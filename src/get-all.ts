const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const DDB_TABLE_NAME = process.env.DDB_TABLE_NAME || '';

export const handler = async () : Promise <any> => {

  const params = {
    TableName: DDB_TABLE_NAME
  };

  try {
    const response = await db.scan(params).promise();
    return { statusCode: 200, body: JSON.stringify(response.Items) };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError)};
  }
};
