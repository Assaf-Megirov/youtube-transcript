export declare class YoutubeTranscriptError extends Error {
    constructor(message: any);
}
export declare class YoutubeTranscriptTooManyRequestError extends YoutubeTranscriptError {
    constructor();
}
export declare class YoutubeTranscriptVideoUnavailableError extends YoutubeTranscriptError {
    constructor(videoId: string);
}
export declare class YoutubeTranscriptDisabledError extends YoutubeTranscriptError {
    constructor(videoId: string);
}
export declare class YoutubeTranscriptNotAvailableError extends YoutubeTranscriptError {
    constructor(videoId: string);
}
export declare class YoutubeTranscriptNotAvailableLanguageError extends YoutubeTranscriptError {
    constructor(langs: string[], availableLangs: string[], videoId: string);
}
export declare class YoutubeVideoMetadataNotFoundError extends YoutubeTranscriptError {
    constructor(videoPage?: string, message?: string);
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
export declare class YoutubeTranscript {
    /**
     * Fetch transcript from YTB Video
     * @param videoId Video url or video identifier
     * @param config Get transcript in a specific language ISOs, ordered by preference
     */
    static fetchTranscript(//legacy overload
    videoId: string, config?: TranscriptConfig): Promise<TranscriptResponse[]>;
    /**
     *
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
    private static getVideoMetaData;
}
