export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'email';
  createdAt: string;
}

export interface Jar {
  id: string;
  userId: string;
  startDate: string;
  unlockDate: string;
  durationMinutes: number;
  isUnlocked: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  jarId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export type DurationOption = 5 | 15 | 60 | 1440 | 10080 | 43200;
