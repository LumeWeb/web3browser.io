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

  return (
    <header className="relative border rounded-md m-4 border-neutral-800 px-3 py-4 w-[calc(100%-32px)] bg-neutral-900 flex flex-col">
      <div className="relative px-2 my-2 mb-4 pl-2 pb-2 w-full flex justify-between">
        <a href="https://lumeweb.com">
          <div className="flex items-center gap-x-2 text-zinc-500">
            <img src={LogoImg.src} className="w-20 h-7" />
            <h2 className="border-l border-current pl-2">Web3 Browser</h2>
          </div>
        </a>
        <div className="w-32 flex justify-end h-10">
          <Lume />
        </div>
      </div>
      <Navigator />
      {ethStatus?.syncState === "syncing" ||
      handshakeStatus?.syncState === "syncing" ? (
        <div className="py-4 -mb-4 flex flex-row gap-x-3">
          {ethStatus?.syncState === "syncing" ? (
            <span className="flex items-center gap-x-2 rounded-full bg-neutral-800 text-white p-1 px-4 bg">
              <CircleProgressBar radius={5} strokeWidth={3} percentage={Math.floor(ethStatus.sync)} />
              <span className="font-bold font-mono text-orange-400 mr-2">{ethStatus.sync.toFixed(1)}%</span> Syncing Ethereum Network
            </span>
          ) : ethStatus?.syncState === "done" ? (
            <span className="flex items-center gap-x-2 rounded-full bg-neutral-800 text-white p-1 px-4 bg">
              <CircleProgressBar radius={5} strokeWidth={3} percentage={100} />
              {" "} Ethereum Synced
            </span>
          ) : null}
          {handshakeStatus?.syncState === "syncing" ? (
            <span className="flex items-center gap-x-2 rounded-full bg-neutral-800 text-white p-1 px-4 bg">
              <CircleProgressBar radius={5} strokeWidth={3} percentage={Math.floor(handshakeStatus.sync)} />
              <span className="font-bold font-mono text-orange-400 mr-2">{handshakeStatus.sync.toFixed(1)}%</span> Syncing Handshake Network
            </span>
          ) : handshakeStatus?.syncState === "done" ? (
            <span className="flex items-center gap-x-2 rounded-full bg-neutral-800 text-white p-1 px-4 bg">
              <CircleProgressBar radius={5} strokeWidth={3} percentage={100} />
              {" "} Handshake Synced
            </span>
          ) : null}
        </div>
      ) : null}
    </header>
  );
};

const CircleProgressBar = ({ radius, strokeWidth, textSize, percentage } : {radius: number, strokeWidth: number, textSize?: number, percentage: number}) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = Math.ceil(percentage) >= 100 ? "green-500" : "orange-400"
  
  return (
    <svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
      <circle
        className="stroke-neutral-700"
        fill="transparent"
        r={radius}
        cx={radius + strokeWidth / 2}
        cy={radius + strokeWidth / 2}
        strokeWidth={strokeWidth}
      />
      <circle
        className={`stroke-${color}`}
        fill="transparent"
        r={radius}
        cx={radius + strokeWidth / 2}
        cy={radius + strokeWidth / 2}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      {textSize ? <text
        x="50%"
        className={`fill-${color}`}
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize={textSize}
      >
        {`${percentage}%`}
      </text> : null }
    </svg>
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
