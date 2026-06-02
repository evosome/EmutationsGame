/**
 * Svelte action to replace emoji characters with Twemoji SVG images
 * This ensures consistent emoji appearance across all platforms
 */

const TWEMOJI_CDN = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72.png';

/**
 * Convert a Unicode emoji to its Twemoji codepoint format
 */
function emojiToCodepoint(emoji: string): string {
  const codePoints = [];
  for (const char of emoji) {
    const code = char.codePointAt(0);
    if (code) {
      codePoints.push(code.toString(16));
    }
  }
  return codePoints.join('-');
}

/**
 * Check if a character is an emoji
 */
function isEmoji(char: string): boolean {
  // Basic emoji range check
  const code = char.codePointAt(0) || 0;
  return (
    (code >= 0x1f600 && code <= 0x1f64f) || // Emoticons
    (code >= 0x1f300 && code <= 0x1f5ff) || // Misc Symbols and Pictographs
    (code >= 0x1f680 && code <= 0x1f6ff) || // Transport and Map
    (code >= 0x1f1e0 && code <= 0x1f1ff) || // Regional indicator symbols
    (code >= 0x2600 && code <= 0x26ff) || // Misc symbols
    (code >= 0x2700 && code <= 0x27bf) || // Dingbats
    (code >= 0xfe00 && code <= 0xfe0f) || // Variation Selectors
    (code >= 0x1f900 && code <= 0x1f9ff) || // Supplemental Symbols and Pictographs
    (code >= 0x1faf0 && code <= 0x1faf6) || // People extended
    (code >= 0x1faf8 && code <= 0x1faf9) || // People extended
    (code >= 0x200d && code <= 0x200d) // Zero Width Joiner
  );
}

/**
 * Svelte action to replace emoji text with Twemoji images
 */
export function twemoji(node: HTMLElement) {
  function replace() {
    const text = node.textContent || '';
    let html = '';

    for (const char of text) {
      if (isEmoji(char)) {
        const codepoint = emojiToCodepoint(char);
        html += `<img src="${TWEMOJI_CDN}" alt="${char}" style="width:1em;height:1em;vertical-align:middle;display:inline-block;" />`;
      } else {
        html += char;
      }
    }

    node.innerHTML = html;
  }

  replace();

  return {
    update() {
      replace();
    },
    destroy() {
      // Cleanup if needed
    },
  };
}

/**
 * Get Twemoji URL for an emoji
 */
export function getTwemojiUrl(emoji: string): string {
  const codepoint = emojiToCodepoint(emoji);
  return `${TWEMOJI_CDN}?emoji=${codepoint}`;
}