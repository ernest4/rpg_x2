import path from "path";
import http from "http";
// import url from "url";
import fs from "fs";

const PORT = (process.env.PORT && parseInt(process.env.PORT)) || 3001;

const STATICS_BASE_PATH = "./dist";
// const STATICS_PATH = path.join(STATICS_BASE_PATH, "statics");
// const ASSETS_PATH = path.join(STATICS_PATH, "assets");
const STATICS_RESOLVED_BASE_PATH = path.resolve(STATICS_BASE_PATH);

const server = (request: http.IncomingMessage, response: http.ServerResponse) => {
  let url = path.normalize(request.url);
  if (url === "/") url = "/statics/index.html"; // NOTE: index only handling
  const safeSuffix = url.replace(/^(\.\.[\/\\])+/, "");
  const fileLocation = path.join(STATICS_RESOLVED_BASE_PATH, safeSuffix);

  const stream = fs.createReadStream(fileLocation);

  // Handle non-existent file
  stream.on("error", error => {
    response.writeHead(404, "Not Found");
    response.write("404: File Not Found!");
    response.end();
  });

  // File exists, stream it to user
  response.statusCode = 200;
  stream.pipe(response);
};

const httpServer = http.createServer(server);

httpServer.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
