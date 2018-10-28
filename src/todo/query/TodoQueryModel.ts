import { IPublishedEvent } from "../../cqrs/IEvent";
import { dispatch, uidToDate } from "../../cqrs/Utils";
import * as events from "../TodoEvents";
import { SearchableTodoRepository } from "./SearchableTodoRepository";

export class TodoReadModel {

    constructor(private readonly repository: SearchableTodoRepository) {}

    public async applyEvent(event: IPublishedEvent): Promise<void> {
        return dispatch<Promise<void>, IPublishedEvent>(this, event, () => Promise.resolve());
    }

    protected async onTodoCreated(event: events.TodoCreated & IPublishedEvent): Promise<void> {
        await this.repository.upsert(event.aggregateId, {
            title: event.title,
            description: event.description,
            completed: false,
            createdAt: uidToDate(event.timeUuid).toISOString()
        });
    }

    protected async onTodoUpdated(event: events.TodoUpdated & IPublishedEvent): Promise<void>  {
        const partial: Partial<SearchableTodo> = {};
        if (event.title) {
            partial.title = event.title;
        }
        if (event.description) {
            partial.description = event.description;
        }
        await this.repository.patch(event.aggregateId, partial);
    }

    protected async onTodoDeleted(event: events.TodoDeleted & IPublishedEvent): Promise<void>  {
        await this.repository.delete(event.aggregateId);
    }

    protected async onTodoCompleted(event: events.TodoCompleted & IPublishedEvent): Promise<void>  {
        await this.repository.patch(event.aggregateId, {
            completed: true,
            completedAt: uidToDate(event.timeUuid).toISOString()
        });
    }

}
