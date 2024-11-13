import {
    Component,
    HostListener,
    inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Member } from '../../_models/member';
import { AccountService } from '../../_services/account.service';
import { MembersService } from '../../_services/members.service';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PhotoEditorComponent } from '../../member/photo-editor/photo-editor.component';
import { DatePipe } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';

@Component({
    selector: 'app-member-edit',
    standalone: true,
    imports: [TabsModule, FormsModule, PhotoEditorComponent, TimeagoModule, DatePipe],
    templateUrl: './member-edit.component.html',
    styleUrl: './member-edit.component.css',
})
export class MemberEditComponent implements OnInit {
    @ViewChild('editForm') editForm?: NgForm;
    @HostListener('window:beforeunload', ['$event']) beforeUnloadListener(
        $event: any,
    ) {
        if (this.editForm?.dirty) {
            $event.returnValue = true;
        }
    }

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
        this.membersService.updateMember(this.editForm?.value).subscribe({
            next: () => {
                this.toastrService.success('Profile updated successfully');
                this.editForm?.reset(this.member);
            },
        });
    }

    onMemberChange(event: Member) {
        this.member = event;
    }
}
