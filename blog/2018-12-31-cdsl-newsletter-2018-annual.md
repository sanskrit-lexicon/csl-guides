---
slug: newsletter-2018-annual
title: "CDSL 2018 Year in Review"
authors: []
tags: [newsletter]
date: 2018-12-31
---

2018 continued the steady development and data maintenance work of the project, with the team preparing the infrastructure changes that would result in the launch of the REST API and expanded tooling in 2019.

<!-- truncate -->

## Dictionary data quality work

Systematic corrections to dictionary data — headwords, abbreviations, literary source references, and markup — continued throughout 2018. The csl-orig repository was receiving regular updates. Particular attention was paid to Monier-Williams and the Böhtlingk dictionaries, where the volume of markup and cross-references makes quality control a sustained effort.

## Tooling development

The Python-based XML generation pipeline (csl-pywork) was being refined to handle an increasing range of dictionary-specific markup cases. The goal was to make the pipeline robust enough that corrections in csl-orig would propagate automatically to the XML output, the web display, and the offline stardict files.

## Looking ahead to the API

Planning for a REST API — which would allow programmatic access to the dictionary data without screen-scraping the web interface — was under way. The csl-apidev repository would be created in 2019, opening the Cologne data to downstream applications and researchers.

---

*To receive future editions by email, [subscribe here](/users/newsletter).*
