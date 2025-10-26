import express, { Router, type Application } from "express";
import http from "node:http";

interface ServerConfig {
  port: number;
  routes: Router;
}

export class Server {
  private readonly app: Application;
  private readonly httpServer: http.Server;
  private readonly port: number;
  private readonly routes: Router;

  constructor(config: ServerConfig) {
    this.app = express();
    this.port = config.port;
    this.httpServer = http.createServer(this.app);
    this.routes = config.routes;
  }

  public start(): void {
    this.app.use(this.routes);

    this.httpServer.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }

  public stop(): void {
    if (!this.app) return;
    this.httpServer.close(() => {
      console.log("Server has been stopped.");
    });
  }
}
