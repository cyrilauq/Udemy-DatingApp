import { Component, inject, OnInit, output } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, JsonPipe],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
    private accountService = inject(AccountService);
    private toastrService = inject(ToastrService);
    cancelRegister = output<boolean>();
    registerForm: FormGroup = new FormGroup({});

    model: any = {};

    ngOnInit(): void {
        this.initializeForm();
    }

    initializeForm() {
        this.registerForm = new FormGroup({
            username: new FormControl('', Validators.required),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(24),
            ]),
            confirmPassword: new FormControl('', [Validators.required, this.matchValues('password')]),
        });
        this.registerForm.controls['password'].valueChanges.subscribe({
            next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
        })
    }

    matchValues(matchTo: string): ValidatorFn {
        return (control: AbstractControl) => {
            return control.value === control.parent?.get(matchTo)?.value ? null : { isMatching: true }
        }
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
