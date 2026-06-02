import type { WeightedEmoji } from './types';

/**
 * Hat emojis pool
 */
export const HAT_EMOJIS: WeightedEmoji[] = [
  { emoji: '🧄', weight: 100 },
  { emoji: '⛑️', weight: 100 },
  { emoji: '👒', weight: 100 },
  { emoji: '🎓', weight: 50 },
  { emoji: '🎩', weight: 50 },
  { emoji: '⛅', weight: 20 },
  { emoji: '👑', weight: 5 },
  { emoji: '🔥', weight: 5 },
  { emoji: '🗿', weight: 1 },
];


/**
 * Head emojis pool with names and weights
 */
export const HEAD_EMOJIS: WeightedEmoji[] = [
  { emoji: '🤬', weight: 100, name: 'сквернослов' },
  { emoji: '😈', weight: 100, name: 'чертенок' },
  { emoji: '😇', weight: 100, name: 'ангелочек' },
  { emoji: '🐺', weight: 100, name: 'волчонок' },
  { emoji: '🐸', weight: 100, name: 'легущька' },
  { emoji: '💩', weight: 100, name: 'какашечка' },
  { emoji: '😺', weight: 100, name: 'кит' },
  { emoji: '🤪', weight: 50, name: 'раздолбай' },
  { emoji: '🥶', weight: 50, name: 'ледыш' },
  { emoji: '😊', weight: 50, name: 'милаш' },
  { emoji: '😎', weight: 50, name: 'крутыш' },
  { emoji: '🤡', weight: 20, name: 'клоун' },
  { emoji: '🍔', weight: 20, name: 'бутерброд' },
  { emoji: '🤑', weight: 20, name: 'миллионерыш' },
  { emoji: '🥸', weight: 20, name: 'энштейныш' },
  { emoji: '✡️', weight: 20, name: 'шалом Израиль' },
  { emoji: '🫨', weight: 5, name: 'six seven' },
  { emoji: '👨‍🦳', weight: 5, name: 'эпштейныш' },
  { emoji: '🤯', weight: 2, name: 'отвал башки' },
  { emoji: '🧀', weight: 2, name: 'сырочек' },
  { emoji: '🦊', weight: 1, name: 'лисёнок' },
];


/**
 * Body emojis pool
 */
export const BODY_EMOJIS: WeightedEmoji[] = [
  { emoji: '🦺', weight: 100 },
  { emoji: '🧥', weight: 100 },
  { emoji: '🥼', weight: 100 },
  { emoji: '👕', weight: 100 },
  { emoji: '🥻', weight: 100 },
  { emoji: '👗', weight: 100 },
  { emoji: '👙', weight: 50 },
  { emoji: '🩱', weight: 50 },
  { emoji: '🩲', weight: 20 },
  { emoji: '👚', weight: 20 },
  { emoji: '🍔', weight: 5 },
  { emoji: '👔', weight: 5 },
  { emoji: '🎀', weight: 5 },
  { emoji: '🧀', weight: 2 },
  { emoji: '🧊', weight: 2 },
  { emoji: '🌳', weight: 2 },
  { emoji: '🌴', weight: 2 },
  { emoji: '🌪️', weight: 1 },
];


/**
 * Hand emojis pool (used for both left and right hands)
 */
export const HAND_EMOJIS: WeightedEmoji[] = [
  { emoji: '⛏️', weight: 100 },
  { emoji: '🔨', weight: 100 },
  { emoji: '✌️', weight: 100 },
  { emoji: '👌', weight: 100 },
  { emoji: '🤘', weight: 100 },
  { emoji: '🏹', weight: 50 },
  { emoji: '🔪', weight: 50 },
  { emoji: '☝️', weight: 50 },
  { emoji: '💪', weight: 20 },
  { emoji: '👊', weight: 20 },
  { emoji: '🫵', weight: 20 },
  { emoji: '💣', weight: 20 },
  { emoji: '☂️', weight: 20 },
  { emoji: '☎️', weight: 5 },
  { emoji: '🎻', weight: 5 },
  { emoji: '🎸', weight: 5 },
  { emoji: '🪗', weight: 5 },
  { emoji: '🪠', weight: 5 },
  { emoji: '🤏', weight: 5 },
  { emoji: '💅', weight: 5 },
  { emoji: '🖖', weight: 5 },
  { emoji: '🎰', weight: 2 },
  { emoji: '🎲', weight: 2 },
  { emoji: '🧼', weight: 2 },
  { emoji: '🫸', weight: 1 },
];


/**
 * Leg emojis pool
 */
export const LEG_EMOJIS: WeightedEmoji[] = [
  { emoji: '🦵', weight: 100 },
  { emoji: '🥾', weight: 100 },
  { emoji: '👢', weight: 50 },
  { emoji: '👠', weight: 20 },
  { emoji: '🧊', weight: 5 },
  { emoji: '🪣', weight: 3 },
  { emoji: '🌪️', weight: 2 },
  { emoji: '🦿', weight: 1 },
];

/**
 * Roll order for the mutation animation
 * The order is: head, body, leftHand, rightHand, leftLeg, rightLeg, hat
 */
export const ROLL_ORDER = ['head', 'body', 'leftHand', 'rightHand', 'leftLeg', 'rightLeg', 'hat'] as const;

/**
 * Get emoji pool by body part name
 */
export function getEmojiPool(partName: string): WeightedEmoji[] {
  switch (partName) {
    case 'hat':
      return HAT_EMOJIS;
    case 'head':
      return HEAD_EMOJIS;
    case 'body':
      return BODY_EMOJIS;
    case 'leftHand':
    case 'rightHand':
      return HAND_EMOJIS;
    case 'leftLeg':
    case 'rightLeg':
      return LEG_EMOJIS;
    default:
      return [];
  }
}