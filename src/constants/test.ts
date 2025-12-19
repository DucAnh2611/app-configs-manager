export const TEST_CONSTANTS = {
  type: {
    base: 'test-key-rotate',
    inf: 'test-key-inf',
  },
  run: {
    helpers: {
      crypto: { e: false, 'e+d': false },
    },
    utils: {
      validator: { ok: false },
    },
    configService: {
      get: {
        o: false,
        a: false,
      },
      up: {
        o: false,
        b: false,
      },
    },
    keyService: {
      generate: {
        rk: false,
        ik: false,
        rkmd: false,
      },
      getRotateKey: {
        ne: false,
        'e-kfne': false,
        'e-kfe-vt': false,
        'e-kfe-e': false,
        'e-kfe-e-r': false,
        'e-kfe-ns': false,
      },
    },
  },
};
