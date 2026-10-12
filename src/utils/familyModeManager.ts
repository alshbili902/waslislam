import { localStore, supabase } from '../lib/supabase.ts';

export type FamilyRole = 'admin' | 'adult' | 'child';
export type AgeGroup = 'early-child' | 'mid-child' | 'teen' | 'adult';

export interface ParentalControls {
  maxDailyMinutes: number;
  restrictExternalLinks: boolean;
  approvedSections: string[];
  allowCommunityReflections: boolean;
}

export interface ProfileStats {
  quranPagesRead: number;
  surahsCompleted: number;
  adhkarSessionsCount: number;
  kidsLessonsCompleted: number;
}

export interface FamilyProfile {
  id: string;
  name: string;
  role: FamilyRole;
  ageGroup: AgeGroup;
  avatar: string;
  isCurrent: boolean;
  parentalControls: ParentalControls;
  stats: ProfileStats;
  createdAt: string;
}

export interface FamilySharedGoal {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  unit: string;
  completed: boolean;
  assignedTo: string[]; // ['all'] or profile ids
  createdAt: string;
}

export interface FamilyGroup {
  id: string;
  familyName: string;
  ownerId: string;
  createdAt: string;
  profiles: FamilyProfile[];
  sharedGoals: FamilySharedGoal[];
  privacyRules: {
    isolateAdultReflections: boolean;
    isolateAdultNotes: boolean;
    allowSharingMilestones: boolean;
  };
}

const STORAGE_KEY = 'wasl_family_mode_v1';

