import AWS = require("aws-sdk");
import { TodoApiClient } from "./TodoApiClient";

export interface ITestSetup {
    apiRoot: string;
    todoApiClient: TodoApiClient;
}

export const TestSetup: ITestSetup = {} as ITestSetup;

before(async () => {
    const cloudFormation = new AWS.CloudFormation();
    const describeResp = await cloudFormation.describeStacks({
        StackName: `rhtodo-dev-${process.env.USER}`
    }).promise();
    const outputs = describeResp.Stacks![0]!.Outputs!;
    TestSetup.apiRoot = outputs.find(o => o.OutputKey === "ApiRoot")!.OutputValue!;
    TestSetup.todoApiClient = new TodoApiClient(TestSetup.apiRoot);
});
