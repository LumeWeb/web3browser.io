import {
  AuthProvider,
  LumeStatusProvider,
  NetworksProvider,
  useNetworks,
} from "@lumeweb/sdk";

import {
  Browser,
  BrowserStateProvider,
  Navigator,
} from "@/components/Browser.tsx";
import Lume from "@/components/Lume.tsx";
import LogoImg from "@/assets/lume-logo.png";

const App: React.FC = () => {
  const { networks } = useNetworks();
  const ethStatus = networks
    .filter((n) => n.name.toLowerCase() === "ethereum")
    .at(0);
  const handshakeStatus = networks
    .filter((n) => n.name.toLowerCase() === "handshake")
    .at(0);

  console.log({ ethStatus, handshakeStatus, networks });

  return (
    <header className="relative border rounded-md m-4 border-neutral-800 px-3 py-4 w-[calc(100%-32px)] bg-neutral-900 flex flex-col">
      <div className="relative px-2 my-2 mb-4 pl-2 pb-2 w-full flex justify-between">
        <div className="flex items-center gap-x-2 text-zinc-500">
          <img src={LogoImg.src} className="w-20 h-7" />
          <h2 className="border-l border-current pl-2">Web3 Browser</h2>
        </div>
        <div className="w-32 flex justify-end h-10">
          <Lume />
        </div>
      </div>
      <Navigator />
      {ethStatus?.syncState === "syncing" ||
      handshakeStatus?.syncState === "syncing" ? (
        <div className="py-2 flex flex-row">
          {ethStatus?.syncState === "syncing" ? (
            <span className="rounded-full bg-white text-black p-1">
              {ethStatus.sync.toPrecision(1)}% Syncing Ethereum Network
            </span>
          ) : null}
          {handshakeStatus?.syncState === "syncing" ? (
            <span className="rounded-full bg-white text-black p-1">
              {handshakeStatus.sync.toPrecision(1)}% Syncing Handshake Network
            </span>
          ) : null}
        </div>
      ) : null}
    </header>
  );
};

const Root = () => {
  return (
    <BrowserStateProvider>
      <LumeStatusProvider>
        <NetworksProvider>
          <AuthProvider>
            <App />
            <Browser />
          </AuthProvider>
        </NetworksProvider>
      </LumeStatusProvider>
    </BrowserStateProvider>
  );
};

export default Root;
