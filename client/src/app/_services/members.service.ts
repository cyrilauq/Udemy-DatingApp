import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { Photo } from '../_models/photo';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MembersService {
    private http = inject(HttpClient);
    baseUrl = environment.apiUrl;
    paginatedResult = signal<PaginatedResult<Member[]> | null>(null);
    memberCache = new Map<string, HttpResponse<Member[]>>();

    getMembers(userParams: UserParams) {
        const paramsKey = this.computeUniqueIdFromParams(userParams);
        const cachedResponse = this.memberCache.get(paramsKey);
        console.log(userParams);
        
        if(cachedResponse) {
            this.setPaginationResultFromHttpResponse(cachedResponse);
        } else {
            let params = this.setHttpParams(userParams);
            
            if (!this.paginatedResult() || this.hasPaginationInfoChanged(userParams.pageNumber, userParams.pageSize)) {
                this.http.get<Member[]>(`${this.baseUrl}users`, { observe: 'response', params }).subscribe({
                    next: response => {
                        this.memberCache.set(paramsKey, response);
                        this.setPaginationResultFromHttpResponse(response);
                    },
                });
            }
        }
        return this.paginatedResult();
    }

    private computeUniqueIdFromParams(userParams: UserParams) {
        return Object.values(userParams).join('-');
    }

    private setHttpParams(userParams: UserParams) {
        let params = this.setHttpPaginationParams(new HttpParams(), userParams.pageNumber, userParams.pageSize);
        params = this.setHttpAgeParams(params, userParams.minAge, userParams.maxAge);
        params = params.append('gender', userParams.gender);
        params = params.append('orderBy', userParams.orderBy);
        return params;
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

    private setHttpAgeParams(httpParams: HttpParams, minAge: number, maxAge: number) {
        let params = httpParams;
        params = params.append('minAge', minAge);
        params = params.append('maxAge', maxAge);
        return params;
    }

    private setHttpPaginationParams(httpParams: HttpParams, pageNumber: number | undefined, pageSize: number | undefined) {
        let params = httpParams;
        if (pageNumber && pageSize) {
            params = params.append('pageNumber', pageNumber);
            params = params.append('pageSize', pageSize);
        }
        return params;
    }

    getMember(username: string) {
        const memberFromCache = this.findMemberFromCache(username);
        if (memberFromCache) return of(memberFromCache);
        return this.http.get<Member>(`${this.baseUrl}users/${username}`);
    }

    private findMemberFromCache(username: string) {
        return [...this.memberCache.values()]
            .reduce((arr, elem) => elem.body ? arr.concat(elem.body) : arr, new Array<Member>(0))
            .find(m => m.username === username)
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
