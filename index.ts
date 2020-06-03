import { createServer } from "./server.ts";

createServer()
  .use("get", "/", (req) => {
    return { body: "<h1>Hello world!</h1>" };
  })
  .use("get", /^\/user\/\w+/i, (req) => {
    const userId = /^\/user\/(\w+)/i.exec(req.url);
    return { body: "<h1>Hello " + userId?.[1] + "</h1>" };
  })
  .run(8000, () => console.log("🌍 Listening http://localhost:8000/"));
