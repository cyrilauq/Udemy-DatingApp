import { ResolveFn } from '@angular/router';
import { Member } from '../_models/member';
import { inject } from '@angular/core';
import { MembersService } from '../_services/members.service';

export const memberDetailResolver: ResolveFn<Member | null> = (route, state) => {
    const memberService = inject(MembersService);

    const username = route.paramMap.get('username');

    console.log(username);
    

    if(!username) return null;

    return memberService.getMember(username);
};
