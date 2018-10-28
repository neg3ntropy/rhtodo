import { ICommand } from "./ICommand";
import { IEvent, IPublishedEvent } from "./IEvent";
import { dispatch } from "./Utils";
import { UuidFactory } from "./UuidFactory";

export abstract class EventSourcedAggregate {

    private _version = 0;
    private _uncommittedEvents: IPublishedEvent[] = [];
    private inTransaction = false;

    constructor(public readonly id: string, protected readonly uuidFactory: UuidFactory = UuidFactory.defaultInstance) {
    }

    public get uncommittedEvents(): ReadonlyArray<IPublishedEvent> {
        return this._uncommittedEvents;
    }

    public get version(): number {
        return this._version;
    }

    public handleCommand<T extends ICommand>(command: T): void {
        this.inTransaction = true;
        dispatch(this, command);
        this.inTransaction = false;
    }

    public applyEvent<T extends IEvent>(event: T): void {
        this._version += 1;
        if (this.inTransaction) {
            event.aggregateId = this.id;
            event.sequence = this.version;
            event.timeUuid = this.uuidFactory.timeUuid();
            this._uncommittedEvents.push(event as IPublishedEvent);
        }
        dispatch(this, event);
    }

    public commit() {
        this._uncommittedEvents = [];
    }

}
