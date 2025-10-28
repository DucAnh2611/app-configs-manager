import { Router } from 'express';
import { ROUTE_PATHS } from '../../constants';
import { printGrid } from '../../helpers';

export const TestRouter = Router();

const webhookTestPaths = ROUTE_PATHS.webhook.test;

TestRouter.get(webhookTestPaths.get, (req, res) => {
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

  return res.json({
    received: true,
    payload: { query: req.query },
  });
});

TestRouter.post(webhookTestPaths.post, (req, res) => {
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

  return res.json({
    received: true,
    payload: { body: req.body, query: req.query },
  });
});
