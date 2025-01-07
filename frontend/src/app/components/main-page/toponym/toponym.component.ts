import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {TuiButton, TuiDialogService, TuiAlertService} from '@taiga-ui/core';
import {ToponymsService} from '../../../services/toponyms.service';
import {ToponymDto} from '../../../dtos/dtos';

@Component({
  standalone: true,
  selector: 'app-toponym',
  imports: [
    CommonModule,
    TuiButton
  ],
  templateUrl: './toponym.component.html',
  styleUrls: ['./toponym.component.sass']
})
export class ToponymComponent implements OnInit {
  toponymDto?: ToponymDto;
  private readonly dialogs = inject(TuiDialogService);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly toponymsService: ToponymsService,
  ) {}

  ngOnInit(): void {
    const toponymId = this.route.snapshot.paramMap.get('id');
    if (toponymId) {
      
      this.toponymsService.getToponymById(toponymId).subscribe({
        next: toponym => {
          this.toponymDto = toponym;
          console.log(this.toponymDto);
        },
        error: err => {}
      });
    }
  }

  openPhotoDialog(startIndex: number): void {
    if (!this.toponymDto?.photoUrls?.[startIndex]) {
      return;
    }
  
    const enlargedPhotoHtml = `
    <div style="text-align: center;">
      <img
        src="${this.toponymDto.photoUrls[startIndex]}"
        alt="Photo"
        style="max-width: 100%; height: auto; border: 1px solid #ccc;"
      />
    </div>
    <style>
      .t-dialog__actions {
        display: none !important;
      }
    </style>
  `;
  
    this.dialogs
      .open(enlargedPhotoHtml, {
        size: 'l',
        closeable: true,
        dismissible: false,
      })
      .subscribe();
  }  
}