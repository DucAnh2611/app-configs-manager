import { ConfigRepository } from '../repositories';

export class ConfigService {
  constructor(private readonly configRepository: ConfigRepository) {}

  public async get() {}

  public async up() {}
}
