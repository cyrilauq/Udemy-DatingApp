import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-test-errors',
  standalone: true,
  imports: [],
  templateUrl: './test-errors.component.html',
  styleUrl: './test-errors.component.css'
})
export class TestErrorsComponent {
  private httpClient = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  validationErrors: string[] = [];

  get400Error() {
    this.httpClient.get(`${this.baseUrl}buggy/bad-request`)
      .subscribe({
        next: response => console.log(response),
        error: error => console.error(error)
      });
  }

  get401Error() {
    this.httpClient.get(`${this.baseUrl}buggy/auth`)
      .subscribe({
        next: response => console.log(response),
        error: error => console.error(error)
      });
  }

  get404Error() {
    this.httpClient.get(`${this.baseUrl}buggy/not-found`)
      .subscribe({
        next: response => console.log(response),
        error: error => console.error(error)
      });
  }

  get500Error() {
    this.httpClient.get(`${this.baseUrl}buggy/server-error`)
      .subscribe({
        next: response => console.log(response),
        error: error => console.error(error)
      });
  }

  get400ValidationError() {
    this.httpClient.post(`${this.baseUrl}account/register`, {})
      .subscribe({
        next: response => console.log(response),
        error: error => {
          console.error(error);
          this.validationErrors = error;
        }
      });
  }
}
