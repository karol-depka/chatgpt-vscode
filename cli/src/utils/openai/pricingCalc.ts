import OpenAI from "openai";

export function showCosts(chatCompletion: OpenAI.Chat.Completions.ChatCompletion) {
  // https://openai.com/pricing

  const tokensUsed = chatCompletion!.usage!.total_tokens;
  console.log(`Tokens used: ${tokensUsed}`);

  const costInDollars = (tokensUsed * 0.06) / 1000; // assuming $0.06 per token
  console.log(`Cost in dollars: $${costInDollars.toFixed(2)}`);
}
