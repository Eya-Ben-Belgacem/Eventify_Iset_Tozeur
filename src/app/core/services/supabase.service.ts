import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://upjqonccakmeakbzjbfr.supabase.co', // 🔥 Remplace par ton URL
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwanFvbmNjYWttZWFrYnpqYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDA3OTUsImV4cCI6MjA4MDI3Njc5NX0.vscDfOqvmqrngNh-tvj4_Sio-3nohFlxTXvxHhfeQXQ'     // 🔥 Remplace par ton clé public
    );
  }

  // 📌 Upload image + retourne l'URL finale
  async uploadEventImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await this.supabase
      .storage
      .from('event-images')   // 🔥 Le nom du bucket que tu vas créer
      .upload(fileName, file);

    if (error) {
      throw new Error('Erreur upload : ' + error.message);
    }

    // 📌 Récupération du lien public
    const { data } = this.supabase
      .storage
      .from('event-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}
