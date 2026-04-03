import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  webServer: {
    command: "node -e \"const http=require('node:http');http.createServer((_,res)=>{res.end('Setup')}).listen(4173)\"",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 60_000
  }
});
