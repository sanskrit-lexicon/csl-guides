// @ts-check
// Manual sidebars — one per audience-oriented section (hybrid of the
// dharmamitra-guides tool-catalog shape and Cologne-specific workflows).

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  usersSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Using the Site',
      collapsed: false,
      items: [
        'users/quick-start',
        'users/using-the-website',
        'users/search-and-display',
        'users/encoding-transliteration',
        'users/transliteration-quiz',
        'users/sandhi-quiz',
        'users/reading-monier-williams',
        'users/downloads-and-data',
        'users/scans-and-print',
        'users/troubleshooting',
      ],
    },
  ],

  dictionariesSidebar: [
    {
      type: 'category',
      label: 'Dictionaries',
      collapsed: false,
      items: [
        'dictionaries/overview',
        'dictionaries/catalog',
        'dictionaries/abbreviations-and-citations',
        'dictionaries/ocr-prefaces',
        {
          type: 'category',
          label: 'Featured dictionaries',
          collapsed: false,
          items: [
            'dictionaries/mw',
            'dictionaries/ap90',
            'dictionaries/ap',
            'dictionaries/pwg',
            'dictionaries/pw',
            'dictionaries/sch',
            'dictionaries/gra',
            'dictionaries/bhs',
            'dictionaries/mwe',
            'dictionaries/skd',
            'dictionaries/vcp',
          ],
        },
      ],
    },
  ],

  toolsSidebar: [
    {
      type: 'category',
      label: 'Tools',
      collapsed: false,
      items: [
        'tools/overview',
        'tools/simple-search',
        'tools/advanced-search',
        'tools/multi-dictionary',
        'tools/offline-stardict',
      ],
    },
  ],

  contributingSidebar: [
    {
      type: 'category',
      label: 'Contributing',
      collapsed: false,
      items: [
        'contributing/overview',
        'contributing/corrections-workflow',
        'contributing/issue-taxonomy',
        'contributing/change-files',
      ],
    },
  ],

  developersSidebar: [
    {
      type: 'category',
      label: 'Developer Guide',
      collapsed: false,
      items: [
        'developers/architecture',
        'developers/repositories',
        'developers/generation-pipeline',
        'developers/data-formats',
        'developers/api',
      ],
    },
    {
      type: 'category',
      label: 'About',
      collapsed: true,
      items: [
        'about/about',
        'about/history',
        'about/events',
        'about/publications',
        'about/acknowledgments',
        'faq',
      ],
    },
  ],
};

export default sidebars;
