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

const App: React.FC = () => {
  return (
    <BrowserStateProvider>
        <LumeStatusProvider>
          <AuthProvider>
            <header className="relative h-14 px-2 pl-2 py-2 w-full bg-neutral-900 flex">
                <Navigator />
              <div className="w-32 flex justify-end">
                <NetworksProvider>
                  <Lume />
                </NetworksProvider>
              </div>
            </header>

            <Browser />
          </AuthProvider>
        </LumeStatusProvider>
    </BrowserStateProvider>
  );
}

export default App;
