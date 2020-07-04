import { RecordList } from 'aws-sdk/clients/dynamodbstreams';

export const handler = async (event: any = {}) : Promise <any> => {
  const records: RecordList = event.Records;

  records.forEach((record) => {
    console.log('Stream record: ', JSON.stringify(record, null, 2));
  });
}
