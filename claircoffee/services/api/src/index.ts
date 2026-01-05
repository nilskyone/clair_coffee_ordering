import http from "http";
import dotenv from "dotenv";
import { createApp } from "./app";
import { initSocket } from "./ws";

dotenv.config();

const app = createApp();
const server = http.createServer(app);

initSocket(server);

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3001);

server.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});
