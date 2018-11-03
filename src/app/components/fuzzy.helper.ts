import { IElement } from "../model/IElement";
import { ICenter } from "../model/ICenter";
import { map, converge, xprod, prop, compose, splitEvery, head, reduce, sum, zip, unnest, divide, __, useWith, curry, identity, zipWith, assoc, flatten, min, max, merge } from 'ramda';

const propCoordinates: Function = prop('coordinates');
const propBelongingDegrees: Function = prop('belongingDegrees');
const propDistances: Function = prop('distances');


export function centersElaboration(elements: Array<IElement>, exponent: number): Array<ICenter> {
  const valuesAmount: number = head(elements).coordinates.length;
  const poweredBelongingsElements: Array<IElement> = map(toPowedBelongings(exponent), elements);
  const toPairedBelongingsAndCoordinates: Function = converge(xprod, [propBelongingDegrees, propCoordinates]);
  const toCompositionOfBelongingsAndCoordinate: Function = map(toComposition);
  const mapToCompositionOfBelongingsAndCoordinate: Function = map(compose(toCompositionOfBelongingsAndCoordinate, toPairedBelongingsAndCoordinates));
  const toSumOfTheCompositions: Function = reduce(zipAndSum, []);
  const splitOnClustersTuples: Function = splitEvery(valuesAmount);
  // Vi - numerators
  const sumsOfTheAppropriateCompositions: Array<Array<number>> = compose(splitOnClustersTuples, toSumOfTheCompositions, mapToCompositionOfBelongingsAndCoordinate)(poweredBelongingsElements);
  // Vi - denominators
  const sumOfTheBelongingDegrees: Array<number> = compose(toSumOfTheCompositions, map(propBelongingDegrees))(poweredBelongingsElements);
  const centers: Array<ICenter> = zipWith(divideEach, sumsOfTheAppropriateCompositions, sumOfTheBelongingDegrees);
  return map(toCenters, centers);
}
// memoize
export const calculateEuclideanDistance: Function = curry(compose(pow(1 / 2), sum, map(compose(pow(2), difference)), useWith(zip, [propCoordinates, propCoordinates])));

export function getInitialCenters(dimensionsAmount: number, clustersAmount: number, base: number = 1): Array<ICenter> {
  return createArrayFilledWith(clustersAmount).map(() => ({
    coordinates: createArrayFilledWith(dimensionsAmount, base).map(toFixedRandomNumber(2))
  }))
}
// memoize
export function getObjective(elements: Array<IElement>, exponent: number): number {
  const res: Array<number> = map(converge(zipWith(calculateObjective(exponent)), [propBelongingDegrees, propDistances]))(elements);
  return sum(map(sum, res));
}

export function performStep(elements: Array<IElement>, centers: Array<ICenter>, exponent: number): Array<IElement> {
  const dist: Array<{}> = map(toDistancesFor(centers))(elements);
  const clustersCount: number = centers.length;
  const prodDist: Array<{}> = map(converge(xprod, [identity, identity]))(dist);
  const belongingDegrees: Array<{}> = map(compose(map(divide(1)), map(pow(2 / (exponent - 1))), map(sum), splitEvery(clustersCount), map(toDivision)))(prodDist);
  const distanceDegreeTuple: Array<{}> = useWith(zipWith(toDistancesAndDegreesTuple), [identity, identity])(dist, belongingDegrees);
  const result: Array<IElement> = useWith(zipWith(merge), [identity, identity])(elements, distanceDegreeTuple);
  return rationingBelongingDegrees(result);
}

function calculateObjective(exponent: number): (belongingDegree: number, distance: number) => number {
  return (belongingDegree: number, distance: number) => {
    return belongingDegree === 0 || distance === 0 ? 0 : Math.pow(belongingDegree, exponent) * Math.pow(distance, 2);
  }
}
export function initiateBelongingDegrees(elements: Array<IElement>, centers: Array<ICenter>): Array<IElement> {
  return converge(zipWith(associateDistancesAndDegreesFromOneSource), [map(toDistancesFor(centers)), identity])(elements);
}

const toMinMaxBelongingDegrees: Function = converge(minMaxDistance, [reduce(max, Number.MIN_SAFE_INTEGER), reduce(min, Number.MAX_SAFE_INTEGER), identity]);
const toNormalizedBelongingDegrees: Function = converge(normalizeDistance, [sum, identity]);

export function rationingBelongingDegrees(elements: Array<IElement>): Array<IElement> {
  return converge(zipWith(assoc('belongingDegrees')), [map(compose(toNormalizedBelongingDegrees, propBelongingDegrees)), identity])(elements);
  // return converge(zipWith(assoc('belongingDegrees')), [map(compose(toNormalizedBelongingDegrees, toMinMaxBelongingDegrees, propBelongingDegrees)), identity])(elements);
}

