import type { ContentProvider } from "../types.js";
import * as nodePath from "path";
import { createClient } from "@lumeweb/kernel-s5-client";

export default class IPFSProvider implements ContentProvider {
  private _client = createClient();

  async fetchContent(
    uri: string,
    path: string,
    query?: string,
  ): Promise<Response> {
    let cid = translatePath(uri);
    let err;
    let urlPath = path;
    const parsedPath = nodePath.parse(urlPath);

    if (!cid.startsWith("/s5/") && cid.startsWith("/sia/")) {
      err = "404";
    }

    if (err) {
      throw new Error(err);
    }

    cid = cid.replace("/s5/", "").replace("/sia/", "");

    let file;

    try {
      const meta = await this._client.stat(cid);
      if (meta.type !== "web_app") {
        throw new Error("404");
      }

      if (!parsedPath.base.length || !parsedPath.ext.length) {
        let found = false;
        for (const indexFile of meta.tryFiles) {
          urlPath = nodePath.join(urlPath, indexFile);
          if (urlPath in meta.paths) {
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error("404");
        }
        file = meta.paths[urlPath];
      } else {
        if (!(urlPath in meta.paths)) {
          throw new Error("404");
        }
      }
    } catch (e) {
      throw new Error(err);
    }

    const headers: HeadersInit = {};

    headers["Content-Type"] = file.contentType as string;

    return new Response(
      new Blob([(await this._client.cat(cid)) as Uint8Array]),
      {
        headers,
      },
    );
  }

  supports(uri: string): boolean {
    uri = translatePath(uri);
    return uri.startsWith("/s5/") || uri.startsWith("/sia/");
  }
}

function translatePath(uri: string) {
  return uri.replace(/:\/\//, "/").replace(/^/, "/");
}
