const $ = require("jquery");
const moment = require("moment");
import {getNewsStories} from "./models/NewsFeed";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/style.css";
import * as firebase from "./models/Firebase";
import "popper.js";
import "bootstrap";
import navIcon from '../imgs/logo.png';
import tempCoverPic from '../imgs/dummy-new-0.jpg';
import defaultProfilePic from "../imgs/logo.png";
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import { version } from "moment";

const Elements = {
    navImg: document.querySelector('.nav'),
    navLogout: $("#nav-logout"),
    newPostBtn: $(".btn-new-post"),
    postText: $(".postBox"),
    username: $(".username"),
    userThumb: $(".userPhoto"),
    searchUsers: $(".search-users"),
    searchResults: document.querySelector(".results"),
    navLinks: $(".nav-link"),
    choosePostPic: $("#add-pic-to-post"),
    addPostPic: $(".add-post-pic"),
    choosePostVid: $("#add-vid-to-post"),
    addPostVid: $(".add-post-video"),
    uploadProBar: $(".upload-progress")
}

const item = document.querySelector(".empty-0")

export const getDefaultProPic = () => {
  return defaultProfilePic;
};

export const getTempCoverPic = () => {
  return tempCoverPic;
};

export const setHomeUser = (user) => {
  firebase.setOnline(user);
  $("#friendpost-tab").tab("show");
  firebase.getFriendsPosts(user, ".empty-0");
  firebase.fetchProfilePictureThumb(user, Elements.userThumb);
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

$(Elements.navLinks).click(function(){
      var id = $(this).attr('id');
      switch(id){
        case "myposts-tab":
            removeItems(".card");
            firebase.getMyPosts(firebase.getUserInfo().currentUser, ".empty-1");
            break;
          case "friendpost-tab":
              removeItems(".card");
              // firebase.getFriendsPosts(firebase.getUserInfo().currentUser, ".empty-0");
            break;
          case "news-tab":
           getNewsStories();
            break;
      }
});


Elements.navLogout.on("click", () => {
  $(".home-page").addClass("hide-home");
  firebase.signOut();
});

Elements.newPostBtn.on("click", () => {
  var imgUrl = $(".pre-post-img").attr("src");
  var vidUrl = $(".pre-post-vid").attr("src");
firebase.addNewPost(firebase.getUserInfo().currentUser, Elements.postText.val(), Elements.username.text(), imgUrl, vidUrl);
$(".pre-post-vid").css({display:"none"});
$(".pre-post-pic").css({display:"none"});
Elements.postText.val("");
// removeItems(".card");
// firebase.getMyPosts(firebase.getUserInfo().currentUser);
});


Elements.searchUsers.on("keydown", (key) => {
    if(key.keyCode === 13){
      firebase.FirebaseElements.allUsers.orderByChild("displayName").equalTo(Elements.searchUsers.val()).once('value', function(snapshot) {
        if(!snapshot.exists() || $(".result-item").length > 0 || snapshot.displayName == "undefined"){
          console.log("No results!!");
          removeItems(".result-item");
        }
        snapshot.forEach(childData => {
            var data = childData.val();
              viewSearchResults(data.photoURL, data.displayName, data.usersID);
        });
    });
    key.preventDefault();
    }else if(key.keyCode === 8){
      removeItems(".result-item");
    }
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


const viewSearchResults = (userPhoto, username, userID) => {
  var url = `http://localhost:8080/view-profile.html?id=${userID}`;

  const resultItem = `<div class="result-item" id="${userID}">
  <div class="card border-0 mx-auto">
      <div class="card-header bg-white border-0">
      <img src="${userPhoto}" alt="" class="view-userPhoto rounded-circle img img-thumbnail float-left mr-2">
      <p class="w-0 mt-1"><a href="${url}">${username}</a></p>
      </div>
  </div>
  <hr>
  </div>`;
  Elements.searchResults.insertAdjacentHTML('beforeend', resultItem);
}

const uploadFile = (file, type, fileType) => {
  const metadata = {
      contentType: fileType
  };
  let uploadProfile = firebase.uploadPicture(file, firebase.getUserInfo().currentUser.uid, metadata, type)
  uploadProfile.on(firebase.getUploadStateChanged(),
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
    Elements.navImg.src = navIcon;
}

const removeItems = ele => {
  $(ele).remove();
}

setupImgs();