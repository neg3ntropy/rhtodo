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

    beforeEach(() => {
        sut = new DynamoEventStore(dynamo, `rhtodo-dev-${process.env.USER}-Events`);
        testEvent = {aggregateId: "test", name: "TestEvent", sequence: 0, test: "zero"};
    });

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
