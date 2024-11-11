import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { of, tap } from 'rxjs';
import { Photo } from '../_models/photo';
import { PaginatedResult } from '../_models/pagination';

@Injectable({
    providedIn: 'root',
})
export class MembersService {
    private http = inject(HttpClient);
    baseUrl = environment.apiUrl;
    paginatedResult = signal<PaginatedResult<Member[]> | null>(null)

    getMembers(pageNumber?: number, pageSize?: number) {
        let params = this.getHttpPageParams(pageNumber, pageSize);
        
        if (!this.paginatedResult() || this.hasPaginationInfoChanged(pageNumber, pageSize)) {
            this.http.get<Member[]>(`${this.baseUrl}users`, { observe: 'response', params }).subscribe({
                next: response => this.setPaginationResultFromHttpResponse(response),
            });
        }
        return this.paginatedResult();
    }

    private hasPaginationInfoChanged(newPageNumber: number | undefined, newPageSize: number | undefined) {
        return this.paginatedResult()?.pagination?.currentPage != newPageNumber || this.paginatedResult()?.pagination?.itemsPerPage != newPageSize;
    }

    private setPaginationResultFromHttpResponse(response: HttpResponse<Member[]>): void {
        return this.paginatedResult.set({
            items: response.body ?? [],
            pagination: JSON.parse(response.headers.get('Pagination')!!)
        });
    }

    private getHttpPageParams(pageNumber: number | undefined, pageSize: number | undefined) {
        let params = new HttpParams();
        if (pageNumber && pageSize) {
            params = params.append('pageNumber', pageNumber);
            params = params.append('pageSize', pageSize);
        }
        return params;
    }

    getMember(username: string) {
        // const localMember = this.members().find(m => m.username === username);
        // if (localMember) return of(localMember);
        return this.http.get<Member>(`${this.baseUrl}users/${username}`);
    }

    updateMember(member: Member) {
        return this.http.put(`${this.baseUrl}users`, member).pipe(
            // tap(() => {
            //     this.members.update(members =>
            //         members.map(m =>
            //             m.username === member.username ? member : m,
            //         ),
            //     );
            // }),
        );
    }

    setMainPhoto(photo: Photo) {
        return this.http
            .put(`${this.baseUrl}users/set-main-photo/${photo.id}`, {})
            .pipe(
                // tap(() => {
                //     this.members.update(members =>
                //         members.map(m => {
                //             if (m.photos.includes(photo)) {
                //                 m.photoUrl = photo.url;
                //             }
                //             return m;
                //         }),
                //     );
                // }),
            );
    }

    deletePhoto(photo: Photo) {
        return this.http.delete(`${this.baseUrl}users/delete-photo/${photo.id}`)
        .pipe(
            // tap(() => {
            //     this.members.update(members =>
            //         members.map(m => {
            //             if (m.photos.includes(photo)) {
            //                 m.photos = m.photos.filter(p => p.id !== photo.id)
            //             }
            //             return m;
            //         }),
            //     );
            // }),
        );
    }
}
