export function extractParentEntityField(input: string) {
  const match = input.match(/(?<=_)[A-Z_]+(?=_value)/i);

  return match ? match[0] : null;
}
