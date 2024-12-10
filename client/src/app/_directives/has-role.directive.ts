import {
    Directive,
    inject,
    Input,
    OnInit,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { AccountService } from '../_services/account.service';

@Directive({
    selector: '[appHasRole]',
    standalone: true,
})
export class HasRoleDirective implements OnInit {
    @Input() appHasRole: string[] = [];

    private accountService = inject(AccountService);
    private viewContainerRef = inject(ViewContainerRef);
    private templateRef = inject(TemplateRef);

    ngOnInit(): void {
        if (this.connectedUserHasRoles(this.appHasRole)) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainerRef.clear();
        }
    }

    private connectedUserHasRoles(roles: string[]) {
        return this.accountService.roles().some(r => roles.includes(r));
    }
}
