import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent{
  
 @ViewChild('fileInput') fileInput!: ElementRef;
  records: any[] = [];
  headers: string[] = [];
  errorMessage: string | null = null;
  progress: number = -1;
  fileReader: FileReader | null = null;
  fileName: string = '';
  totalSize: string = '';
  uploadedSize: string = '';
  errors : any;
  csvData : any;

  @Output() calculatedData = new EventEmitter();

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.handleFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File): void {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['csv', 'xls', 'xlsx'];

    if (!allowedExtensions.includes(fileExtension!)) {
      this.errorMessage = 'Invalid file type. Please upload a CSV, XLS, or XLSX file.';
      return;
    }

    this.errorMessage = null;
    this.progress = 0;
    this.fileName = file.name;
    this.totalSize = this.formatBytes(file.size);
    this.uploadedSize = '0 B';
    this.fileReader = new FileReader();

    this.fileReader.onprogress = (e) => {
      if (e.lengthComputable) {
        this.simulateProgress(e.loaded, e.total);
      }
    };

    this.fileReader.onload = (e) => {
        this.csvData = e.target?.result as string;
    };

    this.fileReader.readAsText(file);
  }

  simulateProgress(loaded: number, total: number): void {
    const increment = 5; // Adjust this value to control the speed of the progress bar
    const delay = 50; // Adjust this value to control the delay between increments

    const updateProgress = () => {
      
      if (this.progress < Math.round((loaded / total) * 100)) {
        this.progress += increment;
        this.uploadedSize = this.formatBytes(this.progress);
        setTimeout(updateProgress, delay);
      } else {
        this.progress = Math.round((loaded / total) * 100);
        this.uploadedSize = this.formatBytes(total);
      }

      if(this.progress == 100){
        this.parseCSV(this.csvData);
        return;
      }
    };

    updateProgress();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  parseCSV(csvData: string): void {
    const lines = csvData.split('\n').map(line => line.trim());
    this.headers = lines[0].split(',').map(header => header.trim());
    this.records = lines.slice(1).map(line => line.split(',').map(field => field.trim()));
    this.validateHierarchy();
  }

  validateHierarchy(): void {
    const emailIndex = this.headers.indexOf('Email');
    const roleIndex = this.headers.indexOf('Role');
    const reportsToIndex = this.headers.indexOf('ReportsTo');
    const fullNameIndex = this.headers.indexOf('FullName'); // Assuming there's a FullName column
  
    const roles: any = {
      'Root': [],
      'Admin': [],
      'Manager': [],
      'Caller': []
    };
  
    const reportsToMap: { [key: string]: string } = {};
    this.errors = [];
  
    for (const record of this.records) {
      const email = record[emailIndex];
      const role = record[roleIndex];
      const reportsTo = record[reportsToIndex];
      const fullName = record[fullNameIndex];
  
      if (role in roles) {
        roles[role].push(email);
      }
  
      if (reportsTo) {
        const reportsToEmails = reportsTo.split(';').map((email: string) => email.trim());
        if (reportsToEmails.length > 1) {
          this.errors.push({ message: 'User reports to multiple users.', email, role, reportingTo: reportsTo, fullName });
        }
        reportsToMap[email] = reportsToEmails[0];
      }
    }
  
    for (const email in reportsToMap) {
      const role = this.getRoleByEmail(email);
      const reportsTo = reportsToMap[email];
      const reportsToRole = this.getRoleByEmail(reportsTo);
      const fullName = this.getFullNameByEmail(email); // Assuming you have a method to get full name by email
  
      if (role === 'Admin' && reportsToRole !== 'Root') {
        this.errors.push({ message: 'Admin must report to Root.', email, role, reportingTo: reportsTo, fullName });
      }
  
      if (role === 'Manager' && !['Admin', 'Manager'].includes(reportsToRole)) {
        this.errors.push({ message: 'Manager must report to Admin or another Manager.', email, role, reportingTo: reportsTo, fullName });
      }
  
      if (role === 'Caller' && reportsToRole !== 'Manager') {
        this.errors.push({ message: 'Caller must report to a Manager.', email, role, reportingTo: reportsTo, fullName });
      }
    }

    this.calculatedData.emit({errors : this.errors , records: this.records , headers:this.headers})

  }
  
  getFullNameByEmail(email: string): string {
    const record = this.records.find(record => record[this.headers.indexOf('Email')] === email);
    return record ? record[this.headers.indexOf('FullName')] : '';
  }

  getRoleByEmail(email: string): string {
    for (const record of this.records) {
      if (record[this.headers.indexOf('Email')] === email) {
        return record[this.headers.indexOf('Role')];
      }
    }
    return '';
  }

  cancelUpload(): void {
    if (this.fileReader) {
      this.fileReader.abort();
      this.fileReader = null;
      this.progress = -1;
      this.records = [];
      this.headers = [];
      this.fileName = '';
      this.totalSize = '';
      this.uploadedSize = '';
      this.calculatedData.emit({errors: [] , records: [] , headers:[]})
    }
  }
}
