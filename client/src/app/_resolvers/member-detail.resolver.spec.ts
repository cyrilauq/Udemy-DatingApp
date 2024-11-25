import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { memberDetailResolver } from './member-detail.resolver';

describe('memberDetailResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => memberDetailResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
