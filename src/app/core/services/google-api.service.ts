import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Service pour intégrer Google Maps et Google Calendar
 * Consommation correcte des APIs Google
 */

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {

  // Google Maps API Key (utilisez une clé restreinte en production)
  private readonly MAPS_API_KEY = environment.googleMapsApiKey;
  
  // Google Calendar scopes
  private readonly CALENDAR_SCOPES = [
    'https://www.googleapis.com/auth/calendar.events.public'
  ];

  constructor() {
    this.loadGoogleMapsApi();
  }

  /**
   * Charger Google Maps API dynamiquement
   */
  private loadGoogleMapsApi() {
    const win = window as any;
    if (!win.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  /**
   * Afficher une carte avec un marqueur pour une adresse/coordonnées
   * @param elementId - ID du conteneur HTML pour la carte
   * @param latitude - Latitude de la localisation
   * @param longitude - Longitude de la localisation
   * @param title - Titre du marqueur
   */
  displayMap(elementId: string, latitude: number, longitude: number, title: string): void {
    const win = window as any;
    if (!win.google) {
      console.error('Google Maps API not loaded');
      return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      return;
    }

    const mapOptions = {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
      mapTypeId: 'roadmap'
    };

    const map = new win.google.maps.Map(element, mapOptions);

    new win.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: title
    });
  }

  /**
   * Générer un lien pour ajouter l'événement à Google Calendar
   * @param event - Objet événement avec titre, description, date
   * @returns URL pour ajouter à Google Calendar
   */
  getGoogleCalendarUrl(event: {
    title: string;
    description?: string;
    date: Date | string;
    endDate?: Date | string;
    location?: string;
  }): string {
    const startDate = this.formatDateForCalendar(event.date);
    const endDate = event.endDate ? this.formatDateForCalendar(event.endDate) : startDate;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description || '',
      location: event.location || '',
      dates: `${startDate}/${endDate}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Convertir une date au format Google Calendar (YYYYMMDDTHHMMSSZ)
   */
  private formatDateForCalendar(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Obtenir les coordonnées (latitude/longitude) d'une adresse
   * Utilise l'Geocoding API de Google Maps
   * @param address - Adresse à géocoder
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    const win = window as any;
    if (!win.google) {
      console.error('Google Maps API not loaded');
      return null;
    }

    return new Promise((resolve) => {
      const geocoder = new win.google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any[], status: string) => {
        if (status === 'OK' && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  }

  /**
   * Générer un lien Google Maps pour une adresse
   * @param address - Adresse
   * @param zoom - Niveau de zoom (1-20)
   */
  getGoogleMapsUrl(address: string, zoom: number = 15): string {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/${encodedAddress}?zoom=${zoom}`;
  }

  /**
   * Générer un lien Google Maps directions
   * @param origin - Adresse de départ
   * @param destination - Adresse d'arrivée
   */
  getGoogleMapsDirectionsUrl(origin: string, destination: string): string {
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);
    return `https://www.google.com/maps/dir/${encodedOrigin}/${encodedDestination}`;
  }
}
