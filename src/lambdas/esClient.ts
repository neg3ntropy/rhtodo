import { Client } from "elasticsearch";
import * as HttpAmazonESConnector from "http-aws-es";

export const esClient = new Client({
    host: [`https://${process.env.ElasticsearchDomainEndpoint}`],
    connectionClass: HttpAmazonESConnector
});
