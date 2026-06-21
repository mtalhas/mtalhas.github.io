export function wrapAsIssueMarkdown(content: string, summary = 'Sanitized agent trace'): string {
  const fence = '```';
  return `<details>\n<summary>${summary}</summary>\n\n${fence}\n${content}\n${fence}\n\n</details>\n`;
}
