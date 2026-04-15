export async function initMocks() {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_USE_REAL_API !== "true"
  ) {
    const { worker } = await import("./browser");
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}
