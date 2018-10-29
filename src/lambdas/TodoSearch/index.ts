import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { ISearchParams } from "../../elasticsearch/ElasticRepository";
import { ErrorResponse } from "../../errorHandling/ErrorResponse";
import { SearchableTodoRepository } from "../../todo/query/SearchableTodoRepository";
import { esClient } from "../esClient";

const repo = new SearchableTodoRepository(esClient);

async function getSingle(evt: APIGatewayEvent): Promise<APIGatewayProxyResult> {
    const single = await repo.get(evt.pathParameters!.id);
    if (!single) {
        const errorResponse: ErrorResponse = {
            ok: false,
            errorCode: "NOT_FOUND",
            errorMessage: "Todo not found"
        };
        return {
            statusCode: 404,
            body: JSON.stringify(errorResponse)
        };
    } else {
        return {
            statusCode: 200,
            body: JSON.stringify(single)
        };
    }
}

async function search(evt: APIGatewayEvent): Promise<APIGatewayProxyResult> {

    const qs = evt.queryStringParameters || {};
    const searchParams: ISearchParams = {
        q: qs.q,
        sort: qs.sort,
        from: parseInt(qs.from || "0", 10),
        size: parseInt(qs.size || "10", 10),
        method: "GET"
    };

    const results = await repo.search(searchParams);
    return {
        statusCode: 200,
        body: JSON.stringify({
            results: results
        })
    };
}

export function handler(evt: APIGatewayEvent): Promise<APIGatewayProxyResult> {
    if (evt.pathParameters && evt.pathParameters.id) {
        return getSingle(evt);
    } else {
        return search(evt);
    }
}
