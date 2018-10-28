import { IPublishedEvent } from "./IEvent";

export interface IEventStore {
    commit(e: IPublishedEvent): Promise<boolean>;
    load(aggregateId: string): Promise<IPublishedEvent[]>;
}
