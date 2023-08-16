import { createLogger, format, transports } from "winston";
const { combine, timestamp } = format;
import { v4 as uuidv4 } from "uuid";

const transformLogInfo = (info) => {
  info.level = info.level.toUpperCase();
  info.log_event_id = `${uuidv4()}`;
  return info;
};

export const getTimestamp = () => {
  return new Date().getTime();
};

const splunkFormat = combine(
  timestamp(getTimestamp),
  format(transformLogInfo)(),
  format.json()
);

export class LambdaLogger {
  constructor(moduleName, logReferences) {
    this._logger = this._createWinstonLogger(moduleName);
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

  info(logReference, logArgs = {}) {
    this._logger.info(this._buildLog(logReference, logArgs));
  }

  warn(logReference, logArgs = {}) {
    this._logger.warn(this._buildLog(logReference, logArgs));
  }

  error(logReference, logArgs = {}) {
    this._logger.error(this._buildLog(logReference, logArgs));
  }

  _getLogTransports() {
    return [new transports.Console()];
  }

  _createWinstonLogger(moduleName) {
    return createLogger({
      level: "info",
      format: splunkFormat,
      defaultMeta: { module: moduleName },
      transports: this._getLogTransports(),
    });
  }

  _validateLogArgs(logArgs) {
    let dictLogArgs = this._convertLogArgsToDict(logArgs);
    return this._removeReservedFields(dictLogArgs);
  }

  _convertLogArgsToDict(logArgs) {
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

  _removeReservedFields(logArgs) {
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

  _buildLog(logReference, logArgs) {
    const validatedLogArgs = this._validateLogArgs(logArgs);

    return {
      ["log_reference"]: logReference,
      message: this._logReferences[logReference] || "log reference not found",
      ...validatedLogArgs,
    };
  }
}

export default LambdaLogger;
