import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { MemberCardComponent } from '../member-card/member-card.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
    selector: 'app-member-list',
    standalone: true,
    imports: [MemberCardComponent, PaginationModule],
    templateUrl: './member-list.component.html',
    styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
    membersService = inject(MembersService);
    pageNumber = 1;
    pageSize = 5;

    ngOnInit(): void {
        this.loadMembers();
    }

    private loadMembers(): void {
        this.membersService.getMembers(this.pageNumber, this.pageSize);
    }

    onPageChanged(event: any) {
        if (this.pageNumber != event.page) {
            this.pageNumber = event.page;
            this.loadMembers();
        }
    }
}
