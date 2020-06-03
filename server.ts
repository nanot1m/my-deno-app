import {
  serve,
  ServerRequest,
} from "https://deno.land/std@0.55.0/http/server.ts";

export type ResponseObject = {
  body?: string;
  headers?: Headers;
  status?: number;
};

export type RequestHandler = (
  req: ServerRequest
) => ResponseObject | Promise<ResponseObject>;

type InternalRequestHandler = (req: ServerRequest) => boolean;

function composeHandlers(
  handlerA: InternalRequestHandler,
  handlerB: InternalRequestHandler
): InternalRequestHandler {
  return (req) => handlerA(req) || handlerB(req);
}

function notFoundHandler(req: ServerRequest) {
  return req.respond({ status: 404, body: "Not found" });
}

function createServer(handleAppRequest: InternalRequestHandler = () => false) {
  return {
    use(method: string, url: string | RegExp, handler: RequestHandler) {
      const handleActionRequest: InternalRequestHandler = (req) => {
        if (req.method.toLowerCase() !== method.toLowerCase()) {
          return false;
        }
        if (typeof url === "string" && req.url !== url) {
          return false;
        }
        if (url instanceof RegExp && !url.test(req.url)) {
          return false;
        }
        Promise.resolve(handler(req)).then((res) => req.respond(res));
        return true;
      };
      return createServer(
        composeHandlers(handleAppRequest, handleActionRequest)
      );
    },
    async run(port: number, cb: () => void) {
      const s = serve({ port });
      cb();
      for await (const req of s) {
        const matched = handleAppRequest(req);
        if (!matched) {
          notFoundHandler(req);
        }
      }
    },
  };
}

export { createServer };
