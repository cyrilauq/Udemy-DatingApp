import { Component, inject, input, OnInit } from '@angular/core';
import { Message } from '../../_models/message';
import { MessageService } from '../../_services/message.service';
import { TimeagoModule } from 'ngx-timeago';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  imports: [TimeagoModule],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.css'
})
export class MemberMessagesComponent implements OnInit {
  private messageService = inject(MessageService);
  
  username = input.required<string>();
  messages: Message[] = [];

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessageThread(this.username()).subscribe({
      next: messages => this.messages= messages
    })
  }
}