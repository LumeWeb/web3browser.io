import {
  LumeDashboard,
  LumeIdentity,
  LumeIdentityTrigger,
  useAuth,
  useLumeStatus,
} from "@lumeweb/sdk";

const Lume: React.FC = () =>  {
  const { isLoggedIn } = useAuth();
  const { ready, inited } = useLumeStatus();

  return (
    <>
      {!isLoggedIn && (
        <LumeIdentity>
          <LumeIdentityTrigger asChild>
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
      {isLoggedIn && <LumeDashboard disabled={!ready} />}
    </>
  );
}

export default Lume;