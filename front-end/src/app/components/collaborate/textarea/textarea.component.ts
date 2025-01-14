import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-textarea',
    imports: [MatIconModule, MatInputModule],
    templateUrl: './textarea.component.html',
    styleUrl: './textarea.component.scss',
})
export class TextareaComponent implements OnInit {
    @Input({ required: true }) id = '';
    @Input({ required: true }) label = '';
    @Input({ required: true }) value = '';
    @Input({ required: true }) username = '';

    @Input() placeholder = 'Default placeholder';
    @Input() lock?: { owner: string };

    @Output() messageEvent = new EventEmitter<IHubMessage>();

    contentSubject = new Subject<string>();

    constructor() {}

    ngOnInit() {
        this.contentSubject
            .pipe(debounceTime(2500))
            .subscribe((c) => this.updateModifications(c));
    }

    handleBlur() {
        this.messageEvent.emit({ id: this.id, topic: 'removeLock' });
    }

    handleFocus() {
        this.messageEvent.emit({ id: this.id, topic: 'applyLock' });
    }

    handleInterimUpdate = ($event: any) =>
        this.contentSubject.next($event.target.value);

    private updateModifications(content: string) {
        this.messageEvent.emit({
            id: this.id,
            topic: 'updateContent',
            content: content,
        });
    }
}

type Topic = 'applyLock' | 'removeLock' | 'updateContent';

export interface IHubMessage {
    id: string;
    topic: Topic;
    content?: string;
}
