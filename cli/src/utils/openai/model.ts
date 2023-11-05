export const modelAliases = {
  llama: "meta-llama/codellama-34b-instruct",
  gpt4: "gpt-4",
  gpt3: "gpt-3.5-turbo",
};

// export const model = "gpt-3.5-turbo";
// export const model = "gpt-4";
// export const model = "google/palm-2-codechat-bison-32k";

// import { opts } from "../../opts/opts";

// export const model = "anthropic/claude-2ZZZ"; // works interestingly;

// export const model = {
//   name: "meta-llama/codellama-34b-instruct", // produced multiple-files - multiple diffs, presidents
// };

// model.name = opts.opts.llmModel || model.name;

export function getModelName(nameOrAlias: string) {
  return (modelAliases as any)[nameOrAlias] || nameOrAlias;
}
