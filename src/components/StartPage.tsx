import { useAuth, useLumeStatus } from "@lumeweb/sdk";
import React from "react";

type Props = {
  setUrl: (url: string) => void;
};

const AVAILABLE_PAGES = [
  "blockranger.eth",
  "esteroids.eth",
  // "ens.eth",
  "sogola.eth",
  "vitalik.eth",
];

const StartPage = ({ setUrl }: Props) => {
  const { ready, inited } = useLumeStatus();
  const { isLoggedIn } = useAuth();
  return (
    <div className="mx-4 relative border rounded-md mt-2 border-neutral-800 p-10 pb-5 w-[calc(100%-32px)] bg-neutral-900 flex flex-col">
      <h2 className="font-bold text-2xl text-white">
        Welcome to the Lume Browser
      </h2>
      <p className="text-gray-400 my-4">
        This browser will let you trustessly access websites with domain names
        from the Ethereum Name Service (ENS) and Handshake protocol, providing a
        secure and decentralized browsing experience.
      </p>
      <p className="text-gray-400 my-4">
        For further documentation, see:{" "}
        <a href="https://docs.lumeweb.com/browser-webapp" className="underline text-white">
          https://docs.lumeweb.com/browser-webapp
        </a>
      </p>
      {/* TODO: Add the lume loading indicators for the networks. */}
      {/* <CircleProgressBar radius={20} strokeWidth={4} textSize={12} percentage={75} /> */}
      {inited && ready ? (
        <div>
          <hr className="my-3 border-neutral-700" />
          <div
            className="bg-yellow-800/40 rounded-md border border-yellow-500 text-yellow-500 p-4"
            role="alert"
          >
            <p className="font-bold">Disclaimer</p>
            <p>
              The sites listed below are the ones we currently support. We're a
              small team working hard to make this technology possible. We don't
              endorse any ideological views. Our focus is on building for a free
              web. The listed sites are examples of what our technology can do
              today. Please note that we are not hosting or serving any content
              ourselves and have no control over the content as it's
              decentralized.
            </p>
          </div>
          <h3 className="text-white text-lg font-bold mt-4">
            Currently Accessible Websites:
          </h3>
          <p className="text-gray-400 my-4">
            To come back to the roots of the web, we have to change a lot of
            behavior on how browsers resolve assets and make them safe by
            checking their hashes in a trustlessly way. The sites listed here
            are the ones we've successfully integrated with our technology.
            We're working on complex tasks to ensure that file serving is
            trustless and decentralized, which involves reimplementing many
            functionalities that current DNSs and CDNs already provide.
          </p>
          <ul className="flex gap-2 flex-row flex-wrap py-3">
            {AVAILABLE_PAGES.map((url, index) => (
              <button
                key={`AvailableSites_${index}`}
                disabled={!ready}
                className={`w-[calc(33%-16px)] border rounded-md py-2 text-white ${
                  ready
                    ? "bg-zinc-900 border-zinc-800 hover:shadow-md hover:ring-1 hover:ring-green-400/20 hover:shadow-green-400/20 hover:transform-gpu hover:-translate-y-[3px] transition-all duration-150"
                    : "bg-zinc-950 border-zinc-900 cursor-not-allowed opacity-30"
                }`}
                onClick={() => ready && setUrl(`http://${url}`)}
              >
                <div className="w-full">{url}</div>
              </button>
            ))}
          </ul>
        </div>
      ) : null}
      {inited && !ready && isLoggedIn ? (
        <div
          className="bg-green-800/40 rounded-md border border-green-500 text-green-500 p-4"
          role="alert"
        >
          <p className="font-bold">You are logged in.</p>
          <p>We are now starting to sync the networks.</p>
        </div>
      ) : null}
      {!isLoggedIn ? (
        <div
          className="bg-blue-800/40 rounded-md border border-blue-500 text-blue-500 p-4"
          role="alert"
        >
          <p className="font-bold">Attention</p>
          <p>Please click login to start using the browser.</p>
        </div>
      ) : null}
      <p className="text-white text-sm p-5 text-center">
        Brought to you with 💚 by the &nbsp;
        <a href="https://lumeweb.com" className="text-zinc-500 underline">
          Lume
        </a>
        &nbsp; team, and grant sponsored by the &nbsp;
        <a
          href="https://sia.tech/about-sia-foundation"
          className="text-zinc-500 underline"
        >
          Sia Foundation
        </a>
      </p>
    </div>
  );
};

export default StartPage;

const CircleProgressBar = ({
  radius,
  strokeWidth,
  textSize,
  percentage,
}: {
  radius: number;
  strokeWidth: number;
  textSize: number;
  percentage: number;
}) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

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
        className="stroke-primary"
        fill="transparent"
        r={radius}
        cx={radius + strokeWidth / 2}
        cy={radius + strokeWidth / 2}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="50%"
        className="fill-primary"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize={textSize}
      >
        {`${percentage}%`}
      </text>
    </svg>
  );
};
