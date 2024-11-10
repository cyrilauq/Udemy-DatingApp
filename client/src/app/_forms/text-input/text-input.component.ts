import { LowerCasePipe, NgIf, TitleCasePipe } from '@angular/common';
import { Component, input, Self } from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    NgControl,
    ReactiveFormsModule,
} from '@angular/forms';

@Component({
    selector: 'app-text-input',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, LowerCasePipe],
    templateUrl: './text-input.component.html',
    styleUrl: './text-input.component.css',
})
export class TextInputComponent implements ControlValueAccessor {
    label = input<string>('');
    type = input<string>('text');

    // The self annotation tells angular DI that the component will need its own instance of the service.
    constructor(@Self() public ngControl: NgControl) {
        this.ngControl.valueAccessor = this;
    }

    inputHasErrors() {
        return this.control.touched && this.control.invalid;
    }

    inputHasSpecificError(errorName: string) {
        return this.control.hasError(errorName);
    }

    writeValue(obj: any): void {}

    registerOnChange(fn: any): void {}

    registerOnTouched(fn: any): void {}

    get control() {
        return this.ngControl.control as FormControl
    }
}
