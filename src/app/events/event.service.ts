// src/app/events/event.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, docData, arrayUnion, arrayRemove, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: any;
  location?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string | null;
  organizerId?: string;
  participants?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  constructor(private firestore: Firestore) {}

  getEvents(): Observable<Event[]> {
    const eventsRef = collection(this.firestore, 'events');
    return collectionData(eventsRef, { idField: 'id' }) as Observable<Event[]>;
  }

  getEvent(id: string): Observable<Event> {
    const eventDocRef = doc(this.firestore, `events/${id}`);
    return docData(eventDocRef, { idField: 'id' }) as Observable<Event>;
  }

  addEvent(event: Event) {
    const eventsRef = collection(this.firestore, 'events');
    return addDoc(eventsRef, event);
  }

  updateEvent(id: string, event: Event) {
    const eventDocRef = doc(this.firestore, `events/${id}`);
    return updateDoc(eventDocRef, { ...event });
  }

  deleteEvent(id: string) {
    const eventDocRef = doc(this.firestore, `events/${id}`);
    return deleteDoc(eventDocRef);
  }

  // 📝 Inscription à un événement
  async registerToEvent(eventId: string, userId: string): Promise<void> {
    const eventDocRef = doc(this.firestore, `events/${eventId}`);
    try {
      await updateDoc(eventDocRef, {
        participants: arrayUnion(userId)
      });
    } catch (error: any) {
      console.error('Error registering to event:', error);
      throw error;
    }
  }

  // ❌ Désinscription d'un événement
  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    const eventDocRef = doc(this.firestore, `events/${eventId}`);
    try {
      await updateDoc(eventDocRef, {
        participants: arrayRemove(userId)
      });
    } catch (error: any) {
      console.error('Error unregistering from event:', error);
      throw error;
    }
  }

  // ✅ Vérifier si un utilisateur est inscrit
  isUserRegistered(event: Event, userId: string): boolean {
    return event.participants?.includes(userId) ?? false;
  }

  // 👥 Obtenir le nombre de participants
  getParticipantCount(event: Event): number {
    return event.participants?.length ?? 0;
  }
}
