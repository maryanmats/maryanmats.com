export function getReadingTime(text: string): number {
  const wordsPerMinute = 200;

  const cleaned = text
    // Remove code blocks (``` ... ```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code (`...`)
    .replace(/`[^`]*`/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove image syntax ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // Remove link syntax but keep link text [text](url) -> text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove remaining markdown symbols (heading markers, bold, italic, etc.)
    .replace(/[#*_~>`|-]/g, '')
    .trim();

  if (!cleaned) {
    return 0;
  }

  const words = cleaned.split(/\s+/).filter(Boolean).length;
  if (words === 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
