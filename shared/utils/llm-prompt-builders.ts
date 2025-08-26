/**
 * Common utilities for building LLM prompts
 */

export const DATABASE_STRUCTURE_HEADER = `

=== DATABASE STRUCTURE AND RULES ===
The following system prompts contain the exact database structure, field definitions, and rules you MUST follow:

`;

export const DATABASE_STRUCTURE_FOOTER = `=== END DATABASE STRUCTURE ===

`;

/**
 * Build database structure section from system prompts
 */
export function buildDatabaseStructureSection(systemPrompts: Array<{name: string, content: string}>): string {
  if (!systemPrompts || systemPrompts.length === 0) {
    return '';
  }
  
  let section = DATABASE_STRUCTURE_HEADER;
  for (const sysPrompt of systemPrompts) {
    section += `### ${sysPrompt.name}\n${sysPrompt.content}\n\n`;
  }
  section += DATABASE_STRUCTURE_FOOTER;
  
  return section;
}