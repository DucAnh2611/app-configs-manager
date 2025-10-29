import { ROUTE_PATHS } from '../../constants';
import { createRouter, printGrid } from '../../helpers';
import { TRequest } from '../../types';

const webhookTestPaths = ROUTE_PATHS.webhook.test;

export const TestRouter = createRouter([
  {
    path: webhookTestPaths.get,
    method: 'get',
    middlewares: [],
    handler: async (req: TRequest, res) => {
      printGrid(
        {
          path: '/test/webhook',
          method: 'GET',
          query: JSON.stringify(req.query),
        },
        [
          ['path', 'Path'],
          ['method', 'Method'],
          ['query', 'Query'],
        ],
        {
          name: 'Webhook Test Get',
          split: ':',
        }
      );

      return { query: req.query };
    },
    handlerOptions: { controller: 'get' },
  },
  {
    path: webhookTestPaths.post,
    method: 'post',
    middlewares: [],
    handler: async (req: TRequest, res) => {
      printGrid(
        {
          path: '/test/webhook',
          method: 'POST',
          body: JSON.stringify(req.body),
          query: JSON.stringify(req.query),
        },
        [
          ['path', 'Path'],
          ['method', 'Method'],
          ['body', 'Body'],
          ['query', 'Query'],
        ],
        {
          name: 'Webhook Test Post',
          split: ':',
        }
      );

      return { body: req.body, query: req.query };
    },
    handlerOptions: { controller: 'test' },
  },
]);
