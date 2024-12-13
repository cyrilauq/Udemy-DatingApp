import { Component, computed, inject, input } from '@angular/core';
import { Member } from '../../_models/member';
import { RouterLink } from '@angular/router';
import { LikesService } from '../../_services/likes.service';
import { ToastrService } from 'ngx-toastr';
import { PresenceService } from '../../_services/presence.service';

@Component({
    selector: 'app-member-card',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './member-card.component.html',
    styleUrl: './member-card.component.css',
})
export class MemberCardComponent {
    private likesService = inject(LikesService);
    private toastrService = inject(ToastrService);
    private presenceService = inject(PresenceService);

    member = input.required<Member>();
    hasLiked = computed(() =>
        this.likesService.likeIds().includes(this.member().id),
    );
    isOnline = computed(() => this.presenceService.onlineUsers().includes(this.member().username));

    toggleLike() {
        this.likesService.toggleLike(this.member().id).subscribe({
            next: () => {
                this.toastrService.success(
                    this.hasLiked() ? 'User liked' : 'User disliked',
                );
            },
        });
    }
}
