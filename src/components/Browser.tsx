import {
  createContext,
  createRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  dnsClient,
  ethClient,
  handshakeClient,
  ipfsClient,
  networkRegistryClient,
  peerDiscoveryClient,
  swarmClient,
} from "@/clients.ts";
import * as kernel from "@lumeweb/libkernel/kernel";
import { kernelLoaded } from "@lumeweb/libkernel/kernel";
import Arrow from "@/components/Arrow.tsx";
import React from "react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  type AuthContextType,
  type LumeStatusContextType,
  useAuth,
  useLumeStatus,
} from "@lumeweb/sdk";

let BOOT_FUNCTIONS: (() => Promise<any>)[] = [];

interface BrowserContextType {
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  isLoadingPage: boolean;
  setIsLoadingPage: React.Dispatch<React.SetStateAction<boolean>>;
}

const BrowserStateContext = createContext<BrowserContextType | undefined>(
  undefined,
);

export function BrowserStateProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [url, setUrl] = useState("");
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);

  return (
    <BrowserStateContext.Provider
      value={{ url, setUrl, isLoadingPage, setIsLoadingPage }}
    >
      {children}
    </BrowserStateContext.Provider>
  );
}

export function useBrowserState() {
  const context = useContext(BrowserStateContext);
  if (!context) {
    throw new Error(
      "useBrowserState must be used within a BrowserStateProvider",
    );
  }
  return context;
}

async function boot({
  onInit,
  onAuth,
  onBoot,
}: {
  onInit: (inited: boolean) => Promise<void> | void;
  onAuth: (authed: boolean) => Promise<void> | void;
  onBoot: (booted: boolean) => Promise<void> | void;
}) {
  let err = false;
  const reg = await navigator.serviceWorker.register("/sw.js");
  await reg.update();

  await kernel.serviceWorkerReady();

  await kernel.init().catch((err) => {
    console.error("[Browser.tsx] Failed to init kernel", { error: err });
  });
  await onInit(true);
  await kernelLoaded()
    .then((result) => {
      if ("indexeddb_error" === (result as string)) {
        alert(
          "Error: Please ensure 3rd party cookies are enabled, and any security like brave shield is off, then reload the app",
        );
        err = true;
      }
    })
    .catch((err) => {
      console.error("[Browser.tsx] Failed to load kernel", { error: err });
    });
  if (err) {
    return;
  }
  await onAuth(true);

  BOOT_FUNCTIONS.push(
    async () =>
      await swarmClient.addRelay(
        "2d7ae1517caf4aae4de73c6d6f400765d2dd00b69d65277a29151437ef1c7d1d",
      ),
  );

  // IRC
  BOOT_FUNCTIONS.push(
    async () =>
      await peerDiscoveryClient.register(
        "zrjHTx8tSQFWnmZ9JzK7XmJirqJQi2WRBLYp3fASaL2AfBQ",
      ),
  );
  BOOT_FUNCTIONS.push(
    async () => await networkRegistryClient.registerType("content"),
  );
  BOOT_FUNCTIONS.push(
    async () => await networkRegistryClient.registerType("blockchain"),
  );
  BOOT_FUNCTIONS.push(async () => await handshakeClient.register());
  BOOT_FUNCTIONS.push(async () => await ethClient.register());
  BOOT_FUNCTIONS.push(async () => await ipfsClient.register());

  const resolvers = [
    "zrjCnUBqmBqXXcc2yPnq517sXQtNcfZ2BHgnVTcbhSYxko7", // CID
    "zrjEYq154PS7boERAbRAKMyRGzAR6CTHVRG6mfi5FV4q9FA", // ENS
    "zrjEH3iojPLr7986o7iCn9THBmJmHiuDWmS1G6oT8DnfuFM", // HNS
  ];

  for (const resolver of resolvers) {
    BOOT_FUNCTIONS.push(async () => dnsClient.registerResolver(resolver));
  }
  BOOT_FUNCTIONS.push(async () => onBoot(true));

  await bootup();

  await Promise.all([
    ethClient.ready(),
    handshakeClient.ready(),
    ipfsClient.ready(),
  ]);
}

