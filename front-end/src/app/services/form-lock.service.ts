import { Injectable } from '@angular/core';
import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
} from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FormLockService {
    private hubConnection: HubConnection;
    private connectedSubject = new BehaviorSubject<HubConnectionState>(
        HubConnectionState.Disconnected,
    );

    constructor() {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5198/realtimehub')
            .withAutomaticReconnect()
            .build();
    }

    startConnection(): Observable<void> {
        return new Observable<void>((observer) => {
            this.hubConnection
                .start()
                .then(() => {
                    this.connectedSubject.next(HubConnectionState.Connected);

                    observer.next();
                    observer.complete();
                })
                .catch(() => observer.error());

            this.hubConnection.onreconnecting(() =>
                this.connectedSubject.next(HubConnectionState.Reconnecting),
            );
            this.hubConnection.onreconnected(() =>
                this.connectedSubject.next(HubConnectionState.Connected),
            );
            this.hubConnection.onclose(() =>
                this.connectedSubject.next(HubConnectionState.Disconnected),
            );
        });
    }

    getConnected() {
        return this.connectedSubject.asObservable();
    }

    followLockUpdates(pageId: string) {
        return new Observable<ILockUpdate>((observer) => {
            this.hubConnection.on(`ReceiveLock-${pageId}`, (obj) => {
                observer.next(obj);
            });
        });
    }

    unfollowLockUpdates(pageId: string) {
        this.hubConnection.off(`ReceiveLock-${pageId}`);
    }

    followContentUpdates(pageId: string) {
        return new Observable<IFormUpdate>((observer) => {
            this.hubConnection.on(`ReceiveContent-${pageId}`, (res) => {
                observer.next(res);
            });
        });
    }

    unfollowContentUpdates(pageId: string) {
        this.hubConnection.off(`ReceiveContent-${pageId}`);
    }

    sendMessage(topic: Topic, args: any[]) {
        this.hubConnection
            .invoke(topic, ...args)
            .catch((error) => console.log('Failed to send message', error));
    }
}

type LockType = 'Lock' | 'Unlock';
type UpdateType = 'Lock' | 'Content';
type Topic = 'GetAllLocks' | 'Lock' | 'Unlock';

export interface ILockUpdate {
    type: LockType;
    pageId: string;
    field: string;
    owner: string;
}

export interface IFormUpdate {
    type: UpdateType;
    field: string;
    content?: string;
}