function minMaxDistance(maxDist: number, minDist: number, distances: Array<number>): number {
  return map((distance: number) => (distance - minDist) / (maxDist - minDist), distances);
}

function normalizeDistance(sum: number, distances: Array<number>): number {
  return map((distance: number) => distance  / sum, distances);
}

function associateDistancesAndDegreesFromOneSource(distances: Array<number>, element: IElement): IElement {
  return {
    ...element,
    distances,
    belongingDegrees: distances
  };
}

function toDistancesAndDegreesTuple(distances: Array<number>, belongingDegrees: Array<number>): {} {
  return {
    distances,
    belongingDegrees
  };
}

function toCenters(coordinates: Array<number>): ICenter {
  return {
    coordinates
  };
}

function toDistancesFor(centers: Array<ICenter>): (element: IElement) => Array<number> {
  return (element: IElement) => {
    return map(calculateEuclideanDistance(element), centers);
  }
}

function difference([a, b]: [number, number]): number {
  return a - b;
}

function divideEach(sumsOfTheAppropriateCompositions: Array<number>, sumOfTheBelongingDegrees: number): Array<number> {
  const divideOnBelongingsSum: Function = divide(__, sumOfTheBelongingDegrees);
  return map(divideOnBelongingsSum, sumsOfTheAppropriateCompositions);
}

function zipAndSum(accum: Array<{}>, arrayToZip: Array<{}>): Array<{}> {
  if (accum.length === 0) {
    return arrayToZip;
  }
  // const res: Array<{}> = compose(map(sum), zip(accum))(arrayToZip);
  return compose(map(sum), zip(accum))(arrayToZip);
}

function toDivision([a, b]: [number, number]): number {
  return a / b;
}
function toComposition([a, b]: [number, number]): number {
  return a * b;
}

function toPowedBelongings(exponent: number): (element: IElement) => IElement {
  return (element: IElement) => ({
    ...element,
    //TODO - memoize => Math.pow()
    belongingDegrees: map(pow(exponent), element.belongingDegrees)
  });
}
function pow(exponent: number): (base: number) => number {
  return (base: number) => Math.pow(base, exponent);
}

function createArrayFilledWith(elementsAmount: number, filler: number = 1): Array<number> {
  return new Array(elementsAmount).fill(filler, 0, elementsAmount);
}

function toFixedRandomNumber(fixed: number): (base: number) => number {
  return (base: number = 1) => parseFloat((Math.random() * base).toFixed(fixed));
}

interface ICoordinatesContainer {
  coordinates: Array<number>
}

// Random generation

export function generateTestElements(dimensionsAmount: number, elementsAmount: number, clustersAmount: number, base: number = 1): Array<IElement> {
  return createArrayFilledWith(elementsAmount).map(() => ({
    coordinates: createArrayFilledWith(dimensionsAmount, base).map(toFixedRandomNumber(2)),
    // belongingDegrees: createArrayFilledWith(clustersAmount, 0).fill(1, 0, 1),
    belongingDegrees: createArrayFilledWith(clustersAmount, 0.01).fill(1 - 0.01 * elementsAmount, 0, 1),
    distances: []
  }))
}

export const defaultElements: Array<IElement> = JSON.parse('[{"coordinates":[0.3,3.98,0.76],"belongingDegrees":[0.9,0.01],"distances":[]},{"coordinates":[6.17,0.74,9.12],"belongingDegrees":[0.9,0.01],"distances":[]},{"coordinates":[0.02,6.61,9.37],"belongingDegrees":[0.9,0.01],"distances":[]},{"coordinates":[6.91,3.37,0.36],"belongingDegrees":[0.9,0.01],"distances":[]},{"coordinates":[2.32,2.47,2.2],"belongingDegrees":[0.9,0.01],"distances":[]},{"coordinates":[5.24,2.71,3.69],"belongingDegrees":[0.9,0.01],"distances":[]},{"coordinates":[6.89,3.41,4.11],"belongingDegrees":[0.9,0.01],"distances":[]},{"coordinates":[0.77,5.36,0.74],"belongingDegrees":[0.9,0.01],"distances":[]},{"coordinates":[4.23,0.83,9.2],"belongingDegrees":[0.9,0.01],"distances":[]},{"coordinates":[2.81,2.5,1.48],"belongingDegrees":[0.9,0.01],"distances":[]}]');
export const defaultCenters: Array<IElement> = JSON.parse('[{"coordinates":[2.67,2.28,1.97]},{"coordinates":[0.82,0.35,4.92]}]');