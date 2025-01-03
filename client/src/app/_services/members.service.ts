import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { Photo } from '../_models/photo';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { of } from 'rxjs';
import { AccountService } from './account.service';
import { setPaginationResultFromHttpResponse, setHttpPaginationParams } from './paginationHelper';

@Injectable({
    providedIn: 'root',
})
export class MembersService {
    private http = inject(HttpClient);
    private accountService = inject(AccountService);
    baseUrl = environment.apiUrl;
    paginatedResult = signal<PaginatedResult<Member[]> | null>(null);
    memberCache = new Map<string, HttpResponse<Member[]>>();
    userParams = signal<UserParams>(new UserParams(this.accountService.currentUser()))

    resetUserParams() {
        this.userParams.set(new UserParams(this.accountService.currentUser()))
    }

    getMembers() {
        const paramsKey = this.computeUniqueIdFromParams(this.userParams());
        const cachedResponse = this.memberCache.get(paramsKey);
        console.log(this.userParams());
        
        if(cachedResponse) {
            setPaginationResultFromHttpResponse(cachedResponse, this.paginatedResult);
        } else {
            let params = this.setHttpParams(this.userParams());
            
            if (!this.paginatedResult() || this.hasPaginationInfoChanged(this.userParams().pageNumber, this.userParams().pageSize)) {
                this.http.get<Member[]>(`${this.baseUrl}users`, { observe: 'response', params }).subscribe({
                    next: response => {
                        this.memberCache.set(paramsKey, response);
                        setPaginationResultFromHttpResponse(response, this.paginatedResult);
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
        let params = setHttpPaginationParams(new HttpParams(), userParams.pageNumber, userParams.pageSize);
        params = this.setHttpAgeParams(params, userParams.minAge, userParams.maxAge);
        params = params.append('gender', userParams.gender);
        params = params.append('orderBy', userParams.orderBy);
        return params;
    }

    private hasPaginationInfoChanged(newPageNumber: number | undefined, newPageSize: number | undefined) {
        return this.paginatedResult()?.pagination?.currentPage != newPageNumber || this.paginatedResult()?.pagination?.itemsPerPage != newPageSize;
    }

    private setHttpAgeParams(httpParams: HttpParams, minAge: number, maxAge: number) {
        let params = httpParams;
        params = params.append('minAge', minAge);
        params = params.append('maxAge', maxAge);
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
