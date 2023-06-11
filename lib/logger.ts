import { FormattedDateTime } from './utils/datetime';
import { files } from './utils/files';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Represents the log level sorted by order of importance,
 * `CRITICAL` being the most important and `DEBUG` least one.
 */
enum LogLevel {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

/**
 * Log output descriptor.
 */
export enum LogOutput {
  STDOUT,
  FILE,
  ALL
}

const DIR = process.env.LOG_DIR || ".";

/**
 * Log class is a TypeScript implementation of a logging utility that allows
 * users to set the logging level, message, and output destination.
*/
class Log {
  private level?: LogLevel;
  private message?: string;
  private output?: LogOutput;
  private logger?: (msg: string) => void;

  constructor(output: LogOutput = LogOutput.ALL) {
    this.output = output;
    this.logger = console.log;
  }

  /**
   * The function sets the logging level and returns the Log object.
   * @param {LogLevel} level - LogLevel - a parameter that specifies the level of
   * logging to be set. It can be one of the following values: "debug", "info",
   * "warn", or "error".
   * @returns The `Log` object is being returned.
   */
  setLevel(level: LogLevel): this {
    this.level = level;
    
    return this;
  }

  /**
   * This function sets a message for a log and returns the log object.
   * @param {string} message - The `message` parameter is a string that represents
   * the message to be logged.
   * @returns The `Log` object is being returned.
   */
  setMessage(message: string): this {
    this.message = message;
    
    return this;
  }

  /**
   * This function sets the output of a log and returns the log.
   * @param {LogOutput} output - The `output` parameter is of type `LogOutput` and
   * represents the destination where the log messages will be outputted. It could
   * be a file, console, database, or any other medium where the logs can be stored
   * or displayed. The `setOutput` method sets the output destination for the
   * @returns The `Log` object is being returned.
   */
  setOutput(output: LogOutput): this {
    this.output = output;

    return this;
  }

  /**
   * This function sets the logger based on the level of logging specified.
   * @returns The method `setLoggerWithLevel()` is returning the current instance
   * of the class (`this`) after setting the appropriate logger function based on
   * the current log level.
   */
  private setLoggerWithLevel(): this {
    switch (this.level) {
      case LogLevel.CRITICAL:
        this.logger = console.error;
        break;
      case LogLevel.ERROR:
        this.logger = console.error;
        break;
      case LogLevel.WARNING:
        this.logger = console.warn;
        break;
      case LogLevel.INFO:
        this.logger = console.info;
        break;
      case LogLevel.DEBUG:
        this.logger = console.debug;
        break;
      default:
        this.logger = console.log;
        break;
    }

    return this;
  }

  /**
   * This function writes the log message to a file or standard output based on the
   * specified output type.
   * @param {LogOutput} output - The parameter `output` is of type `LogOutput`,
   * which is an enum that represents the different types of log outputs that can
   * be used. The `writeOutput` method uses this parameter to determine which type
   * of output to write the log message to.
   * @returns the current instance of the class (`this`) after performing the
   * specified output action based on the input parameter.
   */
  private writeOutput(output: LogOutput): this {
    switch (output) {
      case LogOutput.FILE:
        const ext = '.log';
        const filename = DIR + '/' + FormattedDateTime.date;

        files.append(filename + ext, this.message + '\n');
        break;
      case LogOutput.STDOUT:
        this.logger(this.message);
        break;
      case LogOutput.ALL:
        this.writeOutput(LogOutput.FILE);
        this.writeOutput(LogOutput.STDOUT);
        break;
      default:
        break;
    }

    return this;
  }

  /**
   * The "run" function sets the logger level and writes the output.
   */
  run() {
    this
      .setLoggerWithLevel()
      .writeOutput(this.output);
  }
}

export class Logger {
  private static send(
    level: LogLevel,
    message: string,
    output: LogOutput
  ) {
    const datetime = FormattedDateTime.datetime;
    const levelString = '[' + level + ']';

    message = levelString + ' ' + '[' + datetime + '] ' + message;

    new Log()
      .setLevel(level)
      .setMessage(message)
      .setOutput(output)
      .run();
  };

  /**
   * This is a static method in TypeScript that sends a critical log message with
   * an optional output destination.
   * @param {string} message - The message parameter is a string that represents
   * the log message that needs to be recorded. It could be an error message, a
   * warning, or any other information that needs to be logged.
   * @param {LogOutput} output - The `output` parameter is an optional parameter of
   * type `LogOutput` that specifies where the log message should be sent. It has a
   * default value of `LogOutput.STDOUT`, which means the message will be sent to
   * the standard output (console).
   */
  static critical(message: string, output: LogOutput = LogOutput.STDOUT) {
    this.send(LogLevel.CRITICAL, message, output);
  }

  /**
   * This is a static function in TypeScript that sends an error message with a
   * specified output.
   * @param {string} message - The `message` parameter is a string that represents
   * the error message that needs to be logged.
   * @param {LogOutput} output - The `output` parameter is an optional parameter of
   * type `LogOutput` that specifies where the log message should be sent. It has a
   * default value of `LogOutput.STDOUT`, which means the message will be sent to
   * the standard output (console).
   */
  static error(message: string, output: LogOutput = LogOutput.STDOUT) {
    this.send(LogLevel.ERROR, message, output);
  }

  /**
   * This is a static function in TypeScript that sends a warning message with a
   * specified output.
   * @param {string} message - The message parameter is a string that represents
   * the warning message that needs to be logged.
   * @param {LogOutput} output - The `output` parameter is an optional parameter of
   * type `LogOutput` that specifies where the log message should be sent. It has a
   * default value of `LogOutput.STDOUT`, which means the message will be sent to
   * the standard output (console).
   */
  static warning(message: string, output: LogOutput = LogOutput.STDOUT) {
    this.send(LogLevel.WARNING, message, output);
  }

  /**
   * This is a static method in TypeScript that sends an info log message with an
   * optional output destination.
   * @param {string} message - The message parameter is a string that represents
   * the information or message that needs to be logged. It could be any relevant
   * information that the developer wants to track or debug.
   * @param {LogOutput} output - The `output` parameter is an optional parameter of
   * type `LogOutput` that specifies where the log message should be sent. It has a
   * default value of `LogOutput.STDOUT`, which means the message will be sent to
   * the standard output (console).
   */
  static info(message: string, output: LogOutput = LogOutput.STDOUT) {
    this.send(LogLevel.INFO, message, output);
  }

  /**
   * This is a static method in TypeScript that sends a debug log message with an
   * optional output destination.
   * @param {string} message - The message parameter is a string that represents
   * the debug message that needs to be logged. It could be any information that
   * the developer wants to track or debug during the execution of the program.
   * @param {LogOutput} output - The `output` parameter is an optional parameter of
   * type `LogOutput` that specifies where the log message should be sent. It has a
   * default value of `LogOutput.STDOUT`, which means the message will be sent to
   * the standard output (console).
   */
  static debug(message: string, output: LogOutput = LogOutput.STDOUT) {
    if (!process.env.DEBUG) {
      return;
    }

    this.send(LogLevel.DEBUG, message, output);
  }
}
