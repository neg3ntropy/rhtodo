import expect = require("expect.js");
import { FullResponse } from "request-promise-native";
import { v4 as uuid } from "uuid";
import { SystemTestSetup } from "./SystemTestSetup";
import { TodoApiClient } from "./TodoApiClient";
import { TodoNotificationClient } from "./TodoNotificationClient";

describe("Given the Todo API", () => {

    context("When a new Todo is created", () => {

        let createResponse: FullResponse;
        let aggregateId: string;
        let apiClient: TodoApiClient;
        let notificationClient: TodoNotificationClient;
        let changeNotificationPromise: Promise<any>;

        beforeEach(async () => {
            aggregateId = uuid();
            const createCommand = {
                name: "TodoCreate",
                aggregateId: aggregateId,
                title: "Test",
                description: `blah blah ${aggregateId}`
            };
            apiClient = SystemTestSetup.todoApiClient;
            notificationClient = SystemTestSetup.todoNotificationClient;

            await notificationClient.subscribe("todo/watch/+");
            changeNotificationPromise = notificationClient.waitNotification(n => n.aggregateId === aggregateId);
            createResponse = await apiClient.sendCommand(createCommand);
        });

        it("Should return an ok response", async () => {
            expect(createResponse.body).to.eql({ok: true, version: 1});
            expect(createResponse.statusCode).to.be(200);
        });

        context("When the change notification is received", () => {

            beforeEach(async () => {
                await changeNotificationPromise;
            });

            it("Should be gettable", async () => {
                const getResponse = await apiClient.get(aggregateId);
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
                const getResponse = await apiClient.search({q: `description=${aggregateId} AND completed:false`});
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
                completeResponse = await apiClient.sendCommand(completeCommand);
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
                const completeResponseTwice = await apiClient.sendCommand(completeCommand);
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
