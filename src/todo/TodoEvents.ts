import { IEvent } from "../cqrs/IEvent";

export interface TodoCreated extends IEvent {
    name: "TodoCreated";
    title: string;
    description?: string;
}

export interface TodoUpdated extends IEvent {
    name: "TodoUpdated";
    title?: string;
    description?: string;
}

export interface TodoDeleted extends IEvent {
    name: "TodoDeleted";
}

export interface TodoCompleted extends IEvent {
    name: "TodoCompleted";
}
