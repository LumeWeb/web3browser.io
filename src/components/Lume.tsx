import {
  LumeDashboard,
  LumeIdentity,
  LumeIdentityTrigger,
  useLume,
} from "@lumeweb/sdk";

export default function () {
  const { isLoggedIn, ready, inited } = useLume();

  let loginDisabled = !inited || isLoggedIn;

  return (
    <>
      <LumeIdentity>
        <LumeIdentityTrigger asChild disabled={loginDisabled}>
          {
            <button
              className="ml-2 w-full rounded-full bg-[hsl(113,49%,55%)] text-black disabled:pointer-events-none disabled:opacity-50"
              disabled={loginDisabled}
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
