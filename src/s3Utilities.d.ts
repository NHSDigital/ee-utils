export declare const writeToS3HandleErrors = async (
  dataToWrite: string | object,
  bucketName: string,
  filename: string,
  isJson: boolean = true
): Promise<void> => {};

export declare const outputToS3 = async (
  body: string | object,
  bucket: string,
  key: string,
  isJson: boolean
): Promise<void> => {};

export declare const getParsedJSONFromS3 = async (
  bucket: string,
  file: string
): Promise<object> => {};
