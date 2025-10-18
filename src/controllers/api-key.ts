import { ApiKeyService } from '../services';
import { DtoApiKeyValidate } from '../types';

export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  public async check(body: DtoApiKeyValidate) {
    const check = await this.apiKeyService.validate(body);

    return check;
  }
}
