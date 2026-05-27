export interface ParsedTool { name: string; description?: string; schema?: string; }
export interface ParsedServer {
  name: string;
  /** Inferred npm package, e.g. "@modelcontextprotocol/server-filesystem". Used for known-server lookup. */
  pkg?: string;
  tools?: ParsedTool[];
  rawSize: number;
}
export interface ParsedConfig { servers: ParsedServer[]; raw: unknown; }

function inferPackage(cfg: { command?: string; args?: unknown[] } | undefined): string | undefined {
  if (!cfg || !Array.isArray(cfg.args)) return undefined;
  // Look for the first arg that looks like an @scope/name or bare package name.
  for (const a of cfg.args) {
    if (typeof a !== 'string') continue;
    if (/^@[a-z0-9-]+\/[a-z0-9-]+/i.test(a)) return a.split('@').slice(0, 2).map((s, i) => (i === 0 ? '@' + s : s)).join('').replace(/\s+/g, '').split(/[\s,]/)[0];
    if (/^[a-z0-9-]+$/i.test(a) && a.length > 2) return a;
  }
  return undefined;
}

export function parseConfig(text: string): ParsedConfig {
  let data: any;
  try { data = JSON.parse(text); }
  catch (e) { throw new Error(`JSON parse failed: ${(e as Error).message}`); }

  if (data && typeof data === 'object' && data.mcpServers && typeof data.mcpServers === 'object') {
    const servers: ParsedServer[] = Object.entries(data.mcpServers).map(([name, cfg]: [string, any]) => ({
      name,
      pkg: inferPackage(cfg),
      tools: undefined,
      rawSize: JSON.stringify(cfg).length
    }));
    return { servers, raw: data };
  }

  if (data && Array.isArray(data.servers)) {
    const servers: ParsedServer[] = data.servers.map((s: any) => ({
      name: String(s.name ?? 'unnamed'),
      pkg: typeof s.pkg === 'string' ? s.pkg : undefined,
      tools: Array.isArray(s.tools) ? s.tools.map((t: any) => ({
        name: String(t.name ?? ''),
        description: typeof t.description === 'string' ? t.description : undefined,
        schema: typeof t.schema === 'string' ? t.schema : (t.schema ? JSON.stringify(t.schema) : undefined)
      })) : undefined,
      rawSize: JSON.stringify(s).length
    }));
    return { servers, raw: data };
  }

  throw new Error('Unrecognized config shape: expected an object with `mcpServers` or `servers`.');
}
