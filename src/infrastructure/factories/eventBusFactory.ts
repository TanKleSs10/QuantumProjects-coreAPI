import { IEventBus } from "@src/domain/services/IEventBus";
import { logger } from "@src/infrastructure/logs";
import { LoggerEventBus } from "@src/infrastructure/services/LoggerEventBus";

export const eventBus: IEventBus = new LoggerEventBus(logger.child("EventBus"));
