import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LikesService } from '../_services/likes.service';
import { Member } from '../_models/member';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { FormsModule } from '@angular/forms';
import { MemberCardComponent } from "../members/member-card/member-card.component";
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
    selector: 'app-lists',
    standalone: true,
    imports: [ButtonsModule, FormsModule, MemberCardComponent, PaginationModule],
    templateUrl: './lists.component.html',
    styleUrl: './lists.component.css',
})
export class ListsComponent implements OnInit, OnDestroy {
    likesService = inject(LikesService);

    buttonOptions = [ { value: "liked", title: "Members I liked" }, { value: "likedBy", title: "Members who liked me" }, { value: "mutual", title: "Mutual" }]
    members: Member[] = [];
    predicate = 'liked';
    pageNumber = 1;
    pageSize = 5;

    ngOnInit(): void {
        this.loadLikes();
    }

    ngOnDestroy(): void {
        this.likesService.clearPaginatedResult();
    }

    getTitle() {
        switch(this.predicate) {
            case 'liked':
                return 'Member you liked';
            case 'likedBy':
                return 'Members who liked you';
            default:
                return 'Mutual like';
        }
    }

    loadLikes() {
        this.likesService.getLikes(this.predicate, this.pageNumber, this.pageSize);
    }
    
    onPageChanged(event: any) {
        if(this.pageNumber !== event.page) {
            this.pageNumber = event.page;
            this.loadLikes();
        }
    }
}
