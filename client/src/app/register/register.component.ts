import { Component, inject, OnInit, output } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { DatePickerComponent } from '../_forms/date-picker/date-picker.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, TextInputComponent, DatePickerComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
    private accountService = inject(AccountService);
    private formBuilderService = inject(FormBuilder);
    private router = inject(Router);

    cancelRegister = output<boolean>();
    registerForm: FormGroup = new FormGroup({});
    maxDate = new Date();
    validationErrors: string[] | undefined;

    ngOnInit(): void {
        this.initializeForm();
        this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
    }

    initializeForm() {
        this.registerForm = this.computeFormGroup();
        this.registerForm.controls['password'].valueChanges.subscribe({
            next: () =>
                this.registerForm.controls[
                    'confirmPassword'
                ].updateValueAndValidity(),
        });
    }

    private computeFormGroup(): FormGroup<any> {
        return this.formBuilderService.group({
            gender: ['male'],
            username: ['', Validators.required],
            knownAs: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
            city: ['', Validators.required],
            country: ['', Validators.required],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(24),
                ],
            ],
            confirmPassword: [
                '',
                [Validators.required, this.matchValues('password')],
            ],
        });
    }

    matchValues(matchTo: string): ValidatorFn {
        return (control: AbstractControl) => {
            return control.value === control.parent?.get(matchTo)?.value
                ? null
                : { isMatching: true };
        };
    }

    register() {
        const dob = this.getDateOnly(
            this.registerForm.get('dateOfBirth')?.value,
        );
        this.registerForm.value.dateOfBirth = dob;
        this.accountService.register(this.registerForm.value).subscribe({
            next: _ => this.router.navigateByUrl('/members'),
            error: error => (this.validationErrors = error),
        });
    }

    cancel() {
        this.cancelRegister.emit(false);
    }

    private getDateOnly(dob: string | undefined): string {
        return dob ? new Date(dob).toISOString().slice(0, 10) : '';
    }
}
