const $ = require("jquery");
const moment = require("moment");
import {getNewsStories} from "./models/NewsFeed";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/style.css";
import * as app from "./models/Firebase";
import "popper.js";
import "bootstrap";
import navIcon from '../imgs/logo.png';
import tempCoverPic from '../imgs/dummy-new-0.jpg';
import defaultProfilePic from "../imgs/logo.png";
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import Comments from "./models/Comments";

const Elements = {
    navImg: $('.nav'),
    navLogout: $("#nav-logout"),
    newPostBtn: $(".btn-new-post"),
    postText: $(".postBox"),
    username: $(".username"),
    userThumb: $(".userPhoto"),
    searchUsers: $(".search-users-main"),
    searchUsersPop: $(".search-users-pop"),
    searchButton: $(".btn-search-user"),
    searchResults: $(".results"),
    tabs: $(".tabs"),
    myPostTab: $(".my-posts-btn"),
    friendPostTab: $(".friend-btn"),
    newsTab: $(".news-btn"),
    choosePostPic: $("#add-pic-to-post"),
    addPostPic: $(".add-post-pic"),
    choosePostVid: $("#add-vid-to-post"),
    addPostVid: $(".add-post-video"),
    uploadProBar: $(".upload-progress")
}

const item = document.querySelector(".empty-0")
var currUser = null;
export const getDefaultProPic = () => {
  return defaultProfilePic;
};

export const getTempCoverPic = () => {
  return tempCoverPic;
};



export const setHomeUser = (user) => {
  app.setOnline(user);
  app.fetchProfilePictureThumb(user, Elements.userThumb);
  app.getPosts(user, "my-posts", ".empty-0");
  setupClicks();
  currUser = user;
  }


  const setupClicks = () => {
    $(".content").on("click", ".close", function(event) {
      var id = $(event.target).closest(".myPostCards").attr("id");

      var vidEle = $(".post-vid").attr("src");
      var imgURL = $(".post-img").attr("src");
      if(vidEle.includes("http")){
          app.deleteFile("postVid");
      }else if(imgURL.includes("http")){
          app.deleteFile("postImg");
      }
          app.deletePost(currUser, id);
      });

      $(".content").on("click", ".comment-post", eve => {
          var id = $(event.target).closest(".myPostCards").attr("id");
          $(`#${id}`).find(".comments").fadeToggle(1000);
      });

          $(".content").on("click", ".btn-new-comm", (event) => {
              var id = $(event.target).closest(".myPostCards").attr("id");
              var commentText = $(event.target).closest(".myPostCards").find(".commBox").val();
              app.addNewComment(commentText, currUser.displayName, currUser.uid, currUser.photoURL, id);
              $(".commBox").val("");
          });

          $(".content").on("click", ".like-post", (event) => {
              var id = $(event.target).closest(".myPostCards").attr("id");
              app.FirebaseElements.removeLikeRef(id, currUser).once("value", snap => {
                  if(snap.exists()){
                      app.FirebaseElements.removeLikeRef(id, currUser).remove();
                      app.listenForChanges(id, "remove-like");
                  }else{
                      app.likedPosts(currUser, id);
                      app.listenForChanges(id, "likes");
                  }
              });
            });

            $(".content").on("click", ".del-com-btn", (eve) => {
              var cID = $(eve.target).closest(".myPostCards").attr("id");
              var commentID = $(eve.target).closest(".comment-item").attr("id");
                  app.FirebaseElements.DelCommentRef(cID, commentID).remove();
                  $(`#${commentID}`).remove();
          });

          $(".content").on("click", ".post-pic", function(event) {
            var id = $(event.target).closest($(".post-img")).attr("src");
            $(".image-pop").modal("show");
            $(".view-image").attr("src", id);
            });
      
      $('.image-pop').on('hidden.bs.modal', function () {
        $(this).modal("dispose");
      });
  }

  $(Elements.choosePostPic).on("click", () => {
    Elements.addPostPic.focus().trigger('click');
    Elements.addPostPic.on('change',(evt) => {
    let res = evt.target.files[0];
    Elements.uploadProBar.css({display: "block"});
    uploadFile(res, "post-img", evt.target.files[0].type);
});
});


$(Elements.choosePostVid).on("click", () => {
  Elements.addPostVid.focus().trigger('click');
Elements.addPostVid.on('change',(evt) => {
  let res = evt.target.files[0];
  Elements.uploadProBar.css({display: "block"});
  $(".pre-post-vid").css({display:"block"});
  uploadFile(res, "post-vid", evt.target.files[0].type);
});
});

$(Elements.myPostTab).on("click", () => {
  removeItems(".card");
  app.removeListeners();
  app.getPosts(currUser, "my-posts", ".empty-0");
  setupClicks();
});

$(Elements.friendPostTab).on("click", () => {
  removeItems(".card");
  app.removeListeners();
  app.getPosts(currUser, "friends-posts", ".empty-1");
  setupClicks();
});

