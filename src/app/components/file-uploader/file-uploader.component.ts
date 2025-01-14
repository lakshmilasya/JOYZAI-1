import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { IUser, IValidationError } from 'src/app/interfaces/userRecord';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent{
  
 @ViewChild('fileInput') fileInput!: ElementRef;
 headers: string[] = [];
 records: string[][] = [];
 users: IUser[] = [];
 errors: any[] = [];

  errorMessage: string | null = null;
  progress: number = -1;
  fileReader: FileReader | null = null;
  fileName: string = '';
  totalSize: string = '';
  uploadedSize: string = '';
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

    // Parse headers
    this.headers = lines[0].split(',').map(header => header.trim());

    // Parse records into user objects
    this.users = lines.slice(1).map(line => {
      const [email,name, role,reportsTo] = line.split(',').map(field => field.trim());
      return {
        fullName : name,
        role: role as 'Root' | 'Admin' | 'Manager' | 'Caller',
        email,
        reportsTo
      };
    });
   console.log(this.users)
    this.validateHierarchy();
  }

  validateHierarchy(): void {
    this.errors = [];
  
    const userMap = new Map(this.users.map(user => [user.email, user]));
    const visited = new Set<string>();
  
    const hasCycle = (email: string, stack: Set<string>): boolean => {
      if (stack.has(email)) {
        return true;
      }
      if (visited.has(email)) {
        return false;
      }
  
      visited.add(email);
      stack.add(email);
  
      const parentEmails = userMap.get(email)?.reportsTo?.split(';') ?? [];
      for (const parentEmail of parentEmails) {
        if (userMap.has(parentEmail) && hasCycle(parentEmail, stack)) {
          return true;
        }
      }
  
      stack.delete(email);
      return false;
    };
  
    this.users.forEach(user => {
      const parents = user.reportsTo?.split(';').filter(parent => parent) || [];
  
      // Cycle detection
      if (hasCycle(user.email, new Set())) {
        this.errors.push({
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          reportsTo: user.reportsTo,
          message: `${user.fullName} is involved in a cycle.`,
        });
        return;
      }
  
      // One-to-One Reporting
      if (parents.length > 1) {
        this.errors.push({
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          reportsTo: user.reportsTo,
          message: `${user.fullName} is reporting to multiple parents (${parents.join(', ')}).`,
        });
      }
  
      // Validate parent relationships
      for (const parentEmail of parents) {
        const parent = userMap.get(parentEmail);
        if (!parent) {
          this.errors.push({
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            reportsTo: user.reportsTo,
            message: `${user.fullName} (${user.role}) is reporting to a non-existent user (${parentEmail}).`,
          });
          continue;
        }
  
        switch (user.role) {
          case 'Root':
            this.errors.push({
              fullName: user.fullName,
              email: user.email,
              role: user.role,
              reportsTo: user.reportsTo,
              message: `${user.fullName} (Root) should not report to anyone.`,
            });
            break;
  
          case 'Admin':
            if (parent.role !== 'Root') {
              this.errors.push({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                reportsTo: user.reportsTo,
                message: `${user.fullName} (Admin) must report to a Root, not ${parent.fullName} (${parent.role}).`,
              });
            }
            break;
  
          case 'Manager':
            if (parent.role !== 'Admin' && parent.role !== 'Manager') {
              this.errors.push({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                reportsTo: user.reportsTo,
                message: `${user.fullName} (Manager) must report to an Admin or another Manager, not ${parent.fullName} (${parent.role}).`,
              });
            }
            break;
  
          case 'Caller':
            if (parent.role !== 'Manager') {
              this.errors.push({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                reportsTo: user.reportsTo,
                message: `${user.fullName} (Caller) must report to a Manager, not ${parent.fullName} (${parent.role}).`,
              });
            }
            break;
  
          default:
            this.errors.push({
              fullName: user.fullName,
              email: user.email,
              role: user.role,
              reportsTo: user.reportsTo,
              message: `${user.fullName} has an invalid role (${user.role}).`,
            });
        }
      }
    });
  
    console.log(this.errors);
    this.calculatedData.emit({ errors: this.errors });
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
