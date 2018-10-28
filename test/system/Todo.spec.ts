import expect = require("expect.js");
import { RequestResponse } from "request";
import { UuidFactory } from "../../src/cqrs/UuidFactory";
import { SystemTestSetup } from "./SystemTestSetup";

describe("Given the Todo API", () => {

    context("When a new Todo is created", () => {

        let createResponse: RequestResponse;
        let aggregateId: string;

        beforeEach(async () => {
            aggregateId = UuidFactory.defaultInstance.uuid();
            const createCommand = {
                name: "TodoCreate",
                aggregateId: aggregateId,
                title: "Test"
            };
            createResponse = await SystemTestSetup.todoApiClient.sendCommand(createCommand);
        });

        it("Should return an ok response", async () => {
            expect(createResponse.body).to.eql({ok: true, version: 1});
            expect(createResponse.statusCode).to.be(200);
        });

        context("When the Todo is completed", () => {

            let completeResponse: RequestResponse;

            beforeEach(async () => {
                const completeCommand = {
                    name: "TodoComplete",
                    aggregateId: aggregateId
                };
                completeResponse = await SystemTestSetup.todoApiClient.sendCommand(completeCommand);
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
                const completeResponseTwice = await SystemTestSetup.todoApiClient.sendCommand(completeCommand);
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
