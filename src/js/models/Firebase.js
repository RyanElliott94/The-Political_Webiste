var $ = require("jquery");
const moment = require("moment");
import {initFirebase} from "../models/FirebaseInit";
import firebase from "firebase/app";
require("firebase/auth");
require("firebase/database");
require("firebase/storage");
import {ProfileElements, setMyUser} from "../views/profileView";
import {setHomeUser} from "../index";
import{ getDefaultProPic} from "../index";
var uniqid = require('uniqid');
initFirebase();


export const sessPers = "session";
export const localPers = "local";
export const noPers = "none";
var isMe;

var UserInformation = {
    currentUser: {}
}

export const setUserInfo = (user) => {
    UserInformation.currentUser = user;
    UserInformation.displayName = user.displayName;
    UserInformation.photoURL = user.photoURL;
    UserInformation.userEmail = user.email;
    UserInformation.userID = user.uid;
    UserInformation.isAnon = user.isAnonymous;
}

firebase.auth().onAuthStateChanged(user => {
    if(user){
        setHomeUser(user);
        setMyUser(user);
        setUserInfo(user);
        setProfileInfo(user);
        getProfileInfoFromDB(user);
        $(".logged-out").toggleClass("logged-out");
        $(".hide-home").toggleClass("hide-home");
    }else{
        $(".hide").toggleClass("hide");
        $(".logged-in").toggleClass("logged-in");
    }
});

export const FirebaseElements = {
    coverPicRef: firebase.storage().ref('coverPictures/'),
    profilePicRef: firebase.storage().ref('profilePictures/'),
    allUsers: firebase.database().ref('/users/'),
    allPosts: firebase.database().ref('/posts/'),
    userRef: (user) => {
        return firebase.database().ref(`/users/${user.uid}/`)
    },
    friendsRef: user => {
        return firebase.database().ref(`/users/${user.uid}/friends/`)
    },
    newFriendRef: (user, id) => {
        return firebase.database().ref(`/users/${user.uid}/friends/${id}/`)
    },
    getMyPostsRef: user => {
        return firebase.database().ref(`/users/${user.uid}/posts/`)
    },
    otherUser: userID => {
        return firebase.database().ref(`/users/${userID}/`)
    },
    otherUsersPostsRef: userID => {
        return firebase.database().ref(`/users/${userID}/posts/`)
    }
};

export const fetchProfilePicture = (user, element) => {
    if(user.photoURL){
        $(element).attr("src", user.photoURL);
    }else{
        $(element).attr("src", getDefaultProPic());
    }
}

export const fetchCoverPhoto = (user, element) => {
    FirebaseElements.userRef(user).once('value', function(snapshot) {
        var data = snapshot.val();
        if(data){
            $(element).attr("src", data.coverPic);
        }else{
            $(element).attr("src", "https://i.stack.imgur.com/l60Hf.png");
        }
    });
}

export const fetchProfilePictureThumb = (user, element) => {
    if(user.photoURL){
        $(element).attr("src", user.photoURL);
    }else{
        $(element).attr("src", "https://i.stack.imgur.com/l60Hf.png");
    }
}

export const setOnline = (user) => {
    FirebaseElements.userRef(user).update({
       isOnline: true
    })
    .catch(error => {
        console.log(error.message);
    });
}

export const setOffline = (user) => {
    FirebaseElements.userRef(user).update({
       isOnline: false
    })
    .catch(error => {
        console.log(error.message);
    });
}


const isOnline = (userID) => {
FirebaseElements.otherUser(userID).once("value", snap => {
        var data = snap.val();
        if(data.isOnline == false){
        $(".online-status").text("Offline");
        $(".online-status").removeClass("online");
        $(".online-status").addClass("offline");
        }else{
            $(".online-status").text("Online");
            $(".online-status").removeClass("offline");
            $(".online-status").addClass("online");
        }
    });
}

export async function signUp(userEmail, userPassword) {
const newUser = await firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword);
    return newUser;
}

export async function signIn(userEmail, userPassword) {
    const signedIn = await firebase.auth().signInWithEmailAndPassword(userEmail, userPassword); 
    return signedIn;
}

