export const TEST_CONSTANTS = {
  type: {
    base: 'test-key-rotate',
    inf: 'test-key-inf',
  },
  run: {
    keyService: {
      generate: {
        rk: true,
        ik: true,
        rkmd: true,
      },
      getRotateKey: {
        ne: true,
        'e-kfne': false,
        'e-kfe-vt': true,
        'e-kfe-e': true,
        'e-kfe-e-r': true,
        'e-kfe-ns': true,
      },
    },
  },
};
