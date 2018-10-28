import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { Client } from "elasticsearch";
import * as HttpAmazonESConnector from "http-aws-es";
import { IPublishedEvent } from "../../cqrs/IEvent";
import { SearchableTodoRepository } from "../../todo/query/SearchableTodoRepository";
import { TodoReadModel } from "../../todo/query/TodoQueryModel";

const esClient = new Client({
    host: [`https://${process.env.ElasticsearchDomainEndpoint}`],
    connectionClass: HttpAmazonESConnector
});
const readModel = new TodoReadModel(new SearchableTodoRepository(esClient));

export async function handler(evt: DynamoDBStreamEvent): Promise<void> {
    const events = evt.Records
        .filter(r => r.dynamodb!.NewImage! && !r.dynamodb!.OldImage)
        .map(r => r.dynamodb!.NewImage!)
        .map(i => Converter.unmarshall(i) as IPublishedEvent);

    for (const e of events) {
        await readModel.applyEvent(e);
    }
}
