import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-display-records',
  templateUrl: './display-records.component.html',
  styleUrls: ['./display-records.component.scss']
})
export class DisplayRecordsComponent implements OnInit {
  errors: any
  errorHeaders : any;
  isLoading: boolean = false;
  isEmpty: boolean = false;
  sortedColumn : string = 'fullName';
  isAscending : boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  displayRecords(records: any): void {
    this.errors = records?.errors || [];
    console.log(this.errors)
    if (this.errors.length > 0) {
      this.errorHeaders = Object.keys(this.errors[0]);
    } else {
      this.errorHeaders = [];
    }
    
    if (this.errors.length === 0) {
      this.isEmpty = true;
    } else {
      this.isEmpty = false;
    }
  
    this.isLoading = false;
  }

  getChipStyles(role: string) {
    const chipStyles: any = {
      Admin: {
        backgroundColor: 'rgb(165 235 181)',
        color: 'rgb(23 128 47)',
        padding: '5px 10px',
        borderRadius: '16px',
        fontWeight: 'bold',
        border: '1px solid rgb(23 128 47)'
      },
      Manager: {
        backgroundColor: 'rgb(166 193 222)',
        color: 'rgb(50 75 101)',
        padding: '5px 10px',
        borderRadius: '16px',
        fontWeight: 'bold',
        border: '1px solid rgb(50, 75, 101)'
      },
      Caller: {
        backgroundColor: 'rgb(237 212 140)',
        padding: '5px 10px',
        borderRadius: '16px',
        fontWeight: 'bold',
        color: 'rgb(103 85 33)',
        border: '1px solid rgb(103 85 33)'
      },
      Root: {
        backgroundColor: '#6c757d',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '16px',
        fontWeight: 'bold'
      }
    };

    // Return styles based on role, default to a basic style if role is not found
    return chipStyles[role] || {
      backgroundColor: '#ccc',
      color: '#fff',
      padding: '5px 10px',
      borderRadius: '16px',
      fontWeight: 'bold'
    };
  }
  getInitials(name: string): string {
    if (!name) return '?'; // Default for missing names
    const words = name.split(' ');
    const initials = words.length === 1 
      ? words[0][0] 
      : words[0][0] + words[words.length - 1][0];
    return initials.toUpperCase();
  }

  sortData(): void {
    this.errors.sort((a: { [x: string]: string; }, b: { [x: string]: string; }) => {
      const nameA = a[this.sortedColumn]?.toLowerCase() || '';
      const nameB = b[this.sortedColumn]?.toLowerCase() || '';

      if (nameA < nameB) return this.isAscending ? -1 : 1;
      if (nameA > nameB) return this.isAscending ? 1 : -1;
      return 0;
    });
  }

  // Toggle sorting order (ascending or descending)
  toggleSort(column: string): void {
    if (this.sortedColumn === column) {
      this.isAscending = !this.isAscending; // Toggle the sorting order
    } else {
      this.sortedColumn = column; // Set the column to sort by
      this.isAscending = true; // Reset to ascending order
    }
    this.sortData(); // Apply sorting
  }

}
