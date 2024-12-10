import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = (route, state) => {
    const accountService = inject(AccountService);
    const toastr = inject(ToastrService);

    if (hasRightRoles(accountService.roles())) {
        return true;
    }

    toastr.error('You cannot enter this area');
    return false;
};

const hasRightRoles = (roles: Array<string>) => {
    return roles.includes('Admin') || roles.includes('Moderator');
};
