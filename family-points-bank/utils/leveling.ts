import { Profile, UserRole } from "../types";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "家长",
  child: "萌宝",
};

export interface LevelInfo {
  level: number;
  name: string;
  icon: string;
  color: string;
  minPoints: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: "元气萌新", icon: "zap", color: "text-gray-400", minPoints: 0 },
  { level: 2, name: "活力先锋", icon: "fire", color: "text-emerald-500", minPoints: 50 },
  { level: 3, name: "能量精英", icon: "shield", color: "text-blue-500", minPoints: 200 },
  { level: 4, name: "荣耀统帅", icon: "award", color: "text-purple-500", minPoints: 500 },
  { level: 5, name: "永恒传奇", icon: "star", color: "text-amber-500", minPoints: 1000 },
  { level: 6, name: "元气主神", icon: "reward", color: "text-[#FF4D94]", minPoints: 5000 },
];

export const calculateLevelInfo = (totalEarned: number): LevelInfo & { progress: number; nextPoints: number | null } => {
  const levelIdx = [...LEVELS].reverse().findIndex(l => totalEarned >= l.minPoints);
  const currentLevel = LEVELS[LEVELS.length - 1 - levelIdx] || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.length - levelIdx] || null;

  let progress = 100;
  if (nextLevel) {
    const range = nextLevel.minPoints - currentLevel.minPoints;
    const currentProgress = totalEarned - currentLevel.minPoints;
    progress = Math.min(Math.round((currentProgress / range) * 100), 100);
  }

  return {
    ...currentLevel,
    progress,
    nextPoints: nextLevel ? nextLevel.minPoints : null,
  };
};

export const getProfileTotalEarned = (profile: Profile): number => {
  return (profile.history || [])
    .filter(t => t.type === 'earn' || (t.type === 'transfer' && t.points > 0))
    .reduce((sum, t) => sum + t.points, 0);
};
