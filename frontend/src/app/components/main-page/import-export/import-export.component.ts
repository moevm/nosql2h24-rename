import {Component, OnDestroy} from '@angular/core';
import { TuiFileLike, TuiFiles } from "@taiga-ui/kit";
import {catchError, debounceTime, finalize, map, Observable, of, Subject, switchMap, takeUntil} from "rxjs";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { AsyncPipe, NgIf } from "@angular/common";
import { ToponymsService } from "../../../services/toponyms.service";
import { TuiAppearance, TuiButton } from "@taiga-ui/core";
import {FilterDto} from "../../../dtos/dtos";

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [TuiFiles, AsyncPipe, NgIf, ReactiveFormsModule, TuiButton, TuiAppearance],
  templateUrl: './import-export.component.html',
  styleUrl: './import-export.component.sass'
})
export class ImportExportComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private readonly toponymsService: ToponymsService) { }

  protected readonly control = new FormControl<TuiFileLike | null>(
    null,
    Validators.required,
  );

  protected readonly failedFiles$ = new Subject<TuiFileLike | null>();
  protected readonly loadingFiles$ = new Subject<TuiFileLike | null>();
  protected readonly loadedFiles$ = this.control.valueChanges.pipe(
    takeUntil(this.destroy$),
    debounceTime(300),
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
      takeUntil(this.destroy$),
      map(() => {
        return file;
      }),
      catchError((error) => {
        console.error('File upload failed:', error);
        this.failedFiles$.next(file);
        return of(null);
      }),
      finalize(() => {
        this.loadingFiles$.next(null);

        const filterDto: FilterDto = {
          type: null,
          style: null,
          hasPhoto: null,
          architect: null,
          renamedDateFrom: null,
          renamedDateTo: null,
          cardSearch: null,
          constructionDateFrom: null,
          constructionDateTo: null,
          address: null,
          name: null,
        };

        this.toponymsService.filtersChanged$.next(filterDto);
      })
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
