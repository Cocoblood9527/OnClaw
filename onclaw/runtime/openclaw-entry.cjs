const http = require("node:http");
const host = process.env.ONCLAW_HEALTH_HOST || "127.0.0.1";
const port = Number(process.env.ONCLAW_HEALTH_PORT || "18789");
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.statusCode = 200;
    res.end("ok");
    return;
  }
  res.statusCode = 404;
  res.end("not-found");
});
server.listen(port, host);
const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);