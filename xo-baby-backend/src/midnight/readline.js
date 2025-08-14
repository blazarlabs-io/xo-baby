import * as readline from 'readline';
export function createReadlineInterface() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return {
        question: (query) => {
            return new Promise((resolve) => {
                rl.question(query, (answer) => {
                    resolve(answer);
                });
            });
        },
        close: () => {
            rl.close();
        }
    };
}
//# sourceMappingURL=readline.js.map