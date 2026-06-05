// parseVariables.js
export function parseVariables(text) {
  if (typeof text !== 'string') return [];
  // Regex to match {{ variableName }} allowing whitespace.
  // Variable name must start with a letter, _, or $, followed by alphanumeric/underlines/$.
  const regex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
  const variables = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    variables.add(match[1]);
  }
  return Array.from(variables);
}
