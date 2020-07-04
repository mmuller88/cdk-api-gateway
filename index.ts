import { Function, AssetCode, Runtime} from '@aws-cdk/aws-lambda';
import { LambdaToDynamoDB } from '@aws-solutions-constructs/aws-lambda-dynamodb';
import { Stack, App, RemovalPolicy } from '@aws-cdk/core';
import { Table, AttributeType, StreamViewType } from '@aws-cdk/aws-dynamodb';
import { RestApi, LambdaIntegration, MockIntegration, IResource, PassthroughBehavior } from '@aws-cdk/aws-apigateway';
import { DynamoDBStreamToLambda } from '@aws-solutions-constructs/aws-dynamodb-stream-lambda';

export class ApiLambdaCrudDynamoDBStack extends Stack {
  constructor(app: App, id: string) {
    super(app, id);

    const dynamoTable = new Table(this, 'items', {
      partitionKey: {
        name: 'itemId',
        type: AttributeType.STRING
      },
      tableName: 'items',
      stream: StreamViewType.NEW_AND_OLD_IMAGES,

      // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
      // the new table, and it will remain in your account until manually deleted. By setting the policy to 
      // DESTROY, cdk destroy will delete the table (even if it has data in it)
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    const showDdbEdit = new Function(this, 'showDdbEdit', {
      code: new AssetCode('src'),
      handler: 'show-edit.handler',
      runtime: Runtime.NODEJS_10_X
    });

    new DynamoDBStreamToLambda(this, 'dynamodb-stream-lambda', {
      deployLambda: false,
      existingLambdaObj: showDdbEdit,
      existingTableObj: dynamoTable
    });
   
    const getOneLambda = new Function(this, 'getOneLambda', {
      code: new AssetCode('src'),
      handler: 'get-one.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        PRIMARY_KEY: 'itemId'
      }
    });

    new LambdaToDynamoDB(this, 'getOneLambda-dynamodb', {
      deployLambda: false,
      existingLambdaObj: getOneLambda,
      existingTableObj: dynamoTable,
    });

    const getAllLambda = new Function(this, 'getAllLambda', {
      code: new AssetCode('src'),
      handler: 'get-all.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        PRIMARY_KEY: 'itemId'
      }
    });

    new LambdaToDynamoDB(this, 'getAllLambda-dynamodb', {
      deployLambda: false,
      existingLambdaObj: getAllLambda,
      existingTableObj: dynamoTable,
    });

    const createOne = new Function(this, 'createOne', {
      code: new AssetCode('src'),
      handler: 'create.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        PRIMARY_KEY: 'itemId'
      }
    });

    new LambdaToDynamoDB(this, 'createOne-dynamodb', {
      deployLambda: false,
      existingLambdaObj: createOne,
      existingTableObj: dynamoTable,
    });

    const updateOne = new Function(this, 'updateItemFunction', {
      code: new AssetCode('src'),
      handler: 'update-one.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        PRIMARY_KEY: 'itemId'
      }
    });

    new LambdaToDynamoDB(this, 'updateOne-dynamodb', {
      deployLambda: false,
      existingLambdaObj: updateOne,
      existingTableObj: dynamoTable,
    });

    const deleteOne = new Function(this, 'deleteItemFunction', {
      code: new AssetCode('src'),
      handler: 'delete-one.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        PRIMARY_KEY: 'itemId'
      }
    });

    new LambdaToDynamoDB(this, 'deleteOne-dynamodb', {
      deployLambda: false,
      existingLambdaObj: deleteOne,
      existingTableObj: dynamoTable,
    });

    const api = new RestApi(this, 'itemsApi', {
      restApiName: 'Items Service'
    });

    const items = api.root.addResource('items');
    const getAllIntegration = new LambdaIntegration(getAllLambda);
    items.addMethod('GET', getAllIntegration);

    const createOneIntegration = new LambdaIntegration(createOne);
    items.addMethod('POST', createOneIntegration);
    addCorsOptions(items);

    const singleItem = items.addResource('{id}');
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    singleItem.addMethod('GET', getOneIntegration);

    const updateOneIntegration = new LambdaIntegration(updateOne);
    singleItem.addMethod('PATCH', updateOneIntegration);

    const deleteOneIntegration = new LambdaIntegration(deleteOne);
    singleItem.addMethod('DELETE', deleteOneIntegration);
    addCorsOptions(singleItem);
  }
}

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod('OPTIONS', new MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },  
    }]
  })
}

const app = new App();
new ApiLambdaCrudDynamoDBStack(app, 'ApiLambdaCrudDynamoDBExample');
app.synth();
