import { IPublishedEvent } from "../../cqrs/IEvent";
import { TodoNotifier } from "./TodoNotifier";
import { TodoQueryModel } from "./TodoQueryModel";

export class TodoQueryModelWatcher {

    constructor(private readonly notifier: TodoNotifier,
                private readonly delegate: TodoQueryModel) {}

    public async applyEvent(event: IPublishedEvent): Promise<void> {
        await this.delegate.applyEvent(event);
        await this.notifier.notifyUpdate(event.aggregateId, event.sequence);
    }

}
