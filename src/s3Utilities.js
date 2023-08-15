import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

export const outputToS3 = async (body, bucket, key, isJson = true) => {
  const s3Client = new S3Client({ region: "eu-west-2" });

  const putCommand = new PutObjectCommand({
    Body: isJson ? JSON.stringify(body) : body,
    Bucket: bucket,
    Key: key,
  });

  const s3SendResponse = await s3Client.send(putCommand);
  return s3SendResponse;
};

export const writeToS3HandleErrors = async (
  dataToWrite,
  bucketName,
  filename,
  isJson = true
) => {
  try {
    const s3Response = await outputToS3(
      dataToWrite,
      bucketName,
      filename,
      isJson
    );
    console.log("RESPONSE", s3Response);
    console.log(`UPLOADED OBJECT: ${bucketName}/${filename}`);
  } catch (err) {
    console.error("ERROR", err);
  }
};

export const getParsedJSONFromS3 = async (bucket, file) => {
  const s3Client = new S3Client({ region: "eu-west-2" });

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: file,
  });
  const s3Response = await s3Client.send(command);
  if (s3Response && s3Response["$metadata"].httpStatusCode === 200) {
    return JSON.parse(await s3Response.Body.transformToString());
  } else {
    throw new Error(
      "File or Bucket was not found or incorrect permissions to access!"
    );
  }
};
