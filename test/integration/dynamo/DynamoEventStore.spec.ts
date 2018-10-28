import expect = require("expect.js");
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { IPublishedEvent } from "../../../src/cqrs/IEvent";
import { DynamoEventStore } from "../../../src/dynamo/DynamoEventStore";

describe("Given a DynamoEventStore", () => {

    interface TestEvent extends IPublishedEvent {
        name: "TestEvent";
        test: string;
    }

    let sut: DynamoEventStore;
    const dynamo = new DocumentClient();
    let testEvent: TestEvent;

    beforeEach(async () => {
        const table = `rhtodo-dev-${process.env.USER}-Events`;
        await cleanDb(table);
        sut = new DynamoEventStore(dynamo, table);
        testEvent = {aggregateId: "test", name: "TestEvent", sequence: 0, timeUuid: "timeUuid", test: "zero"};
    });

    async function cleanDb(table: string): Promise<void> {
        const query: DocumentClient.QueryInput = {
            TableName: table,
            KeyConditionExpression: `aggregateId = :aggregateId`,
            ExpressionAttributeValues: {":aggregateId":  "test"}
        };
        const results = await dynamo.query(query).promise();
        const deletes = (results.Items || [])
            .map<DocumentClient.Key>(e => ({aggregateId: e.aggregateId, sequence: e.sequence}))
            .map(k => dynamo.delete({TableName: table, Key: k }).promise());
        await Promise.all(deletes);
    }

    context("When a new event is stored", () => {

        let ok: boolean;
        beforeEach(async () => {
            ok = await sut.commit(testEvent);
        });

        it("Should return true", async () => {
            expect(ok).to.be.ok();
        });

        context("When loading", () => {
            it("Should retrieve the event", async () => {
                const events = await sut.load("test");
                expect(events).to.eql([testEvent]);
            });
        });

        context("When there is a concurrency conflict", () => {
            it("Should not store the second event", async () => {
                const okTwice = await sut.commit(testEvent);
                expect(okTwice).not.to.be.ok();
                const events = await sut.load("test");
                expect(events).to.have.length(1);
            });
        });
    });

});
