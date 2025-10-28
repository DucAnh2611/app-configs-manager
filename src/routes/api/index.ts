import { Router } from 'express';
import { ROUTE_PATHS } from '../../constants';
import { ValidateNamespace } from '../../middlewares';
import { ApiV1Router } from './v1';

export const ApiRouter = Router();

const apiPaths = ROUTE_PATHS.api;

ApiRouter.use(ValidateNamespace());

ApiRouter.use(apiPaths.v1.base, ApiV1Router);
