import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { FuzzyComponent } from './components/fuzzy.component';
import { ViewComponent } from './components/view/view.component';
import { ChartModule } from 'angular-highcharts';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    FuzzyComponent,
    ViewComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    ChartModule,
    AppRoutingModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatSidenavModule,
    MatDividerModule,
    MatTooltipModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatProgressBarModule
  ],
  providers: [],
  bootstrap: [FuzzyComponent]
})
export class AppModule { }
