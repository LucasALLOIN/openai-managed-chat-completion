"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const GPTCompletion_1 = __importDefault(require("../src/GPTCompletion"));
const readline_1 = __importDefault(require("readline"));
const openai_1 = __importDefault(require("./openai"));
const promptFunction = (gpt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        terminal: true
    });
    const prompt = [];
    console.log("Enter your prompt: (Type 'EOQ' to end the prompt.)");
    try {
        for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), _a = rl_1_1.done, !_a;) {
            _c = rl_1_1.value;
            _d = false;
            try {
                const input = _c;
                if (input === "/exit") {
                    process.exit(0);
                }
                else if (input === "EOQ") {
                    rl.close();
                }
                else {
                    prompt.push(input);
                }
            }
            finally {
                _d = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = rl_1.return)) yield _b.call(rl_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (prompt.length === 0) {
        process.exit(0);
    }
    try {
        console.log("Mr. GPT-3.5 is thinking...");
        const completion = yield gpt.getStreamCompletion(prompt.join("\n"));
        completion.on("data", (chunk) => {
            gpt.parseStreamCompletion(chunk, (parsedData) => {
                if (parsedData.choices[0].finish_reason === "stop") {
                    process.stdout.write("\n");
                    promptFunction(gpt);
                    return;
                }
                if (parsedData.choices.length === 0) {
                    throw new Error("No completion found");
                }
                if (parsedData.choices[0].delta.role) {
                    return;
                }
                process.stdout.write(parsedData.choices[0].delta.content);
            });
        });
    }
    catch (e) {
        console.error(e);
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const gpt = new GPTCompletion_1.default(openai_1.default);
    console.log("Welcome to the GPT-3.5 CLI! Type '/exit' to exit.");
    yield promptFunction(gpt);
});
main();
