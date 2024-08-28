declare class YoutubeTranscriptError extends Error {
    constructor(message: any);
}
declare class YoutubeTranscriptTooManyRequestError extends YoutubeTranscriptError {
    constructor();
}
declare class YoutubeTranscriptVideoUnavailableError extends YoutubeTranscriptError {
    constructor(videoId: string);
}
declare class YoutubeTranscriptDisabledError extends YoutubeTranscriptError {
    constructor(videoId: string);
}
declare class YoutubeTranscriptNotAvailableError extends YoutubeTranscriptError {
    constructor(videoId: string);
}
declare class YoutubeTranscriptNotAvailableLanguageError extends YoutubeTranscriptError {
    constructor(langs: string[], availableLangs: string[], videoId: string);
}
declare class YoutubeVideoMetadataNotFoundError extends YoutubeTranscriptError {
    constructor(videoPage?: string, message?: string);
}
interface TranscriptConfig {
    lang?: string;
    langs?: string[];
}
interface TranscriptResponse {
    text: string;
    duration: number;
    offset: number;
    lang?: string;
}
interface IYoutubeVideoMetadata {
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
declare class YoutubeTranscript {
    /**
     * Fetch transcript from YTB Video (legacy overload)
     * @param videoId Video url or video identifier
     * @param config Get transcript in a specific language ISOs, ordered by preference
     * @returns Promise<TranscriptResponse[]>
     */
    static fetchTranscript(//legacy overload
    videoId: string, config?: TranscriptConfig): Promise<TranscriptResponse[]>;
    /**
     * fetch transcript from YTB Video (new overload: can include metadata)
     * @param videoId
     * @param config
     * @param includeMetadata
     * @returns {transcriptResponseArray: TranscriptResponse[], videoMetadata: IYoutubeVideoMetadata}
     */
    static fetchTranscript(//legacy overload
    videoId: string, config?: TranscriptConfig, includeMetadata?: boolean): Promise<{
        transcriptResponseArray: TranscriptResponse[];
        videoMetadata: IYoutubeVideoMetadata;
    }>;
    /**
     * Retrieve video id from url or string
     * @param videoId video url or video id
     */
    private static retrieveVideoId;
    /**
   * Fetches metadata for a YouTube video. Use this function if you want only the video's metadata without the transcript.
   *
   * @param {string} videoId - The ID of the YouTube video.
   * @return {Promise<IYoutubeVideoMetadata>} A promise that resolves with the video's metadata. hint: import { IYoutubeVideoMetadata } from 'youtube-transcript';
   */
    static fetchMetadata(videoId: string): Promise<IYoutubeVideoMetadata>;
    /**
     * Extracts metadata from a YouTube video page as text.
     *
     * @param {string} videoPageBody - The response from the youtube video page as text. ex: response = await fetch(); videoPageBody = await response.text();
     * @return {IYoutubeVideoMetadata} The extracted metadata.
     */
    private static getVideoMetaData;
}

export { type IYoutubeVideoMetadata, type TranscriptConfig, type TranscriptResponse, YoutubeTranscript, YoutubeTranscriptDisabledError, YoutubeTranscriptError, YoutubeTranscriptNotAvailableError, YoutubeTranscriptNotAvailableLanguageError, YoutubeTranscriptTooManyRequestError, YoutubeTranscriptVideoUnavailableError, YoutubeVideoMetadataNotFoundError };
