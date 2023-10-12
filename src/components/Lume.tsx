import {
  LumeDashboard,
  LumeIdentity,
  LumeIdentityTrigger,
  useLume,
} from "@lumeweb/sdk";

export default function () {
  const { isLoggedIn, ready } = useLume();
  return (
    <>
      <LumeIdentity>
        <LumeIdentityTrigger asChild disabled={!ready}>
          {
            <button
              className="ml-2 w-full rounded-full bg-[hsl(113,49%,55%)] text-black"
              disabled={!ready}
            >
              Login
            </button>
          }
        </LumeIdentityTrigger>
      </LumeIdentity>
      {isLoggedIn && ready && <LumeDashboard />}
    </>
  );
}
