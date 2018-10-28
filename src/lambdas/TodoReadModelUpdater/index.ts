import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { IPublishedEvent } from "../../cqrs/IEvent";
import { TodoReadModel } from "../../todo/TodoReadModel";

const readModel = new TodoReadModel();

export async function handler(evt: DynamoDBStreamEvent): Promise<void> {
    const events = evt.Records
        .filter(r => r.dynamodb!.NewImage! && !r.dynamodb!.OldImage)
        .map(r => r.dynamodb!.NewImage!)
        .map(i => Converter.unmarshall(i) as IPublishedEvent);

    for (const e of events) {
        await readModel.applyEvent(e);
    }
}
