import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MembersService {
    private http = inject(HttpClient);
    baseUrl = environment.apiUrl;
    members = signal<Member[]>([]);

    getMembers() {
        if (this.members().length == 0) {
            this.http.get<Member[]>(`${this.baseUrl}users`).subscribe({
                next: members => this.members.set(members),
            });
        }
        return this.members();
    }

    getMember(username: string) {
        const localMember = this.members().find(m => m.username === username);
        if (localMember) return of(localMember);
        return this.http.get<Member>(`${this.baseUrl}users/${username}`);
    }

    updateMember(member: Member) {
        return this.http.put(`${this.baseUrl}users`, member).pipe(
            tap(() => {
                this.members.update(members =>
                    members.map(m =>
                        m.username === member.username ? member : m,
                    ),
                );
            }),
        );
    }
}
