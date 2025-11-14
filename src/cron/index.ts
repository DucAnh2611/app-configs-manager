import { getServices } from '../services';
import { registerWebhookCronJob } from './webhook';

export const initCronJob = () => {
  const services = getServices();

  registerWebhookCronJob(services);
};
