export interface ICommand {
    readonly name: string;
    readonly aggregateId: string;
    readonly expectedVersion?: number;
}
