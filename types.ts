export enum GameState {
  IDLE = 'IDLE',
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  RESULT = 'RESULT',
  TOO_SOON = 'TOO_SOON'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum SoundPack {
  CLASSIC = 'Classic',
  ARCADE = 'Arcade',
  TECH = 'Tech'
}

export enum ThemeColor {
  INDIGO = 'indigo',
  ROSE = 'rose',
  EMERALD = 'emerald',
  AMBER = 'amber'
}

export interface Settings {
  volume: number;
  soundPack: SoundPack;
}

export interface ReactionAttempt {
  timestamp: number;
  time: number;
}