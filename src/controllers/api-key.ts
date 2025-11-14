import { ApiKeyService } from '../services';
import { TApiKeyServiceCheck } from '../types';

export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  public async check(body: TApiKeyServiceCheck) {
    const check = await this.apiKeyService.validate(body);

    return check;
  }
}
