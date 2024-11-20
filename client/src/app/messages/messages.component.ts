import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [ButtonsModule],
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
}
