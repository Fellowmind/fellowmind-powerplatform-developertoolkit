export function extractParentEntityField(input: string) {
  const match = input.match(/(?<=_)[A-Z0-9_]+(?=_value)/i);

  return match ? match[0] : null;
}
