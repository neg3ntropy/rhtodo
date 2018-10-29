import { IIntegrationTestSetup, IntegrationTestSetup } from "../integration/IntegrationTestSetup";
import { TodoApiClient } from "./TodoApiClient";
import { TodoNotificationClient } from "./TodoNotificationClient";

export interface ISystemTestSetup extends IIntegrationTestSetup {
    todoApiClient: TodoApiClient;
    todoNotificationClient: TodoNotificationClient;
}

export const SystemTestSetup: ISystemTestSetup = IntegrationTestSetup as ISystemTestSetup;

before(async () => {
    SystemTestSetup.todoApiClient = new TodoApiClient(SystemTestSetup.apiRoot);
    SystemTestSetup.todoNotificationClient = new TodoNotificationClient();
    await SystemTestSetup.todoNotificationClient.connect();
});

afterEach(async () => {
    await SystemTestSetup.todoNotificationClient.reset();
});

after(async () => {
    await SystemTestSetup.todoNotificationClient.close();
});
