import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    IHubMessage,
    TextareaComponent,
} from '../../components/collaborate/textarea/textarea.component';
import { CommonModule } from '@angular/common';
import { FormLockService, ILockUpdate } from '../../services/form-lock.service';
import { catchError, Subscription } from 'rxjs';
import { HubConnectionState } from '@microsoft/signalr';
import { MatInputModule } from '@angular/material/input';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

type ConnectionColor = 'green' | 'orange' | 'red';

interface Lock {
    id: string;
    userId: string;
}

@Component({
    selector: 'app-collaborate',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDividerModule,
        MatInputModule,
        TextareaComponent,
    ],
    templateUrl: './collaborate.component.html',
    styleUrl: './collaborate.component.scss',
})
export class CollaborateComponent implements OnInit, OnDestroy {
    connected = false;
    connectionStatus = 'Disconnected';
    connectionColor: ConnectionColor = 'red';

    pageId = 'D12';
    username = 'User';
    lastUpdate?: Date;
    locks: Lock[] = [];

    values = new Map<string, string>([
        [
            'main.details',
            'Some static message that should look like the user is working on this textarea.',
        ],
    ]);

    profileForm = new FormGroup({
        username: new FormControl(this.username),
        pageId: new FormControl(this.pageId),
    });

    private formSubscription?: Subscription;
    private formStatusSubscription?: Subscription;
    private lockMapping = new Map<string, { owner: string }>();

    constructor(
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private formLockService: FormLockService,
    ) {}

    ngOnInit() {
        this.formSubscription = this.formLockService
            .startConnection()
            .subscribe(() => {
                this.formStatusSubscription = this.formLockService
                    .getConnected()
                    .subscribe((status) => {
                        this.processConnectionStatus(status);
                    });

                this.subscribeTo(this.pageId);

                this.formLockService.sendMessage('GetAllLocks', [this.pageId]);
            });
    }

    ngOnDestroy() {
        this.formStatusSubscription?.unsubscribe();
        this.formSubscription?.unsubscribe();
    }

    getMapByKey(key: string) {
        return this.lockMapping.get(key);
    }

    sendNotification(msg: IHubMessage) {
        switch (msg.topic) {
            case 'applyLock':
                this.setLock(msg);
                break;
            case 'removeLock':
                this.removeLock(msg);
                break;
            case 'updateContent':
                this.updateContent(msg);
                break;
            default:
                console.error(`Message ${msg.topic} is not supported.`);
                break;
        }
    }

    updateForm() {
        if (!this.profileForm.valid) {
            this.snackBar.open('Form invalid, validate values');

            return;
        }

        const formValues = this.profileForm.value;

        this.unsubscribeFrom(this.pageId);

        this.pageId = formValues.pageId!;
        this.username = formValues.username!;

        this.subscribeTo(this.pageId);

        this.snackBar.open('Username and/or page id updated!');
    }

    private subscribeTo(pageId: string) {
        this.formLockService.followLockUpdates(pageId).subscribe((lock) => {
            if (!lock) {
                return;
            }

            this.handleLockUpdate(lock);
        });

        this.formLockService
            .followContentUpdates(pageId)
            .subscribe((update) => {
                if (!update.content) {
                    return;
                }

                this.values.set(update.field, update.content);
            });
    }

    private unsubscribeFrom(pageId: string) {
        this.formLockService.unfollowLockUpdates(pageId);
        this.formLockService.unfollowContentUpdates(pageId);
    }

    private setLock(msg: IHubMessage) {
        this.formLockService.sendMessage('Lock', [
            this.username,
            this.pageId,
            msg.id,
        ]);
    }

    private removeLock(msg: IHubMessage) {
        this.formLockService.sendMessage('Unlock', [
            this.username,
            this.pageId,
            msg.id,
        ]);
    }

    private updateContent(msg: IHubMessage) {
        const request = {
            pageId: this.pageId,
            field: msg.id,
            content: msg.content,
        };

        this.http.post('http://localhost:5198/document', request).subscribe();
    }

    private handleLockUpdate(lock: ILockUpdate) {
        if (lock.type === 'Lock' && !this.lockMapping.has(lock.field)) {
            this.lockMapping.set(lock.field, { owner: lock.owner });
        } else if (lock.type === 'Unlock' && this.lockMapping.has(lock.field)) {
            this.lockMapping.delete(lock.field);
        } else {
            console.error('Failed to process lock update', lock);
        }
    }

    private processConnectionStatus(status: HubConnectionState) {
        switch (status) {
            case HubConnectionState.Connected:
                this.connected = true;
                this.connectionStatus = 'Connected';
                this.connectionColor = 'green';

                break;
            case HubConnectionState.Reconnecting:
                this.connected = false;
                this.connectionStatus = 'Reconnecting';
                this.connectionColor = 'orange';

                break;
            case HubConnectionState.Disconnected:
            default:
                this.connected = false;
                this.connectionStatus = 'Disconnected';
                this.connectionColor = 'red';

                break;
        }
    }
}
