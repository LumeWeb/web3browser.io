import { ContentProcessor } from "./contentProcessor.js";
import type { ContentProvider } from "./types.js";
import type { DNSResult } from "@lumeweb/libresolver";

export class ProviderManager {
  private providers: ContentProvider[] = [];

  private _processor = new ContentProcessor();

  get processor(): ContentProcessor {
    return this._processor;
  }

  register(provider: ContentProvider) {
    this.providers.push(provider);
  }

  async fetch(dnsResult: DNSResult, path: string): Promise<Response> {
    for (const record of dnsResult.records) {
      for (const provider of this.providers) {
        if (provider.supports(record.value)) {
          const content = await provider.fetchContent(record.value, path);

          if (content.headers.get("Content-Type")) {
            return this._processor.process(
              content,
              content.headers.get("Content-Type")!,
            );
          }

          return content;
        }
      }
    }

    throw new Error("No suitable provider found.");
  }
}
