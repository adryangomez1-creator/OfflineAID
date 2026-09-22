import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConexionService {
  readonly enLinea$ = merge(fromEvent(window, 'online'), fromEvent(window, 'offline')).pipe(
    map(() => navigator.onLine),
    startWith(navigator.onLine)
  );
  readonly estado = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    this.enLinea$.subscribe(this.estado);
  }
}
