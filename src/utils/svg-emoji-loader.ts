/**
 * Twemoji SVG loader utility
 * Uses Vite's eager import to load all SVG files from the twemojis directory
 */

import type { Emoji } from "$types/emoji";

// Import all SVG files from the twemojis directory using Vite's eager import
const twemojiModules = import.meta.glob<string>('../assets/twemojis/*.svg', {
  eager: true,
  import: 'default',
});

/**
 * Cache for SVG content by hex code
 */
const svgCache = new Map<string, string>();

/**
 * Get the hex code for an emoji (Twemoji filename format)
 */
export function getHexCode(emoji: string): string {
  return [...emoji]
    .map(c => c.codePointAt(0)!.toString(16))
    .join('-');
}

/**
 * Load an SVG for a given emoji
 * @param emoji - The emoji character
 * @returns The SVG content as a string, or undefined if not found
 */
export function loadEmojiSVGData(emoji: Emoji): string | undefined {
  const qualifiedName = emoji.qualifiedName;

  // Check cache first
  if (svgCache.has(qualifiedName)) {
    return svgCache.get(qualifiedName);
  }

  // Find the SVG file in the glob imports
  const path = `../assets/twemojis/${qualifiedName}.svg`;
  const module = twemojiModules[path];

  if (module) {
    const svgContent = module;
    svgCache.set(qualifiedName, svgContent);
    return svgContent;
  }

  return undefined;
}

/**
 * Check if a Twemoji SVG exists for a given emoji
 * @param emoji - The emoji character
 * @returns True if the SVG exists
 */
export function hasEmoji(emoji: Emoji): boolean {
  const qualifiedName = emoji.qualifiedName;
  const path = `../assets/twemojis/${qualifiedName}.svg`;
  return path in twemojiModules;
}
