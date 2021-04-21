---
title: "Shows"
layout: "layouts/feed.html"
pagination:
  data: collections.shows
  size: 25
  alias: show
paginationPrevText: "Newer"
paginationNextText: "Older"
paginationAnchor: "#post-list"
permalink: "shows{% if pagination.pageNumber > 0 %}/page/{{ pagination.pageNumber }}{% endif %}/index.html"
---

A list of theatre productions I've been involved in.
