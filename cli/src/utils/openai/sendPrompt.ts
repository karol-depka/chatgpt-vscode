import OpenAI from "openai";
import { makePrompt } from "../prompting/makePrompt";
import { FileToPatch } from "../patching/types";
import { MPFullPrompt, MPUserPrompt, PatchContentStr } from "../types";
import { MPPromptInputs } from "../prompting/types";
import { green } from "../colors";
import { extractCodeFromMarkdown } from "../markdown/markdown_utils";


console.log("initializing OpenAI");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export function makeAndSendFullPrompt(promptInputs: MPPromptInputs) {
  const fullPromptTextToSend = makePrompt(promptInputs);
  return sendFullPrompt(fullPromptTextToSend);
}

export async function sendFullPrompt(fullPromptTextToSend: MPFullPrompt) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: fullPromptTextToSend }],
    // model: "gpt-3.5-turbo",
    model: "gpt-4",
    temperature: 0,
  });

  // console.debug(`chatCompletion.choices`, chatCompletion.choices);
  const responseContent = chatCompletion.choices[0].message.content;
  // console.debug(`chatCompletion.choices...`, responseContent);
  console.log(green + `responseContent:${responseContent}` + "\x1b[0m");
  const responsePatch = extractCodeFromMarkdown(
    responseContent!
  ) as PatchContentStr;
  return { chatCompletion, responsePatch };
}
