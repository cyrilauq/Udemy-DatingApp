import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Member } from '../../_models/member';
import { AccountService } from '../../_services/account.service';
import { MembersService } from '../../_services/members.service';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-member-edit',
    standalone: true,
    imports: [TabsModule, FormsModule],
    templateUrl: './member-edit.component.html',
    styleUrl: './member-edit.component.css',
})
export class MemberEditComponent implements OnInit {
    @ViewChild("editForm") editForm?: NgForm;

    private accountService = inject(AccountService);
    private membersService = inject(MembersService);
    private toastrService = inject(ToastrService);
    member?: Member;

    ngOnInit(): void {
        this.loadMember();
    }

    loadMember() {
        const user = this.accountService.currentUser();
        if (!user) return;
        this.membersService.getMember(user.username).subscribe({
            next: member => (this.member = member),
        });
    }

    updateMember() {
        console.log(this.member);
        this.toastrService.success('Profile updated successfully');
        this.editForm?.reset(this.member);
    }
}