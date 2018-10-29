
interface SearchableTodo {
    readonly _id: string;
    title: string;
    description?: string;
    createdAt: string;
    completed: boolean;
    completedAt?: string;
}
