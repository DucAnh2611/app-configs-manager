import cron, { ScheduledTask } from 'node-cron';
import { logger } from '../libs';
import { TDynamicJob } from '../types';
import { QueueService } from './queue';

interface DynamicRegistry {
  task: ScheduledTask;
  job: TDynamicJob;
}

export class CronService {
  private registry: Map<string, DynamicRegistry>;

  constructor(private readonly queueService: QueueService) {
    this.registry = new Map<string, DynamicRegistry>();
  }

  registerDynamicJob(job: TDynamicJob) {
    if (this.registry.has(job.name)) {
      return;
    }

    this.queueService.createWorker(job.name, job.workerHandler, job.concurrency);

    const task = cron.schedule(job.expression, async () => {
      await job.handler();
    });

    this.registry.set(job.name, { job, task });
  }

  unregisterDynamicJob(name: string) {
    const entry = this.registry.get(name);
    if (!entry) return;

    logger.info(`🧹 Removing job: ${name}`);

    entry.task.stop();

    this.queueService.removeWorker(name);
    this.registry.delete(name);
  }

  listDynamicJobs() {
    return Array.from(this.registry.keys());
  }
}
