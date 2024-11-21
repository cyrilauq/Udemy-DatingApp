import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { FormsModule } from '@angular/forms';
import { Message } from '../_models/message';
import { TimeagoModule } from 'ngx-timeago';
import { RouterLink } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [ButtonsModule, FormsModule, TimeagoModule, RouterLink, PaginationModule],
    templateUrl: './messages.component.html',
    styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit {
    messagesService = inject(MessageService);
    container = 'Inbox';
    pageNumber = 1;
    pageSize = 5;

    ngOnInit(): void {
        this.loadMessages();
    }

    loadMessages() {
        this.messagesService.getMessages(
            this.pageNumber,
            this.pageSize,
            this.container,
        );
    }

    onPageChanged(event: any) {
        if (event.page != this.pageNumber) {
            this.pageNumber = event.page;
            this.loadMessages();
        }
    }

    getUserPhotoUrl(message: Message, isSender: boolean) {
        if (isSender) {
            return (
                (this.container === 'Outbox'
                    ? message.recipientPhotoUrl
                    : message.senderPhotoUrl) ?? './assets/user. png'
            );
        }
        return (
            (this.container === 'Outbox'
                ? message.recipientPhotoUrl
                : message.senderPhotoUrl) ?? './assets/user. png'
        );
    }

    getUserName(message: Message, isSender: boolean) {
        if (isSender) {
            return (
                (this.container === 'Outbox'
                    ? message.recipientUsername
                    : message.senderUsername) ?? './assets/user. png'
            );
        }
        return (
            (this.container === 'Outbox'
                ? message.recipientUsername
                : message.senderUsername) ?? './assets/user. png'
        );
    }

    getRoute(message: Message) {
        return this.container === 'Outbox' ? `/members/${message.recipientUsername}` : `/members/${message.senderUsername}`;
    }
}
