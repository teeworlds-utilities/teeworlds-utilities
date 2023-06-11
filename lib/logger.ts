import { FormattedDateTime } from './utils/datetime';
import { files } from './utils/files';

enum LogLevel {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

enum LogOutput {
  STDOUT,
  FILE,
  ALL
}

const DIR = process.env.LOG_DIR || ".";

class Log {
  private level?: LogLevel;
  private message?: string;
  private output?: LogOutput;
  private logger?: (msg: string) => void;

  constructor(output: LogOutput = LogOutput.ALL) {
    this.output = output;
    this.logger = console.log;
  }

  setLevel(level: LogLevel): Log {
    this.level = level;
    
    return this;
  }

  setMessage(message: string): Log {
    this.message = message;
    
    return this;
  }

  setOutput(output: LogOutput): Log {
    this.output = output;

    return this;
  }

  private setLoggerWithLevel(): Log {
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
        this.logger = console.trace;
        break;
      default:
        this.logger = console.log;
        break;
    }

    return this;
  }

  private writeOutput(output: LogOutput): Log {
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

  run() {
    this
      .setLoggerWithLevel()
      .writeOutput(this.output);
  }
}

class Logger {
  // private static output(logOutput: LogOutput,)

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
    this.send(LogLevel.DEBUG, message, output);
  }
}

export { Logger, LogOutput };