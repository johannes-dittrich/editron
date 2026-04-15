"use client";

import { useEffect, useState, type ReactNode } from "react";

export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(
    process.env.NEXT_PUBLIC_USE_REAL_API === "true"
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_REAL_API === "true") return;
    import("@/mocks/init").then(({ initMocks }) =>
      initMocks().then(() => setReady(true))
    );
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
