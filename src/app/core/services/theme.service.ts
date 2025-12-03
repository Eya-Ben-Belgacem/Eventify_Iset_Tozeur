import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>(this.loadTheme());
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  private loadTheme(): Theme {
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored || (this.prefersDark() ? 'dark' : 'light');
  }

  private prefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme() {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.themeSubject.next(newTheme);
    localStorage.setItem('theme', newTheme);
    this.applyTheme(newTheme);
  }

  private applyTheme(theme: Theme) {
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('light-theme', 'dark-theme');
    htmlEl.classList.add(`${theme}-theme`);
    htmlEl.setAttribute('data-theme', theme);
  }

  getTheme(): Theme {
    return this.themeSubject.value;
  }
}
