import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ValorantService } from './valorant';

describe('ValorantService', () => {
  let service: ValorantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(ValorantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
