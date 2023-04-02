# OpenAI Managed Chat Completion

A TypeScript project that provides a fully managed class, with history (context from you previous prompt) is supported, for chatting with the OpenAI GPT model. It uses the [OpenAI API](https://beta.openai.com/) to communicate with the GPT model and provides two modes of interaction: one-time completions and streaming completions.
There aslo is a CLI interface that allows you to chat with the GPT model in the command line in demo.ts.

## Installation from package manager

### Yarn

```sh
$ yarn add openai-managed-chat-completion
```

### NPM

```sh
$ npm install openai-managed-chat-completion
```

## Installation from repository

1. Clone the repository:

```sh
$ git clone https://github.com/LucasALLOIN/openai-managed-chat-completion.git
```

2. Install dependencies:

```sh
$ cd openai-managed-chat-completion
$ yarn
```

3. (only for demo cli) Set your OpenAI API key as an environment variable in `.env`:

```
OPENAI_API_KEY=<YOUR_API_KEY>
```

## Developer Documentation

The main class in this project is `GPTCompletion`, which handles creating chat completions with the OpenAI API. It defines methods for getting completions both with and without streaming.

### Constructor

```ts
constructor(openai: OpenAIApi, model = "gpt-3.5-turbo")
```

Creates a new `GPTCompletion` instance.

- `openai`: An instance of `OpenAIApi` from the `openai` package.
- `model`: The name of the GPT model to use. Defaults to "gpt-3.5-turbo".

### Methods

#### `async getCompletion(prompt: string): Promise<string>`

Gets a one-time completion from the GPT model.

- `prompt`: The prompt to use for the completion.

Returns a Promise that resolves to the completed text.

#### `async getStreamCompletion(prompt: string): Promise<Readable>`

Gets a streaming completion from the GPT model.

- `prompt`: The prompt to use for the completion.

Returns a Promise that resolves to a Readable stream of completed data.

#### `parseStreamCompletion(chunk: Buffer, onParsed?: (parsedData: ParsedData) => void, onFinished?: () => void, onError?: (error: any) => void)`

Parses a streamed response from the OpenAI API.

- `chunk`: The streamed response chunk to parse.
- `onParsed`: A callback function to call when the parsed data is available.
- `onFinished`: A callback function to call when the streaming response is finished.
- `onError`: A callback function to call when an error occurs while parsing the streamed response.

### Example Usage

```ts
import {OpenAIApi} from "openai";
import GPTCompletion from "./gpt-completion";
import openai from "./openai";

const gpt = new GPTCompletion(openai);

const completion = gpt.getCompletion("Hello, GPT!");

completion.then(result => {
  console.log(result); // "Hi there!"
});

const stream = gpt.getStreamCompletion("Tell me about yourself.");

stream.on("data", (chunk: Buffer) => {
  gpt.parseStreamCompletion(chunk, (parsedData) => {
    console.log(parsedData);
  });
});
```

## Dependencies

- `dotenv`: A zero-dependency module that loads environment variables from a .env file.
- `openai`: A client library for the OpenAI API.
- `nodemon`: A tool for automatically restarting the server when changes are made.
- `ts-node`: A tool that executes TypeScript files directly, without compilation.
- `typescript`: A superset of JavaScript that adds typed variables and other features.
- `rollup`: A module bundler for JavaScript.
- `rollup-plugin-node-resolve`: A Rollup plugin that locates modules using the Node resolution algorithm.
- `rollup-plugin-typescript2`: A Rollup plugin that uses the TypeScript compiler to transpile TypeScript files.

## Usage

### Demo

To use streaming completions, run the following command:

```
$ yarn dev
```

This will start the CLI interface. When prompted, enter the prompt you want to use to chat with the GPT model. Type EOQ to end the prompt.

The streaming completions mode will provide output as the GPT model generates it. It is useful for long conversations where the model takes a long time to generate a response.
