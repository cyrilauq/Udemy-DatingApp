import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/User';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    baseUrl = environment.apiUrl;

    private http = inject(HttpClient);

    getUsersWithRoles() {
        return this.http.get<User[]>(`${this.baseUrl}admin/users`);
    }
}