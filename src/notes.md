---
title: "Notes"
permalink: "/notes/"
layout: "layouts/notes.html"
---

These are my working notes, which are ripped straight from my computer. They are messy; things might make zero sense for public consumption; links might be dead. But have at it! The best way to navigate is to click around through the magic of hyperlinks.

A good place to start: [[§ What's top of mind]]

<!--Here are a few possible starting points:-->

Here are a few other recent notes:

{% set notes = collections.notes.slice(0,5) %}

{% for note in notes %}
<a href="{{note.url}}">{{ note.data.title }}</a>
{%endfor%}
