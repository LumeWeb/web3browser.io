import {
  LumeDashboard,
  LumeIdentity,
  LumeIdentityTrigger,
  useAuth,
  useLumeStatus,
  useNetworks,
} from "@lumeweb/sdk";
import { useBrowserState } from "./Browser";

const Lume: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { authStatus } = useBrowserState();
  const { ready, inited } = useLumeStatus();

  return (
    <>
      {!isLoggedIn && (
        <LumeIdentity>
          <LumeIdentityTrigger asChild>
              <button
                className="ml-2 w-full rounded-full bg-[hsl(113,49%,55%)] text-black disabled:pointer-events-none disabled:opacity-50"
                disabled={!inited || authStatus === 'syncing'}
              >
                Login
              </button>
          </LumeIdentityTrigger>
        </LumeIdentity>
      )}
      {isLoggedIn && <LumeDashboard disabled={!inited} />}
    </>
  );
};

export default Lume;
