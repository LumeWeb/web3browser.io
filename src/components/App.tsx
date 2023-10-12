import {
  Browser,
  BrowserStateProvider,
  Navigator,
} from "@/components/Browser.tsx";
import Lume from "@/components/Lume.tsx";
import { LumeProvider } from "@lumeweb/sdk";

export default function () {
  return (
    <LumeProvider>
      <BrowserStateProvider>
        <>
          <header className="relative h-14 px-2 pl-2 py-2 w-full bg-neutral-900 flex">
            <div className="relative h-full w-full rounded-full bg-neutral-800 border border-neutral-700 flex items-center [>input:focus]:ring-2 [>input:focus]:ring-white">
              <Navigator />
            </div>
            <div className="w-32 flex justify-end">
              <Lume />
            </div>
          </header>
          <Browser />
        </>
      </BrowserStateProvider>
    </LumeProvider>
  );
}
