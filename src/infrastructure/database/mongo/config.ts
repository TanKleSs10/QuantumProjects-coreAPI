import { ILogger } from "@src/interfaces/Logger";
import mongoose from "mongoose";

interface OptionsDB {
  mongoUri: string;
  logger: ILogger;
}

export class MongoConfig {
  private readonly mongoUri: string;
  private readonly logger: ILogger;

  constructor(options: OptionsDB) {
    this.mongoUri = options.mongoUri;
    this.logger = options.logger;
  }

  async connect(): Promise<void> {
    try {
      await mongoose.connect(this.mongoUri);
      this.logger.info("Connected to MongoDB");
    } catch (err) {
      this.logger.error("Error connecting to MongoDB", { error: err });
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.logger.info("Disconnected from MongoDB");
    } catch (err) {
      this.logger.error("Error disconnecting from MongoDB", { error: err });
    }
  }
}