export function signInWithPersistence(userEmail, userPassword, persistenceType){
firebase.auth().setPersistence(persistenceType).catch(error => {
    console.log(error.message);
});
return signIn(userEmail, userPassword);
}

export async function signInAsGuest() {
    const guestUser =  await firebase.auth().signInAnonymously();
    return guestUser;
}

export const signOut = () => {
    setOffline(firebase.auth().currentUser);
firebase.auth().signOut().then(function() {
        console.log("Signed out!!");
    }).catch(function (error) {
    });
}

export const uploadPicture = (file, userID, meta, type) => {
    if(type === "profilePic"){
        return FirebaseElements.profilePicRef.child(`avi-img-${uniqid()}`).put(file, meta);
    }else if(type === "coverPic"){
        return FirebaseElements.coverPicRef.child(userID).put(file, meta);
    }
}

export const updateProfilePicture = url => {
    firebase.auth().currentUser.updateProfile({
        photoURL: url
    }).catch(function (error) {
        console.log(error);
    });
}

export const getTimeStamp = () => {return firebase.database.ServerValue.TIMESTAMP};

export const getUploadStateChanged = () =>{return firebase.storage.TaskEvent.STATE_CHANGED};

export const setProfileInfo = (user) => {
    FirebaseElements.userRef(user).update({
        usersFullName: "not set",
        usersEmail: user.email,
        photoURL: user.photoURL,
        usersID: user.uid,
        addedAt: getTimeStamp()
    }).catch(error => {
        console.log(error.message);
    });
}

export const setUserBio = (user, bioText) => {
    FirebaseElements.userRef(user).update({
        userBio: bioText,
        addedAt: getTimeStamp()
    }).catch(error => {
        console.log(error.message);
    });
}

export const setLinks = (user, linksURL, linkName) => {
    FirebaseElements.userRef(user).update({
        linkName: linkName,
        userLinks: linksURL,
        addedAt: getTimeStamp()
    }).catch(error => {
        console.log(error.message);
    });
}

export const setUsername = (user, usernameText) => {
    FirebaseElements.userRef(user).update({
        displayName: usernameText,
        addedAt: getTimeStamp()
    }).catch(error => {
        console.log(error.message);
    });
}

export const setCoverPhoto = (user, url) => {
    FirebaseElements.userRef(user).update({
        coverPic: url,
        addedAt: getTimeStamp()
    }).catch(error => {
        console.log(error.message);
    });
}

export const setProfilePhoto = (user, url) => {
    FirebaseElements.userRef(user).update({
        photoURL: url,
        addedAt: getTimeStamp()
    }).catch(error => {
        console.log(error.message);
    });
}

export const getProfileInfoFromDB = user => {
    FirebaseElements.userRef(user).once('value', function(snapshot) {
        var data = snapshot.val();
        if(data){
            ProfileElements.bioDesc.text(data.userBio);
            ProfileElements.userName.text(data.displayName);
            ProfileElements.linkName.text(data.linkName);
            ProfileElements.linkURL.attr("href", data.userLinks);
        }
    }).catch(error => {
        console.log(error.message);
    });
};

// Currently not needed but will keep just in case!!

// export const getPostType = (user, type) => {
//     var isMyPost;
//     if(type === "myPost"){
//         isMyPost = FirebaseElements.getPostsRef(user);
//     }else{
//         isMyPost = FirebaseElements.allPosts(user);
//     }
//     return isMyPost;
// }
//////////////////////////////////////////////////////

export const addNewPost = (user, postText, username, type) => {
    FirebaseElements.getMyPostsRef(user).push().set({
    displayName: username,
    photoThumb: user.photoURL,
    postBody: postText,
    postID: uniqid(),
    addedAt: getTimeStamp()
}).then(() => {
    FirebaseElements.allPosts.push().set({
        userID: user.uid,
        displayName: username,
        photoThumb: user.photoURL,
        postBody: postText,
        addedAt: getTimeStamp()
    });
})
.catch(error => {
    console.log(error.message);
});
}

