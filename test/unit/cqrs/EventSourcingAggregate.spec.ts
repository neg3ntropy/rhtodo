import expect = require("expect.js");
import { EventSourcingAggregate } from "../../../src/cqrs/EventSourcingAggregate";
import { ICommand } from "../../../src/cqrs/ICommand";
import { IEvent } from "../../../src/cqrs/IEvent";

describe("Given an EventSourcedAggregate", () => {

    interface Count extends ICommand {
        name: "Count";
        delta: number;
    }

    interface CountChanged extends IEvent {
        name: "CountChanged";
        delta: number;
    }

    class PositiveCounter extends EventSourcingAggregate {

        public count = 0;

        protected onCount(command: Count): void {
            if (this.count + command.delta >= 0) {
                this.applyEvent<CountChanged>({ name: "CountChanged", delta: command.delta });
            }
        }

        protected onCountChanged(event: CountChanged): void {
            this.count += event.delta;
        }
    }

    let sut: PositiveCounter;

    beforeEach(() => {
        sut = new PositiveCounter("test");
    });

    context("When processing a valid command", () => {

        beforeEach(() => {
            sut.handleCommand<Count>({ aggregateId: "test", name: "Count", delta: 1 });
        });

        it("Should track uncommitted events", () => {
            expect(sut.uncommittedEvents).to.eql([
                { name: "CountChanged", aggregateId: "test", sequence: 1, delta: 1 }
            ]);
        });

        it("Should increment the version", () => {
            expect(sut.version).to.be(1);
        });
    });

    context("When sourcing events", () => {

        beforeEach(() => {
            sut.applyEvent<CountChanged>({ aggregateId: "test", name: "CountChanged", delta: +1 });
            sut.applyEvent<CountChanged>({ aggregateId: "test", name: "CountChanged", delta: -1 });
        });

        it("Should not buffer events", () => {
            expect(sut.uncommittedEvents).to.eql([]);
        });

        it("Should increment the version", () => {
            expect(sut.version).to.be(2);
        });

        it("Should update the state by dispatching to the appropriate handler", () => {
            expect(sut.count).to.eql(0);
        });
    });

    context("When receiving unsupported commands", () => {
        it("Should throw an error", () => {
            expect(() => sut.handleCommand({aggregateId: "test", name: "invalid"})).to.throwError();
        });
    });

    context("When receiving unsupported events", () => {
        it("Should throw an error", () => {
            expect(() => sut.applyEvent({aggregateId: "test", name: "invalid"})).to.throwError();
        });
    });
});
