const RE_YOUTUBE =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)';
const RE_XML_TRANSCRIPT =
  /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

export class YoutubeTranscriptError extends Error {
  constructor(message) {
    super(`[YoutubeTranscript] 🚨 ${message}`);
  }
}

export class YoutubeTranscriptTooManyRequestError extends YoutubeTranscriptError {
  constructor() {
    super(
      'YouTube is receiving too many requests from this IP and now requires solving a captcha to continue'
    );
  }
}

export class YoutubeTranscriptVideoUnavailableError extends YoutubeTranscriptError {
  constructor(videoId: string) {
    super(`The video is no longer available (${videoId})`);
  }
}

export class YoutubeTranscriptDisabledError extends YoutubeTranscriptError {
  constructor(videoId: string) {
    super(`Transcript is disabled on this video (${videoId})`);
  }
}

export class YoutubeTranscriptNotAvailableError extends YoutubeTranscriptError {
  constructor(videoId: string) {
    super(`No transcripts are available for this video (${videoId})`);
  }
}

export class YoutubeTranscriptNotAvailableLanguageError extends YoutubeTranscriptError {
  constructor(langs: string[], availableLangs: string[], videoId: string) {
    super(
      `No transcripts are available in ${langs.join(', ')} for this video (${videoId}). Available languages: ${availableLangs.join(
        ', '
      )}`
    );
  }
}

export class YoutubeVideoMetadataNotFoundError extends YoutubeTranscriptError {
  constructor(videoPage?: string, message?: string) {
    super(`Video metadata not found. ${message}` + (videoPage ? ` (Video page: ${videoPage})` : ``));
  }
}

export interface TranscriptConfig {
  lang?: string;
  langs?: string[];
}
export interface TranscriptResponse {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}
export interface IYoutubeVideoMetadata {
  creator?: string;
  creatorUsername?: string;
  title?: string;
  description?: string;
  length?: number;
  uploadDate?: Date;
  postUrl?: string;
  postId?: string;
  videoUrl?: string;
  fullUrl?: string;
  thumbnailUrl?: string;
  isAd?: boolean;
  crosspost?: boolean;
}

/**
 * Class to retrieve transcript if exist
 */
export class YoutubeTranscript {