async function bootup() {
  for (const entry of Object.entries(BOOT_FUNCTIONS)) {
    console.log(entry[1].toString());
    await entry[1]();
  }
}

const NavInput = forwardRef<HTMLInputElement>(
  (props: React.InputHTMLAttributes<HTMLInputElement>, ref) => {
    return <Input ref={ref} {...props} />;
  },
);

export function Navigator() {
  const { url: contextUrl, setUrl } = useBrowserState();
  const { ready } = useLumeStatus();
  const inputEl = useRef<HTMLInputElement | null>();

  const browse = (inputValue: string) => {
    let input = inputValue.trim();

    // If the input doesn't contain a protocol, assume it's http
    if (!input?.match(/^https?:\/\//)) {
      input = `http://${input}`;
    }

    try {
      // Try to parse it as a URL
      const url = new URL(input);

      setUrl(url.toString() || "about:blank");
    } catch (e) {
      // Handle invalid URLs here, if needed
      console.error("Invalid URL:", e);
    }
  };

  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.value = contextUrl;
    }
  }, [contextUrl]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const inputElement = e.target as HTMLFormElement;
        const inputValue = (
          inputElement?.elements.namedItem("url") as HTMLInputElement
        )?.value;
        if (inputValue) {
          browse(inputValue);
        }
      }}
      className="relative h-full w-full rounded-full bg-neutral-800 border border-neutral-700 flex items-center [&>input:focus]:ring-2 [&>input:focus]:ring-primary [&>input:focus+button]:ring-2 [&>input:focus+button]:ring-primary"
    >
      <NavInput
        ref={(el) => (inputEl.current = el)}
        disabled={!ready}
        className={`rounded-l-full bg-neutral-800 text-white border-none focus-visible:ring-offset-0 ${
          !ready ? "bg-neutral-950" : ""
        }`}
        name="url"
      />
      <Button
        disabled={!ready}
        className="rounded-r-full focus-visible:ring-offset-0"
      >
        Navigate
        <Arrow />
      </Button>
    </form>
  );
}

export function Browser() {
  const { url, setUrl, isLoadingPage, setIsLoadingPage } = useBrowserState();
  const status = useLumeStatus();
  const auth = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    boot({
      onAuth(authed) {
        auth.setIsLoggedIn(authed);
      },
      onBoot(booted) {
        status.setReady(booted);
      },
      onInit(inited) {
        status.setInited(inited);
      },
    }).catch((err) =>
      console.error("[Browser.tsx] Failed to Boot Lume", { error: err }),
    );
  }, []);

  const handleIframeLoad = () => {
    try {
      const newUrl = iframeRef?.current?.contentWindow?.location.href as string;
      const urlObj = new URL(newUrl);
      let realUrl = urlObj.pathname
        .replace(/^\/browse\//, "")
        .replace(/\/$/, "");
      if (url !== realUrl) {
        setUrl(realUrl);
      }
      setIsLoadingPage(false);
    } catch (e) {
      // This will catch errors related to cross-origin requests, in which case we can't access the iframe's contentWindow.location
      console.warn(
        "Couldn't access iframe URL due to cross-origin restrictions:",
        e,
      );
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "src"
          ) {
            setIsLoadingPage(true);
          }
        }
      });

      observer.observe(iframe, { attributes: true });
      return () => observer.disconnect(); // Clean up on unmount
    }
  }, []);

  return (
    <>
      {isLoadingPage ? (
        <div className="fixed bottom-2 left-3">
          <span className="max-w-4xl w-full block my-2 py-1 px-4 rounded-lg bg-gray-900/70 border border-gray-600 text-gray-400">
            Loading {url}...
          </span>
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        onLoad={handleIframeLoad}
        src={url ? `/browse/${url}` : "about:blank"}
        className="w-full h-full"
      ></iframe>
    </>
  );
}
