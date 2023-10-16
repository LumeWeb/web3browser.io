import {
  createContext,
  createRef,
  forwardRef,
  useContext,
  useEffect,
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
import type React from "react";
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
}

const BrowserStateContext = createContext<BrowserContextType | undefined>(
  undefined,
);

export function BrowserStateProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [url, setUrl] = useState("about:blank");

  return (
    <BrowserStateContext.Provider value={{ url, setUrl }}>
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

async function boot(status: LumeStatusContextType, auth: AuthContextType) {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await reg.update();

  await kernel.serviceWorkerReady();

  kernel.init().then(() => {
    status.setInited(true);
  });

  await kernelLoaded();

  auth.setIsLoggedIn(true);

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
  BOOT_FUNCTIONS.push(async () => status.setReady(true));

  const resolvers = [
    "zrjCnUBqmBqXXcc2yPnq517sXQtNcfZ2BHgnVTcbhSYxko7", // CID
    "zrjEYq154PS7boERAbRAKMyRGzAR6CTHVRG6mfi5FV4q9FA", // ENS
    "zrjEH3iojPLr7986o7iCn9THBmJmHiuDWmS1G6oT8DnfuFM", // HNS
  ];

  for (const resolver of resolvers) {
    BOOT_FUNCTIONS.push(async () => dnsClient.registerResolver(resolver));
  }

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

export function Navigator() {
  const { url, setUrl } = useBrowserState();
  const { isLoggedIn } = useAuth();
  const inputRef = createRef<HTMLInputElement>();

  const browse = () => {
    let input = inputRef.current?.value.trim();

    // If the input doesn't contain a protocol, assume it's http
    if (!input?.match(/^https?:\/\//)) {
      input = `http://${input}`;
    }

    try {
      // Try to parse it as a URL
      const url = new URL(input);

      setUrl(
        `/browse/${url.hostname}${url.pathname}${url.search}${url.hash}` ||
          "about:blank",
      );
    } catch (e) {
      // Handle invalid URLs here, if needed
      console.error("Invalid URL:", e);
    }
  };

  const NavInput = forwardRef((props: any, ref) => (
    <Input ref={ref} {...props}></Input>
  ));

  console.log("Navigator mounted");

  return (
    <>
      <NavInput ref={inputRef} disabled={!isLoggedIn} />
      <Button onClick={browse} disabled={!isLoggedIn}>
        Navigate
        <Arrow />
      </Button>
    </>
  );
}

export function Browser() {
  const { url } = useBrowserState();
  const status = useLumeStatus();
  const auth = useAuth();

  useEffect(() => {
    boot(status, auth);
  }, []);

  return <iframe src={url} className="w-full h-full"></iframe>;
}
