import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Member } from '../../_models/member';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { Photo } from '../../_models/photo';
import { TimeagoModule } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { Message } from '../../_models/message';
import { MessageService } from '../../_services/message.service';
import { PresenceService } from '../../_services/presence.service';
import { AccountService } from '../../_services/account.service';
import { HubConnectionState } from '@microsoft/signalr';

@Component({
    selector: 'app-member-detail',
    standalone: true,
    imports: [TabsModule, GalleryModule, TimeagoModule, DatePipe, MemberMessagesComponent],
    templateUrl: './member-detail.component.html',
    styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent implements OnInit, OnDestroy {
    @ViewChild('memberTabs', { static: true }) memberTabs?: TabsetComponent;

    private messageService = inject(MessageService);
    private route = inject(ActivatedRoute); // Inject a service that will help us interact with the current route
    private accountService = inject(AccountService);
    private router = inject(Router);
    presenceService = inject(PresenceService);

    member: Member = {} as Member;
    images: GalleryItem[] = [];
    activeTab?: TabDirective;

    ngOnInit(): void {
        this.route.data.subscribe({
            next: data => {
                this.member = data['member']
                console.log(data);
                
                if(this.member) this.images = this.member.photos.map(p => this.photoToImage(p));
            }
        });

        this.route.paramMap.subscribe({
            next: _ => this.onRouteParamsChange()
        })

        this.route.queryParams.subscribe({
            next: params => {
                params['tab'] && this.selectTab(params['tab'])
            }
        });
    }

    ngOnDestroy(): void {
        this.messageService.stopHubConnection();
    }

    selectTab(tabHeader: string) {
        if(this.memberTabs) {
            const messageTab = this.memberTabs.tabs.find(t => t.heading === tabHeader);
            if(messageTab) messageTab.active = true;
        }
    }

    onRouteParamsChange() {
        const user = this.accountService.currentUser();
        if(user) {
            if(this.messageService.hubConnection?.state === HubConnectionState.Connected && this.activeTab?.heading === 'Messages') {
                this.messageService.hubConnection.stop()
                    .then(() => {
                        this.messageService.createHubConnection(user, this.member.username);
                    });
            }
        }
    }

    onTabActivated(data: TabDirective) {
        this.activeTab = data;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tab: this.activeTab.heading },
            queryParamsHandling: 'merge'
        });
        if (this.activeTab.heading === 'Messages' && this.member) {
            this.loadMessages();
        } else {
            this.messageService.stopHubConnection();
        }
    }

    loadMessages() {
        const currentUser = this.accountService.currentUser();
        if(currentUser) {
            this.messageService.createHubConnection(currentUser, this.member.username);
        }
    }

    private photoToImage(photo: Photo): ImageItem {
        return new ImageItem({
            src: photo.url,
            thumb: photo.url,
        });
    }
}
