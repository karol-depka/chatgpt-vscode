import dotenv from "dotenv";
import OpenAI from "openai";
import { makeFullPrompt } from "../prompting/makeFullPrompt";
import { performance } from 'perf_hooks';
import { MPFullLLMPrompt, MPPatchContent } from "../types";
import { MPPromptInputs } from "../prompting/types";
import chalk from 'chalk'
import { extractCodeFromMarkdown } from "../markdown/markdown_utils";
import {main} from "./sendPromptStreaming";
import {
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming
} from "openai/resources";
dotenv.config();

export async function makeAndSendFullPrompt(promptInputs: MPPromptInputs) {
  const fullPromptTextToSend = makeFullPrompt(promptInputs);
  // main();
  return sendFullPrompt(fullPromptTextToSend);
}

export async function sendFullPrompt(fullPromptTextToSend: MPFullLLMPrompt) {
  console.log(chalk.green("initializing OpenAI"));
  const t0 = performance.now();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log(chalk.inverse("sendFullPrompt:"));
  // const model = "gpt-3.5-turbo";
  const model = "gpt-4";
  console.log('Using model ' + chalk.blue(model));
  // const body: ChatCompletionCreateParamsNonStreaming = {
  const body: ChatCompletionCreateParamsStreaming = {
    messages: [{ role: "user", content: fullPromptTextToSend }],
    model: model,
    // temperature: 0,
    top_p: 0.1,
    stream: true,
  };
  console.log(chalk.green("calling openai.chat.completions.create body"), body);
  const completion = await openai.chat.completions.create(body);
  // console.log(chalk.inverse("END sendFullPrompt"));
  const t1 = performance.now();
  const timeTaken = ((t1 - t0) / 1000).toFixed(1);
  console.log(`API request took ${timeTaken} seconds`);
  let fullOutput = ''
  for await (const chunk of completion) {
    // console.log('chunk', chunk.choices[0].delta.content);
    let chunkContent = chunk.choices[0].delta.content;
    fullOutput += chunkContent;
    process.stdout.write(chunkContent || '');
  }

  // console.debug(`chatCompletion.choices`, chatCompletion.choices);
  // const responseContent = completion.choices[0].message.content;
  // console.debug(`chatCompletion.choices...`, responseContent);
  // console.log(chalk.green(`responseContent:${responseContent}`));

  // const responsePatch = '' as MPPatchContent;
  const responsePatch = extractCodeFromMarkdown(
      fullOutput!
  ) as MPPatchContent;
  return { chatCompletion: completion, responsePatch, printCostsFunc: () => {
    // FIXME
  } };
}
