import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { setHttpPaginationParams, setPaginationResultFromHttpResponse } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  likeIds = signal<number[]>([]);
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);
  
  toggleLike(targetId: number) {
    return this.http.post(`${this.baseUrl}likes/${targetId}`, {}).pipe(
      tap(() => {
        if(this.likeIds().includes(targetId)) {
          this.likeIds.update(ids => ids.filter(id => id !== targetId))
        } else {
          this.likeIds.update(ids => [...ids, targetId])
        }
      })
    );
  }

  getLikes(predicate: string, pageNumber: number = 1, pageSize: number = 10) {
    let httpParams = setHttpPaginationParams(new HttpParams(), pageNumber, pageSize);
    httpParams = httpParams.append('predicate', predicate);

    return this.http.get<Member[]>(`${this.baseUrl}likes?predicate=${predicate}`, { observe: 'response', params: httpParams })
      .subscribe({
        next: response => setPaginationResultFromHttpResponse(response, this.paginatedResult)
      });
  }

  getLikeIds() {
    return this.http.get<number[]>(`${this.baseUrl}likes/list`).subscribe({
      next: ids => this.likeIds.set(ids)
    })
  }

  clearPaginatedResult() {
    this.paginatedResult.set(null);
  }
}
