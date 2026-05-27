import { sanitize, type CustomRule } from '../lib/sanitizer/sanitize';
import { wrapAsIssueMarkdown } from '../lib/sanitizer/issueWrap';

const LS_CUSTOM = 'd4.customRegexes';
const LS_DENY = 'd4.denylist';
const LS_UUID = 'd4.uuidEnabled';

export function mount(root: HTMLElement) {
  const $ = <T extends Element>(sel: string) => root.querySelector(sel) as T;
  const input = $<HTMLTextAreaElement>('textarea[data-test=input]');
  const output = $<HTMLTextAreaElement>('textarea[data-test=output]');
  const runBtn = $<HTMLButtonElement>('button[data-test=run]');
  const copyBtn = $<HTMLButtonElement>('button[data-test=copy-issue]');
  const status = $<HTMLElement>('[data-test=status]');
  const custom = $<HTMLTextAreaElement>('textarea[data-test=custom]');
  const deny = $<HTMLTextAreaElement>('textarea[data-test=deny]');
  const uuidToggle = $<HTMLInputElement>('input[data-test=uuid-toggle]');

  if (!input || !output || !runBtn) return;

  try {
    custom.value = localStorage.getItem(LS_CUSTOM) ?? '';
    deny.value = localStorage.getItem(LS_DENY) ?? '';
    uuidToggle.checked = localStorage.getItem(LS_UUID) === '1';
  } catch { /* storage may be disabled in private mode */ }

  runBtn.addEventListener('click', () => {
    try {
      localStorage.setItem(LS_CUSTOM, custom.value);
      localStorage.setItem(LS_DENY, deny.value);
      localStorage.setItem(LS_UUID, uuidToggle.checked ? '1' : '0');
    } catch { /* ignore */ }

    const customRegexes: CustomRule[] = custom.value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map((line, i) => ({ id: `c${i}`, label: line, pattern: line }));
    const denylist = deny.value.split('\n').map(s => s.trim()).filter(Boolean);

    const enabledIds = new Set<string>([
      'openai-sk','stripe-pk','github-pat','slack-bot','aws-access','google-api',
      'google-oauth','gitlab-pat','anthropic-pat','jwt','email','phone-e164',
      'phone-us','ipv4','ipv6'
    ]);
    if (uuidToggle.checked) enabledIds.add('uuid');

    const { output: out, counts, warnings } = sanitize(input.value, { customRegexes, denylist, enabledIds });
    output.value = out;
    const totalRedactions = Object.values(counts).reduce((a, b) => a + b, 0);
    const warningLine = warnings.length ? ` Warnings: ${warnings.join('; ')}` : '';
    status.textContent = `Redacted ${totalRedactions} item${totalRedactions === 1 ? '' : 's'}.${warningLine}`;
  });

  copyBtn.addEventListener('click', async () => {
    const md = wrapAsIssueMarkdown(output.value);
    try {
      await navigator.clipboard.writeText(md);
      status.textContent = 'Copied as GitHub issue markdown.';
    } catch {
      status.textContent = 'Clipboard write blocked. Select the output and copy manually.';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-island=sanitizer]') as HTMLElement | null;
  if (root) mount(root);
});
