import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Coin } from "./coin";

@Injectable({
  providedIn: 'root'
})
export class CoinService {

  private coinUrl = 'https://8rr.de/coins.php';

  constructor(private http: HttpClient) {};

  getCoins(): Observable<Coin[]> {
    return this.http.get<Coin[]>(this.coinUrl)
      .pipe(
        catchError(this.handleError<Coin[]>('getCoins', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); 
      return of(result as T);
    };
  }
}
