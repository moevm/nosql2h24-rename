import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FilterDto, ToponymDto} from "../../../dtos/dtos";
import {NgForOf} from "@angular/common";
import {TuiPagination} from "@taiga-ui/kit";
import {
  TuiTableCell,
  TuiTableDirective,
  TuiTableTbody,
  TuiTableTd,
  TuiTableTh,
  TuiTableThGroup, TuiTableTr
} from "@taiga-ui/addon-table";

@Component({
  selector: 'app-toponym-table',
  templateUrl: './toponym-table.component.html',
  standalone: true,
  imports: [
    NgForOf,
    TuiPagination,
    TuiTableCell,
    TuiTableDirective,
    TuiTableTbody,
    TuiTableTd,
    TuiTableTh,
    TuiTableThGroup,
    TuiTableTr
  ],
})
export class ToponymTableComponent {
  @Output() pageChanged = new EventEmitter<number>();

  @Input() data: ToponymDto[] = [];
  @Input() columns: string[] = [];
  @Input() pageSize = 10;

  currentPage = 0;

  get paginatedData(): ToponymDto[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.data.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.pageChanged.emit(page);
  }

  getRenameYears(renameYears: Date[]) {
    return renameYears.map((date) => date.toISOString().split('T')[0]).join(':');
  }
}
