import { Router } from 'express';
import { ValidateNamespace } from '../../middlewares';
import { ApiV1Router } from './v1';

export const ApiRouter = Router();

ApiRouter.use(ValidateNamespace());

ApiRouter.use('/v1', ApiV1Router);