$(Elements.newsTab).on("click", () => {
  removeItems(".card");
  removeItems(".news-item");
  getNewsStories();
});

Elements.navLogout.on("click", () => {
  $(".home-page").addClass("hide-home");
  app.signOut();
});


Elements.newPostBtn.on("click", () => {
  var imgUrl = $(".pre-post-img").attr("src");
  var vidUrl = $(".pre-post-vid").attr("src");
  app.addNewPost(app.getUserInfo().currentUser, Elements.postText.val(), Elements.username.text(), imgUrl, vidUrl);
  $(".pre-post-vid").attr("src", "");
  $(".pre-post-img").attr("src", "");
  Elements.postText.val("");
});

$(".btn-search").on("click", () => {
  $(".search-pop").modal("show");
Elements.searchButton.on("click", () => {
  app.FirebaseElements.allUsers.orderByChild("displayName").equalTo(Elements.searchUsersPop.val()).once('value', function(snapshot) {
    if(!snapshot.exists() || $(".result-item").length > 0 || snapshot.displayName == "undefined"){
      $(".no-result-pop").css({display:"block"});
      removeItems(".result-item");
    }
    snapshot.forEach(childData => {
        var data = childData.val();
        $(".no-result-pop").css({display:"none"});
          viewSearchResults(data.photoURL, data.displayName, data.usersID, ".results-pop");
    });
});
});
});

Elements.searchUsers.on("keydown", (key) => {
    if(key.keyCode === 13){
      app.FirebaseElements.allUsers.orderByChild("displayName").equalTo(Elements.searchUsers.val()).once('value', function(snapshot) {
        if(!snapshot.exists() || $(".result-item").length > 0 || snapshot.displayName == "undefined"){
          $(".no-result").css({display:"block"});
          removeItems(".result-item");
        }
        snapshot.forEach(childData => {
            var data = childData.val();
            $(".no-result").css({display:"none"});
              viewSearchResults(data.photoURL, data.displayName, data.usersID, ".results");
        });
    });
    key.preventDefault();
    }else if(key.keyCode === 8){
      $(".no-result").css({display:"none"});
      removeItems(".result-item");
    }

    $(document).on("click", () => {
      $(".no-result").css({display:"none"});
    });
});
// Old version. Stopped using it as I couldn't fetch article thumbnails!!
// newsFeed.getNewsStories().then(newsItems => {
//     newsItems.forEach(item => {
//         let artItem = `<div class="stories bg-white rounded-lg p-2 m-3">
//         <a href="${item.link}"><h5 class="articleTitle">${item.title}</h5></a>
//           <p class="articleDesc">${item.description}</p>
//         </div>`;
//         if(Elements.topStories){
//           Elements.topStories.insertAdjacentHTML('beforeend', artItem);
//         }
//     });
// });


const viewSearchResults = (userPhoto, username, userID, ele) => {
  var url = `/view-profile.html?id=${userID}`;

  const resultItem = `<div class="result-item" id="${userID}">
  <div class="card border-0 mx-auto">
      <div class="card-header bg-white border-0">
      <img src="${userPhoto}" alt="" class="view-userPhoto rounded-circle img img-thumbnail float-left mr-2">
      <p class="w-0 mt-1"><a href="${url}">${username}</a></p>
      </div>
  </div>
  <hr>
  </div>`;
  $(ele).append(resultItem);
}

const uploadFile = (file, type, fileType) => {
  const metadata = {
      contentType: fileType
  };
  let uploadProfile = app.uploadPicture(file, app.getUserInfo().currentUser.uid, metadata, type)
  uploadProfile.on(app.getUploadStateChanged(),
      (snapshot) => {
          let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100; 
          if(type === "post-vid"){
            Elements.uploadProBar.text(`Uploading Video: ${Math.round(progress)}%`);
          }else{
            Elements.uploadProBar.text(`Uploading Image: ${Math.round(progress)}%`);
          }
      },
      (error) => {
          switch (error.code) {
              case 'storage/unauthorized':
                  break;
              case 'storage/unknown':
                  break;
          }
      }, () => {
          uploadProfile.snapshot.ref.getDownloadURL().then((downloadURL) => {
            if(type === "post-vid"){
              $(".pre-post-vid").attr("src", downloadURL);
            }else{
              $(".pre-post-img").attr("src", downloadURL);
            }
            Elements.uploadProBar.css({display: "none"});
              });
      });
}

const setupImgs = () => {
    // NavBar Icon!!
    Elements.navImg.attr("src", navIcon);
}

const removeItems = ele => {
  $(".content").off("click", ".close");
  $(".content").off("click", ".comment-post");
  $(".content").off("click", ".btn-new-comm");
  $(".content").off("click", ".like-post");
  $(ele).remove();
}

setupImgs();