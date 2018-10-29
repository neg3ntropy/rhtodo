import { device as DeviceClient } from "aws-iot-device-sdk";
import { Iot } from "aws-sdk";
import { promisify } from "util";
import { EventEmitter } from "events";

export class TodoNotificationClient extends EventEmitter {

    private _endpoint?: string;
    private client!: DeviceClient;
    private topics = new Set<string>();

    public async connect(): Promise<void> {
        this.client = new DeviceClient({
            protocol: "wss",
            port: 443,
            host: await this.discoverEndpoint(),
        });

        await new Promise(resolve => this.client.once("connect", resolve));
    }

    public async reset(): Promise<void> {
        if (this.topics.size === 0) {
            return;
        }
        await promisify(this.client.unsubscribe.bind(this.client))(Array.from(this.topics));
        this.topics.clear();
        this.removeAllListeners();
        this.client.on("message", this.onMessage.bind(this));
    }

    public async subscribe(topic: string): Promise<void> {
        await promisify(this.client.subscribe.bind(this.client))(topic);
        this.topics.add(topic);
        this.client.on("message", this.onMessage.bind(this));
    }

    public waitNotification<T>(matcher: (n: T) => boolean): Promise<T> {
        return new Promise<T>(resolve => {
            this.on("notification", n => {
                if (matcher(n)) {
                    resolve(n);
                }
            });
        });
    }

    public async close(): Promise<void> {
        await promisify(this.client.end.bind(this.client))();
    }

    private async discoverEndpoint(): Promise<string> {
        if (this._endpoint) {
            return this._endpoint;
        }
        const iot = new Iot();
        const describeResp = await iot.describeEndpoint().promise();
        this._endpoint = describeResp.endpointAddress!;
        return this._endpoint;
    }

    private onMessage(topic: string, payload: Buffer): void {
        const parsed = JSON.parse(payload.toString());
        this.emit("notification", parsed);
    }

}
