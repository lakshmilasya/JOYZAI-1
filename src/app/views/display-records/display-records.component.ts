import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-display-records',
  templateUrl: './display-records.component.html',
  styleUrls: ['./display-records.component.scss']
})
export class DisplayRecordsComponent implements OnInit {
  records : any;
  errors: any
  headers : any;
  errorHeaders : any;
  isLoading: boolean = false;
  isEmpty: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  displayRecords(records: any): void {
    this.records = records?.records || [];
    this.errors = records?.errors || [];
    this.headers = records?.headers || [];
    
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
}
