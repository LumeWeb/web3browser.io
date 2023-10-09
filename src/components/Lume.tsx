import { LumeIdentity, LumeDashboard, LumeProvider } from "@lumeweb/sdk";

export default function () {
  return (
    <>
      <LumeIdentity />
      <LumeProvider>
        <LumeDashboard />
      </LumeProvider>
    </>
  );
}
