import { Component, inject, OnInit, output } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { JsonPipe, NgIf } from '@angular/common';
import { TextInputComponent } from '../_forms/text-input/text-input.component';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, TextInputComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
    private accountService = inject(AccountService);
    private toastrService = inject(ToastrService);
    private formBuilderService = inject(FormBuilder);
    cancelRegister = output<boolean>();
    registerForm: FormGroup = new FormGroup({});

    model: any = {};

    ngOnInit(): void {
        this.initializeForm();
    }

    initializeForm() {
        this.registerForm = this.formBuilderService.group({
            username: ['', Validators.required],
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
        this.registerForm.controls['password'].valueChanges.subscribe({
            next: () =>
                this.registerForm.controls[
                    'confirmPassword'
                ].updateValueAndValidity(),
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
