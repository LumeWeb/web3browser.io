export interface ContentProvider {
  supports: (uri: string) => boolean;
  fetchContent: (
    uri: string,
    path: string,
    query?: string,
  ) => Promise<Response>;
}

export interface ContentFilter {
  process: (response: Response, mineType: string) => Promise<Response>;
}
