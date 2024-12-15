import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
} from '@microsoft/signalr';
import { User } from '../_models/User';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class PresenceService {
    private hubUrl = environment.hubsUrl;
    private hubConnection?: HubConnection;
    private toastrService = inject(ToastrService);
    private router = inject(Router);

    onlineUsers = signal<string[]>([]);

    createHubConnection(user: User) {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`${this.hubUrl}presence`, {
                accessTokenFactory: () => user.token,
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start().catch(error => console.error(error));

        this.hubConnection.on('UserIsOnline', username => {
            this.toastrService.info(`${username} has connected`);
        });
        this.hubConnection.on('UserIsOffline', username => {
            this.toastrService.warning(`${username} has disconnected`);
        });
        this.hubConnection.on('GetOnlineUsers', usernames => {
            this.onlineUsers.set(usernames);
        });
        
        this.hubConnection.on('NewMessageReceived', ({ username, knowAs }) => {
            this.toastrService.info(`${knowAs} has sent you a new message! Click me to see it`)
                .onTap
                .pipe(take(1))
                .subscribe(() => this.router.navigateByUrl(`/members/${username}?tab=Messages`));
        });
    }

    stopHubConnection() {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            this.hubConnection.stop().catch(error => console.error(error));
        }
    }
}