  /**
   * Fetch transcript from YTB Video
   * @param videoId Video url or video identifier
   * @param config Get transcript in a specific language ISOs, ordered by preference
   */
  public static async fetchTranscript( //legacy overload
    videoId: string,
    config?: TranscriptConfig
  ): Promise<TranscriptResponse[]>;
  /**
   * 
   * @param videoId 
   * @param config 
   * @param includeMetadata 
   * @returns {transcriptResponseArray: TranscriptResponse[], videoMetadata: IYoutubeVideoMetadata}
   */
  public static async fetchTranscript( //legacy overload
    videoId: string,
    config?: TranscriptConfig,
    includeMetadata?: boolean
  ): Promise<{ transcriptResponseArray: TranscriptResponse[], videoMetadata: IYoutubeVideoMetadata }>;
  public static async fetchTranscript(
    videoId: string,
    config?: TranscriptConfig,
    includeMetadata?: boolean
  ): Promise<TranscriptResponse[] | { transcriptResponseArray: TranscriptResponse[], videoMetadata: IYoutubeVideoMetadata }> {
    const identifier = this.retrieveVideoId(videoId);

    // Merge config.lang and config.langs
    const configLangs = [...(config?.lang ? [config.lang] : []), ...(config?.langs ?? [])];
    const preferredLang = configLangs?.[0];

    const videoPageResponse = await fetch(
      `https://www.youtube.com/watch?v=${identifier}`,
      {
        headers: {
          ...(preferredLang && { 'Accept-Language': preferredLang }),
          'User-Agent': USER_AGENT,
        },
      }
    );
    const videoPageBody = await videoPageResponse.text();

    const splittedHTML = videoPageBody.split('"captions":');

    if (splittedHTML.length <= 1) {
      if (videoPageBody.includes('class="g-recaptcha"')) {
        throw new YoutubeTranscriptTooManyRequestError();
      }
      if (!videoPageBody.includes('"playabilityStatus":')) {
        throw new YoutubeTranscriptVideoUnavailableError(videoId);
      }
      throw new YoutubeTranscriptDisabledError(videoId);
    }

    const captions = (() => {
      try {
        return JSON.parse(
          splittedHTML[1].split(',"videoDetails')[0].replace('\n', '')
        );
      } catch (e) {
        return undefined;
      }
    })()?.['playerCaptionsTracklistRenderer'];

    if (!captions) {
      throw new YoutubeTranscriptDisabledError(videoId);
    }

    if (!('captionTracks' in captions)) {
      throw new YoutubeTranscriptNotAvailableError(videoId);
    }


    // Check for available languages based on config
    let availableLanguages: string[] = configLangs.filter(
      (lang) => captions.captionTracks.some((track) => track.languageCode === lang)
    );

    if (configLangs.length && !availableLanguages.length) {
      throw new YoutubeTranscriptNotAvailableLanguageError(
        configLangs,
        captions.captionTracks.map((track) => track.languageCode),
        videoId
      );
    }

    const transcriptLanguage = availableLanguages[0];

    const transcriptURL = (
      transcriptLanguage
        ? captions.captionTracks.find(
          (track) => track.languageCode === transcriptLanguage
        )
        : captions.captionTracks[0]
    ).baseUrl;

    const transcriptResponse = await fetch(transcriptURL, {
      headers: {
        ...(transcriptLanguage && { 'Accept-Language': transcriptLanguage }),
        'User-Agent': USER_AGENT,
      },
    });
    if (!transcriptResponse.ok) {
      throw new YoutubeTranscriptNotAvailableError(videoId);
    }
    const transcriptBody = await transcriptResponse.text();
    const results = [...transcriptBody.matchAll(RE_XML_TRANSCRIPT)];
    const finalResults = results.map((result) => ({
      text: result[3],
      duration: parseFloat(result[2]),
      offset: parseFloat(result[1]),
      lang: transcriptLanguage,
    }));

    if (includeMetadata) {
      const metaData: IYoutubeVideoMetadata = YoutubeTranscript.getVideoMetaData(videoPageBody);
      return { transcriptResponseArray: finalResults, videoMetadata: metaData }
    }
    return finalResults as TranscriptResponse[];
  }

  /**
   * Retrieve video id from url or string
   * @param videoId video url or video id
   */
  private static retrieveVideoId(videoId: string) {
    if (videoId.length === 11) {
      return videoId;
    }
    const matchId = videoId.match(RE_YOUTUBE);
    if (matchId && matchId.length) {
      return matchId[1];
    }
    throw new YoutubeTranscriptError(
      'Impossible to retrieve Youtube video ID.'
    );
  }

  private static getVideoMetaData(videoPageBody: string): IYoutubeVideoMetadata {
    let startSplit, jsonString, jsonObject;
    try {
      startSplit = videoPageBody.split('var ytInitialPlayerResponse = ')[1];
      jsonString = startSplit.split(';</script>')[0];
      jsonObject = JSON.parse(jsonString);
    } catch (e) {
      throw new YoutubeVideoMetadataNotFoundError(videoPageBody);
    }
    if (jsonObject.videoDetails) {
      const videoDetails = jsonObject.videoDetails;
      const res: IYoutubeVideoMetadata = {}
      res.creator = videoDetails.author;
      res.creatorUsername = videoDetails.channelId;
      res.title = videoDetails.title;
      res.description = videoDetails.shortDescription;
      res.length = Number(videoDetails.lengthSeconds) * 1000; //length is storedin ms
      if (jsonObject.microformat && jsonObject.microformat.playerMicroformatRenderer) {
        const microformat = jsonObject.microformat.playerMicroformatRenderer;
        res.uploadDate = new Date(microformat.uploadDate);
      }
      res.postUrl = `https://www.youtube.com/watch?v=${videoDetails.videoId}`;
      res.postId = videoDetails.videoId;
      res.videoUrl = undefined; //TODO:
      res.fullUrl = undefined;
      res.thumbnailUrl = videoDetails.thumbnail.thumbnails[0].url;//the smallest thumbnail
      res.isAd = false; //TODO: figure out how to find out if it is an ad
      res.crosspost = false //NA in youtube
      return res;
    }
    throw new YoutubeVideoMetadataNotFoundError(videoPageBody, 'parsed but didnt find the video details');
  }
}
