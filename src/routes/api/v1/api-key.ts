import { ROUTE_PATHS } from '../../../constants';
import { controllerNames, getController } from '../../../controllers';
import { EValidateDtoType } from '../../../enums';
import { createRouter } from '../../../helpers';
import { ValidateDto } from '../../../middlewares';
import { DtoApiKeyValidate, TRequestValidatedDto } from '../../../types';

const apiKeyPaths = ROUTE_PATHS.api.v1.apiKey;

export const ApiKeyRouter = createRouter([
  {
    path: apiKeyPaths.check,
    method: 'post',
    middlewares: [ValidateDto([{ dto: DtoApiKeyValidate, type: EValidateDtoType.BODY }])],
    handler: async (req: TRequestValidatedDto<DtoApiKeyValidate, {}, {}>) => {
      const { apiKeyController } = getController();

      const resData = await apiKeyController.check(req.vBody);

      return { valid: resData };
    },
    handlerOptions: { controller: controllerNames.apiKey.check.name },
  },
]);
