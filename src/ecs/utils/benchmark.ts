export const benchmark = (callback: Function): number => {
  const t0 = performance.now();
  callback();
  const t1 = performance.now();
  return t1 - t0;
};

export const benchmarkSubject = (subject: string, callback: Function): string => {
  const time = benchmark(callback);
  return `${subject} took ${time} milliseconds.`;
};
