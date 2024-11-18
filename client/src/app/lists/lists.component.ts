import { Component, inject, OnInit } from '@angular/core';
import { LikesService } from '../_services/likes.service';
import { Member } from '../_models/member';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { FormsModule } from '@angular/forms';
import { MemberCardComponent } from "../members/member-card/member-card.component";

@Component({
    selector: 'app-lists',
    standalone: true,
    imports: [ButtonsModule, FormsModule, MemberCardComponent],
    templateUrl: './lists.component.html',
    styleUrl: './lists.component.css',
})
export class ListsComponent implements OnInit {
    private likesService = inject(LikesService);

    buttonOptions = [ { value: "liked", title: "Members I liked" }, { value: "likedBy", title: "Members who liked me" }, { value: "mutual", title: "Mutual" }]
    members: Member[] = [];
    predicate = 'liked';

    ngOnInit(): void {
        this.loadLikes();
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
        this.likesService.getLikes(this.predicate).subscribe({
            next: members => (this.members = members),
        });
    }
}
