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
   * @param {LogLevel} level - Log level
   * @returns this
   */
  setLevel(level: LogLevel): this {
    this.level = level;
    
    return this;
  }

  /**
   * This function sets a message for a log and returns the log object.
   * @param {string} message - Log message
   * @returns this
   */
  setMessage(message: string): this {
    this.message = message;
    
    return this;
  }

  /**
   * Set an output kind
   * @param output - Log output
   * @returns this
   */
  setOutput(output: LogOutput): this {
    this.output = output;

    return this;
  }

  /**
   * Set a logger
   * @returns this
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
   * Write to the output
   * @param output - Log output 
   * @returns this
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

  static critical(message: string, output: LogOutput = LogOutput.STDOUT) {
    this.send(LogLevel.CRITICAL, message, output);
  }

  static error(message: string, output: LogOutput = LogOutput.STDOUT) {
    this.send(LogLevel.ERROR, message, output);
  }

  static warning(message: string, output: LogOutput = LogOutput.STDOUT) {
    this.send(LogLevel.WARNING, message, output);
  }

  static info(message: string, output: LogOutput = LogOutput.STDOUT) {
    this.send(LogLevel.INFO, message, output);
  }

  static debug(message: string, output: LogOutput = LogOutput.STDOUT) {
    if (!process.env.DEBUG) {
      return;
    }

    this.send(LogLevel.DEBUG, message, output);
  }
}