const DEFAULT_FAMILY: FamilyGroup = {
  id: 'fam_default_01',
  familyName: 'عائلة وصل الكريمة',
  ownerId: 'prof_parent_1',
  createdAt: new Date().toISOString(),
  privacyRules: {
    isolateAdultReflections: true,
    isolateAdultNotes: true,
    allowSharingMilestones: true
  },
  profiles: [
    {
      id: 'prof_parent_1',
      name: 'ولي الأمر (الأب / الأم)',
      role: 'admin',
      ageGroup: 'adult',
      avatar: 'shield',
      isCurrent: true,
      parentalControls: {
        maxDailyMinutes: 0,
        restrictExternalLinks: false,
        approvedSections: ['all'],
        allowCommunityReflections: true
      },
      stats: {
        quranPagesRead: 142,
        surahsCompleted: 12,
        adhkarSessionsCount: 45,
        kidsLessonsCompleted: 0
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'prof_child_1',
      name: 'عبدالرحمن',
      role: 'child',
      ageGroup: 'mid-child',
      avatar: 'star',
      isCurrent: false,
      parentalControls: {
        maxDailyMinutes: 45,
        restrictExternalLinks: true,
        approvedSections: ['kids', 'quran', 'adhkar', 'library'],
        allowCommunityReflections: false
      },
      stats: {
        quranPagesRead: 28,
        surahsCompleted: 6,
        adhkarSessionsCount: 19,
        kidsLessonsCompleted: 8
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'prof_child_2',
      name: 'مريم',
      role: 'child',
      ageGroup: 'early-child',
      avatar: 'flower',
      isCurrent: false,
      parentalControls: {
        maxDailyMinutes: 30,
        restrictExternalLinks: true,
        approvedSections: ['kids', 'quran'],
        allowCommunityReflections: false
      },
      stats: {
        quranPagesRead: 12,
        surahsCompleted: 3,
        adhkarSessionsCount: 14,
        kidsLessonsCompleted: 11
      },
      createdAt: new Date().toISOString()
    }
  ],
  sharedGoals: [
    {
      id: 'goal_1',
      title: 'ختمة جزء عم الأسرية',
      description: 'مدارسة وتلاوة جزء عم كاملاً خلال الشهر الحالي مع الأولاد',
      targetCount: 37,
      currentCount: 22,
      unit: 'سورة',
      completed: false,
      assignedTo: ['all'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'goal_2',
      title: 'أذكار الصباح والمساء اليومية',
      description: 'المحافظة على قراءة أذكار الصباح جماعة أو فرادى',
      targetCount: 30,
      currentCount: 24,
      unit: 'يوم',
      completed: false,
      assignedTo: ['all'],
      createdAt: new Date().toISOString()
    }
  ]
};

export const familyModeManager = {
  getFamilyGroup(): FamilyGroup {
    return localStore.get<FamilyGroup>(STORAGE_KEY, DEFAULT_FAMILY);
  },

  saveFamilyGroup(family: FamilyGroup): void {
    localStore.set(STORAGE_KEY, family);

    // Sync to Supabase if authenticated
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user && supabase) {
          supabase.from('family_groups').upsert({
            id: family.id,
            user_id: data.session.user.id,
            family_name: family.familyName,
            profiles_json: JSON.stringify(family.profiles),
            goals_json: JSON.stringify(family.sharedGoals),
            updated_at: new Date().toISOString()
          }).then(({ error }) => {
            if (error) console.warn('[FamilyMode] Cloud sync fallback:', error);
          });
        }
      });
    }
  },

  getCurrentProfile(): FamilyProfile {
    const family = this.getFamilyGroup();
    const curr = family.profiles.find(p => p.isCurrent);
    return curr || family.profiles[0];
  },

  switchProfile(profileId: string): FamilyProfile {
    const family = this.getFamilyGroup();
    family.profiles = family.profiles.map(p => ({
      ...p,
      isCurrent: p.id === profileId
    }));
    this.saveFamilyGroup(family);
    return family.profiles.find(p => p.id === profileId) || family.profiles[0];
  },

  updateFamilyName(name: string): void {
    const family = this.getFamilyGroup();
    family.familyName = name.trim();
    this.saveFamilyGroup(family);
  },

  createProfile(params: {
    name: string;
    role: FamilyRole;
    ageGroup: AgeGroup;
    avatar: string;
    parentalControls?: Partial<ParentalControls>;
  }): FamilyProfile {
    const family = this.getFamilyGroup();
    const newProfile: FamilyProfile = {
      id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: params.name.trim(),
      role: params.role,
      ageGroup: params.ageGroup,
      avatar: params.avatar,
      isCurrent: false,
      parentalControls: {
        maxDailyMinutes: params.parentalControls?.maxDailyMinutes ?? (params.role === 'child' ? 45 : 0),
        restrictExternalLinks: params.parentalControls?.restrictExternalLinks ?? (params.role === 'child'),
        approvedSections: params.parentalControls?.approvedSections ?? (params.role === 'child' ? ['kids', 'quran', 'adhkar'] : ['all']),
        allowCommunityReflections: params.parentalControls?.allowCommunityReflections ?? (params.role !== 'child')
      },
      stats: {
        quranPagesRead: 0,
        surahsCompleted: 0,
        adhkarSessionsCount: 0,
        kidsLessonsCompleted: 0
      },
      createdAt: new Date().toISOString()
    };

    family.profiles.push(newProfile);
    this.saveFamilyGroup(family);
    return newProfile;
  },

  updateProfile(profileId: string, updates: Partial<FamilyProfile>): void {
    const family = this.getFamilyGroup();
    family.profiles = family.profiles.map(p => {
      if (p.id === profileId) {
        return {
          ...p,
          ...updates,
          parentalControls: {
            ...p.parentalControls,
            ...(updates.parentalControls || {})
          }
        };
      }
      return p;
    });
    this.saveFamilyGroup(family);
  },

  deleteProfile(profileId: string): boolean {
    const family = this.getFamilyGroup();
    if (family.profiles.length <= 1) return false; // Prevent removing the last profile
    const target = family.profiles.find(p => p.id === profileId);
    if (target?.role === 'admin' && family.profiles.filter(p => p.role === 'admin').length <= 1) {
      return false; // Prevent removing only admin
    }

    family.profiles = family.profiles.filter(p => p.id !== profileId);
    // If the active profile was deleted, select first available
    if (!family.profiles.some(p => p.isCurrent)) {
      family.profiles[0].isCurrent = true;
    }
    this.saveFamilyGroup(family);
    return true;
  },

  addSharedGoal(goal: Omit<FamilySharedGoal, 'id' | 'currentCount' | 'completed' | 'createdAt'>): FamilySharedGoal {
    const family = this.getFamilyGroup();
    const newGoal: FamilySharedGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      currentCount: 0,
      completed: false,
      createdAt: new Date().toISOString()
    };
    family.sharedGoals.push(newGoal);
    this.saveFamilyGroup(family);
    return newGoal;
  },

  incrementGoalProgress(goalId: string, amount: number = 1): void {
    const family = this.getFamilyGroup();
    family.sharedGoals = family.sharedGoals.map(g => {
      if (g.id === goalId) {
        const next = Math.max(0, Math.min(g.targetCount, g.currentCount + amount));
        return {
          ...g,
          currentCount: next,
          completed: next >= g.targetCount
        };
      }
      return g;
    });
    this.saveFamilyGroup(family);
  },

  deleteGoal(goalId: string): void {
    const family = this.getFamilyGroup();
    family.sharedGoals = family.sharedGoals.filter(g => g.id !== goalId);
    this.saveFamilyGroup(family);
  },

  recordChildActivity(profileId: string, type: keyof ProfileStats, amount: number = 1): void {
    const family = this.getFamilyGroup();
    family.profiles = family.profiles.map(p => {
      if (p.id === profileId) {
        return {
          ...p,
          stats: {
            ...p.stats,
            [type]: (p.stats[type] || 0) + amount
          }
        };
      }
      return p;
    });
    this.saveFamilyGroup(family);
  },

  /**
   * Enforces privacy and authorization boundaries:
   * 1. Personal notes and reflections of an adult member can NEVER be accessed by other members.
   * 2. Only admin/parents can modify child settings or see child learning reports.
   * 3. Children cannot modify family configuration or other members.
   */
  checkPermission(
    actorId: string,
    targetId: string,
    action: 'manage_profile' | 'view_child_report' | 'access_private_notes'
  ): boolean {
    const family = this.getFamilyGroup();
    const actor = family.profiles.find(p => p.id === actorId);
    const target = family.profiles.find(p => p.id === targetId);

    if (!actor || !target) return false;

    // Strict Adult Privacy Rule:
    if (action === 'access_private_notes') {
      return actor.id === target.id; // Self only! Never cross-exposed.
    }

    if (action === 'manage_profile') {
      if (actor.id === target.id) return true; // Self edit
      return actor.role === 'admin'; // Admin can manage profiles
    }

    if (action === 'view_child_report') {
      if (target.role === 'child' && (actor.role === 'admin' || actor.role === 'adult')) {
        return true;
      }
      return actor.id === target.id;
    }

    return false;
  }
};
