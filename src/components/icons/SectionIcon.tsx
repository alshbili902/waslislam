import React from 'react';
import {
  BookOpen,
  BookMarked,
  Bookmark,
  Clock,
  Compass,
  Calendar,
  Coins,
  Search,
  Sparkles,
  Flame,
  Layers,
  GraduationCap,
  Scroll,
  Radio,
  ShieldCheck,
  Heart,
  Volume2,
  FileText,
  Sliders,
  BarChart3,
  Users,
  User,
  FolderArchive,
  Sun,
  Moon,
  HelpCircle,
  Trophy,
  Check,
  CheckCircle2,
  Info,
  Lock,
  Star,
  Award,
  Lightbulb,
  Droplets,
  Share2,
} from 'lucide-react';

import {
  IconAblution,
  IconKidsLearning,
  IconTasbeeh,
  IconKaaba,
  IconPrayerMihrab,
  IconQuranStand,
  IconRamadanLantern,
  IconDuaHands,
} from './IslamicIcons';

export type SemanticFeatureId =
  | 'quran'
  | 'quran-reading'
  | 'quran-audio'
  | 'quran-thematic'
  | 'quran-similar'
  | 'quran-planner'
  | 'quran-khatmah'
  | 'quran-journal'
  | 'quran-dictionary'
  | 'quran-tafsir'
  | 'quran-bookmarks'
  | 'worship'
  | 'worship-daily'
  | 'prayer'
  | 'prayer-times'
  | 'qibla'
  | 'tasbeeh'
  | 'adhkar'
  | 'wudu'
  | 'ablution'
  | 'salah'
  | 'seerah'
  | 'prophets-stories'
  | 'stories'
  | 'kids'
  | 'kids-stories'
  | 'kids-wudu'
  | 'kids-salah'
  | 'kids-adhkar'
  | 'kids-quiz'
  | 'learning-paths'
  | 'academy'
  | 'hadith'
  | 'calendar'
  | 'hijri'
  | 'zakat'
  | 'seasons'
  | 'ramadan'
  | 'hajj'
  | 'names-of-allah'
  | 'library'
  | 'studio'
  | 'share'
  | 'search'
  | 'trust-center'
  | 'charity'
  | 'settings'
  | 'theme-light'
  | 'theme-dark'
  | 'notifications'
  | 'backup'
  | 'accessibility'
  | 'reports'
  | 'family'
  | 'profile-admin'
  | 'profile-child'
  | 'profile-adult'
  | 'quiz';

/**
 * Centralized Icon Mapping for Wasl Islamic
 * Maps every semantic feature to a consistent, professional, theme-aware vector icon.
 */
export const SECTION_ICONS: Record<SemanticFeatureId, React.ComponentType<{ className?: string }>> = {
  // Quran ecosystem
  'quran': BookOpen,
  'quran-reading': BookOpen,
  'quran-audio': Volume2,
  'quran-thematic': Layers,
  'quran-similar': Sparkles,
  'quran-planner': BookMarked,
  'quran-khatmah': IconQuranStand,
  'quran-journal': Bookmark,
  'quran-dictionary': HelpCircle,
  'quran-tafsir': FileText,
  'quran-bookmarks': Volume2,

  // Worship & Adhkar
  'worship': Compass,
  'worship-daily': IconPrayerMihrab,
  'prayer': Clock,
  'prayer-times': Clock,
  'qibla': Compass,
  'tasbeeh': IconTasbeeh,
  'adhkar': IconDuaHands,
  'wudu': IconAblution,
  'ablution': IconAblution,
  'salah': IconPrayerMihrab,

  // Knowledge & Educational Tracks
  'seerah': Scroll,
  'prophets-stories': BookOpen,
  'stories': BookOpen,
  'academy': GraduationCap,
  'learning-paths': Layers,
  'hadith': Scroll,
  'names-of-allah': Sparkles,

  // Kids & Family
  'kids': IconKidsLearning,
  'kids-stories': BookOpen,
  'kids-wudu': IconAblution,
  'kids-salah': IconPrayerMihrab,
  'kids-adhkar': IconDuaHands,
  'kids-quiz': Trophy,
  'family': Users,
  'profile-admin': ShieldCheck,
  'profile-child': Sparkles,
  'profile-adult': User,

  // Tools & Utilities
  'calendar': Calendar,
  'hijri': Calendar,
  'zakat': Coins,
  'library': Bookmark,
  'studio': Sparkles,
  'share': Share2,
  'search': Search,
  'trust-center': ShieldCheck,
  'charity': Heart,
  'settings': Sliders,
  'theme-light': Sun,
  'theme-dark': Moon,
  'notifications': Sparkles,
  'backup': FolderArchive,
  'accessibility': Sparkles,
  'reports': BarChart3,
  'quiz': Award,

  // Seasons
  'seasons': Flame,
  'ramadan': IconRamadanLantern,
  'hajj': IconKaaba,
};

export interface SectionIconProps {
  id: SemanticFeatureId | string;
  className?: string;
  fallback?: React.ComponentType<{ className?: string }>;
}

/**
 * Universal Section Icon Renderer with safe fallbacks and zero emoji leakage.
 */
export const SectionIcon: React.FC<SectionIconProps> = ({
  id,
  className = 'w-5 h-5',
  fallback: Fallback = Sparkles,
}) => {
  const IconComponent = (SECTION_ICONS as Record<string, React.ComponentType<{ className?: string }>>)[id] || Fallback;
  return <IconComponent className={className} />;
};

export function getSectionIcon(id: SemanticFeatureId | string): React.ComponentType<{ className?: string }> {
  return (SECTION_ICONS as Record<string, React.ComponentType<{ className?: string }>>)[id] || Sparkles;
}
