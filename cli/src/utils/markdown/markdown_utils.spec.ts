import { extractCodeFromMarkdown } from './markdown_utils'; // replace with your actual module

fdescribe('extractCodeFromMarkdown', () => {
    it('should extract code block from markdown string', () => {
        const markdown = `
# Heading

Some text

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

More text
`;
        const expected = "console.log('Hello, world!');";
        expect(extractCodeFromMarkdown(markdown)).toBe(expected);
    });

    it('should return empty string if no code block is found', () => {
        const markdown = `
# Heading

Some text

More text
`;
        expect(extractCodeFromMarkdown(markdown)).toBe('');
    });

    it('should handle multiple code blocks and return the first one', () => {
        const markdown = `
# Heading

Some text

\`\`\`javascript
console.log('First block');
\`\`\`

More text

\`\`\`javascript
console.log('Second block');
\`\`\`
`;
        const expected = "console.log('First block');";
        expect(extractCodeFromMarkdown(markdown)).toBe(expected);
    });
});