import { Job, JobsOptions, Queue, Worker } from 'bullmq';
import { createIORedis } from '../libs';

export class QueueService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(private readonly connection: ReturnType<typeof createIORedis>) {}

  public getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(name, new Queue(name, { connection: this.connection }));
    }

    return this.queues.get(name)!;
  }

  public addQueue<T>(queueName: string, data: T, opts: Partial<JobsOptions> = {}) {
    const queue = this.getQueue(queueName);

    return queue.add(queueName, data, {
      removeOnComplete: true,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      ...opts,
    });
  }

  public createWorker<T>(
    queueName: string,
    handler: (job: Job<T>) => Promise<void>,
    concurrency = 5
  ) {
    if (this.workers.get(queueName)) return this.workers.get(queueName);

    const worker = new Worker<T>(queueName, handler, {
      connection: this.connection,
      concurrency,
    });

    const onCompleted = (job: Job) =>
      console.log(`[${new Date().toISOString()}] - ${queueName}: Completed`);

    const onFailed = (job: Job | undefined, err: Error) =>
      console.error(`[${new Date().toISOString()}] - ${queueName}: Failed: ${err.message}`);

    worker.on('completed', onCompleted);
    worker.on('failed', onFailed);

    worker.on('closed', () => {
      console.log(`🧹 [${queueName}] Worker closed, cleaning up...`);

      worker.removeListener('completed', onCompleted);
      worker.removeListener('failed', onFailed);

      this.workers.delete(queueName);
    });

    this.workers.set(queueName, worker);

    return worker;
  }

  public removeWorker(queueName: string) {
    const worker = this.workers.get(queueName);

    if (worker) {
      worker.close();

      this.workers.delete(queueName);
    }
  }
}
