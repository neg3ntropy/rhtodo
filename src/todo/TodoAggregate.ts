import { EventSourcedAggregate } from "../cqrs/EventSourcedAggregate";
import { BadRequestError } from "../errorHandling/InvalidRequestError";
import * as commands from "./TodoCommands";
import * as events from "./TodoEvents";

enum Status {
    NEW = "NEW",
    TODO = "TODO",
    DONE = "DONE",
    DELETED = "DELETED"
}

export class TodoAggregate extends EventSourcedAggregate {
    private status = Status.NEW;
    private title!: string;
    private description?: string;

    protected onTodoCreate(command: commands.TodoCreate): void {
        this.assertStatus(Status.NEW);
        this.applyEvent<events.TodoCreated>({
            name: "TodoCreated",
            title: command.title,
            description: command.description
        });
    }

    protected onTodoUpdate(command: commands.TodoUpdate): void {
        this.assertStatus(Status.TODO, Status.DONE);
        const event: events.TodoUpdated = {
            name: "TodoUpdated",
            title: command.title !== this.title ? command.title : undefined,
            description: command.description !== this.description ? command.description : undefined,
        };
        if (event.title || event.description) {
          this.applyEvent(event);
        }
    }

    protected onTodoDelete(command: commands.TodoDelete): void {
        this.assertStatus(Status.TODO, Status.DONE);
        this.applyEvent<events.TodoDeleted>({name: "TodoDeleted"});
    }

    protected onTodoComplete(command: commands.TodoComplete): void {
        this.assertStatus(Status.TODO);
        this.applyEvent<events.TodoCompleted>({name: "TodoCompleted"});
    }

    protected onTodoCreated(event: events.TodoCreated): void {
        this.status = Status.TODO;
        this.title = event.title;
        this.description = event.description;
    }

    protected onTodoUpdated(event: events.TodoUpdated): void {
        if (event.title !== undefined) {
            this.title = event.title;
        }
        if (event.description !== undefined) {
            this.description = event.description;
        }
    }

    protected onTodoDeleted(event: events.TodoDeleted): void {
        this.status = Status.DELETED;
    }
    protected onTodoCompleted(event: events.TodoCompleted): void {
        this.status = Status.DONE;
    }

    private assertStatus(...statuses: Status[]): void {
        if (!statuses.includes(this.status)) {
            throw new BadRequestError(`Unacceptable command when status=${this.status}`);
        }
    }
}
