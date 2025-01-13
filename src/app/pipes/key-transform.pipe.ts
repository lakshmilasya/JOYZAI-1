import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyTransform'
})
export class KeyTransformPipe implements PipeTransform {

  transform(value: string): string {
    // Capitalize the first letter and replace camelCase with spaces
    const defaultTransform = value.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return defaultTransform;
  }
}