export const addAsFriend = userID => {
    firebase.database().ref(`/users/${userID}`).once("value", snapshot => {
        var data = snapshot.val();
        FirebaseElements.newFriendRef(firebase.auth().currentUser, userID).update({
            userID: userID,
            displayName: data.displayName,
            photoThumb: data.photoURL
        });
    });
}


export const getMyPosts = (user, ele) => {
    FirebaseElements.getMyPostsRef(user).once('value', function(snapshot) {
        snapshot.forEach(function(childData) {
          var postData = childData.val();
          var postHTML = `<div class="card border-0 rounded-lg my-3 mx-auto myPostCards" id="${postData.postID}">
          <div class="card-header pb-0 border-0 bg-white">
          <img src="${postData.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2">
          <p class="username w-0 mt-1 mb-0">${postData.displayName}</p>
          <p class="postDate w-auto mt-0">${moment(postData.addedAt).fromNow()}</p>
          </div>
          <hr class="mx-auto" style="width:90%">
        <div class="card-body pt-0 px-4 text-dark border-0">
          <p class="card-text postText">${postData.postBody}</p>
        </div>`;
          const item = document.querySelector(`${ele}`);
          if(item){
            item.insertAdjacentHTML('beforeend', postHTML);
          }
        });
      });
    }

export const getOtherUsersPosts = (userID, ele) => {
        FirebaseElements.otherUsersPostsRef(userID).once('value', function(snapshot) {
            snapshot.forEach(function(childData) {
              var postData = childData.val();
              var postHTML = `<div class="card border my-3 mx-auto myPostCards" id="${postData.postID}">
              <div class="card-header">
              <img src="${postData.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2">
              <p class="username w-0 mt-1 mb-0">${postData.displayName}</p>
              <p class="postDate w-auto mt-0">${moment(postData.addedAt).fromNow()}</p>
              </div>
            <div class="card-body text-dark">
              <p class="card-text postText">${postData.postBody}</p>
            </div>`;
              const item = document.querySelector(`${ele}`);
              if(item){
                item.insertAdjacentHTML('beforeend', postHTML);
              }
            });
          });
    }

    export const getFriendsPosts = (user, ele) => {
        FirebaseElements.friendsRef(user).once("value", snap => {
            snap.forEach(item => {
                var friendData = item.val();

                FirebaseElements.allPosts.once("value", snap => {
                    snap.forEach(item => {
                        var postData = item.val();
                        if(friendData.userID === postData.userID){
                            var postHTML = `<div class="card border-0 rounded-lg my-3 mx-auto">
                            <div class="card-header pb-0 border-0 bg-white">
                            <img src="${postData.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2">
                            <p class="username w-0 mt-1 mb-0">${postData.displayName}</p>
                            <p class="postDate w-auto mt-0">${moment(postData.addedAt).fromNow()}</p>
                            </div>
                            <hr class="mx-auto" style="width:90%">
                            <div class="card-body pt-0 px-4 text-dark border-0">
                            <p class="card-text postText">${postData.postBody}</p>
                            </div>`;
                            const item = document.querySelector(`${ele}`);
                        if(postData){
                            item.insertAdjacentHTML('beforeend', postHTML);
                        }
                        }
                    });
                });
            });
        });
    }

    export const viewFriends = (user, ele) => {
        var postHTML;
    FirebaseElements.friendsRef(user).once("value", snapshot => {
        snapshot.forEach(dataChild => {
            var data = dataChild.val();
            var url = `http://localhost:8080/view-profile.html?id=${data.userID}`;
            postHTML = `<div class="friend-item mx-auto rounded-lg bg-white clearfix mb-2" id="${data.userID}">
            <img src="${data.photoThumb}" alt="" class="img img-thumbnail float-left friendsPhoto rounded-circle friend-profile-pic-src m-2">
            <p class="friend-username mt-2 mb-0"><a href="${url}">${data.displayName}</a></p>
            <p class="online-status">${isOnline(data.userID)}</p>
        </div>`;
        var item = document.querySelector(ele);
        if(item){
         item.insertAdjacentHTML('beforeend', postHTML);
        }
        });
    });
    }

export const getUserInfo = () => {
    return UserInformation;
}