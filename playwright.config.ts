import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  webServer: {
    command:
      "node -e \"const http=require('node:http');http.createServer((req,res)=>{const url=new URL(req.url||'/', 'http://127.0.0.1:4173');const ready=url.searchParams.get('ready')==='1';const body=ready?'<div>Chat</div>':'<div>Setup</div><div>root:ok</div><div>runtime:fail</div><div>provider:ok</div><div>ready:fail</div>';res.setHeader('Content-Type','text/html; charset=utf-8');res.end(body);}).listen(4173)\"",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 60_000
  }
});
