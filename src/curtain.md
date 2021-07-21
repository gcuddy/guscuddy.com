---
title: 'The Curtain'
layout: 'layouts/feed.html'
pagination:
    data: collections.newsletter
    size: 500
    alias: curtain
paginationPrevText: 'Newer dispatches'
paginationNextText: 'Older dispatches'
paginationAnchor: '#post-list'
permalink: 'curtain{% if pagination.pageNumber > 0 %}/page/{{ pagination.pageNumber }}{% endif %}/index.html'
noCta: true
cssclass: 'curtain-landing'
---

{% set grouping = 'season' %}

A weekly newsletter on art, theater, media, culture, and the internet.

<!-- I try to make it feel personal, and hundreds of folks seem to love it. -->

{% set dataVariant = "ghost" %}
{% include "partials/email-capture.html" %}

<!-- Not in the loop yet? [Sign up here](#cta). -->
