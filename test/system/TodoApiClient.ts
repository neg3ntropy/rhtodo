import { RequestResponse } from "request";
import rp = require("request-promise-native");

export class TodoApiClient {

    constructor(public readonly apiRoot: string) {}

    public sendCommand(command: any): Promise<RequestResponse> {
        return rp(`${this.apiRoot}/todo`, {
            method: "POST",
            body: command,
            resolveWithFullResponse: true,
            simple: false,
            json: true
        }).promise();
    }

}
