import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../_models/member';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { Photo } from '../../_models/photo';
import { TimeagoModule } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { Message } from '../../_models/message';
import { MessageService } from '../../_services/message.service';

@Component({
    selector: 'app-member-detail',
    standalone: true,
    imports: [TabsModule, GalleryModule, TimeagoModule, DatePipe, MemberMessagesComponent],
    templateUrl: './member-detail.component.html',
    styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent implements OnInit {
    @ViewChild('memberTabs', { static: true }) memberTabs?: TabsetComponent;

    private memberService = inject(MembersService);
    private messageService = inject(MessageService);
    private route = inject(ActivatedRoute); // Inject a service that will help us interact with the current route

    member: Member = {} as Member;
    images: GalleryItem[] = [];
    activeTab?: TabDirective;
    messages: Message[] = [];

    ngOnInit(): void {
        this.route.data.subscribe({
            next: data => {
                this.member = data['member']
                console.log(data);
                
                if(this.member) this.images = this.member.photos.map(p => this.photoToImage(p));
            }
        });

        this.route.queryParams.subscribe({
            next: params => {
                params['tab'] && this.selectTab(params['tab'])
            }
        });
    }

    onUpdateMessage(message: Message) {
        this.messages.push(message);
    }

    selectTab(tabHeader: string) {
        if(this.memberTabs) {
            const messageTab = this.memberTabs.tabs.find(t => t.heading === tabHeader);
            if(messageTab) messageTab.active = true;
        }
    }

    onTabActivated(data: TabDirective) {
        this.activeTab = data;
        if (this.activeTab.heading === 'Messages' && this.messages.length === 0 && this.member) {
            this.loadMessages();
        }
    }

    loadMessages() {
        this.messageService.getMessageThread(this.member!.username).subscribe({
            next: messages => (this.messages = messages),
        });
    }

    private photoToImage(photo: Photo): ImageItem {
        return new ImageItem({
            src: photo.url,
            thumb: photo.url,
        });
    }
}
