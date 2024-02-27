export const build_response = (body: string, statusCode: number = 200) => {
  return {
    statusCode,
    body,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    },
  };
};
