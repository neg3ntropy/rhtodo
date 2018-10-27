export interface IEvent {
    aggregateId?: string;
    sequence?: number;
    readonly name: string;
}

export interface IPublishedEvent extends IEvent {
    readonly aggregateId: string;
    readonly sequence: number;
}
