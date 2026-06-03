import { BASE_WALLET_SYMBOL } from "$constants/price";
import { EmutationRarity, EmutationQuality } from "$types/index";

/**
 * Format a seed string to XXX-XXX-XXX-XXX format
 */
export function formatSeed(seed: string): string {
  const cleaned = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const parts: string[] = [];
  for (let i = 0; i < cleaned.length; i += 3) {
    parts.push(cleaned.substring(i, i + 3));
  }
  return parts.join("-").substring(0, 15); // Max 15 chars (XXX-XXX-XXX-XXX)
}

/**
 * Generate a random seed
 */
export function generateRandomSeed(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let seed = "";
  for (let i = 0; i < 12; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return formatSeed(seed);
}

/**
 * Format drop chance as a readable string with percentage.
 */
export function formatDropChance(chance: number): string {
  const percentage = chance * 100;
  if (percentage >= 1) {
    return `${percentage.toFixed(2)}%`;
  } else if (percentage >= 0.01) {
    return `${percentage.toFixed(3)}%`;
  } else {
    return `~0.00000${(percentage * 100).toFixed(2).replace("0.", "")}%`;
  }
}

/**
 * Format price as a readable string with symbol
 */
export function formatPrice(
  price: number,
  walletSymbol = BASE_WALLET_SYMBOL,
): string {
  return `${price.toFixed(1)}${walletSymbol}`;
}

/**
 * Get rarity display information
 */
export function getRarityInfo(rarity: EmutationRarity): {
  name: string;
  color: string;
} {
  const rarityInfo: Record<number, { name: string; color: string }> = {
    [EmutationRarity.STINKY]: { name: "вонючий", color: "#8B7355" },
    [EmutationRarity.POOR]: { name: "дешевый", color: "#9E9E9E" },
    [EmutationRarity.COMMON]: { name: "непримечательный", color: "#757575" },
    [EmutationRarity.UNCOMMON]: { name: "необычный", color: "#98cc9a" },
    [EmutationRarity.CUTY]: { name: "милый", color: "#FF69B4" },
    [EmutationRarity.STRANGE]: { name: "странный", color: "#fc5dfc" },
    [EmutationRarity.EPIC]: { name: "невероятный", color: "#ad21c0" },
    [EmutationRarity.MIND_BLOWING]: {
      name: "умопомрачительный",
      color: "#E91E63",
    },
    [EmutationRarity.LEGENDARY]: { name: "легендарнейший", color: "#e4c40f" },
    [EmutationRarity.NONEXISTING]: { name: "невообразимый", color: "#ffe261" },
  };

  return rarityInfo[rarity] || rarityInfo[EmutationRarity.COMMON];
}

/**
 * Get quality display information
 */
export function getQualityInfo(quality: EmutationQuality): { name: string } {
  const qualityInfo: Record<number, { name: string }> = {
    [EmutationQuality.HAUNTED]: { name: "без ценности" },
    [EmutationQuality.BOUGHT]: { name: "из магазина" },
    [EmutationQuality.INTERESTING]: { name: "с особенностями" },
    [EmutationQuality.GOLDEN]: { name: "с позолотой" },
    [EmutationQuality.BRILLIANT]: { name: "из драгоценностей" },
    [EmutationQuality.PERFECT]: { name: "высшей пробы" },
  };

  return qualityInfo[quality] || qualityInfo[EmutationQuality.INTERESTING];
}

/**
 * Generate monster name from rarity, base name, and quality
 */
export function generateMonsterName(monster: {
  rarity: EmutationRarity;
  baseName: string;
  quality: EmutationQuality;
}): string {
  const rarityInfo = getRarityInfo(monster.rarity);
  const qualityInfo = getQualityInfo(monster.quality);

  return `${rarityInfo.name} ${monster.baseName} ${qualityInfo.name}`;
}
