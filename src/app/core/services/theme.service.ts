import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private isDark = false;
  private _theme$ = new BehaviorSubject<'light' | 'dark'>('light');
  public readonly theme$ = this._theme$.asObservable();

  constructor() {
    // Charger le thème depuis le localStorage
    const savedTheme = localStorage.getItem('theme');
    this.isDark = savedTheme === 'dark';
    this._theme$.next(this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    const theme = this.isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    this._theme$.next(theme);
    this.applyTheme();
  }

  applyTheme() {
    const html = document.documentElement;
    html.classList.remove(this.isDark ? 'light-theme' : 'dark-theme');
    html.classList.add(this.isDark ? 'dark-theme' : 'light-theme');
  }

  isDarkMode() {
    return this.isDark;
  }
}
