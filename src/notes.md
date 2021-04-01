---
title: "Notes"
permalink: "/notes/"
layout: "layouts/about.html"
---

Haven't figured out if these are going to "Notes" like Robin Rendle or others', or more like "working notes" like Andy Matuschak's. Or maybe those are two different things? Maybe I should have a "garden" section?

{% for note in collections.notes %}
<a href="{{note.url}}">{{ note.data.title }}</a>
{%endfor%}