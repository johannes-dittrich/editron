import "./polyfills.js";
import { buildApp } from "./app.js";
import { startAudioExtractWorker, closeQueues } from "./queue/index.js";

const port = Number(process.env.API_PORT ?? 4000);
const host = "0.0.0.0";

const app = await buildApp();

startAudioExtractWorker();

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

async function shutdown() {
  await closeQueues();
  await app.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
