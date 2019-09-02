const $ = require("jquery");
// const GoogleNewsRss = require('google-news-rss');
// const googleNewss = new GoogleNewsRss();

let resItems;
let artArray;
let artTitle;
let artImage;
let article;
let eleItem = document.querySelector(".topStories");
// export async function getNewsStoriesOld() {
//       await googleNewss
//        .search('politics')
//        .then(response => {
//         resItems = Array.from(response);
//         resItems.length = 8;
//        });
//     return resItems;
// }

export function getNewsStories() {
   // Created my own news list. Only using FoxNews for now but It's far better than the previous Google RSS Feed!
$(function () {
  $.ajax({
      type: 'GET',
      url: 'https://www.foxnews.com/politics',
      dataType: "html",
      success: function (data) {
        var article = $(data).find("article");
        var artArray = Array.from(article);
        artArray.length = 10;
        artArray.forEach(item => {
          var artTitle = $(item).find(".info .title").text();
          var artLink = $(item).find(".info .title a").attr("href");
          var artImage = $(item).find(".m a img").attr("src");
          var artDesc = $(item).find(".info .content .dek a").text();

          let artItem = `<div class="card border-0 shadow-sm rounded-lg my-3 pb-3 mx-auto myPostCards">
          <div class="card-header pb-0 border-0 bg-white">
          <img src="${artImage}" alt="" class="img img-thumbnail article-img float-left mr-2 mb-2">
          <a href="http://www.foxnews.com/${artLink}"><h5 class="articleTitle">${artTitle}</h5></a>
          </div>
          <hr class="mx-auto mt-0" style="width:90%">
        <div class="card-body pt-0 pb-0 px-4 text-dark border-0">
        <p class="articleDesc">${artDesc}</p>
         </div>
        </div>`;
        
        // `<div class="stories bg-white rounded-lg p-2 m-3 shadow-sm">
        //   <div class="artImg float-left">
        //      <img src="${artImage}" class="img img-thumbnail article-img"></img>
        //      </div>
        //      <div class="artText">
        //      <a href="http://www.foxnews.com/${artLink}"><h5 class="articleTitle">${artTitle}</h5></a>
        //      <p class="articleDesc" data-maxlength="10">${artDesc}</p>
        //      </div>
        //    </div>`;

        if(eleItem && artTitle){
          eleItem.insertAdjacentHTML('beforeend', artItem);
          // $(".articleDesc").text().substring(0, 30) + "....";
        }
        });
      }
  });
});
}