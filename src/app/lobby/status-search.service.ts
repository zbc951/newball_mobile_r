// Angular
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
// App
import { GamesBasis } from '@lobby/games-basis';
import { Observable } from 'rxjs/Observable';
import { useAsync } from 'lib/helper';
// RxJs

export interface ISearch {
  selectedDate: string;
  selectedLeagues: string[];
}

@Injectable()
export class StatusSearchService {

  private searchSubject: Subject<ISearch> = new Subject();
  search$: Observable<ISearch> = this.searchSubject.asObservable();

  private search: ISearch = {
    selectedDate: undefined,
    selectedLeagues: []
  }
  constructor() { }

  setSearch(selectedDate: string, selectedLeagues: string[]) {
    this.search.selectedDate = selectedDate;
    this.search.selectedLeagues = selectedLeagues;
    useAsync(() => {
      this.searchSubject.next(this.search);
    });
  }

}
