import * as newsFeed from "./models/NewsFeed";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/style.css";
import * as firebase from "./models/Firebase";
const $ = require("jquery");
import "popper.js";
import "bootstrap";
import navIcon from '../imgs/logo.png';
import tempCoverPic from '../imgs/dummy-new-0.jpg';
import Search from "./models/Search";

const Elements = {
    topStories: document.querySelector(".topStories"),
    navImg: document.querySelector('.nav'),
    navLogout: $("#nav-logout"),
    newPostBtn: $(".btn-new-post"),
    postText: $(".postBox"),
    username: $(".username"),
    userThumb: $(".userPhoto"),
    searchUsers: $(".search-users"),
    searchResults: document.querySelector(".results")
}

const item = document.querySelector(".empty-0")

export const getTempCoverPic = () => {
  return tempCoverPic;
};

export const setHomeUser = (user) => {
  getAllPosts(user);
  firebase.fetchProfilePictureThumb(user, Elements.userThumb);
  }

  const getAllPosts = (user) => {
    firebase.FirebaseElements.allPosts(user).once('value', function(snapshot) {
        snapshot.forEach(function(childData) {
          var postData = childData.val();
          var postHTML = `<div class="card border my-3 mx-auto">
          <div class="card-header">
          <img src="${postData.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2">
          <p class="username w-0 mt-1">${postData.displayName}</p></div>
        <div class="card-body text-dark">
          <p class="card-text postText">${postData.postBody}</p>
        </div>`;
          item.insertAdjacentHTML('beforeend', postHTML);
        });
      });
    }

$(document).ready(() => {

Elements.navLogout.on("click", () => {
  firebase.signOut();
});

Elements.newPostBtn.on("click", () => {
firebase.addNewPost(firebase.getUserInfo().currentUser, Elements.postText.val(), Elements.username.text());
});

Elements.searchUsers.on("keydown", (key) => {
    if(key.keyCode === 13){
      firebase.FirebaseElements.allUsers.orderByChild("displayName").startAt(Elements.searchUsers.val()).once('value', function(snapshot) {
        snapshot.forEach(childData => {
            var data = childData.val();
            if(data.displayName == "undefined" || !Elements.searchUsers.val()){
            }else{
              viewSearchResults(data.photoURL, data.displayName, data.usersID);
            }
        });
    });
    key.preventDefault();
    }else if(key.keyCode === 8){
      $(".result-item").remove();
    }
});


newsFeed.getNewsStories().then(newsItems => {
    newsItems.forEach(item => {
        let artItem = `<div class="stories bg-white rounded-lg p-2 m-3">
        <a href="${item.link}"><h5 class="articleTitle">${item.title}</h5></a>
          <p class="articleDesc">${item.description}</p>
        </div>`;
      Elements.topStories.insertAdjacentHTML('beforeend', artItem);
    });
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
setupImgs();