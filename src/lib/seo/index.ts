import type { Tag } from '~/lib/datocms/schema';
import { getLocale } from '~/lib/i18n';
import { globalSeo } from '~/lib/site.json';
import aiRobotsTxt from './ai.robots.txt?raw';

/** 
  * `globalSeo` _should_ have a key per available locale. When there is only one
  * locale configured in Dato, that key is missing. Therefore we fallback to the
  * `globalSeo` object 
  */
const localeSeo = () => {
  const locale = getLocale();
  const localeSeoData = globalSeo[locale as keyof typeof globalSeo];
  return localeSeoData || globalSeo;
};

export const siteName: () => string = () => localeSeo().siteName;
export const titleSuffix: () => string = () => localeSeo().titleSuffix;

export const noIndexTag: Tag = {
  attributes: { name: 'robots', content: 'noindex' },
  tag: 'meta',
};

export const titleTag = (title: string): Tag => ({
  tag: 'title',
  content: `${title} ${titleSuffix()}`,
});

/**
  * Content-Signal policies based on the policy select on contentsignals.org. 
  * The policy is set per site by the editor via the Dato `aiContentPolicy` single-select. 
  * @see https://contentsignals.org/
  */
export const aiContentPolicies = {
  'disallow-all': [],
  'search-only': ['search'],
  'search-ai-input': ['search', 'ai-input'],
  'search-ai-input-ai-training': ['search', 'ai-input', 'ai-train'],
} as const satisfies Record<string, readonly string[]>;

export type AiContentPolicy = keyof typeof aiContentPolicies;

export type RobotsTxtProps = {
  allowAiBots: boolean,
  allowAll: boolean,
  aiContentPolicy: string,
  siteUrl: string,
};

/** Signals that depend on allowAiBots */
const aiSignals = ['ai-train', 'ai-input'] as const;

/**
  * Content Signals declare how content may be used by automated clients,
  * independently from crawl access (Allow/Disallow). `allowAiBots` has effect on the 
  * `ai-train` and `ai-input` signals, but not on the `search` signal.
  * The override for all the aiContentPolicies is `allowAll`: when general indexing is
  * disallowed (`allowAll` is false, e.g. a noIndex or preview site) every signal
  * is suppressed (`no`).
  * @see https://contentsignals.org/
  */
const contentSignal = ({ aiContentPolicy, allowAll, allowAiBots }: Pick<RobotsTxtProps, 'aiContentPolicy' | 'allowAll' | 'allowAiBots'>) => {
  const signals: readonly string[] = Object.hasOwn(aiContentPolicies, aiContentPolicy)
    ? aiContentPolicies[aiContentPolicy as AiContentPolicy]
    : [];
  const yesNo = (signal: string) => {
    if (!allowAll || !signals.includes(signal)) return 'no';
    if (!allowAiBots && (aiSignals as readonly string[]).includes(signal)) return 'no';
    return 'yes';
  };
  return `Content-Signal: ai-train=${yesNo('ai-train')}, search=${yesNo('search')}, ai-input=${yesNo('ai-input')}`;
};

export const robotsTxt = ({ allowAiBots, allowAll, aiContentPolicy, siteUrl }: RobotsTxtProps) => `
${allowAiBots ? '' : aiRobotsTxt}

User-agent: *
${contentSignal({ aiContentPolicy, allowAll, allowAiBots })}
${allowAll ? 'Allow: /' : 'Disallow: /'}

Sitemap: ${siteUrl}/sitemap-index.xml

`.trim();

export type LlmsTxtItem = {
  title: string;
  url?: string;
  description?: string;
  children?: LlmsTxtItem[];
};

export type LlmsTxtProps = {
  siteName: string;
  siteSummary: string;
  intro: string;
  allowAiBots: boolean;
  items: LlmsTxtItem[];
};

const renderLlmsTxtItems = (items: LlmsTxtItem[], depth = 0): string[] => {
  return items.flatMap((item) => {
    const indent = '  '.repeat(depth);
    const label = item.url ? `[${item.title}](${item.url})` : item.title;
    const line = item.description
      ? `${indent}- ${label}: ${item.description}`
      : `${indent}- ${label}`;
    return [line, ...renderLlmsTxtItems(item.children ?? [], depth + 1)];
  });
};

export type AgentEntry = {
  /** Human-readable name of the agent. */
  name: string;
  /** What the agent does. */
  description?: string;
  /** Endpoint where the agent can be reached. */
  url: string;
  /**
   * Path (or URL) to the agent's A2A capability descriptor, i.e. the
   * `/.well-known/agent-card.json` referenced by the DNS-AID SVCB record's
   * `well-known` parameter. @see https://www.rfc-editor.org/rfc/rfc8615
   */
  agentCard?: string;
};

export type AgentsIndex = {
  version: string;
  name: string;
  description: string;
  url: string;
  agents: AgentEntry[];
};

export type AgentsIndexProps = {
  siteName: string;
  siteSummary: string;
  siteUrl: string;
  agents?: AgentEntry[];
};

/**
 * Machine-readable agent registry: the HTTP counterpart to the DNS-AID
 * `_index._agents.<domain>` record (which returns a pointer to an
 * organization-specific registry of all agents).
 *
 * IMPORTANT: authoritative DNS-AID discovery happens via SVCB/HTTPS DNS records
 * under `_agents.<domain>` plus DNSSEC signing. Those live in your DNS zone
 * (e.g. Cloudflare DNS) and cannot be served from this repo. This file is the
 * registry those records can point a client to.
 * @see https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/
 * @see https://www.rfc-editor.org/rfc/rfc9460
 *
 * Minimal placeholder: `agents` is empty by default. Per project, pass the
 * agents this site exposes (e.g. its search endpoint).
 */
export const agentsIndex = ({
  siteName,
  siteSummary,
  siteUrl,
  agents = [],
}: AgentsIndexProps): AgentsIndex => ({
  version: '0.1',
  name: siteName,
  description: siteSummary,
  url: siteUrl,
  agents,
});

export const llmsTxt = ({
  siteName,
  siteSummary,
  intro,
  allowAiBots,
  items,
}: LlmsTxtProps): string => {
  const blocks: string[] = [`# ${siteName}`];

  if (siteSummary) {
    blocks.push(`> ${siteSummary}`);
  }

  if (intro) {
    blocks.push(intro.replace(/\{\{\s*siteName\s*\}\}/g, siteName));
  }

  if (allowAiBots && items.length > 0) {
    const isGroup = (item: LlmsTxtItem) => !item.url && (item.children?.length ?? 0) > 0;
    const pages = items.filter((item) => !isGroup(item));
    const groups = items.filter(isGroup);

    if (pages.length > 0) {
      blocks.push(['## Pages', '', ...renderLlmsTxtItems(pages)].join('\n'));
    }

    for (const group of groups) {
      blocks.push([`## ${group.title}`, '', ...renderLlmsTxtItems(group.children ?? [])].join('\n'));
    }
  }

  return blocks.join('\n\n');
};
