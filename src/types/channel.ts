export type ChannelStreamType = 'hls' | 'm3u' | 'unknown';

export type ChannelLiveStatus = 'working' | 'stopped' | 'unavailable' | 'checking';

export interface ChannelCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  channelCount?: number;
}

export interface IslamicChannel {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  streamUrl: string;
  streamType: ChannelStreamType;
  playlistUrl?: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  categoryIcon?: string;
  country?: string;
  language?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  sourceName?: string;
  sourceUrl?: string;
  licenseNote?: string;
  rightsStatus?: string;
  createdAt?: string;
  liveStatus?: ChannelLiveStatus;
  latencyMs?: number;
}

export interface M3UParsedItem {
  id: string;
  name: string;
  streamUrl: string;
  streamType: ChannelStreamType;
  logoUrl?: string;
  group?: string;
  country?: string;
  language?: string;
  isDuplicate?: boolean;
}

export interface StreamValidationReport {
  reachable: boolean;
  status: 'working' | 'stopped' | 'unavailable';
  statusCode?: number;
  contentType?: string;
  latencyMs?: number;
  message: string;
}

export interface ChannelAnalyticsEvent {
  event: 'channel_opened' | 'playback_started' | 'playback_error' | 'favorite_added' | 'favorite_removed' | 'channel_switched';
  channelId: string;
  channelName: string;
  timestamp: string;
  details?: Record<string, any>;
}
