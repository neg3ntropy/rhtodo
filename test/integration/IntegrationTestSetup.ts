import AWS = require("aws-sdk");

export interface IIntegrationTestSetup {
    apiRoot: string;
    elasticsearchDomainEndpoint: string;
}

export const IntegrationTestSetup: IIntegrationTestSetup = {} as IIntegrationTestSetup;

before(async () => {
    const cloudFormation = new AWS.CloudFormation();
    const describeResp = await cloudFormation.describeStacks({
        StackName: `rhtodo-dev-${process.env.USER}`
    }).promise();
    const outputs = describeResp.Stacks![0]!.Outputs!;
    const outputMap = new Map(outputs.map<[string, string]>(o => [o.OutputKey!, o.OutputValue!]));
    IntegrationTestSetup.apiRoot = outputMap.get("ApiRoot")!;
    IntegrationTestSetup.elasticsearchDomainEndpoint = outputMap.get("ElasticsearchDomainEndpoint")!;
});
