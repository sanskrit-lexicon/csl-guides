// @ts-check
// Docusaurus config for the Cologne Digital Sanskrit Dictionaries guides.
// Docs: https://docusaurus.io/docs/configuration

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cologne Digital Sanskrit Dictionaries',
  tagline: 'User, contributor, and developer guides for sanskrit-lexicon.uni-koeln.de',
  favicon: 'img/logo.svg',

  // Production URL and base path. Project site under the org:
  //   https://sanskrit-lexicon.github.io/csl-guides/
  url: 'https://sanskrit-lexicon.github.io',
  baseUrl: '/csl-guides/',

  // GitHub Pages deployment config.
  organizationName: 'sanskrit-lexicon',
  projectName: 'csl-guides',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        indexBlog: true,
        docsRouteBasePath: '/',
        blogRouteBasePath: 'news',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
      }),
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/', // serve docs at the site root
          sidebarPath: './sidebars.js',
          // Surface each page's git "last updated" date. Needs full git history at build
          // time (fetch-depth: 0 in deploy.yml) or every page shows the same commit date.
          // The date is moved to the top-right of the page by src/theme/DocItem/Content;
          // the default footer copy is hidden in custom.css.
          showLastUpdateTime: true,
          editUrl:
            'https://github.com/sanskrit-lexicon/csl-guides/tree/main/',
        },
        blog: {
          routeBasePath: 'news',
          blogTitle: 'News',
          blogDescription: 'Announcements and release notes for the Cologne Digital Sanskrit Dictionaries',
          showReadingTime: false,
          editUrl:
            'https://github.com/sanskrit-lexicon/csl-guides/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Default social-card image (og:image / twitter:image) for link unfurls.
      image: 'img/social-card.png',
      navbar: {
        title: 'Cologne Sanskrit Lexicon',
        logo: {
          alt: 'CDSL logo',
          src: 'img/logo.svg',
        },
        items: [
          {type: 'docSidebar', sidebarId: 'usersSidebar', position: 'left', label: 'Using the Site'},
          {type: 'docSidebar', sidebarId: 'dictionariesSidebar', position: 'left', label: 'Dictionaries'},
          {type: 'docSidebar', sidebarId: 'toolsSidebar', position: 'left', label: 'Tools'},
          {type: 'docSidebar', sidebarId: 'contributingSidebar', position: 'left', label: 'Contributing'},
          {type: 'docSidebar', sidebarId: 'developersSidebar', position: 'left', label: 'Developers'},
          {to: '/news', label: 'News', position: 'left'},
          {to: '/faq', label: 'FAQ', position: 'right'},
          {
            href: 'https://sanskrit-lexicon.uni-koeln.de',
            label: 'Live Site',
            position: 'right',
          },
          {
            href: 'https://github.com/sanskrit-lexicon',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Use',
            items: [
              {label: 'Using the Site', to: '/users/using-the-website'},
              {label: 'Dictionaries', to: '/dictionaries/overview'},
              {label: 'Encoding & Transliteration', to: '/users/encoding-transliteration'},
            ],
          },
          {
            title: 'Build',
            items: [
              {label: 'Contributing', to: '/contributing/corrections-workflow'},
              {label: 'Developer Guide', to: '/developers/architecture'},
              {label: 'Issue Taxonomy', to: '/contributing/issue-taxonomy'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'Live Site', href: 'https://sanskrit-lexicon.uni-koeln.de'},
              {label: 'GitHub Org', href: 'https://github.com/sanskrit-lexicon'},
              {label: 'CDSL Project', href: 'https://www.sanskrit-lexicon.uni-koeln.de'},
            ],
          },
        ],
        copyright: `Cologne Digital Sanskrit Dictionaries. Content under CC BY-SA 4.0 unless noted. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'python', 'json'],
      },
    }),
};

export default config;
