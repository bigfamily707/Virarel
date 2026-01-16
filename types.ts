import React from 'react';

export type VideoStatus = 'ideation' | 'scripting' | 'production' | 'review' | 'scheduled' | 'published' | 'failed';

export type Platform = 'YouTube Shorts' | 'TikTok' | 'Instagram Reels' | 'Facebook Reels';

export interface VideoProject {
  id: string;
  topic: string;
  title: string;
  hook?: string;
  script?: string;
  platform: Platform[];
  status: VideoStatus;
  scheduledDate?: string; // ISO String
  generatedDate: string;
  viralityScore: number;
  thumbnailUrl?: string;
  videoUrl?: string; // URL to the actual video file (mp4)
}

export interface MetricData {
  name: string;
  views: number;
  engagement: number;
  amt: number;
}

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

export interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: 'publish' | 'ai' | 'system' | 'trend' | 'error';
}

export interface AccountConfig {
    connected: boolean;
    accessToken?: string;
    accountId?: string; // Channel ID for YT, User ID for IG
}

export interface ConnectedAccounts {
  youtube: AccountConfig;
  tiktok: AccountConfig;
  instagram: AccountConfig;
  facebook: AccountConfig;
}