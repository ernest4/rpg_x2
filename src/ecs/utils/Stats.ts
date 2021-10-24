import { benchmark as benchmarkRunner } from "./benchmark";

export class Stats {
  private parentDiv: HTMLDivElement;
  private _data: { [datum: string]: { value: string | number; element: any } } = {};

  constructor(fps: number = 1) {
    this.domInit();
  }

  benchmark = (subject: string, callback: Function) => {
    if (!this._data[subject]) this.datumInit(subject);
    this._data[subject].value = benchmarkRunner(callback);
  };

  update = () => {
    Object.entries(this._data).forEach(([subject, { value, element }]) => {
      element.innerHTML = `${subject}: ${value}ms`;
    });
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

  private datumInit = (subject: string) => {
    this._data[subject] = {
      value: null,
      element: this.datumDivInit(subject),
    };
  };

  private datumDivInit = (subject: string) => {
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
}

export default Stats;
