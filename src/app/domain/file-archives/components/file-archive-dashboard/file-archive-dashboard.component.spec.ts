import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileArchiveDashboardComponent } from './file-archive-dashboard.component';

describe('FileArchiveDashboardComponent', () => {
  let component: FileArchiveDashboardComponent;
  let fixture: ComponentFixture<FileArchiveDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileArchiveDashboardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FileArchiveDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
