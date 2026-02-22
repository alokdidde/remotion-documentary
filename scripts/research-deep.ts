#!/usr/bin/env npx tsx

import fs from 'fs';
import path from 'path';
import { config, validateConfig } from './config.js';
import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeepResearchOptions {
  topic: string;
  output: string;
}

interface GroundedQueryOptions {
  query: string;
  output: string;
  append: boolean;
}

interface FollowUpOptions {
  questions: string[];
  output: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClient(): GoogleGenAI {
  validateConfig();
  return new GoogleGenAI({ apiKey: config.googleApiKey });
}

function ensureDirSync(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeOutput(filePath: string, content: string, append: boolean): void {
  ensureDirSync(filePath);
  if (append && fs.existsSync(filePath)) {
    fs.appendFileSync(filePath, '\n\n' + content);
    console.log(`Appended to: ${filePath}`);
  } else {
    fs.writeFileSync(filePath, content);
    console.log(`Written to: ${filePath}`);
  }
}

// ---------------------------------------------------------------------------
// Extract sources from grounding metadata
// ---------------------------------------------------------------------------

interface Source {
  title: string;
  url: string;
}

function extractSources(candidate: any): Source[] {
  const sources: Source[] = [];
  const seen = new Set<string>();

  const metadata = candidate?.groundingMetadata;
  if (!metadata?.groundingChunks) return sources;

  for (const chunk of metadata.groundingChunks) {
    const web = chunk.web;
    if (web?.uri && !seen.has(web.uri)) {
      seen.add(web.uri);
      sources.push({ title: web.title || web.uri, url: web.uri });
    }
  }
  return sources;
}

function formatSourcesSection(sources: Source[]): string {
  if (sources.length === 0) return '';
  const lines = sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`);
  return '\n\n## Sources\n\n' + lines.join('\n');
}

// ---------------------------------------------------------------------------
// Deep Research (background agent, polls until complete)
// ---------------------------------------------------------------------------

async function runDeepResearch(opts: DeepResearchOptions): Promise<void> {
  const ai = getClient();
  const { topic, output } = opts;

  console.log(`Starting deep research on: "${topic}"`);
  console.log(`Agent: ${config.models.geminiDeepResearch}`);
  console.log(`This may take 5-20 minutes...\n`);

  // 1. Submit to Deep Research Agent
  const interaction = await (ai as any).interactions.create({
    input: buildResearchPrompt(topic),
    agent: config.models.geminiDeepResearch,
    background: true,
  });

  const interactionId = interaction.id;
  console.log(`Interaction ID: ${interactionId}`);

  // 2. Poll until complete (timeout: 30 min)
  const POLL_INTERVAL_MS = 10_000;
  const TIMEOUT_MS = 30 * 60 * 1000;
  const start = Date.now();
  let result: any;

  while (Date.now() - start < TIMEOUT_MS) {
    result = await (ai as any).interactions.get(interactionId);
    const status = result.status;

    if (status === 'completed') {
      console.log(`\nResearch completed in ${Math.round((Date.now() - start) / 1000)}s`);
      break;
    }
    if (status === 'failed' || status === 'cancelled') {
      throw new Error(`Deep research ${status}. Details: ${JSON.stringify(result)}`);
    }

    const elapsed = Math.round((Date.now() - start) / 1000);
    process.stdout.write(`\r  Polling... ${elapsed}s elapsed (status: ${status})`);
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  if (!result || result.status !== 'completed') {
    throw new Error('Deep research timed out after 30 minutes');
  }

  // 3. Extract the report text
  const reportText = extractInteractionText(result);
  if (!reportText) {
    throw new Error('Deep research returned no content');
  }

  // 4. Format as RESEARCH_BRIEF.md
  const brief = formatResearchBrief(topic, reportText);
  writeOutput(output, brief, false);

  console.log(`\nResearch brief written to: ${output}`);
  console.log(`Run follow-up queries to verify key claims.`);
}

function buildResearchPrompt(topic: string): string {
  return `Conduct comprehensive research on: "${topic}"

This research will be used to produce a YouTube documentary. Produce a detailed research report with exactly these 10 sections using these exact headings:

## 1. Summary
One paragraph overview of the topic.

## 2. Why This Matters
Documentary angle — why would an audience care? What's the emotional or intellectual hook?

## 3. Key Facts
Specific, concrete data points. Present as a table or bullet list.
- Include exact numbers (costs, population, counts — not "thousands" or "many")
- Include exact dates (DD MMM YYYY when possible — not just "2015")
- Include named people with their exact roles and titles
- Include named organizations, legislation, court cases with identifiers
- Each fact MUST have an inline citation [N] referencing the Sources list
- Do NOT use vague language ("significant", "major", "widely regarded")

## 4. Timeline
Chronological key events. At least 6 entries. Each entry must have:
- A specific date (DD MMM YYYY when possible, at minimum month + year)
- What happened in one sentence
- An inline citation [N]

## 5. Key People
At least 3 major figures. For each person: full name, title/role, why they matter, inline citation [N].

## 6. Themes & Tensions
Conflicts, contradictions, and narrative arcs suitable for documentary storytelling. Be specific — name the parties, stakes, and outcomes. These will drive the documentary's Conflict Arc structure.

## 7. Visual / B-Roll Ideas
Concrete footage, images, and locations to search for. Include:
- Specific locations (with city/region)
- Specific events that were photographed/filmed
- Types of archival material that likely exists
- Map animations needed (which geography, which boundaries)

## 8. Contested Claims
Facts that sources disagree on, or claims that are commonly repeated but lack reliable primary sourcing. If none found, state "None identified after cross-referencing N sources." Move any "commonly cited" figures here if you can't trace them to a primary source.

## 9. Open Questions
What remains unknown, underexplored, or would require primary research to answer.

## 10. Sources
Numbered list matching inline citations. For each source include:
- [N] — number
- Title of the source
- URL
- Type tag: [primary], [news], [academic], [government], [wikipedia], or [other]

Aim for at least 8 sources, with at least half being non-Wikipedia. Prefer primary sources, government documents, academic papers, and reputable journalism over blogs or social media. Use inline citations [N] throughout the report (not [cite: N] or other formats).`;
}

function extractInteractionText(interaction: any): string {
  // The outputs field contains the research report
  if (interaction.outputs) {
    if (typeof interaction.outputs === 'string') return interaction.outputs;
    if (Array.isArray(interaction.outputs)) {
      return interaction.outputs
        .map((part: any) => {
          if (typeof part === 'string') return part;
          if (part.text) return part.text;
          return '';
        })
        .join('\n');
    }
  }
  // Fallback: check response field
  if (interaction.response?.text) return interaction.response.text;
  if (interaction.response?.candidates?.[0]?.content?.parts) {
    return interaction.response.candidates[0].content.parts
      .map((p: any) => p.text || '')
      .join('\n');
  }
  return '';
}

function formatResearchBrief(topic: string, reportText: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `# Research Brief: ${topic}

> Generated via Gemini Deep Research Agent on ${date}
> Model: ${config.models.geminiDeepResearch}

${reportText}
`;
}

// ---------------------------------------------------------------------------
// Grounded Search (fast, uses Google Search tool)
// ---------------------------------------------------------------------------

async function runGroundedQuery(opts: GroundedQueryOptions): Promise<void> {
  const ai = getClient();
  const { query, output, append } = opts;

  console.log(`Running grounded search: "${query}"`);
  console.log(`Model: ${config.models.geminiGrounding} + Google Search\n`);

  const response = await ai.models.generateContent({
    model: config.models.geminiGrounding,
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || '';
  const sources = extractSources(response.candidates?.[0]);

  const section = formatGroundedSection(query, text, sources);
  writeOutput(output, section, append);

  console.log(`\nAnswer written to: ${output}`);
  if (sources.length > 0) {
    console.log(`Sources: ${sources.length} web references`);
  }
}

function formatGroundedSection(query: string, text: string, sources: Source[]): string {
  let md = `## Query: ${query}\n\n${text}`;
  if (sources.length > 0) {
    md += '\n\n### Sources\n\n';
    md += sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join('\n');
  }
  return md;
}

// ---------------------------------------------------------------------------
// Follow-up mode (multiple grounded queries)
// ---------------------------------------------------------------------------

async function runFollowUps(opts: FollowUpOptions): Promise<void> {
  const ai = getClient();
  const { questions, output } = opts;

  console.log(`Running ${questions.length} follow-up queries...\n`);

  const sections: string[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`[${i + 1}/${questions.length}] "${q}"`);

    const response = await ai.models.generateContent({
      model: config.models.geminiGrounding,
      contents: q,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const sources = extractSources(response.candidates?.[0]);

    sections.push(formatGroundedSection(q, text, sources));
    console.log(`  → ${sources.length} sources found`);
  }

  const combined =
    `## Follow-up Research\n\n> ${new Date().toISOString().split('T')[0]}\n\n` +
    sections.join('\n\n---\n\n');

  writeOutput(output, combined, true);
  console.log(`\nAll follow-ups appended to: ${output}`);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]) {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/research-deep.ts [mode] [options]

Modes:
  --topic <text>           Deep research (5-20 min, comprehensive)
  --query <text>           Grounded search (2-5 sec, targeted)
  --follow-up <q1> <q2>   Multiple grounded follow-up queries

Options:
  --output, -o <path>      Output file path (required)
  --append                 Append to existing file instead of overwriting

Examples:
  # Full deep research
  npx tsx scripts/research-deep.ts --topic "Vijaya Nirmala filmmaker" \\
    --output ~/videos/documentaries/vijaya-nirmala/RESEARCH_BRIEF.md

  # Quick grounded lookup
  npx tsx scripts/research-deep.ts --query "Vijaya Nirmala Guinness World Record exact count" \\
    --output ~/videos/documentaries/vijaya-nirmala/RESEARCH_BRIEF.md --append

  # Multiple follow-up verifications
  npx tsx scripts/research-deep.ts \\
    --follow-up "How many films did Vijaya Nirmala direct" "Was she in the Guinness Book" \\
    --output ~/videos/documentaries/vijaya-nirmala/RESEARCH_BRIEF.md
`);
    process.exit(0);
  }

  const outputIdx = args.findIndex((a) => a === '--output' || a === '-o');
  if (outputIdx === -1 || !args[outputIdx + 1]) {
    console.error('Error: --output is required');
    process.exit(1);
  }
  const output = path.resolve(args[outputIdx + 1]);
  const append = args.includes('--append');

  const topicIdx = args.findIndex((a) => a === '--topic');
  if (topicIdx !== -1) {
    const topic = args[topicIdx + 1];
    if (!topic || topic.startsWith('--')) {
      console.error('Error: --topic requires a value');
      process.exit(1);
    }
    return { mode: 'deep' as const, topic, output };
  }

  const queryIdx = args.findIndex((a) => a === '--query');
  if (queryIdx !== -1) {
    const query = args[queryIdx + 1];
    if (!query || query.startsWith('--')) {
      console.error('Error: --query requires a value');
      process.exit(1);
    }
    return { mode: 'grounded' as const, query, output, append };
  }

  const followUpIdx = args.findIndex((a) => a === '--follow-up');
  if (followUpIdx !== -1) {
    // Collect all args after --follow-up until the next flag or end
    const questions: string[] = [];
    for (let i = followUpIdx + 1; i < args.length; i++) {
      if (args[i].startsWith('--') || args[i] === '-o') break;
      questions.push(args[i]);
    }
    if (questions.length === 0) {
      console.error('Error: --follow-up requires at least one question');
      process.exit(1);
    }
    return { mode: 'followup' as const, questions, output };
  }

  console.error('Error: Specify --topic, --query, or --follow-up');
  process.exit(1);
}

async function main() {
  const parsed = parseArgs(process.argv);

  try {
    switch (parsed.mode) {
      case 'deep':
        await runDeepResearch({ topic: parsed.topic, output: parsed.output });
        break;
      case 'grounded':
        await runGroundedQuery({
          query: parsed.query,
          output: parsed.output,
          append: parsed.append,
        });
        break;
      case 'followup':
        await runFollowUps({ questions: parsed.questions, output: parsed.output });
        break;
    }
  } catch (error) {
    console.error('\nResearch failed:', error);
    process.exit(1);
  }
}

main();
