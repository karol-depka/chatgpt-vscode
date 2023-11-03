export function extractCodeFromMarkdown(markdown: string): string {
  const codeRegex = /```(?:\w+)?\n([\s\S]+?)\n```/;
  const match = markdown.match(codeRegex);
  if (match) {
    return match[1];
  }
  return "";
}
