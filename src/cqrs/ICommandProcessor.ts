import { ICommand } from "./ICommand";

export interface ICommandProcessor {
    process(command: ICommand): Promise<CommandAck>;
}

export interface Success {
    readonly ok: true;
    readonly version: number;
}

export interface Failure {
    readonly ok: false;
    readonly error: Error;
}

export type CommandAck = Success | Failure;
