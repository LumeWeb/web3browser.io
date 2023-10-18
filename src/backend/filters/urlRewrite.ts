import type { ContentFilter } from "../types.js";
import { getTld } from "@lumeweb/libresolver";
import tldEnum from "@lumeweb/tld-enum";
import * as cheerio from "cheerio";
import path from "path";

const swUrl = new URL(self.location.origin);

export default class URLRewriteFilter implements ContentFilter {
  async process(
    response: Response,
    mimeType: string,
    requestor: string,
  ): Promise<Response> {
    if (mimeType !== "text/html") {
      return response;
    }

    let html = await response.text();

    const $ = cheerio.load(html);

    const rUrl = new URL(requestor);

    ["a", "link", "script", "img"].forEach((tag) => {
      $.root()
        .find(tag)
        .each((index, element) => {
          let attrName = ["a", "link"].includes(tag) ? "href" : "src";
          let urlValue = $(element).attr(attrName);
          if (urlValue) {
            const isExternal =
              urlValue.startsWith("http") ||
              (urlValue.startsWith("//") && isICANN(urlValue));
            if (!isExternal || !isICANN(urlValue)) {
              if (!isExternal) {
                //@ts-ignore
                urlValue = path.join(rUrl.pathname, urlValue);
              }
              urlValue = `${swUrl.protocol}//${swUrl.hostname}/browse/${rUrl.hostname}${urlValue}`;
              console.log(urlValue);

              $(element).attr(attrName, urlValue);
            }
          }
        });
    });

    console.log("URLRewriteFilter result", $.html());

    return new Response($.html(), {
      headers: response.headers,
    });
  }
}

function isICANN(url: string) {
  if (url.startsWith("//")) {
    debugger;
    url = `https:${url}`;
  }
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    return tldEnum.list.includes(getTld(domain));
  } catch (e) {
    return false;
  }
}
