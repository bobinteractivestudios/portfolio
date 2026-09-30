"use client";

import { useContext, useState } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Keeps rendering the route its children had when it mounted, whatever the
// router has moved on to. Next swaps a layout's page the moment the address
// changes; SiteShell uses this to hold on to a page while its exit plays (key
// it by the page's path, so a new one mounts for the next page).
export default function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const [frozen] = useState(context);
  return <LayoutRouterContext.Provider value={frozen}>{children}</LayoutRouterContext.Provider>;
}
