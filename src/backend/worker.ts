import { createClient as createDnsClient } from "@lumeweb/kernel-dns-client";
import { ProviderManager } from "./providerManager.js";
import IPFSProvider from "./providers/ipfs.js";
import URLRewriteFilter from "./filters/urlRewrite.js";

const dnsClient = createDnsClient();

const providerManager = new ProviderManager();
providerManager.register(new IPFSProvider());
providerManager.processor.registerFilter(new URLRewriteFilter());

globalThis.postMessage = async (...args) => {
  // @ts-ignore
  let ret = await clients.matchAll({ includeUncontrolled: true });
  ret.forEach((item: any) => item.postMessage(...args));

  if (!ret.length) {
    const cb = (event: any) => {
      // @ts-ignore
      postMessage(...args);
      self.removeEventListener("activate", cb);
    };
    self.addEventListener("activate", cb);
  }
};

self.addEventListener("activate", (event) => {
  // @ts-ignore
  event.waitUntil(
    (async () => {
      // @ts-ignore
      await clients.claim();
      // @ts-ignore
    })(),
  );
});

addEventListener("fetch", (event: any) => {
  event.respondWith(
    (async () => {
      const req = event.request;
      const url = new URL(req.url);

      if (
        ["/index.html", "/index.js", "/"].includes(url.pathname) ||
        !url.pathname.startsWith("/browse/")
      ) {
        return fetch(event.request).then((response: any) => {
          response.redirectToFinalURL = true;
          return response;
        });
      }

      let realUrl = url.pathname.replace(/^\/browse\//, "").replace(/\/$/, "");

      if (!realUrl.match(/^https?:\/\//)) {
        realUrl = `http://${realUrl}`;
      }
      // Use your existing communication framework to resolve DNS.
      const dnsResult = await dnsClient.resolve(new URL(realUrl).hostname);

      console.log("realUrl", realUrl);

      if (!dnsResult.error && dnsResult.records.length > 0) {
        return providerManager.fetch(
          realUrl,
          dnsResult,
          new URL(realUrl).pathname,
        );
      }

      return new Response("Sorry, that is not a valid web3 website.");
    })(),
  );
});
