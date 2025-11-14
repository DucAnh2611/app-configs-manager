export const ROUTE_PATHS = {
  base: '/',
  ping: {
    base: '/',
  },
  api: {
    base: '/api',
    v1: {
      base: '/v1',
      app: {
        base: '/app',
      },
      apiKey: {
        base: '/api-key',
        check: '/check',
      },
      config: {
        base: '/config',
        history: '/history',
        get: '/',
        up: '/',
        toggle: '/toggle/:id',
        rollback: '/rollback/:id',
        remove: '/:id',
      },
      webhook: {
        base: '/webhook',
        list: '/list/all',
        get: '/:id',
        register: '/',
        toggle: '/toggle/:id',
        update: '/:id',
        delete: '/:id',
      },
      webhookHistory: {
        base: '/webhook-history',
        list: '/list',
        retry: '/retry/:id',
      },
    },
  },
  webhook: {
    base: '/webhook',
    test: {
      base: '/test',
      get: '/',
      post: '/',
    },
  },
  any: /.*/,
};
