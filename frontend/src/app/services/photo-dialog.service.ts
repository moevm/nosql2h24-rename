import {Injectable} from '@angular/core';
import {TuiPopoverService} from '@taiga-ui/cdk';
import {TUI_DIALOGS} from '@taiga-ui/core';
import { PhotoDialogComponent } from 'app/components/main-page/photo-dialog/photo-dialog.component';

@Injectable({
    providedIn: 'root',
    useFactory: () =>
        new PhotoDialogService(
            TUI_DIALOGS,
            PhotoDialogComponent,
            {photos: [], activeIndex: 0}
        ),
})
export class PhotoDialogService extends TuiPopoverService<PhotoDialogOptions, void> {}

export interface PhotoDialogOptions {
  readonly photos: readonly string[];
  readonly activeIndex: number;
}
