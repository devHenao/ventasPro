import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() maxSize: number = 5; // Maximum number of page links to show
  
  @Output() pageChange = new EventEmitter<number>();
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  get pages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    const maxSize = this.maxSize;
    
    if (total <= maxSize) {
      // Show all pages if total is less than maxSize
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end pages
      let startPage = Math.max(1, current - Math.floor(maxSize / 2));
      let endPage = startPage + maxSize - 1;
      
      if (endPage > total) {
        endPage = total;
        startPage = Math.max(1, endPage - maxSize + 1);
      }
      
      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (startPage > 1) {
        if (startPage > 2) {
          pages.unshift(-1); // -1 represents ellipsis
        }
        pages.unshift(1);
      }
      
      if (endPage < total) {
        if (endPage < total - 1) {
          pages.push(-1); // -1 represents ellipsis
        }
        pages.push(total);
      }
    }
    
    return pages;
  }
  
  setPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.pageChange.emit(page);
  }
  
  next(): void {
    this.setPage(this.currentPage + 1);
  }
  
  previous(): void {
    this.setPage(this.currentPage - 1);
  }
  
  isEllipsis(page: number): boolean {
    return page === -1;
  }
}
