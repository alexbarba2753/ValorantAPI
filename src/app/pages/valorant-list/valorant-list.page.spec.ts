import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValorantListPage } from './valorant-list.page';

describe('ValorantListPage', () => {
  let component: ValorantListPage;
  let fixture: ComponentFixture<ValorantListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ValorantListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
