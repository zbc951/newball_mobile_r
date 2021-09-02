import { TestBed, inject } from '@angular/core/testing';

import { SpecialPlayService } from './special-play.service';

describe('SpecialPlayService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpecialPlayService]
    });
  });

  it('should be created', inject([SpecialPlayService], (service: SpecialPlayService) => {
    expect(service).toBeTruthy();
  }));
});
