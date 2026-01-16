import { createClient } from '@supabase/supabase-js';
import { VideoProject, LogEntry, ConnectedAccounts } from '../types';

// Use environment variables or fallback for demo purposes
// OWASP: Do not hardcode keys in production.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ozdvuwemerzfqpopdgyf.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHZ1d2VtZXJ6ZnFwb3BkZ3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDk5NzcsImV4cCI6MjA4NDA4NTk3N30.Z4kt5KbbiSPVLd0EGxwwp4U1UxLludcdd4ZA9jizGQQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Interface Wrappers
export const db = {
  projects: {
    async getAll() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('generated_date', { ascending: false });
      
      if (error) {
          console.warn('Supabase projects fetch error (using fallback):', JSON.stringify(error));
          return null;
      }

      // Map snake_case DB columns to camelCase Types
      return data.map((p: any) => ({
        id: p.id,
        topic: p.topic,
        title: p.title,
        hook: p.hook,
        script: p.script,
        platform: p.platform || [],
        status: p.status,
        scheduledDate: p.scheduled_date,
        generatedDate: p.generated_date,
        viralityScore: p.virality_score,
        thumbnailUrl: p.thumbnail_url,
        videoUrl: p.video_url
      })) as VideoProject[];
    },

    async create(project: VideoProject) {
      const { error } = await supabase
        .from('projects')
        .insert({
          id: project.id,
          topic: project.topic,
          title: project.title,
          hook: project.hook,
          script: project.script,
          platform: project.platform,
          status: project.status,
          scheduled_date: project.scheduledDate,
          generated_date: project.generatedDate,
          virality_score: project.viralityScore,
          thumbnail_url: project.thumbnailUrl,
          video_url: project.videoUrl
        });
      if (error) console.error('Supabase create project error:', JSON.stringify(error));
    },

    async update(id: string, updates: Partial<VideoProject>) {
      const dbUpdates: any = { ...updates };
      // Convert specific fields to snake_case
      if (updates.scheduledDate) { dbUpdates.scheduled_date = updates.scheduledDate; delete dbUpdates.scheduledDate; }
      if (updates.generatedDate) { dbUpdates.generated_date = updates.generatedDate; delete dbUpdates.generatedDate; }
      if (updates.viralityScore) { dbUpdates.virality_score = updates.viralityScore; delete dbUpdates.viralityScore; }
      if (updates.thumbnailUrl) { dbUpdates.thumbnail_url = updates.thumbnailUrl; delete dbUpdates.thumbnailUrl; }
      if (updates.videoUrl) { dbUpdates.video_url = updates.videoUrl; delete dbUpdates.videoUrl; }

      const { error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id);
      if (error) console.error('Supabase update project error:', JSON.stringify(error));
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) console.error('Supabase delete project error:', JSON.stringify(error));
    }
  },

  logs: {
    async getAll() {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.warn('Supabase logs fetch error:', JSON.stringify(error));
        return null;
      }
      
      return data.map((l: any) => ({
        id: l.id,
        time: l.time_label || new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: l.text,
        type: l.type
      })) as LogEntry[];
    },

    async add(log: LogEntry) {
      const { error } = await supabase
        .from('logs')
        .insert({
          id: log.id,
          text: log.text,
          type: log.type,
          time_label: log.time,
          created_at: new Date().toISOString()
        });
      if (error) console.error('Supabase add log error:', JSON.stringify(error));
    }
  },

  settings: {
      async get() {
          const { data, error } = await supabase.from('settings').select('connected_accounts').single();
          if (error) {
              console.warn('Supabase settings fetch error:', JSON.stringify(error));
              return null;
          }
          return data?.connected_accounts as ConnectedAccounts;
      },
      
      async update(accounts: ConnectedAccounts) {
          // Assuming single user/tenant row with ID 1
           const { error } = await supabase
            .from('settings')
            .upsert({ id: 1, connected_accounts: accounts });
           if (error) console.error("Supabase settings update error:", JSON.stringify(error));
      }
  }
};