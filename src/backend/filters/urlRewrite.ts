import type { ContentFilter } from "../types.js";
import { getTld } from "@lumeweb/libresolver";
import tldEnum from "@lumeweb/tld-enum";
import * as cheerio from "cheerio";
import urlJoin from "proper-url-join";

export default class URLRewriteFilter implements ContentFilter {
  async process(response: Response, mimeType: string): Promise<Response> {
    if (mimeType !== "text/html") {
      return response;
    }

    let html = await response.text();

    const $ = cheerio.load(html);

    ["a", "link", "script", "img"].forEach((tag) => {
      $.root()
        .find(tag)
        .each((index, element) => {
          let attrName = ["a", "link"].includes(tag) ? "href" : "src";
          let urlValue = $(element).attr(attrName);
          if (urlValue) {
            const isExternal = urlValue.startsWith("http");
            if (!isExternal || !isICANN(urlValue)) {
              if (!isExternal) {
                //@ts-ignore
                urlValue = urlJoin("/browse/", urlValue);
              } else {
                urlValue = `/browse/${urlValue}`;
              }

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
