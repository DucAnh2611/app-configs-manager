export type TDynamicJob = {
  name: string;
  expression: string;
  handler: () => Promise<void>;
  workerHandler: (job: any) => Promise<void>;
  concurrency?: number;
};
