import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

export function Layout() {
  return (
    <div className="h-dvh flex flex-col bg-background">
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
}
