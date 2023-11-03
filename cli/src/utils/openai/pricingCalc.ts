import OpenAI from "openai";

export function showCosts(chatCompletion: OpenAI.Chat.Completions.ChatCompletion) {
  // https://openai.com/pricing
  const inputTokens = chatCompletion!.usage!.prompt_tokens;
  const outputTokens = tokensUsed - inputTokens;

  console.log(`Input tokens: ${inputTokens}`);
  console.log(`Output tokens: ${outputTokens}`);
  const tokensUsed = chatCompletion!.usage!.total_tokens;
  const inputCost = (inputTokens * 0.06) / 1000;
  const outputCost = (outputTokens * 0.06) / 1000;
  const totalCost = inputCost + outputCost;

  console.log(`Input cost: $${inputCost.toFixed(2)}`);
  console.log(`Output cost: $${outputCost.toFixed(2)}`);
  console.log(`Total cost: $${totalCost.toFixed(2)}`);
  const costInDollars = (tokensUsed * 0.06) / 1000; // assuming $0.06 per token
  console.log(`Cost in dollars: $${costInDollars.toFixed(2)}`);
}
