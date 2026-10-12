/**
 * Wasl Islamic (وصل الإسلامية) - Learning Paths Manager.
 * Handles enrollment, step progression, completion checks, notes,
 * and admin curriculum authoring/previewing.
 */

import { INITIAL_LEARNING_PATHS, type GuidedLearningPath, type PathStep } from '../data/learningPathsData.ts';
import { localStore } from '../lib/supabase.ts';

export interface UserPathProgress {
  pathId: string;
  enrolledAt: string;
  completedStepIds: string[];
  currentStepIndex: number;
  isCompleted: boolean;
  notes: Record<string, string>; // stepId -> userNote
  lastActivityAt: string;
}

export const learningPathsManager = {
  /**
   * Get all active paths (including custom admin created paths)
   */
  getAllPaths(): GuidedLearningPath[] {
    const custom = localStore.get<GuidedLearningPath[]>('admin_custom_learning_paths', []);
    return [...INITIAL_LEARNING_PATHS, ...custom];
  },

  /**
   * Get path by id
   */
  getPathById(id: string): GuidedLearningPath | undefined {
    return this.getAllPaths().find(p => p.id === id);
  },

  /**
   * Get all progress entries for current user
   */
  getUserProgress(): Record<string, UserPathProgress> {
    return localStore.get<Record<string, UserPathProgress>>('user_learning_paths_progress', {});
  },

  /**
   * Get progress for a specific path
   */
  getPathProgress(pathId: string): UserPathProgress | null {
    const all = this.getUserProgress();
    return all[pathId] || null;
  },

  /**
   * Enroll in a path
   */
  enrollInPath(pathId: string): UserPathProgress {
    const all = this.getUserProgress();
    if (all[pathId]) return all[pathId];

    const newProg: UserPathProgress = {
      pathId,
      enrolledAt: new Date().toISOString(),
      completedStepIds: [],
      currentStepIndex: 1,
      isCompleted: false,
      notes: {},
      lastActivityAt: new Date().toISOString()
    };

    all[pathId] = newProg;
    localStore.set('user_learning_paths_progress', all);
    return newProg;
  },

  /**
   * Complete a step and advance to next
   */
  completeStep(pathId: string, stepId: string, note?: string): UserPathProgress {
    let prog = this.getPathProgress(pathId);
    if (!prog) {
      prog = this.enrollInPath(pathId);
    }

    const path = this.getPathById(pathId);
    const completedSet = new Set(prog.completedStepIds);
    completedSet.add(stepId);

    const completedArray = Array.from(completedSet);
    const isFinished = path ? completedArray.length >= path.steps.length : false;

    const nextStepIndex = path ? Math.min(path.steps.length, completedArray.length + 1) : prog.currentStepIndex;

    const updatedNotes = { ...prog.notes };
    if (note) {
      updatedNotes[stepId] = note;
    }

    const updatedProg: UserPathProgress = {
      ...prog,
      completedStepIds: completedArray,
      currentStepIndex: nextStepIndex,
      isCompleted: isFinished,
      notes: updatedNotes,
      lastActivityAt: new Date().toISOString()
    };

    const all = this.getUserProgress();
    all[pathId] = updatedProg;
    localStore.set('user_learning_paths_progress', all);

    return updatedProg;
  },

  /**
   * Reset progress on a path
   */
  resetPathProgress(pathId: string): void {
    const all = this.getUserProgress();
    delete all[pathId];
    localStore.set('user_learning_paths_progress', all);
  },

  /**
   * Admin Method: Add or Update custom path
   */
  saveCustomPath(path: GuidedLearningPath): void {
    const custom = localStore.get<GuidedLearningPath[]>('admin_custom_learning_paths', []);
    const idx = custom.findIndex(p => p.id === path.id);
    if (idx >= 0) {
      custom[idx] = path;
    } else {
      custom.push(path);
    }
    localStore.set('admin_custom_learning_paths', custom);
  }
};
