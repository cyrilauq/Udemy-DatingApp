import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  likeIds = signal<number[]>([]);
  
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

  getLikes(predicate: string) {
    return this.http.get(`${this.baseUrl}list/predicate=${predicate}`);
  }

  getLikeIds() {
    return this.http.get<number[]>(`${this.baseUrl}likes/list`).subscribe({
      next: ids => this.likeIds.set(ids)
    })
  }
}
