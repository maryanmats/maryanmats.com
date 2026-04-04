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
    // Remove heading markers at start of line
    .replace(/^#{1,6}\s/gm, '')
    // Remove bold/italic markers
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Remove blockquote markers at start of line
    .replace(/^>\s?/gm, '')
    // Remove horizontal rules
    .replace(/^[-*]{3,}$/gm, '')
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
