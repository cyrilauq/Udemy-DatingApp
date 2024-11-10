import { LowerCasePipe, NgIf } from '@angular/common';
import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
    selector: 'app-date-picker',
    standalone: true,
    imports: [BsDatepickerModule, ReactiveFormsModule, LowerCasePipe, NgIf],
    templateUrl: './date-picker.component.html',
    styleUrl: './date-picker.component.css',
})
export class DatePickerComponent implements ControlValueAccessor {
    label = input<string>('');
    maxDate = input<Date>();
    bsConfig?: Partial<BsDatepickerConfig>; // Using partial make every properties of the object facultative, so we we'll use a type of "BsDatepickerConfig" without having all the properties required

    get control(): FormControl {
        return this.ngControl.control as FormControl;
    }

    constructor(@Self() public ngControl: NgControl) {
        this.ngControl.valueAccessor = this;
        this.bsConfig = {
            containerClass: 'theme-red',
            dateInputFormat: 'DD MMMM YYYY'
        }
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
}
