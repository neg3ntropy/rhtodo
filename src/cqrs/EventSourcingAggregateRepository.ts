import { EventSourcingAggregate } from "./EventSourcingAggregate";
import { IEventStore } from "./IEventStore";

export abstract class EventSourcingAggregateRepository<T extends EventSourcingAggregate> {

    constructor(
        private readonly eventStore: IEventStore) {
    }

    public async load(aggregateId: string): Promise<T> {
        const aggregate = this.init(aggregateId);
        const events = await this.eventStore.load(aggregateId);
        for (const e of events) {
            aggregate.applyEvent(e);
        }
        return aggregate;
    }

    public async save(aggregate: T): Promise<void> {
        for (const e of aggregate.uncommittedEvents) {
            this.eventStore.commit(e);
        }
        aggregate.commit();
    }

    protected abstract init(aggregateId: string): T;
}
