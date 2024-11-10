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

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, TextInputComponent, DatePickerComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
    private accountService = inject(AccountService);
    private toastrService = inject(ToastrService);
    private formBuilderService = inject(FormBuilder);
    cancelRegister = output<boolean>();
    registerForm: FormGroup = new FormGroup({});
    maxDate = new Date();

    model: any = {};

    ngOnInit(): void {
        this.initializeForm();
        this.maxDate.setFullYear(this.maxDate.getFullYear() - 18)
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
        console.log(this.registerForm.value);
        // this.accountService.register(this.model).subscribe({
        //     next: response => {
        //         console.log(response);
        //         this.cancel();
        //     },
        //     error: ({ error }) => this.toastrService.error(error),
        // });
    }

    cancel() {
        this.cancelRegister.emit(false);
    }
}
