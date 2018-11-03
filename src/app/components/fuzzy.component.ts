import { Component } from '@angular/core';
import { IElement } from '../model/IElement';
import { generateTestElements, centersElaboration, calculateEuclideanDistance, getInitialCenters, initiateBelongingDegrees, defaultElements, defaultCenters, rationingBelongingDegrees, getObjective, performStep } from './fuzzy.helper';
import { ICenter } from '../model/ICenter';
import { compose } from 'ramda';
import { AreaRadial } from 'd3';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { share } from 'rxjs/operators';

// const DIMENSIONS_AMOUNT: number = 2;
// const ELEMENTS_AMOUNT: number = 50;
// const CLUSTERS_AMOUNT: number = 10;
// const EXPONENT: number = 2;
// const BASE: number = 20;
// const MAX_ITERATIONS: number = 50;
// const EPSILON: number = 0.01;

@Component({
  selector: 'app-root',
  templateUrl: './fuzzy.component.html',
  styleUrls: ['./fuzzy.component.scss']
})
export class FuzzyComponent {
  public elementsAndCenters: [Array<IElement>, Array<ICenter>];

  public dimensionsAmount: number = 2;
  public elementsAmount: number = 50;
  public clustersAmount: number = 10;
  public exponent: number = 2;
  public BASE: number = 20;
  public maxIterationsNumber: number = 50;
  public epsilon: number = 0.01;

  public isProcessing: boolean = false;
  public displayedColumns: Array<string> = ['step', 'stepDifference', 'time'];
  public dataSource: Observable<Array<ILog>> = new Observable();

  private elements: Array<IElement> = [];
  private centers: Array<ICenter> = [];
  private counter: number = 0;
  private isPaused: boolean = false;

  public logs: Array<ILog> = [];

  constructor() {
    this.generateNewPoints();
    this.dataSource = of([]).pipe(share());
    // let stepDifference: number;
    // let counter: number = 0;
    // do {
    //   counter++;
    //   const objective: number = getObjective(elements, EXPONENT);
    //   centers = centersElaboration(elements, EXPONENT);
    //   elements = performStep(elements, centers, EXPONENT);
    //   stepDifference = objective - getObjective(elements, EXPONENT);
    // } while (stepDifference > EPSILON || counter > MAX_ITERATIONS)
    // this.updateElementsAndCenters(elements, centers);
    // console.log(this.elements, this.centers);

  }

  public pause(): void {
    this.isPaused = true;
  }

  private generateNewPoints(): void {
    this.counter = 0;
    this.logs = [];
    let elements: Array<IElement> = generateTestElements(this.dimensionsAmount, this.elementsAmount, this.clustersAmount, this.BASE);
    let centers: Array<ICenter> = getInitialCenters(this.dimensionsAmount, this.clustersAmount, this.BASE);
    elements = compose(rationingBelongingDegrees, initiateBelongingDegrees)(elements, centers);
    this.updateElementsAndCenters(elements, centers);
    this.updateDataSource();
  }

  private autoCalculate(): void {
    let elements: Array<IElement> = this.elements;
    let centers: Array<ICenter> = this.centers;
    let stepDifference: number;
    this.isProcessing = true;
    do {
      const start: Date = new Date();
      this.counter++;
      const objective: number = getObjective(elements, this.exponent);
      centers = centersElaboration(elements, this.exponent);
      elements = performStep(elements, centers, this.exponent);
      stepDifference = objective - getObjective(elements, this.exponent);
      this.logs.unshift({
        step: this.counter,
        stepDifference: stepDifference.toFixed(10),
        time: new Date().getTime() - start.getTime()
      });
      this.updateDataSource();

    } while (stepDifference > this.epsilon && this.counter < this.maxIterationsNumber && !this.isPaused)
    this.isProcessing = false;
    this.isPaused = false;
    this.updateElementsAndCenters(elements, centers);
  }

  private autoCalculateWithDelay(): void {
    this.isProcessing = true;    
    const start: Date = new Date();
    const reachedDifference: number = this.oneCalculationStep();
    const timeSpend: number = new Date().getTime() - start.getTime();
    if ((reachedDifference > this.epsilon && this.counter < this.maxIterationsNumber) && !this.isPaused) {
      setTimeout(() => this.autoCalculateWithDelay(), 500);
    } else {
      this.isProcessing = false;
      this.isPaused = false;
    }
  }

  private oneCalculationStep(): number {
    this.isProcessing = true;    
    const start: Date = new Date();
    let elements: Array<IElement> = this.elements;
    let centers: Array<ICenter> = this.centers;
    let stepDifference: number;
    this.counter++;
    const objective: number = getObjective(elements, this.exponent);
    centers = centersElaboration(elements, this.exponent);
    elements = performStep(elements, centers, this.exponent);
    stepDifference = objective - getObjective(elements, this.exponent);
    this.logs.unshift({
      step: this.counter,
      stepDifference: stepDifference.toFixed(10),
      time: new Date().getTime() - start.getTime()
    });
    this.updateElementsAndCenters(elements, centers);
    this.updateDataSource();
    this.isProcessing = false;    
    return stepDifference;
  }

  private updateElementsAndCenters(elements: Array<IElement>, centers: Array<ICenter>): void {
    this.elements = elements;
    this.centers = centers;
    this.elementsAndCenters = [elements, centers];
  }

  private updateDataSource(): void {
    this.dataSource = of(this.logs).pipe(share());
  }
}

interface ILog {
  step: number,
  stepDifference: string,
  time: number
}