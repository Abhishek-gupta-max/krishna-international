import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'encodeUri', standalone: true })
export class EncodeUriPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return encodeURIComponent(value ?? '');
  }
}
