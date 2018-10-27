import { IEvent } from "./IEvent";

export interface IEventStore {
    commit(e: IEvent): Promise<boolean>;
    load(streamId: string): Promise<IEvent[]>;
}
