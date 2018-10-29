import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import * as IotData from "aws-sdk/clients/iotdata";
import { IPublishedEvent } from "../../cqrs/IEvent";
import { SearchableTodoRepository } from "../../todo/query/SearchableTodoRepository";
import { TodoNotifier } from "../../todo/query/TodoNotifier";
import { TodoQueryModel } from "../../todo/query/TodoQueryModel";
import { TodoQueryModelWatcher } from "../../todo/query/TodoQueryModelWatcher";
import { esClient } from "../esClient";

const readModel = new TodoQueryModel(new SearchableTodoRepository(esClient));
const iotData = new IotData({endpoint: process.env.IotEndpointAddress});
const readModelWatcher = new TodoQueryModelWatcher(new TodoNotifier(iotData), readModel);

export async function handler(evt: DynamoDBStreamEvent): Promise<void> {
    const events = evt.Records
        .filter(r => r.dynamodb!.NewImage! && !r.dynamodb!.OldImage)
        .map(r => r.dynamodb!.NewImage!)
        .map(i => Converter.unmarshall(i) as IPublishedEvent);

    for (const e of events) {
        await readModelWatcher.applyEvent(e);
    }
}
