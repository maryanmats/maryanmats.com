export function getReadingTime(text: string): number {
	const wordsPerMinute = 200;
	const words = text.trim().split(/\s+/).length;
	return Math.max(1, Math.ceil(words / wordsPerMinute));
}
