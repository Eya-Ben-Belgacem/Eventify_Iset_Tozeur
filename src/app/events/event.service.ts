// src/app/events/event.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: any;
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
}
