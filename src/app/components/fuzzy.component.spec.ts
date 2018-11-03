import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FuzzyComponent } from './fuzzy.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        FuzzyComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(FuzzyComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  // it(`should have as title 'Fuzzy'`, () => {
  //   const fixture = TestBed.createComponent(FuzzyComponent);
  //   const app = fixture.debugElement.componentInstance;
  //   expect(app.title).toEqual('Fuzzy');
  // });

  // it('should render title in a h1 tag', () => {
  //   const fixture = TestBed.createComponent(FuzzyComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('Welcome to Fuzzy!');
  // });
});
