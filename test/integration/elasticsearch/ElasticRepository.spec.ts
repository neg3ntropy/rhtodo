import expect = require("expect.js");
import { Client } from "elasticsearch";
import * as HttpAmazonESConnector from "http-aws-es";
import { ElasticRepository } from "../../../src/elasticsearch/ElasticRepository";
import { IntegrationTestSetup } from "../IntegrationTestSetup";

describe("Given the ElasticRepository", () => {

    interface Test {
        readonly _id: string;
        readonly attribute: string;
        readonly patch?: string;
    }

    class TestElasticRepository extends ElasticRepository<Test> {
        protected readonly type = "test";
        protected readonly index = "test";
    }

    let sut: TestElasticRepository;
    let esClient: Client;

    beforeEach(async () => {
        esClient = new Client({
            host: [`https://${IntegrationTestSetup.elasticsearchDomainEndpoint}`],
            connectionClass: HttpAmazonESConnector,
            log: "trace"
        });
        await esClient.indices.delete({index: "test"});
        sut = new TestElasticRepository(esClient);
    });

    context("When an item is indexed", () => {

        const item: Test = {_id: "id", attribute: "test"};

        beforeEach(async () => {
            await sut.upsert(item);
        });

        it("Should be retrievable by id", async () => {
            const retrieved = await sut.get("id");
            expect(retrieved).to.eql(item);
        });

        it("Should be searcheable", async () => {
            const retrieved = await sut.search({q: "attribute:test", method: "GET"});
            expect(retrieved).to.eql([item]);
        });

        context("When is deleted", () => {
            beforeEach(async () => {
                await sut.delete("id");
            });

            it("Should disappear", async () => {
                const retrieved = await sut.get("id");
                expect(retrieved).to.be(undefined);
            });
        });

        context("When updated partially", () => {

            beforeEach(async () => {
                await sut.patch({_id: "id", patch: "patch"});
            });

            it("Should merge the modifications", async () => {
                const retrieved = await sut.get("id");
                expect(retrieved).to.eql({...item, patch: "patch"});
            });
        });
    });
});
