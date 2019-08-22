const $ = require("jquery");
const moment = require("moment");
import * as newsFeed from "./models/NewsFeed";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/style.css";
import * as firebase from "./models/Firebase";
import "popper.js";
import "bootstrap";
import navIcon from '../imgs/logo.png';
import tempCoverPic from '../imgs/dummy-new-0.jpg';
import defaultProfilePic from "../imgs/logo.png";

const Elements = {
    topStories: document.querySelector(".topStories"),
    navImg: document.querySelector('.nav'),
    navLogout: $("#nav-logout"),
    newPostBtn: $(".btn-new-post"),
    postText: $(".postBox"),
    username: $(".username"),
    userThumb: $(".userPhoto"),
    searchUsers: $(".search-users"),
    searchResults: document.querySelector(".results"),
    navLinks: $(".nav-link")
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

    $(Elements.navLinks).click(function(){
      var id = $(this).attr('id');
      switch(id){
        case "myposts-tab":
            removeItems(".card");
            firebase.getMyPosts(firebase.getUserInfo().currentUser, ".empty-1");
          break;
          case "friendpost-tab":
              removeItems(".card");
              firebase.getFriendsPosts(firebase.getUserInfo().currentUser, ".empty-0");
            break;
      }
});

Elements.navLogout.on("click", () => {
  $(".home-page").addClass("hide-home");
  firebase.signOut();
});

Elements.newPostBtn.on("click", () => {
firebase.addNewPost(firebase.getUserInfo().currentUser, Elements.postText.val(), Elements.username.text());
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


newsFeed.getNewsStories().then(newsItems => {
    newsItems.forEach(item => {
        let artItem = `<div class="stories bg-white rounded-lg p-2 m-3">
        <a href="${item.link}"><h5 class="articleTitle">${item.title}</h5></a>
          <p class="articleDesc">${item.description}</p>
        </div>`;
        if(Elements.topStories){
          Elements.topStories.insertAdjacentHTML('beforeend', artItem);
        }
    });
});


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
const setupImgs = () => {
    // NavBar Icon!!
    Elements.navImg.src = navIcon;
}

const removeItems = ele => {
  $(ele).remove();
}

setupImgs();