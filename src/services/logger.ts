type LogLevel = "debug" | "info" | "warn" | "error";

export enum ELoggerTags {
  DEV_DEBUG = "DEV_DEBUG",
  NETWORK = "NETWORK",
  DATA_TRANSFORMATION = "DATA_TRANSFORMATION",
}

interface LogMessage {
  iStackBuddy: true;
  logLevel: LogLevel;
  tag: ELoggerTags;
  subTag: string;
  message: string;
  timestamp?: string;
}

class Logger {
  private formatMessage(
    level: LogLevel,
    message: string,
    tag: ELoggerTags,
    subTag: string
  ): LogMessage {
    return {
      iStackBuddy: true,
      logLevel: level,
      tag,
      subTag,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  debug(
    message: string,
    tag: ELoggerTags = ELoggerTags.DEV_DEBUG,
    subTag: string = "logger-service"
  ) {
    console.debug(this.formatMessage("debug", message, tag, subTag));
  }

  info(
    message: string,
    tag: ELoggerTags = ELoggerTags.DEV_DEBUG,
    subTag: string = "logger-service"
  ) {
    console.info(this.formatMessage("info", message, tag, subTag));
  }

  warn(
    message: string,
    tag: ELoggerTags = ELoggerTags.DEV_DEBUG,
    subTag: string = "logger-service"
  ) {
    console.warn(this.formatMessage("warn", message, tag, subTag));
  }

  error(
    message: string,
    tag: ELoggerTags = ELoggerTags.DEV_DEBUG,
    subTag: string = "logger-service"
  ) {
    console.error(this.formatMessage("error", message, tag, subTag));
  }
}

// Create a singleton instance
export const logger = new Logger();
