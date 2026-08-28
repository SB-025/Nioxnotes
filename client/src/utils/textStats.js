export const calculateNoteStats = (content) => {
  if (!content) return { words: 0, characters: 0 };
  
  // The editor is a plain textarea that uses markdown-like syntax for bold/italic.
  // We strip markdown tokens so that formatting characters aren't counted.
  let plainText = content
    // Remove bold/italic wrappers (e.g. **bold**, _italic_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove headers (e.g. ### Header)
    .replace(/^#+\s/gm, '')
    // Remove links (e.g. [text](url)) - keep only text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove code blocks
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1');

  // Count characters:
  // The user requested: "COUNT characters excluding line-break characters."
  const textWithoutNewlines = plainText.replace(/[\r\n]/g, '');
  
  // Using spread operator to correctly count Unicode characters (including emojis)
  const characters = [...textWithoutNewlines].length;
  
  // Count words:
  // Split by whitespace and filter out empty strings.
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  return { words, characters };
};
