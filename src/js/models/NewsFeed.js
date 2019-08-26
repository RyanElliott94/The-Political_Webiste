const $ = require("jquery");
const GoogleNewsRss = require('google-news-rss');
const googleNewss = new GoogleNewsRss();

let resItems;
let artArray;
let artTitle;
let artImage;
let article;

export async function getNewsStoriesOld() {
      await googleNewss
       .search('politics')
       .then(response => {
        resItems = Array.from(response);
        resItems.length = 8;
       });
    return resItems;
}

export function getNewsStories() {
   var getArticles = $(function () {
        $.ajax({
            type: 'GET',
            url: 'https://www.foxnews.com/politics',
            dataType: "html",
            success: function (data) {
              article = $(data).find("article");
              artArray = Array.from(article);
              artArray.forEach(item => {
                artTitle = $(item).find(".m a img").attr("alt");
                artImage = $(item).find(".m a img").attr("src");
              });
            }
        });
    });
    return getArticles;
}