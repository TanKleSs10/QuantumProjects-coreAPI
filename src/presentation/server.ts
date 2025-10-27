import { ILogger } from "@src/interfaces/Logger";
import express, { Router, type Application } from "express";
import http from "node:http";

interface ServerConfig {
  port: number;
  routes: Router;
  Logger: ILogger;
}

export class Server {
  private readonly app: Application;
  private readonly httpServer: http.Server;
  private readonly port: number;
  private readonly routes: Router;
  private readonly logger: ILogger;

  constructor(config: ServerConfig) {
    this.app = express();
    this.port = config.port;
    this.httpServer = http.createServer(this.app);
    this.routes = config.routes;
    this.logger = config.Logger;
  }

  public start(): void {
    // Routes
    this.app.use(this.routes);

    this.httpServer.listen(this.port, () => {
      this.logger.info(`Server is running on port ${this.port}`);
    });
  }

  public stop(): void {
    if (!this.app) return;
    this.httpServer.close(() => {
      this.logger.info("Server has been stopped");
    });
  }
}
