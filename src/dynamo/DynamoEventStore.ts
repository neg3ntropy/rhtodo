import { IEventStore } from "../cqrs/IEventStore";
import { IPublishedEvent } from "../cqrs/IEvent";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export class DynamoEventStore implements IEventStore {

    public constructor(private readonly dynamo: DocumentClient,
                       private readonly table: string) {
    }

    public async commit<T extends IPublishedEvent>(e: T): Promise<boolean> {
        const input: DocumentClient.PutItemInput = {
            TableName: this.table,
            Item: e,
            ConditionExpression: "attribute_not_exists(aggregateId) AND attribute_not_exists(#sequence)",
            ExpressionAttributeNames: {"#sequence":  "sequence"}
        };
        try {
            await this.dynamo.put(input).promise();
            return true;
        } catch (error) {
            if (error.name !== "ConditionalCheckFailedException") {
                throw error;
            }
            return false;
        }
    }

    public async load(aggregateId: string): Promise<IPublishedEvent[]> {
        const query: DocumentClient.QueryInput = {
            TableName: this.table,
            ConsistentRead: true,
            KeyConditionExpression: `aggregateId = :aggregateId`,
            ExpressionAttributeValues: {":aggregateId":  aggregateId}
        };
        const response = await this.dynamo.query(query).promise();
        return response.Items as IPublishedEvent[] || [];
    }

}
