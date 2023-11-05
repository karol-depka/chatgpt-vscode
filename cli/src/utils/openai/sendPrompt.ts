/* eslint-disable @typescript-eslint/naming-convention */
import dotenv from "dotenv";
import OpenAI from "openai";
import {makeFullPrompt} from "../prompting/makeFullPrompt";
import {performance} from "perf_hooks";
import {MPFullLLMPrompt, MPPatchContent} from "../types";
import {MPPromptInputs} from "../prompting/types";
import chalk from "chalk";
import {extractCodeFromMarkdown} from "../markdown/markdown_utils";
import {
  ChatCompletionChunk,
  ChatCompletionCreateParamsStreaming,
} from "openai/resources";
import { model } from "./model";

dotenv.config();

export async function makeAndSendFullPrompt(promptInputs: MPPromptInputs) {
  const fullPromptTextToSend = makeFullPrompt(promptInputs);
  // main();
  return sendFullPrompt(fullPromptTextToSend);
}

function logDebugChunk(chunk: ChatCompletionChunk) {
  // console.log('chunk', chunk.choices[0].delta.content);
  console.log("");
  console.log(chalk.yellow("==== chunk:"));
  console.dir(chunk);
  console.dir(chunk.choices);
}

export async function sendFullPrompt(fullPromptTextToSend: MPFullLLMPrompt) {
  console.log(chalk.green("initializing OpenAI"));
  const t0 = performance.now();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000", // To identify your app. Can be set to e.g. http://localhost:3000 for testing
      "X-Title": "MetaPRO CLI", // Optional. Shows on openrouter.ai
    },
    // dangerouslyAllowBrowser: true,
  });

  console.log(chalk.inverse("sendFullPrompt:"));
  console.log("Using model " + chalk.blue(model));
  // const body: ChatCompletionCreateParamsNonStreaming = {
  const body: ChatCompletionCreateParamsStreaming = {
    messages: [{ role: "user", content: fullPromptTextToSend }],
    model: model,
    // temperature: 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    top_p: 0.1,
    stream: true,
  };
  console.log(chalk.green("calling openai.chat.completions.create body"), body);
  const completion = await openai.chat.completions.create(body);
  // console.log(chalk.inverse("END sendFullPrompt"));
  const t1 = performance.now();
  const timeTaken = ((t1 - t0) / 1000).toFixed(1);
  console.log(`API request took ${timeTaken} seconds`);
  console.log(chalk.inverse(chalk.green("Start response streaming")));
  let fullOutput = "";
  for await (const chunk of completion) {
    logDebugChunk(chunk);
    let chunkContent = chunk.choices[0].delta.content;
    fullOutput += chunkContent;
    process.stdout.write(chunkContent || "");
  }
  console.log(); // newline
  console.log(chalk.inverse(chalk.green("End response streaming")));
  const t2 = performance.now();
  const streamingTimeTaken = ((t2 - t1) / 1000).toFixed(1);
  console.log(`Streaming response took ${streamingTimeTaken} seconds`);

  // console.log("⚡ Finished receiving answer from OpenAI API\n");

  // console.debug(`chatCompletion.choices`, chatCompletion.choices);
  // const responseContent = completion.choices[0].message.content;
  // console.debug(`chatCompletion.choices...`, responseContent);
  // console.log(chalk.green(`responseContent:${responseContent}`));

  // const responsePatch = '' as MPPatchContent;
  const responsePatch = extractCodeFromMarkdown(fullOutput!) as MPPatchContent;
  return {
    chatCompletion: completion,
    responsePatch,
    printCostsFunc: () => {
      // FIXME
    },
  };
}
