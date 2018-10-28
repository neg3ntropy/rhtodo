import { ICommand } from "../../cqrs/ICommand";

export interface TodoCreate extends ICommand {
    name: "TodoCreate";
    title: string;
    description?: string;
}

export interface TodoUpdate extends ICommand {
    name: "TodoUpdate";
    title?: string;
    description?: string;
}

export interface TodoDelete extends ICommand {
    name: "TodoDelete";
}

export interface TodoComplete extends ICommand {
    name: "TodoComplete";
}
