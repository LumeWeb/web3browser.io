import type { ContentProvider } from "../types.js";
import * as nodePath from "path";
import { createClient } from "@lumeweb/kernel-s5-client";
import { CID, CID_TYPES } from "@lumeweb/libs5";

export default class S5Provider implements ContentProvider {
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

    if (!cid.startsWith("/s5/") && !cid.startsWith("/sia/")) {
      err = "404";
    }

    if (err) {
      throw new Error(err);
    }

    cid = cid.replace("/s5/", "").replace("/sia/", "");

    let file;

    switch (CID.decode(cid).type) {
      case CID_TYPES.METADATA_WEBAPP:
        const meta = await this._client.stat(cid);
        if (!parsedPath.base.length || !parsedPath.ext.length) {
          let found = false;
          for (const indexFile of meta.tryFiles) {
            urlPath = nodePath.join(urlPath, indexFile);
            if (urlPath.startsWith("/")) {
              urlPath = urlPath.substring(1);
            }
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
          if (urlPath.startsWith("/")) {
            urlPath = urlPath.substring(1);
          }
          if (!(urlPath in meta.paths)) {
            throw new Error("404");
          }
          file = meta.paths[urlPath];
        }

        break;
      default:
        throw new Error("404");
    }

    const headers: HeadersInit = {};

    headers["Content-Type"] = file.contentType as string;

    return new Response(
      new Blob([(await this._client.cat(file.cid)) as Uint8Array]),
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
