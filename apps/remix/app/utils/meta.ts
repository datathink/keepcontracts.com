import { i18n, type MessageDescriptor } from '@lingui/core';

export const appMetaTags = (title?: MessageDescriptor) => {
  const description = 'KeepContracts — simple, secure document signing for your team.';

  return [
    {
      title: title ? `${i18n._(title)} | KeepContracts` : 'KeepContracts',
    },
    {
      name: 'description',
      content: description,
    },
    {
      name: 'keywords',
      content: 'KeepContracts, document signing, secure contracts, DataThink',
    },
    {
      name: 'author',
      content: 'DataThink',
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
    {
      property: 'og:title',
      content: 'KeepContracts',
    },
    {
      property: 'og:description',
      content: description,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:description',
      content: description,
    },
  ];
};
