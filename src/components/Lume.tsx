import {
  LumeIdentity,
  LumeIdentityTrigger,
  LumeDashboardTrigger,
  LumeDashboard,
  useLume,
  LumeProvider,
} from "@lumeweb/sdk";

export default function () {
  const { isLoggedIn, ready } = useLume();
  return (
    <>
      <LumeIdentity>
        <LumeIdentityTrigger asChild disabled={!ready}>
          {isLoggedIn ? (
            <LumeDashboard>
              <LumeDashboardTrigger asChild>
                <button className="ml-2 w-full rounded-full bg-[hsl(113,49%,55%)] text-black">
                  Check Status
                </button>
              </LumeDashboardTrigger>
            </LumeDashboard>
          ) : (
            <button className="ml-2 w-full rounded-full bg-[hsl(113,49%,55%)] text-black">
              Login
            </button>
          )}
        </LumeIdentityTrigger>
      </LumeIdentity>
    </>
  );
}
