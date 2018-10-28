import expect = require("expect.js");
import { Client } from "elasticsearch";
import * as HttpAmazonESConnector from "http-aws-es";
import { ElasticRepository } from "../../../src/elasticsearch/ElasticRepository";
import { IntegrationTestSetup } from "../IntegrationTestSetup";

describe("Given the ElasticRepository", () => {

    interface Test {
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
            connectionClass: HttpAmazonESConnector
        });
        await esClient.indices.delete({index: "test"});
        sut = new TestElasticRepository(esClient);
    });

    context("When an item is indexed", () => {

        const item: Test = {attribute: "test"};

        beforeEach(async () => {
            await sut.upsert("id", item);
        });

        it("Should be retrievable by id", async () => {
            const retrieved = await sut.get("id");
            expect(retrieved).to.eql(item);
        });

        it("Should be searcheable", async () => {
            const retrieved = await sut.get("id");
            expect(retrieved).to.eql(item);
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
            const patch: Partial<Test> = {patch: "patch"};

            beforeEach(async () => {
                await sut.patch("id", patch);
            });

            it("Should merge the modifications", async () => {
                const retrieved = await sut.get("id");
                expect(retrieved).to.eql({...item, ...patch});
            });
        });
    });
});
