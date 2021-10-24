import { DeltaTime } from "../types";
import { benchmark as benchmarkRunner } from "./benchmark";
import Buffer from "./Buffer";
import { round } from "./Number";

// TODO: jests

// TODO:
// At the bottom widget list the frame budget in ms and %
// Frame budget is calculated from engine FPS
// (For each system that has different frame rate, show their own budget)
export class Stats {
  private parentDiv: HTMLDivElement;
  private _data: { [datum: string]: { values: Buffer<number>; element: HTMLDivElement } } = {};
  private _statsTickLengthMS: number;
  private _currentTicketLengthMS: number = 0;

  constructor(fps: number = 2) {
    this._statsTickLengthMS = 1000 / fps;
    this.domInit();
  }

  benchmark = (subject: string, callback: Function) => {
    if (!this._data[subject]) this.dataSubjectInit(subject);
    this._data[subject].values.push(benchmarkRunner(callback));
  };

  update = (deltaTime: DeltaTime) => {
    this._currentTicketLengthMS += deltaTime;

    if (this._statsTickLengthMS <= this._currentTicketLengthMS) {
      this._currentTicketLengthMS = 0;
      this.renderData();
    }
  };

  private domInit = () => {
    this.parentDiv = document.createElement("div");
    this.parentDiv.style.cssText = `
      top: 20px;
      background: white;
      position: fixed;
    `;
    document.body.appendChild(this.parentDiv);
  };

  private dataSubjectInit = (subject: string) => {
    this._data[subject] = {
      values: new Buffer<number>(),
      element: this.dataSubjectDivInit(subject),
    };
  };

  private dataSubjectDivInit = (subject: string) => {
    const datumDiv = document.createElement("div");
    datumDiv.innerHTML = `${subject}: 0ms`;
    // datumDiv.style.cssText = `
    //   top: 20px;
    //   background: white;
    //   position: fixed;
    // `;
    this.parentDiv.appendChild(datumDiv);

    return datumDiv;
  };

  private renderData = () => Object.entries(this._data).forEach(this.renderDataSubject);

  private renderDataSubject = ([subject, { values, element }]) => {
    let sum = 0;
    const valueCount = values.size();
    values.process(value => (sum += value));
    const average = sum / valueCount;
    element.innerHTML = `${subject}: ${round(average, 4)}ms`;
  };
}

export default Stats;
