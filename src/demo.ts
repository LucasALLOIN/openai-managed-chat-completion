import * as dotenv from 'dotenv';
dotenv.config();

import GPTCompletion from "./GPTCompletion";
import readline from 'readline';
import openai from "./openai";

const promptFunction = async (gpt: GPTCompletion) => {
    const rl = readline.createInterface({
        input: process.stdin,
        terminal: true
    });

    const prompt: Array<string> = [];

    console.log("Enter your prompt: (Type 'EOQ' to end the prompt.)")
    for await (const input of rl) {
        if (input === "/exit") {
            process.exit(0);
        } else if (input === "EOQ") {
            rl.close();
        } else {
            prompt.push(input);
        }
    }
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
}

const main = async () => {
    const gpt = new GPTCompletion(openai);
    console.log("Welcome to the GPT-3.5 CLI! Type '/exit' to exit.");
    await promptFunction(gpt);
}

main();
