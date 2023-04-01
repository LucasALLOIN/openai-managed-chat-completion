import {OpenAIApi} from "openai";
import {ChatCompletionRequestMessage} from "openai/api";
import {Readable, Stream, Writable} from "stream";

class GPTCompletion {
    private readonly internalStream: Writable;

    private readonly openai: OpenAIApi;

    private readonly model: string;

    private chatLog: Array<ChatCompletionRequestMessage> = [];

    private currentStreamedCompletion: string = "";

    constructor(openai: OpenAIApi, model: string = "gpt-3.5-turbo") {
        this.openai = openai;
        this.model = model;
        this.internalStream = new Stream.PassThrough();
        this.internalStream.on('data', (chunk) => {
            this.parseStreamCompletion(chunk, (parsedData) => {
                if (parsedData.choices[0].finish_reason === "stop") {
                    this.chatLog = this.chatLog.concat([
                        {
                            role: "assistant",
                            content: this.currentStreamedCompletion
                        }
                    ]);
                    this.currentStreamedCompletion = "";
                    return;
                }

                if (parsedData.choices.length === 0) {
                    throw new Error("No completion found");
                }

                if (parsedData.choices[0].delta.role) {
                    return;
                }

                this.currentStreamedCompletion = this.currentStreamedCompletion + parsedData.choices[0].delta.content!;
            });
        });
    }
    async getCompletion(prompt: string): Promise<string> {
        this.chatLog = this.chatLog.concat([
            {
                role: "user",
                content: prompt
            }
        ]);

        const response = await this.openai.createChatCompletion({
            model: this.model,
            messages: this.chatLog,
        });

        if (response.data.choices.length === 0) {
            throw new Error("No completion found");
        }

        const responseMessage = response.data.choices[0].message!;
        if (responseMessage.role === "system") {
            throw new Error("OpenAI System Error: " + responseMessage.content);
        }

        this.chatLog = this.chatLog.concat([responseMessage]);

        return responseMessage.content;
    }

    async getStreamCompletion(prompt: string): Promise<Readable> {
        this.chatLog = this.chatLog.concat([
            {
                role: "user",
                content: prompt
            }
        ]);

        const response = await this.openai.createChatCompletion({
            model: this.model,
            messages: this.chatLog,
            stream: true
        }, {
            responseType: "stream"
        });

        if (this.chatLog.length === 1) {
            // @ts-ignore
            response.data.pipe(this.internalStream);
        }

        return response.data as unknown as Readable;
    }

    public parseStreamCompletion(chunk: Buffer, onParsed?: (parsedData: any) => void, onFinished?: () => void, onError?: (error: any) => void) {
        const decodedChunk = chunk.toString("utf-8");
        if (decodedChunk.startsWith("data: ")) {
            const responses = decodedChunk.split("\n").filter((x: string) => x !== "")

            for (let i = 0; i < responses.length; i++) {
                if (responses[i].startsWith("data: ")) {
                    const decodedChunkWithoutPrefix = responses[i].substring(6);

                    let parsedChunk;

                    try {
                        parsedChunk = JSON.parse(decodedChunkWithoutPrefix);
                    } catch (e: any) {
                        if (onError)
                            onError(e)
                        continue;
                    }

                    if (onParsed)
                        onParsed(parsedChunk)
                }
            }
            if (onFinished)
                onFinished()
        }
    }
}

export default GPTCompletion;
