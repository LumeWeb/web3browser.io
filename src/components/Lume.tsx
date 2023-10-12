import {
  LumeDashboard,
  LumeIdentity,
  LumeIdentityTrigger,
  useLume,
} from "@lumeweb/sdk";

export default function () {
  const { isLoggedIn, ready, inited } = useLume();

  return (
    <>
      {!isLoggedIn && (
        <LumeIdentity>
          <LumeIdentityTrigger asChild disabled={!inited}>
            {
              <button
                className="ml-2 w-full rounded-full bg-[hsl(113,49%,55%)] text-black disabled:pointer-events-none disabled:opacity-50"
                disabled={!inited}
              >
                Login
              </button>
            }
          </LumeIdentityTrigger>
        </LumeIdentity>
      )}
      {isLoggedIn && ready && <LumeDashboard />}
    </>
  );
}
