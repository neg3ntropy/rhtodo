import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { EventSourcedAggregateCommandProcessor } from "../../cqrs/EventSourcedCommandProcessor";
import { ICommand } from "../../cqrs/ICommand";
import { DynamoEventStore } from "../../dynamo/DynamoEventStore";
import { AppError } from "../../errorHandling/AppError";
import { TodoAggregateRepository } from "../../todo/command/TodoAggregateRepository";
import { ErrorResponse } from "../../errorHandling/ErrorResponse";

const dynamoEventStore = new DynamoEventStore(new DocumentClient(), process.env.EventsTable!);
const aggregateRepository = new TodoAggregateRepository(dynamoEventStore);
const commandProcessor = new EventSourcedAggregateCommandProcessor(aggregateRepository);

function toCommand(evt: APIGatewayEvent): ICommand {
    return JSON.parse(evt.body || "{}");
}

function toErrorResponse(appError: AppError): ErrorResponse {
    return {
        ok: false,
        errorCode: appError.code,
        errorMessage: appError.message
    };
}

export async function handler(evt: APIGatewayEvent): Promise<APIGatewayProxyResult> {
    const command = toCommand(evt);
    const ack = await commandProcessor.process(command);
    if (ack.ok) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                ok: true,
                version: ack.version
            })
        };
    } else if (ack.error instanceof AppError) {
        return {
            statusCode: ack.error.status,
            body: JSON.stringify(toErrorResponse(ack.error))
        };
    } else {
        throw ack.error;
    }
}
