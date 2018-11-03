import { Component, OnInit, Input, ViewChild, ElementRef, AfterContentChecked } from '@angular/core';
import { IElement } from '../../model/IElement';
import { ICenter } from '../../model/ICenter';
import { Chart } from 'angular-highcharts';
import { map, prop, head, last, reduce, max } from 'ramda';
import * as d3 from 'd3';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  host: {class: 'view'}
})
export class ViewComponent implements AfterContentChecked {

  @ViewChild('svg') svg: ElementRef;
  @Input()
  public isProcessing: boolean = false; 
  @Input()
  public set elementsAndCenters([elements, centers]: [Array<IElement>, Array<ICenter>]) {
    this.elements = elements;
    this.centers = centers;
    fillSVG(this.svg, elements, centers);
  }

  public chart: Chart;
  private elements: Array<IElement>;
  private centers: Array<ICenter>;
  constructor() {
  }
  ngAfterContentChecked(): void {
    fillSVG(this.svg, this.elements, this.centers);
  }
}

function fillSVG(svg: ElementRef, elements: Array<IElement>, centers: Array<ICenter>): void {
  if (svg) {
    const selectedSVG = d3.select(svg.nativeElement);
    selectedSVG.selectAll("*").remove();
    elements.map((element: IElement) => {
      const clusterIndex: number = element.belongingDegrees.indexOf(reduce(max, Number.MIN_SAFE_INTEGER, element.belongingDegrees));
      selectedSVG
        .append('circle')
        .attr('cx', (head(element.coordinates) * 20) + 10)
        .attr('cy', (last(element.coordinates) * 20) + 10)
        .attr('r', 5)
        .attr('fill', colorPallet[clusterIndex])
    })
    centers.map((element: IElement, index: number) => {
      selectedSVG
        .append('circle')
        .attr('cx', head(element.coordinates) * 20 + 10)
        .attr('cy', last(element.coordinates) * 20 + 10)
        .attr('r', 7)
        .attr('fill', colorPallet[index])
        .attr('stroke', 'black')
        .attr('stroke-width', '3')
    })


  }
}

const colorPallet: Array<string> = [
  "#ff0000",
  "#00ff00",
  "#0040ff",
  "#ffff00",
  "#ff4000",
  "#ff8000",
  "#ffbf00",
  "#bfff00",
  "#80ff00",
  "#40ff00",
  "#00ff40",
  "#00ff80",
  "#00ffbf",
  "#00ffff",
  "#00bfff",
  "#0080ff",
  "#0000ff",
  "#4000ff",
  "#8000ff",
  "#bf00ff",
  "#ff00ff",
  "#ff00bf",
  "#ff0080",
  "#ff0040",
]