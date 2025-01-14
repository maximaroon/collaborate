import { TestBed } from '@angular/core/testing';

import { FormLockService } from './form-lock.service';

describe('FormLockService', () => {
  let service: FormLockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormLockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
