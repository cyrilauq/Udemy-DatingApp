import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { MemberCardComponent } from '../member-card/member-card.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { UserParams } from '../../_models/userParams';
import { AccountService } from '../../_services/account.service';

@Component({
    selector: 'app-member-list',
    standalone: true,
    imports: [MemberCardComponent, PaginationModule],
    templateUrl: './member-list.component.html',
    styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
    membersService = inject(MembersService);
    private accountService = inject(AccountService);
    userParams = new UserParams(this.accountService.currentUser());

    ngOnInit(): void {
        this.loadMembers();
    }

    private loadMembers(): void {
        this.membersService.getMembers(this.userParams);
    }

    onPageChanged(event: any) {
        if (this.userParams.pageNumber != event.page) {
            this.userParams.pageNumber = event.page;
            this.loadMembers();
        }
    }
}
