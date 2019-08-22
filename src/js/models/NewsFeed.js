const GoogleNewsRss = require('google-news-rss');
const googleNewss = new GoogleNewsRss();

let resItems;

export async function getNewsStories() {
      await googleNewss
       .search('politics')
       .then(response => {
        resItems = Array.from(response);
        resItems.length = 8;
       });
    return resItems;
}