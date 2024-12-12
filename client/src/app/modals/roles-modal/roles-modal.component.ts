import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-roles-modal',
    standalone: true,
    imports: [],
    templateUrl: './roles-modal.component.html',
    styleUrl: './roles-modal.component.css',
})
export class RolesModalComponent {
    bsModalRef = inject(BsModalRef);
    title = '';
    username = '';
    availableRoles: string[] = [];
    selectedRoles: string[] = [];

    updateChecked(updateValue: string) {
        if (this.roleIsCheck(updateValue)) {
            this.selectedRoles = this.selectedRoles.filter(r => r !== updateValue);
        } else {
            this.selectedRoles.push(updateValue);
        }
    }

    roleIsCheck(role: string) {
        return this.selectedRoles.includes(role);
    }

    roleCanBeUpdated(role: string) {
        return role !== 'Admin' && this.username === 'admin';
    }
}
