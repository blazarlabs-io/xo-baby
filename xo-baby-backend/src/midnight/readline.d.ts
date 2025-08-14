export interface ReadlineInterface {
    question(query: string): Promise<string>;
    close(): void;
}
export declare function createReadlineInterface(): ReadlineInterface;
