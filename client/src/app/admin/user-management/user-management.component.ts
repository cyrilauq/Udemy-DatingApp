import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../_services/admin.service';
import { User } from '../../_models/User';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [],
    templateUrl: './user-management.component.html',
    styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
    users: User[] = [];
    // We need to tells bootstrap the component that will be used as a modal and that's why we type it with RolesModalComponent
    bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();

    private adminservice = inject(AdminService);
    private modalService = inject(BsModalService);

    ngOnInit(): void {
        this.getUsersWithRoles();
    }

    openRolesModal(user: User) {
        const modalOptions: ModalOptions = {
            class: 'modal-lg',
            initialState: {
                title: 'User roles',
                username: user.username,
                availableRoles: ['Admin', 'Moderator', 'Member'],
                selectedRoles: [...user.roles],
                users: this.users,
                rolesUpdated: false
            }
        };

        this.bsModalRef = this.modalService.show(RolesModalComponent, modalOptions);
        this.bsModalRef.onHide?.subscribe({
            next: () => {
                if(this.bsModalRef.content && this.bsModalRef.content.rolesUpdated) {
                    const selectedRoles = this.bsModalRef.content.selectedRoles;
                    this.adminservice.updateUserRoles(user.username, selectedRoles).subscribe({
                        next: roles => user.roles = roles
                    });
                }
            }
        });
    }

    getUsersWithRoles() {
        this.adminservice.getUsersWithRoles().subscribe({
            next: users => (this.users = users),
        });
    }
}
