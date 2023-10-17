import type { ContentProvider } from "../types.js";
import { ipfsPath, ipnsPath, path as checkPath } from "is-ipfs";
import { createClient } from "@lumeweb/kernel-ipfs-client";
import { CID } from "multiformats/cid";
import type { UnixFSStats } from "@helia/unixfs";
import * as nodePath from "path";
import { fileTypeFromBuffer } from "file-type";
import extToMimes from "../mimes.js";

export default class IPFSProvider implements ContentProvider {
  private _client = createClient();

  async fetchContent(
    uri: string,
    path: string,
    query?: string,
  ): Promise<Response> {
    let cid = translatePath(uri);
    let stat: UnixFSStats | null = null;
    let urlPath = path;
    const parsedPath = nodePath.parse(urlPath);
    let err;
    console.log("ipfs fetching", uri, path);
    try {
      if (ipnsPath(cid)) {
        const cidHash = cid.replace("/ipns/", "");
        // Use sogola.eth as a test, bypass lookup.
        if (
          cidHash ===
          "k51qzi5uqu5dhxd50115dn1hfvuwiqwej3dki72uyopetqua71i6lp96pem0a6"
        ) {
          cid = "QmbavvC59N5u93LqPR5Kz74wdUY3FWnDv38SvhTx4oQope";
        } else {
          cid = await this._client.ipns(cidHash);
        }

        cid = `/ipfs/${cid}`;
      }

      if (ipfsPath(cid)) {
        cid = CID.parse(cid.replace("/ipfs/", "")).toV1().toString();
        stat = await this._client.stat(cid);
      }
    } catch (e) {
      err = (e as Error).message;
    }

    if (!err && stat?.type === "directory") {
      if (!parsedPath.base.length || !parsedPath.ext.length) {
        let found = false;
        for (const indexFile of ["index.html", "index.htm"]) {
          try {
            const subPath = nodePath.join(urlPath, indexFile);
            await this._client.stat(cid, {
              path: subPath,
            });
            urlPath = subPath;
            found = true;
            break;
          } catch {}
        }

        if (!found) {
          err = "404";
        }
      } else {
        try {
          await this._client.stat(cid, {
            path: urlPath,
          });
        } catch {
          err = "404";
        }
      }
    }

    if (err) {
      throw new Error(err);
    }

    let bufferRead = 0;
    const fileTypeBufferLength = 4100;
    const mimeBuffer: Uint8Array[] = [];
    let reader = await this._client.cat(cid, { path: urlPath });

    for await (const chunk of reader.iterable()) {
      if (bufferRead < fileTypeBufferLength) {
        if (chunk.length >= fileTypeBufferLength) {
          mimeBuffer.push(chunk.slice(0, fileTypeBufferLength));
          bufferRead += fileTypeBufferLength;
        } else {
          mimeBuffer.push(chunk);
          bufferRead += chunk.length;
        }

        if (bufferRead >= fileTypeBufferLength) {
          reader.abort();
          break;
        }
      } else {
        reader.abort();
        break;
      }
    }

    let mime;

    if (bufferRead >= fileTypeBufferLength) {
      const totalLength = mimeBuffer.reduce((acc, val) => acc + val.length, 0);
      const concatenated = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of mimeBuffer) {
        concatenated.set(chunk, offset);
        offset += chunk.length;
      }
      mime = await fileTypeFromBuffer(concatenated);

      if (!mime) {
        const ext = nodePath.parse(urlPath).ext.replace(".", "");
        if (extToMimes.has(ext)) {
          mime = extToMimes.get(ext);
        }
      }
    }

    reader = await this._client.cat(cid, { path: urlPath });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of reader.iterable()) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    const headers: HeadersInit = {};

    if (mime) {
      headers["Content-Type"] = mime as string;
    }

    return new Response(stream, {
      headers,
    });
  }

  supports(uri: string): boolean {
    return checkPath(translatePath(uri));
  }
}

function translatePath(uri: string) {
  return uri.replace(/:\/\//, "/").replace(/^/, "/");
}
