export function extractDomain(url: string): string {
  const urlObj = new URL(url);
  return urlObj.origin;
}
