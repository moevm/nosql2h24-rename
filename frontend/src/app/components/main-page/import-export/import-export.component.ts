import { Component } from '@angular/core';
import { TuiFileLike, TuiFiles } from "@taiga-ui/kit";
import { catchError, finalize, map, Observable, of, Subject, switchMap } from "rxjs";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { AsyncPipe, NgIf } from "@angular/common";
import { ToponymsService } from "../../../services/toponyms.service";
import { TuiAppearance, TuiButton } from "@taiga-ui/core";

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [TuiFiles, AsyncPipe, NgIf, ReactiveFormsModule, TuiButton, TuiAppearance],
  templateUrl: './import-export.component.html',
  styleUrl: './import-export.component.sass'
})
export class ImportExportComponent {

  constructor(private readonly toponymsService: ToponymsService) { }

  protected readonly control = new FormControl<TuiFileLike | null>(
    null,
    Validators.required,
  );

  protected readonly failedFiles$ = new Subject<TuiFileLike | null>();
  protected readonly loadingFiles$ = new Subject<TuiFileLike | null>();
  protected readonly loadedFiles$ = this.control.valueChanges.pipe(
    switchMap((file) => this.processFile(file)),
  );

  protected removeFile(): void {
    this.control.setValue(null);
  }

  protected processFile(file: TuiFileLike | null): Observable<TuiFileLike | null> {
    this.failedFiles$.next(null);

    if (this.control.invalid || !file) {
      return of(null);
    }

    this.loadingFiles$.next(file);
    return this.toponymsService.import(file as File).pipe(
      map(() => {
        return file;
      }),
      catchError((error) => {
        console.error('File upload failed:', error);
        this.failedFiles$.next(file);
        return of(null);
      }),
      finalize(() => this.loadingFiles$.next(null))
    );
  }

  downloadFile(): void {
    this.toponymsService.export().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed:', err);
      }
    });
  }
}
