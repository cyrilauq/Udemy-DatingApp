import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';
import {
    setHttpPaginationParams,
    setPaginationResultFromHttpResponse,
} from './paginationHelper';
import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
} from '@microsoft/signalr';
import { User } from '../_models/User';
import { Group } from '../_models/group';
import { BusyService } from './busy.service';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    private baseUrl = environment.apiUrl;
    private hubUrl = environment.hubsUrl;
    hubConnection?: HubConnection;

    private http = inject(HttpClient);
    private busyService = inject(BusyService);

    paginatedResult = signal<PaginatedResult<Message[]> | null>(null);
    messageThread = signal<Message[]>([]);

    createHubConnection(user: User, otherUsername: string) {
        this.busyService.busy();
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`${this.hubUrl}message?user=${otherUsername}`, {
                accessTokenFactory: () => user.token,
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start()
            .catch(error => console.error(error))
            .finally(() => this.busyService.idle());

        this.hubConnection.on('ReceiveMessageThread', messages => this.messageThread.set(messages));
        this.hubConnection.on('NewMessage', newMessage => this.messageThread.update(messages => [...messages, newMessage]));
        this.hubConnection.on("UpdatedGroup", (group: Group) => {
            if(group.connections.some(c => c.username === otherUsername)) {
                this.messageThread.update(messages => {
                    messages.forEach(message => {
                        if(!message.dateRead) {
                            message.dateRead = new Date(Date.now());
                        }
                    });
                    return messages;
                })
            }
        });
    }

    stopHubConnection() {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            this.hubConnection.stop().catch(error => console.error(error));
        }
    }

    getMessages(pageNumber: number, pageSize: number, container: string) {
        let params = setHttpPaginationParams(
            new HttpParams(),
            pageNumber,
            pageSize,
        );

        params = params.append('Container', container);

        return this.http
            .get<
                Message[]
            >(`${this.baseUrl}messages`, { observe: 'response', params })
            .subscribe({
                next: response =>
                    setPaginationResultFromHttpResponse(
                        response,
                        this.paginatedResult,
                    ),
            });
    }

    getMessageThread(username: string) {
        return this.http.get<Message[]>(
            `${this.baseUrl}messages/thread/${username}`,
        );
    }

    async sendMessage(username: string, content: string) {
        const messageToSend = {
            recipientUsername: username,
            content,
        };
        return this.hubConnection?.invoke('SendMessage', messageToSend);
    }

    deleteMessage(id: number) {
        return this.http.delete(`${this.baseUrl}messages/${id}`);
    }
}
