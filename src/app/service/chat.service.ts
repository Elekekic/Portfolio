import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'assets/questions-answers.json';
  private isUnlocked = false;
  private shownQuotes: Set<number> = new Set();

  constructor(private http: HttpClient) {}

  getQuestions(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((data) => {
        return data.questions;
      })
    );
  }

  getAnswersForQuestion(questionId: number): Observable<(string | { link?: string; name?: string })[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((data) => {
        let answers = data.answers[questionId.toString()] as (string | { link?: string; name?: string })[];

        if (questionId === 3) {
          this.isUnlocked = true;
        }

        if (questionId === 5) {
          this.isUnlocked = true;
        }

        if (questionId === 11) {
          this.isUnlocked = true;
        }

        if (questionId === 7) {
          answers = [this.getRandomQuote(data.answers['7']), ...data.answers['7'].slice(-2)];
        }
        return answers;
      })
    );
  }

  getLinks(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((data) => {
        return data.links;
      })
    );
  }

  private getRandomQuote(quotes: any[]): any {
    const quoteList = quotes.filter((q) => typeof q === 'object' && q.quote); // all quotes
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * quoteList.length);
    } while (this.shownQuotes.has(randomIndex) && this.shownQuotes.size < quoteList.length);

    if (this.shownQuotes.size === quoteList.length) {
      this.shownQuotes.clear();
    }

    this.shownQuotes.add(randomIndex);
    return quoteList[randomIndex].quote;
  }
}
