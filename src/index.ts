import * as dotenv from 'dotenv';
dotenv.config();

import GPTCompletion from "./gpt-completion";
import readline from 'readline';
import openai from "./openai";
import * as fs from "fs";

process.stdin.setEncoding('utf8');

const promptFunction = async (gpt: GPTCompletion) => {
    const rl = readline.createInterface({
        input: process.stdin,
        terminal: true
    });

    const prompt: Array<string> = [];

    console.log("Enter your prompt: (Type 'EOQ' to end the prompt.)")
    rl.on('line', (input) => {
        if (input === "/exit") {
            process.exit(0);
        } else if (input === "EOQ") {
            rl.close();
        }
        prompt.push(input);
    }).on('close', async () => {
        if (prompt.length === 0) {
            process.exit(0);
        }
        try {
            console.log("Mr. GPT-3.5 is thinking...");
            const completion = await gpt.getStreamCompletion(prompt.join("\n"));

            completion.on("data", (chunk: Buffer) => {
                gpt.parseStreamCompletion(chunk, (parsedData) => {
                    if (parsedData.choices[0].finish_reason === "stop") {
                        process.stdout.write("\n");
                        promptFunction(gpt);
                        return
                    }

                    if (parsedData.choices.length === 0) {
                        throw new Error("No completion found");
                    }

                    if (parsedData.choices[0].delta.role) {
                        return;
                    }

                    process.stdout.write(parsedData.choices[0].delta.content!);
                });
            })

        } catch (e) {
            console.error(e);
        }
    });
}
const main = async () => {
    const openaiInstance = openai;
    const gpt = new GPTCompletion(openaiInstance);

    console.log("Welcome to the GPT-3.5 CLI! Type '/exit' to exit.");
    promptFunction(gpt);
}

main();
