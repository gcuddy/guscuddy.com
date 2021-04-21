---js
{
    title: "My Posts",
    pagination: {
        data: "collections.shows",
        size: 1,
        alias: "show",
        before: function(data) {
            let arr = [];
            data.forEach((item) => {
                item.data.photos.src.forEach((img, i) => {
                    const container = {};
                    container.title = item.data.title;
                    container.credit = item.data.photos.credit;
                    container.theater = item.data.theater;
                    container.url = item.url;
                    container.src = img;
                    container.index = i;
                    arr.push(container);
                })
            })
            return arr;
        }
    },
    permalink: "/shows/{{ show.title | slug }}/{{ show.index + 1 }}/",
    layout: "layouts/photo.html"
}
---

{{ show.src }}
