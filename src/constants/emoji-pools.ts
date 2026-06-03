import type { WeightedEmoji } from '$types/index';
import { EmutationBodypartsEnum } from '$types/bodyparts';

import emojis from '$assets/emojis.json';

const {
  GARLIC,
  HELMET,
  SUN_HAT,
  GRADUATION,
  TOP_HAT,
  CLOUD,
  CROWN,
  FIRE,
  MOAI,
  PROFANE,
  DEVIL,
  ANGEL,
  WOLF,
  FROG,
  POOP,
  CAT,
  ZANY,
  COLD,
  SMILING,
  COOL,
  CLOWN,
  BURGER,
  RICH,
  DISGUISED,
  STAR_OF_DAVID,
  OLD_MAN,
  EXPLODING,
  CHEESE,
  FOX,
  SAFETY_VEST,
  COAT,
  LAB_COAT,
  TSHIRT,
  SARI,
  DRESS,
  BIKINI,
  ONE_PIECE,
  SHORTS,
  BLOUSE,
  TIE,
  RIBBON,
  ICE_CUBE,
  TREE,
  PALM,
  PICK,
  HAMMER,
  OK,
  ROCKS,
  BOW,
  KNIFE,
  MUSCLE,
  FIST,
  POINT_AT,
  BOMB,
  UMBRELLA,
  PHONE,
  VIOLIN,
  GUITAR,
  ACCORDION,
  PLUNGER,
  PINCH,
  NAIL_POLISH,
  SPOCK,
  SLOT_MACHINE,
  DICE,
  SOAP,
  LEG,
  HIKING_BOOT,
  BOOT,
  HEEL,
  BUCKET,
  PROSTHETIC,
} = emojis;

/**
 * Hat emojis pool
 */
export const HAT_EMOJIS: WeightedEmoji[] = [
  { emoji: GARLIC, weight: 100 },
  { emoji: HELMET, weight: 100 },
  { emoji: SUN_HAT, weight: 100 },
  { emoji: GRADUATION, weight: 50 },
  { emoji: TOP_HAT, weight: 50 },
  { emoji: CLOUD, weight: 20 },
  { emoji: CROWN, weight: 5 },
  { emoji: FIRE, weight: 5 },
  { emoji: MOAI, weight: 1 },
];

/**
 * Head emojis pool with names and weights
 */
export const HEAD_EMOJIS: WeightedEmoji[] = [
  { emoji: PROFANE, weight: 100 },
  { emoji: DEVIL, weight: 100 },
  { emoji: ANGEL, weight: 100 },
  { emoji: WOLF, weight: 100 },
  { emoji: FROG, weight: 100 },
  { emoji: POOP, weight: 100 },
  { emoji: CAT, weight: 100 },
  { emoji: ZANY, weight: 50 },
  { emoji: COLD, weight: 50 },
  { emoji: SMILING, weight: 50 },
  { emoji: COOL, weight: 50 },
  { emoji: CLOWN, weight: 20 },
  { emoji: BURGER, weight: 20 },
  { emoji: RICH, weight: 20 },
  { emoji: DISGUISED, weight: 20 },
  { emoji: STAR_OF_DAVID, weight: 20 },
  { emoji: OLD_MAN, weight: 5 },
  { emoji: EXPLODING, weight: 2 },
  { emoji: CHEESE, weight: 2 },
  { emoji: FOX, weight: 1 },
];

/**
 * Body emojis pool
 */
export const BODY_EMOJIS: WeightedEmoji[] = [
  { emoji: SAFETY_VEST, weight: 100 },
  { emoji: COAT, weight: 100 },
  { emoji: LAB_COAT, weight: 100 },
  { emoji: TSHIRT, weight: 100 },
  { emoji: SARI, weight: 100 },
  { emoji: DRESS, weight: 100 },
  { emoji: BIKINI, weight: 50 },
  { emoji: ONE_PIECE, weight: 50 },
  { emoji: SHORTS, weight: 20 },
  { emoji: BLOUSE, weight: 20 },
  { emoji: BURGER, weight: 5 },
  { emoji: TIE, weight: 5 },
  { emoji: RIBBON, weight: 5 },
  { emoji: CHEESE, weight: 2 },
  { emoji: ICE_CUBE, weight: 2 },
  { emoji: TREE, weight: 2 },
  { emoji: PALM, weight: 2 },
];

/**
 * Hand emojis pool (used for both left and right hands)
 */
export const HAND_EMOJIS: WeightedEmoji[] = [
  { emoji: PICK, weight: 100 },
  { emoji: HAMMER, weight: 100 },
  { emoji: OK, weight: 100 },
  { emoji: ROCKS, weight: 100 },
  { emoji: BOW, weight: 50 },
  { emoji: KNIFE, weight: 50 },
  { emoji: MUSCLE, weight: 20 },
  { emoji: FIST, weight: 20 },
  { emoji: POINT_AT, weight: 20 },
  { emoji: BOMB, weight: 20 },
  { emoji: UMBRELLA, weight: 20 },
  { emoji: PHONE, weight: 5 },
  { emoji: VIOLIN, weight: 5 },
  { emoji: GUITAR, weight: 5 },
  { emoji: ACCORDION, weight: 5 },
  { emoji: PLUNGER, weight: 5 },
  { emoji: PINCH, weight: 5 },
  { emoji: NAIL_POLISH, weight: 5 },
  { emoji: SPOCK, weight: 5 },
  { emoji: SLOT_MACHINE, weight: 2 },
  { emoji: DICE, weight: 2 },
  { emoji: SOAP, weight: 2 },
];

/**
 * Leg emojis pool
 */
export const LEG_EMOJIS: WeightedEmoji[] = [
  { emoji: LEG, weight: 100 },
  { emoji: HIKING_BOOT, weight: 100 },
  { emoji: BOOT, weight: 50 },
  { emoji: HEEL, weight: 20 },
  { emoji: ICE_CUBE, weight: 5 },
  { emoji: BUCKET, weight: 3 },
  { emoji: PROSTHETIC, weight: 1 },
];


/**
 * Roll order for the mutation animation
 * The order is: head, body, leftHand, rightHand, leftLeg, rightLeg, hat
 */
export const ROLL_ORDER = [
  EmutationBodypartsEnum.HEAD,
  EmutationBodypartsEnum.BODY,
  EmutationBodypartsEnum.LEFT_HAND,
  EmutationBodypartsEnum.RIGHT_HAND,
  EmutationBodypartsEnum.LEFT_LEG,
  EmutationBodypartsEnum.RIGHT_LEG,
  EmutationBodypartsEnum.HAT,
] as const;

/**
 * Get emoji pool by body part enum
 */
export function getEmojiPool(partName: EmutationBodypartsEnum): WeightedEmoji[] {
  switch (partName) {
    case EmutationBodypartsEnum.HAT:
      return HAT_EMOJIS;
    case EmutationBodypartsEnum.HEAD:
      return HEAD_EMOJIS;
    case EmutationBodypartsEnum.BODY:
      return BODY_EMOJIS;
    case EmutationBodypartsEnum.LEFT_HAND:
    case EmutationBodypartsEnum.RIGHT_HAND:
      return HAND_EMOJIS;
    case EmutationBodypartsEnum.LEFT_LEG:
    case EmutationBodypartsEnum.RIGHT_LEG:
      return LEG_EMOJIS;
    default:
      return [];
  }
}
