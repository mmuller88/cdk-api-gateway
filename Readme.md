# cdk-api-gateway

1) Checkout https://github.com/aws-samples

2) Copy the content of ./aws-cdk-examples/tree/master/typescript/api-cors-lambda-crud-dynamodb it to this project

3) Follow the Build and Deploy

## Build

To build this app, you need to be in this example's root folder. Then run the following:

```bash
npm install -g aws-cdk
npm install && npm install --prefix src
npm run build
```

This will install the necessary CDK, then this example's dependencies, and then build your TypeScript files and your CloudFormation template.

## Deploy

Run `cdk bootstrap aws://<ACCOUNT-NUMBER>/<REGION>`for deploying the cdk toolkit stack
Run `npm run build && cdk deploy`. This will build and deploy / redeploy your Stack to your AWS Account.

After the deployment you will see the API's URL, which represents the url you can then use.

## Destroy

Run `cdk destroy`