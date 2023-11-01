import {
  AuthProvider,
  LumeStatusProvider,
  NetworksProvider,
} from "@lumeweb/sdk";

import {
  Browser,
  BrowserStateProvider,
  Navigator,
} from "@/components/Browser.tsx";
import Lume from "@/components/Lume.tsx";
import LogoImg from "@/assets/lume-logo.png";

const App: React.FC = () => {
  return (
    <BrowserStateProvider>
      <LumeStatusProvider>
        <AuthProvider>
          <header className="relative border rounded-md m-2 border-neutral-800 px-3 py-4 w-[calc(100%-16px)] bg-neutral-900 flex flex-col">
            <div className="relative px-2 pl-2 py-2 w-full flex justify-between">
              <div className="flex gap-x-2 my-2 mb-4 text-zinc-500">
                <img src={LogoImg.src} className="w-20 h-7" />
                <h2 className="border-l border-current pl-2">Web3 Browser</h2>
              </div>
              <div className="w-32 flex justify-end max-h-10">
                <NetworksProvider>
                  <Lume />
                </NetworksProvider>
              </div>
            </div>
            <Navigator />
          </header>

          <Browser />
        </AuthProvider>
      </LumeStatusProvider>
    </BrowserStateProvider>
  );
};

export default App;
