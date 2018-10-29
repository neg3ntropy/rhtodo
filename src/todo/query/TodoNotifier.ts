import * as IotData from "aws-sdk/clients/iotdata";

export class TodoNotifier {
    constructor(private readonly iotData: IotData) {}

    public async notifyUpdate(aggregateId: string, version: number): Promise<void> {
        const iotParams = {
            payload: JSON.stringify({aggregateId: aggregateId, version: version}),
            topic: `todo/watch/${aggregateId}`
        };

        await this.iotData.publish(iotParams).promise();
    }
}
