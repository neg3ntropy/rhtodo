import { IIntegrationTestSetup, IntegrationTestSetup } from "../integration/IntegrationTestSetup";
import { TodoApiClient } from "./TodoApiClient";

export interface ISystemTestSetup extends IIntegrationTestSetup {
    todoApiClient: TodoApiClient;
}

export const SystemTestSetup: ISystemTestSetup = IntegrationTestSetup as ISystemTestSetup;

before(async () => {
    SystemTestSetup.todoApiClient = new TodoApiClient(SystemTestSetup.apiRoot);
});
