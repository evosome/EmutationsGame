import type { Emoji } from '$types/emoji';

/**
 * Body parts that make up a monster
 */
export interface EmutationBodyparts {
  hat?: Emoji;
  head?: Emoji;
  body?: Emoji;
  leftHand?: Emoji;
  rightHand?: Emoji;
  leftLeg?: Emoji;
  rightLeg?: Emoji;
}

export enum EmutationBodypartsEnum {
  HAT,
  HEAD,
  BODY,
  LEFT_HAND,
  RIGHT_HAND,
  LEFT_LEG,
  RIGHT_LEG,
}

/**
 * List of all body part enums
 */
export const ALL_BODYPARTS = [
  EmutationBodypartsEnum.HAT,
  EmutationBodypartsEnum.HEAD,
  EmutationBodypartsEnum.BODY,
  EmutationBodypartsEnum.LEFT_HAND,
  EmutationBodypartsEnum.RIGHT_HAND,
  EmutationBodypartsEnum.LEFT_LEG,
  EmutationBodypartsEnum.RIGHT_LEG,
] as const;

/**
 * Get body part from EmutationBodyparts by enum
 */
export function getBodyPart(bodyparts: EmutationBodyparts, part: EmutationBodypartsEnum): Emoji | undefined {
  switch (part) {
    case EmutationBodypartsEnum.HAT:
      return bodyparts.hat;
    case EmutationBodypartsEnum.HEAD:
      return bodyparts.head;
    case EmutationBodypartsEnum.BODY:
      return bodyparts.body;
    case EmutationBodypartsEnum.LEFT_HAND:
      return bodyparts.leftHand;
    case EmutationBodypartsEnum.RIGHT_HAND:
      return bodyparts.rightHand;
    case EmutationBodypartsEnum.LEFT_LEG:
      return bodyparts.leftLeg;
    case EmutationBodypartsEnum.RIGHT_LEG:
      return bodyparts.rightLeg;
    default:
      return undefined;
  }
}

/**
 * Set body part in EmutationBodyparts by enum
 */
export function setBodyPart(bodyparts: EmutationBodyparts, part: EmutationBodypartsEnum, emoji: Emoji): void {
  switch (part) {
    case EmutationBodypartsEnum.HAT:
      bodyparts.hat = emoji;
      break;
    case EmutationBodypartsEnum.HEAD:
      bodyparts.head = emoji;
      break;
    case EmutationBodypartsEnum.BODY:
      bodyparts.body = emoji;
      break;
    case EmutationBodypartsEnum.LEFT_HAND:
      bodyparts.leftHand = emoji;
      break;
    case EmutationBodypartsEnum.RIGHT_HAND:
      bodyparts.rightHand = emoji;
      break;
    case EmutationBodypartsEnum.LEFT_LEG:
      bodyparts.leftLeg = emoji;
      break;
    case EmutationBodypartsEnum.RIGHT_LEG:
      bodyparts.rightLeg = emoji;
      break;
  }
}

/**
 * Get the object key for a body part enum.
 * Useful when you need to index into EmutationBodyparts directly.
 */
export function getBodyPartKey(part: EmutationBodypartsEnum): keyof EmutationBodyparts {
  switch (part) {
    case EmutationBodypartsEnum.HAT:
      return 'hat';
    case EmutationBodypartsEnum.HEAD:
      return 'head';
    case EmutationBodypartsEnum.BODY:
      return 'body';
    case EmutationBodypartsEnum.LEFT_HAND:
      return 'leftHand';
    case EmutationBodypartsEnum.RIGHT_HAND:
      return 'rightHand';
    case EmutationBodypartsEnum.LEFT_LEG:
      return 'leftLeg';
    case EmutationBodypartsEnum.RIGHT_LEG:
      return 'rightLeg';
  }
}
