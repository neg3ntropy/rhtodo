import rp = require("request-promise-native");

export class TodoApiClient {

    private readonly requestOptions: rp.RequestPromiseOptions = {
        resolveWithFullResponse: true,
        simple: false,
        json: true
    };

    constructor(public readonly apiRoot: string) {}

    public sendCommand(command: any): Promise<rp.FullResponse> {
        return rp(`${this.apiRoot}/todo`, {
            method: "POST",
            body: command,
            ...this.requestOptions
        }).promise();
    }

    public async get(id: string): Promise<rp.FullResponse> {
        return rp(`${this.apiRoot}/todo/${id}`, {
            method: "GET",
            ...this.requestOptions
        }).promise();
    }

    public async search(qs: string|{[k: string]: string}): Promise<rp.FullResponse> {
        return rp(`${this.apiRoot}/todo`, {
            method: "GET",
            qs: qs,
            ...this.requestOptions
        }).promise();
    }

}
