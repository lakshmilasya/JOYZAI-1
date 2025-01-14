export interface IUser {
    fullName: string;
    role: 'Root' | 'Admin' | 'Manager' | 'Caller';
    email: string;
    reportsTo : string;
  }
  
export  interface IValidationError {
    userName: string;
    email : string;
    errorMessage: string;
    role: string;
    reportingTo : string
  }