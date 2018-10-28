import { IEvent, IPublishedEvent } from "./IEvent";
import { ICommand } from "./ICommand";
import { UuidFactory } from "./UuidFactory";

interface Sourced<T> {
    [onMethod: string]: (payload: T) => void | undefined;
}

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
        this.dispatch(command);
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
        this.dispatch(event);
    }

    public commit() {
        this._uncommittedEvents = [];
    }

    private dispatch<T extends {name: string}>(payload: T): void {
        const handlerName = `on${payload.name}`;
        const handler = (this as unknown as Sourced<T>)[handlerName];
        if (typeof handler !== "function") {
            throw new Error(`Not implemented: ${handlerName}`);
        }
        handler.bind(this)(payload);
    }
}
