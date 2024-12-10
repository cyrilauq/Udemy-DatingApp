import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../_services/admin.service';
import { User } from '../../_models/User';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [],
    templateUrl: './user-management.component.html',
    styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
    users: User[] = [];

    private adminservice = inject(AdminService);

    ngOnInit(): void {
        this.getUsersWithRoles();
    }

    getUsersWithRoles() {
        this.adminservice.getUsersWithRoles().subscribe({
            next: users => (this.users = users),
        });
    }
}
