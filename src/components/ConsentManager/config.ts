export const groups = [
  {
    key: 'functional',
    title: 'Functional',
    items: [
      {
        key: 'hs-locale',
        title: 'Preferred language',
        text: 'Remembers your preferred language.',
        default: true,
        url: false,
        cookies: [
          {
            key: 'HEAD_START_LOCALE',
            url: false,
          },
        ],
      },
    ],
  },
  {
    key: 'external-content',
    title: 'External content',
    items: [
      {
        key: 'x-twitter',
        title: 'X (Twitter)',
        text: 'Embed tweets. Includes analytics.',
        default: false,
        url: 'https://twitter.com/en/privacy',
        cookies: [
          {
            key: 'metrics_token',
            url: 'https://cookiedatabase.org/cookie/twitter/metrics_token/',
          }
        ],
      },
      {
        key: 'youtube',
        title: 'YouTube',
        text: 'Embed videos. Includes analytics.',
        default: false,
        url: false,
        cookies: [],
      },
    ],
  },
  {
    key: 'statistics',
    title: 'Statistics',
    items: [
      {
        key: 'plausible',
        title: 'Plausible',
        text: 'Collects anonymous data about website usage.',
        default: false,
        url: false,
        cookies: [],
      },
      {
        key: 'google-analytics',
        title: 'Google Analytics',
        text: 'Service is mostly used for website statistics.',
        url: 'https://policies.google.com/privacy',
        default: false,
        cookies: [
          {
            key: '_ga',
            url: 'https://cookiedatabase.org/cookie/google-analytics/_ga/',
          },
          {
            key: '_gid',
            url: 'https://cookiedatabase.org/cookie/google-analytics/_gid/',
          },
          {
            key: '_ga_*',
            url: 'https://cookiedatabase.org/cookie/google-analytics/_ga_/',
          },
        ],
      },
    ],
  },
];
