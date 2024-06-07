/** The types that an object flag's fields may be. */
export type FlagFieldType = string | number | boolean;

/** Metadata for a save file; stored in meta.txt */
export interface SaveMetadata {
  exist: boolean;
  lastTeleportPointPath: string;
  atSceneGuid: string;
  lastPos: {
    x: number;
    y: number;
    z: number;
  };
  gold: number;
  level: number;
  exp: number;
  skillPointLeft: number;
  totalSkillLevel: number;
  playTime: number;
  deathCount: number;
  finishedCreditRoll: boolean;
  secondTimePlay: boolean;
  trueEndTriggered: boolean;
  badEndTriggered: boolean;
  gameMode: number;
}
