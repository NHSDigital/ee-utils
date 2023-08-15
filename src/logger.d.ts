import { Logger, transports } from "winston";

export declare type LogReferences<T> = Record<T, string>;

declare class LambdaLogger<T> {
  constructor(moduleName: string, logReferences: LogReferences<T>);

  info: (
    logReference: keyof LogReferences<T>,
    logArgs: Record<string, any>
  ) => void;
  warn: (
    logReference: keyof LogReferences<T>,
    logArgs: Record<string, any>
  ) => void;
  error: (
    logReference: keyof LogReferences<T>,
    logArgs: Record<string, any>
  ) => void;

  _getLogTransports: () => Array<transports.ConsoleTransportInstance>;

  _createWinstonLogger: (moduleName: string) => Logger;

  _validateLogArgs: (logArgs: Record<string, any>) => Record<string, any>;

  _convertLogArgsToDict: (logArgs: Record<string, any>) => Record<string, any>;

  _removeReservedFields: (logArgs: Record<string, any>) => Record<string, any>;

  _buildLog: (
    logReference: keyof LogReferences<T>,
    logArgs: Record<string, any>
  ) => Record<string, any>;
}

export default LambdaLogger;
