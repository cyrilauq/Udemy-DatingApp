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
    rolesUpdated = false;

    updateChecked(updateValue: string) {
        if (this.roleIsCheck(updateValue)) {
            this.selectedRoles = this.selectedRoles.filter(r => r !== updateValue);
        } else {
            console.log("Role added");
            
            this.selectedRoles.push(updateValue);
            console.log(this.selectedRoles.length);
            
        }
    }

    roleIsCheck(role: string) {
        return this.selectedRoles.includes(role);
    }

    roleCanBeUpdated(role: string) {
        return role !== 'Admin' && this.username === 'admin';
    }

    hasSelectedRoles() {
        return this.selectedRoles.length !== 0;
    }

    onSelectRoles() {
        this.rolesUpdated = true;
        this.bsModalRef.hide();
    }
}
