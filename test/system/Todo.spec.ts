import expect = require("expect.js");
import { FullResponse } from "request-promise-native";
import { v4 as uuid } from "uuid";
import { SystemTestSetup } from "./SystemTestSetup";
import { TodoApiClient } from "./TodoApiClient";

describe("Given the Todo API", () => {

    context("When a new Todo is created", () => {

        let createResponse: FullResponse;
        let aggregateId: string;
        let client: TodoApiClient;

        beforeEach(async () => {
            aggregateId = uuid();
            const createCommand = {
                name: "TodoCreate",
                aggregateId: aggregateId,
                title: "Test",
                description: `blah blah ${aggregateId}`
            };
            client = SystemTestSetup.todoApiClient;
            createResponse = await client.sendCommand(createCommand);
        });

        it("Should return an ok response", async () => {
            expect(createResponse.body).to.eql({ok: true, version: 1});
            expect(createResponse.statusCode).to.be(200);
        });

        context("When the change notification is received", () => {

            beforeEach(async () => {
                await new Promise(resolve => setTimeout(resolve, 2000)); // TODO websocket
            });

            it("Should be gettable", async () => {
                const getResponse = await client.get(aggregateId);
                expect(getResponse.statusCode).to.be(200);
                const item = getResponse.body;
                expect(item).to.have.property("createdAt");
                expect(item).to.eql({
                    _id: aggregateId,
                    title: "Test",
                    completed: false,
                    createdAt: item.createdAt,
                    description: `blah blah ${aggregateId}`
                });
            });

            it("Should be searchable", async () => {
                const getResponse = await client.search({q: `description=${aggregateId} AND completed:false`});
                expect(getResponse.statusCode).to.be(200);
                expect(getResponse.body.results).to.have.length(1);
                const item = getResponse.body.results[0];
                expect(item).to.eql({
                    _id: aggregateId,
                    title: "Test",
                    completed: false,
                    createdAt: item.createdAt,
                    description: `blah blah ${aggregateId}`
                });
            });
        });

        context("When the Todo is completed", () => {

            let completeResponse: FullResponse;

            beforeEach(async () => {
                const completeCommand = {
                    name: "TodoComplete",
                    aggregateId: aggregateId
                };
                completeResponse = await client.sendCommand(completeCommand);
            });

            it("Should return an ok response", async () => {
                expect(completeResponse.body).to.eql({ok: true, version: 2});
                expect(completeResponse.statusCode).to.be(200);
            });

            it("Should not accept another complete command", async () => {
                const completeCommand = {
                    name: "TodoComplete",
                    aggregateId: aggregateId
                };
                const completeResponseTwice = await client.sendCommand(completeCommand);
                expect(completeResponseTwice.statusCode).to.be(400);
                expect(completeResponseTwice.body).to.eql({
                    ok: false,
                    errorCode: "BAD_REQUEST",
                    errorMessage: "Unacceptable command when status=DONE"
                });
            });
        });

    });

});
