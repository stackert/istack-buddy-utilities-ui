import { logger, ELoggerTags, LogMessage } from "../logger";

describe("Logger Service", () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    // Spy on all console methods
    consoleSpy = {
      debug: jest.spyOn(console, "debug"),
      info: jest.spyOn(console, "info"),
      warn: jest.spyOn(console, "warn"),
      error: jest.spyOn(console, "error"),
    };
  });

  afterEach(() => {
    // Restore all console spies
    Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
  });

  const verifyLogMessage = (
    spy: jest.SpyInstance,
    level: LogMessage["logLevel"],
    message: string,
    tag: ELoggerTags = ELoggerTags.DEV_DEBUG,
    subTag: string = "logger-service"
  ) => {
    expect(spy).toHaveBeenCalledTimes(1);
    const logCall = spy.mock.calls[0][0];

    // Verify the log message structure
    expect(logCall).toEqual({
      iStackBuddy: true,
      logLevel: level,
      tag,
      subTag,
      message,
      timestamp: expect.any(String),
    });

    // Verify timestamp is valid ISO string
    expect(new Date(logCall.timestamp).toISOString()).toBe(logCall.timestamp);
  };

  describe("Log Levels", () => {
    it("logs debug messages", () => {
      const message = "Debug test message";
      logger.debug(message);
      verifyLogMessage(consoleSpy.debug, "debug", message);
    });

    it("logs info messages", () => {
      const message = "Info test message";
      logger.info(message);
      verifyLogMessage(consoleSpy.info, "info", message);
    });

    it("logs warning messages", () => {
      const message = "Warning test message";
      logger.warn(message);
      verifyLogMessage(consoleSpy.warn, "warn", message);
    });

    it("logs error messages", () => {
      const message = "Error test message";
      logger.error(message);
      verifyLogMessage(consoleSpy.error, "error", message);
    });
  });

  describe("Tags and SubTags", () => {
    it("uses default tag and subTag when not provided", () => {
      const message = "Test message with defaults";
      logger.info(message);
      verifyLogMessage(
        consoleSpy.info,
        "info",
        message,
        ELoggerTags.DEV_DEBUG,
        "logger-service"
      );
    });

    it("uses custom tag and subTag when provided", () => {
      const message = "Test message with custom tags";
      const tag = ELoggerTags.NETWORK;
      const subTag = "api-call";

      logger.info(message, tag, subTag);
      verifyLogMessage(consoleSpy.info, "info", message, tag, subTag);
    });
  });

  describe("Message Formatting", () => {
    it("includes all required fields in log message", () => {
      const message = "Test message";
      logger.info(message);

      const logCall = consoleSpy.info.mock.calls[0][0];
      expect(logCall).toHaveProperty("iStackBuddy", true);
      expect(logCall).toHaveProperty("logLevel", "info");
      expect(logCall).toHaveProperty("tag");
      expect(logCall).toHaveProperty("subTag");
      expect(logCall).toHaveProperty("message", message);
      expect(logCall).toHaveProperty("timestamp");
    });

    it("generates valid ISO timestamp", () => {
      const message = "Test message";
      logger.info(message);

      const logCall = consoleSpy.info.mock.calls[0][0];
      const timestamp = logCall.timestamp;

      // Verify it's a valid ISO string
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });
});
