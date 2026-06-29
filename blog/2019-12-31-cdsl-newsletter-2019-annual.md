---
slug: newsletter-2019-annual
title: "CDSL 2019 Year in Review"
authors: []
tags: [newsletter]
date: 2019-12-31
---

2019 was a landmark year for the project: the REST API launched, corrections tracking moved fully to GitHub, and the web display received important improvements to cross-reference linking.

<!-- truncate -->

## REST API launched (csl-apidev)

The csl-apidev repository was created in 2019, providing a programmatic REST interface to the Cologne dictionary data. For the first time, developers and researchers could query individual entries, search headwords, and retrieve dictionary data without navigating the web interface. This opened the Cologne corpus to downstream tools, mobile applications, and integration with other Sanskrit NLP resources.

## Cross-reference links improved

The web display layer (csl-websanlexicon) received significant improvements to how cross-references are rendered. Links to Westergaard and Whitney — frequently cited sources in Monier-Williams — were updated to work correctly in both the online display and a local installation. The template system was also refactored, making it easier to maintain consistent display across all dictionaries.

## Corrections workflow on GitHub

The csl-corrections repository received its first commits in 2019, beginning the practice of tracking all applied corrections as structured change files with references to the issues that motivated them. The Python generation pipeline also received Python 3 compatibility work this year, laying the groundwork for the team's transition away from Python 2.

---

*To receive future editions by email, [subscribe here](/users/newsletter).*
