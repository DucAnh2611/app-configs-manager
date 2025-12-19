export type TDynamicJob = {
  name: string;
  expression?: string;
  register?: () => Promise<void>;
  workerHandler: (job: any) => Promise<void>;
  concurrency?: number;
};
