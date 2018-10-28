import { ICommandProcessor, CommandAck } from "./ICommandProcessor";
import { ICommand } from "./ICommand";
import { EventSourcedAggregateRepository } from "./EventSourcedAggregateRepository";
import { EventSourcedAggregate } from "./EventSourcedAggregate";

export class EventSourcedAggregateCommandProcessor implements ICommandProcessor {

    constructor(private readonly repository: EventSourcedAggregateRepository<EventSourcedAggregate>) {}

    public async process(command: ICommand): Promise<CommandAck> {
        try {
            const aggregate = await this.repository.load(command.aggregateId);
            aggregate.handleCommand(command);
            await this.repository.save(aggregate);
            return {ok: true, version: aggregate.version};
        } catch (error) {
            return {ok: false, error: error};
        }
    }
}
