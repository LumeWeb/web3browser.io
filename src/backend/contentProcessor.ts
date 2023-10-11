import type { ContentFilter } from "./types.js";

export class ContentProcessor {
  private filters: ContentFilter[] = [];

  registerFilter(filter: ContentFilter) {
    this.filters.push(filter);
  }

  async process(response: Response, mimeType: string): Promise<Response> {
    let processedResponse = response;

    for (const filter of this.filters) {
      processedResponse = await filter.process(processedResponse, mimeType);
    }

    return processedResponse;
  }
}
