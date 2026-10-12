import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesDashboardComponent } from './files-dashboard.component';

describe('FilesDashboardComponent', () => {
  let component: FilesDashboardComponent;
  let fixture: ComponentFixture<FilesDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesDashboardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FilesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
