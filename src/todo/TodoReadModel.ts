import { dispatch } from "../cqrs/Utils";
import { IPublishedEvent } from "../cqrs/IEvent";
import * as events from "./TodoEvents";

export class TodoReadModel {
    public async applyEvent(event: IPublishedEvent): Promise<void> {
        return dispatch<Promise<void>, IPublishedEvent>(this, event, Promise.resolve);
    }

    protected onTodoCreated(event: events.TodoCreated): void {
        //
    }

    protected onTodoUpdated(event: events.TodoUpdated): void {
        //
    }

    protected onTodoDeleted(event: events.TodoDeleted): void {
        //
    }

    protected onTodoCompleted(event: events.TodoCompleted): void {
        //
    }

}
