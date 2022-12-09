/**
 * Periodically calls an async fn and keeps its latest response value cached.
 */
export declare class AsyncRefreshCache<T> {
    private values;
    private readonly interval;
    /**
     * @param loadFn - async function to be called periodically
     * @param period - wait time in seconds before calling `loadFn` again
     */
    constructor(loadFn: () => Promise<T>, period?: number);
    get(): Promise<T>;
    stop(): void;
}
