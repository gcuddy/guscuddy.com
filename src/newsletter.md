---
title: "Previously on The Curtain..."
layout: "layouts/feed.html"
pagination:
  data: collections.newsletter
  size: 25
paginationPrevText: "Newer dispatches"
paginationNextText: "Older dispatches"
paginationAnchor: "#post-list"
permalink: "newsletter{% if pagination.pageNumber > 0 %}/page/{{ pagination.pageNumber }}{% endif %}/index.html"
---
{% set grouping = 'season' %}

Not in the loop yet? [Sign up here](#cta).
