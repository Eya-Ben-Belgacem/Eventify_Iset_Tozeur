import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
    // Créer un client Supabase SANS RLS (clé anon publique)
    this.supabase = createClient(
      'https://upjqonccakmeakbzjbfr.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwanFvbmNjYWttZWFrYnpqYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDA3OTUsImV4cCI6MjA4MDI3Njc5NX0.vscDfOqvmqrngNh-tvj4_Sio-3nohFlxTXvxHhfeQXQ',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
  }

  // ============= SUPABASE STORAGE IMAGE UPLOAD =============

  async uploadEventImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    
    try {
      const { error } = await this.supabase
        .storage
        .from('event-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data } = this.supabase
        .storage
        .from('event-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Supabase event image upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async uploadProfileImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    
    try {
      const { error } = await this.supabase
        .storage
        .from('profiles')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data } = this.supabase
        .storage
        .from('profiles')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Supabase profile image upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // ---------------- EVENTS CRUD -----------------

  async addEvent(eventData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEvents(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getEventById(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(id: string) {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async updateEvent(id: string, data: any) {
    const { error } = await this.supabase
      .from('events')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  }

  // ---------------- PARTICIPANTS -----------------

  async registerParticipant(eventId: string, userId: string) {
    const event = await this.getEventById(eventId);
    const participants = event.participants || [];

    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    await this.updateEvent(eventId, { participants });
  }

  async unregisterParticipant(eventId: string, userId: string) {
    const event = await this.getEventById(eventId);
    const participants = (event.participants || []).filter((id: string) => id !== userId);

    await this.updateEvent(eventId, { participants });
  }
}
