import { TimestampOptions } from "logform";
import { v4 as uuidv4 } from "uuid";
import { Logger, createLogger, format, transports } from "winston";
import * as Transport from "winston-transport";
const { combine, timestamp } = format;

export declare type LogReferences<T extends string | number | symbol> = Record<
  T,
  string
>;

const transformLogInfo = (info: any) => {
  info.log_event_id = `${uuidv4()}`;
  return info;
};

export const getTimestamp = () => {
  return new Date().getTime();
};

const splunkFormat = combine(
  timestamp(getTimestamp as TimestampOptions),
  format(transformLogInfo)(),
  format.json()
);

export class LambdaLogger<T extends string | number | symbol> {
  [key: string]: any;

  private _logger: Logger;
  private _logReferences: LogReferences<T>;
  private _reservedFields: string[];
  constructor(moduleName: string, logReferences: LogReferences<T>, level: string = "info", transports?: Transport[]) {
    this._logger = this._createWinstonLogger(moduleName, level, transports);
    this._logReferences = logReferences;
    this._reservedFields = [
      "level",
      "timestamp",
      "module",
      "message",
      "log_reference",
      "log_event_id",
    ];
  }

  info(logReference: T, logArgs = {}) {
    this._logger.info(this._buildLog(logReference, logArgs));
  }

  warn(logReference: T, logArgs = {}) {
    this._logger.warn(this._buildLog(logReference, logArgs));
  }

  error(logReference: T, logArgs = {}) {
    this._logger.error(this._buildLog(logReference, logArgs));
  }
  debug(logReference: T, logArgs = {}) {
    this._logger.debug(this._buildLog(logReference, logArgs));
  }

  _getLogTransports(): Transport[] {
    return [new transports.Console()];
  }

  _createWinstonLogger(
    moduleName: string,
    level: string = "info",
    transports?: Transport[]
  ) {
    return createLogger({
      level,
      format: splunkFormat,
      defaultMeta: { module: moduleName },
      transports: transports ?? this._getLogTransports(),
    });
  }

  _validateLogArgs(logArgs: Record<string, string>) {
    let dictLogArgs = this._convertLogArgsToDict(logArgs);
    return this._removeReservedFields(dictLogArgs);
  }

  _convertLogArgsToDict(logArgs: Record<string, string>) {
    if (
      typeof logArgs === "object" &&
      logArgs !== null &&
      !Array.isArray(logArgs)
    ) {
      return logArgs;
    }
    this._logger.warn({
      ["log_reference"]: "LOGGER001",
      message: "log args is not a dictionary",
    });
    return {};
  }

  _removeReservedFields(logArgs: Record<string, string>) {
    let cleanedArgs = logArgs;
    for (let field of this._reservedFields) {
      if (field in cleanedArgs) {
        delete cleanedArgs[field];
        this._logger.warn({
          ["log_reference"]: "LOGGER002",
          message: `"${field}" cannot be used in log arguments because it is reserved by the logger`,
        });
      }
    }
    return cleanedArgs;
  }

  _buildLog(logReference: T, logArgs: Record<string, string>) {
    const validatedLogArgs = this._validateLogArgs(logArgs);

    return {
      ["log_reference"]: logReference,
      message: this._logReferences[logReference] || "log reference not found",
      ...validatedLogArgs,
    };
  }
}
