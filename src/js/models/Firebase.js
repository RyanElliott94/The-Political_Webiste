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
import PostHTML from "./PostHTML";
import Comments from "./Comments";
import MessageHTML from "./MessageHTML";
import { finished } from "stream";
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
        listenForRemovedPosts(user);
        listenForRemovedComments();
        if(window.location.pathname.includes("/profile.html")){
            setMyUser(user);
        }else if(window.location.pathname.includes("/index.html")){
            setHomeUser(user);
        }
        setUserInfo(user);
        setProfileInfo(user);
        getProfileInfoFromDB(user);
        getMessages();
        $(".logged-out").toggleClass("logged-out");
        $(".hide-home").toggleClass("hide-home");
    }else{
        $(".hide").toggleClass("hide");
        $(".logged-in").toggleClass("logged-in");
    }
});


export const getPosts = (user, type, ele) => {
    FirebaseElements.allPosts.on("child_added", snap => {
        var postData = snap.val();
        var postID = snap.key;
        var postHtml = new PostHTML(postID, postData.photoThumb, postData.addedAt, postData.postBody, postData.displayName, postData.postIMG, postData.postVid, getNumLikes(postID), getNumComments(postID), user, postData.userID);
    if(user && postData.userID == user.uid && type === "my-posts"){
               const mainItem = $(ele);
               $(mainItem).prepend(postHtml.getMyHTML());
                postHtml.whosLiked(postID);
                postHtml.getComments(postID);
                
     }else if(type === "friends-posts"){
        FirebaseElements.friendsRef(user).once("value", snap => {
            snap.forEach(item => {
                var friendData = item.val();
            if(friendData.userID === postData.userID){
            const item = document.querySelector(ele);
            if(item){
                $(item).prepend(postHtml.getHTML());
                postHtml.whosLiked(postID);
                postHtml.getComments(postID);
            }
                }
            });
        });
     }else if(postData.userID == user && type === "profile-posts"){
              const item = $(ele);
            //   const tabItem = $(ele);
          if(item){
            $(item).prepend(postHtml.getHTML());
            // $(tabItem).prepend(postHtml.getHTML());
            postHtml.whosLiked(postID);
            postHtml.getComments(postID);
          }
     }
   });
}

const getNumLikes = (postID) => {
    var numLikes = 0;
    FirebaseElements.getLikeInfoRef(postID).once("value", snap => {
        numLikes = snap.numChildren();
    });
    return numLikes;
}

const getNumComments = (postID) => {
    var numComments = 0;
    FirebaseElements.commentsRef(postID).once("value", snap => {
        numComments = snap.numChildren();
    });
    return numComments;
}


export const listenForReply = (messageID) => {
    $(".msg-items").remove();
    FirebaseElements.newMessageRef(messageID).off();
    FirebaseElements.getMessageUsersRef(messageID).once("value", snapshot => {
        snapshot.forEach(data => {
            var sender = data.val().senderID;
            var currUserID = data.val().currUserID;
            var otherUserID = data.val().otherID;
            if(currUserID == getUserInfo().currentUser.uid || otherUserID == getUserInfo().currentUser.uid){
                FirebaseElements.newMessageRef(messageID).on("child_added", data => {
                    var msgData = data.val();
                        var sender = msgData.senderID;
                        var html = new MessageHTML(messageID, getUserInfo().currentUser.photoURL, msgData.sentAt, msgData.messageText, "", "", "", getUserInfo().currentUser, sender, msgData.read);
                        const viewMessages = $(".listItems");
                        if(viewMessages){
                            $(viewMessages).append(html.getMessageItem());
                        }
                });
            }
        });
    });
}

const listenForRemovedPosts = user => {
    FirebaseElements.getMyPostsRef(user).on('child_removed', function(snapshot) {
        var postID = snapshot.key;
        const item = $(`#${postID}`);
        if(item){
          item.remove();
        }
    });
}

export const listenForRemovedComments = () => {
    FirebaseElements.allCommentsRef().on('child_removed', function(snapshot) {
        var postID = snapshot.key;
        const item = $(`#${postID}`);
        if(item){
          item.remove();
        }
    });
}

export const removeListeners = () => {
    FirebaseElements.allPosts.off();
}

export const listenForChanges = (id, type) => {
    switch(type){
        case "messages":
                FirebaseElements.getMessageUsersRef(id).once("value", snapshot => {
                    snapshot.forEach(data => {
                        var sender = data.val().senderID;
                        var currUserID = data.val().currUserID;
                        var otherUserID = data.val().otherID;
                        if(currUserID == getUserInfo().currentUser.uid || otherUserID == getUserInfo().currentUser.uid){
                            FirebaseElements.newMessageRef(id).on("child_changed", data => {
                                var msgData = data.val();
                                    var sender = msgData.senderID;
                                    var html = new MessageHTML(id, getUserInfo().currentUser.photoURL, msgData.sentAt, msgData.messageText, "", "", "", getUserInfo().currentUser, sender, msgData.read);
                            });
                        }
                    });
                });
        break;
        case "posts":

        break;
        case "likes":
            FirebaseElements.getLikeInfoRef(id).off();
            FirebaseElements.getLikeInfoRef(id).on("child_added", snap => {
                var numLikes = snap.numChildren() -1;
                var html = new PostHTML(id, null, null, null, null, null, null, numLikes, getUserInfo().currentUser);
                html.whosLiked(id);
                html.updateLikes(id, numLikes);
            });
        break;
        case "remove-like":
                FirebaseElements.getLikeInfoRef(id).off();
                FirebaseElements.getLikeInfoRef(id).once("value", snap => {
                    var numLikes = snap.numChildren();
                    $(`#${id}`).find(".icon").removeClass("fas").addClass("far").removeClass("liked");
                    $(`#${id}`).find(".like-post span").text(numLikes);
                    $(`#${id}`).find(".f-like-post span").text(numLikes);
                });
        break;
    }
}

export const FirebaseElements = {
    coverPicRef: firebase.storage().ref('coverPictures/'),
    postPicRef: firebase.storage().ref('postPictures/'),
    postVidRef: firebase.storage().ref('postVideos/'),
    msgPicRef: firebase.storage().ref('msgPictures/'),
    msgVidRef: firebase.storage().ref('msgVideos/'),
    profilePicRef: firebase.storage().ref('profilePictures/'),
    allUsers: firebase.database().ref('/users/'),
    allPosts: firebase.database().ref(`/posts/`),
    findMessages: firebase.database().ref(`/threads/`),
    allPostsByID: postID => {
        return firebase.database().ref(`/posts/${postID}`)
    },
    allCommentsRef: (postID) => {
        return firebase.database().ref(`posts/${postID}/comments/`)
    },
    commentsRef: (postID) => {
        return firebase.database().ref(`posts/${postID}/comments/`)
    },
    newCommentRef: (postID) => {
        return firebase.database().ref(`posts/${postID}/comments/com_${uniqid()}`)
    },
    addLikedRef: (postID, user) => {
        return firebase.database().ref(`/posts/${postID}/likedBy/${user.uid}/`)
    },
    getLikeInfoRef: (postID) => {
        return firebase.database().ref(`/posts/${postID}/likedBy/`)
    },
    removeLikeRef: (postID, user) => {
        return firebase.database().ref(`/posts/${postID}/likedBy/${user.uid}`)
    },
    DelCommentRef: (postID, commentID) => {
        return firebase.database().ref(`/posts/${postID}/comments/${commentID}`)
    },
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
    newPostRef: (user, id) => {
        return firebase.database().ref(`/users/${user.uid}/posts/${id}`)
    },
    deletePostRef: (user, postID) => {
        return firebase.database().ref(`/users/${user.uid}/posts/${postID}`)
    },
    otherUser: userID => {
        return firebase.database().ref(`/users/${userID}/`)
    },
    newMessageRef: (id) => {
        return firebase.database().ref(`/threads/${id}/messages/`)
    },
    addUsersToMsgRef: (id) => {
        return firebase.database().ref(`/threads/${id}/users`)
    },
    getMessageDataRef: (id) => {
        return firebase.database().ref(`/threads/${id}/messages/`)
    },
    getMessageUsersRef: (id) => {
        return firebase.database().ref(`/threads/${id}/users/`)
    },
    getMessageItemRef: (messageID, messageItem) => {
        return firebase.database().ref(`/threads/${messageID}/messages/${messageItem}/`)
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

export const setMessageAsRead = (messageID) => {
    FirebaseElements.newMessageRef(messageID).once("value", snap => {
        snap.forEach(data => {
            var msgData = data.val();
            if(!msgData.read){
                if(msgData.senderID != getUserInfo().currentUser.uid){
                    FirebaseElements.getMessageItemRef(messageID, data.key).update({
                        read: true
                    });
                }
            }
        });
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
    }else if(type === "post-img"){
        return FirebaseElements.postPicRef.child(`post-img-${uniqid()}`).put(file, meta);
    }else if(type === "post-vid"){
        return FirebaseElements.postVidRef.child(`post-vid-${uniqid()}`).put(file, meta);
    }else if(type === "msg-img"){
        return FirebaseElements.msgPicRef.child(`msg-img-${uniqid()}`).put(file, meta);
    }else if(type === "msg-vid"){
        return FirebaseElements.msgVidRef.child(`msg-vid-${uniqid()}`).put(file, meta);
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
    })
    .then(() => {
        user.updateProfile({
            displayName: usernameText,
          }).catch(function(error) {
            // An error happened.
          });
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

export const addNewMessage = (msgBody, msgIMG, msgVid, read, currUserID, otherUserID) => {
    let ranID = uniqid();
    FirebaseElements.newMessageRef(ranID).push().set({
        sentAt: getTimeStamp(),
        messageText: msgBody,
        msgImg: msgIMG,
        msgVid: msgVid,
        read: read,
        senderID: currUserID
    }).finally(() => {
        FirebaseElements.addUsersToMsgRef(ranID).push({
            otherID: otherUserID,
            currUserID: currUserID
        });
    });
}

export const addMessageReply = (msgID, msgBody, msgIMG, msgVid, read, currUserID) => {
    FirebaseElements.newMessageRef(msgID).push().set({
        sentAt: getTimeStamp(),
        messageText: msgBody,
        msgImg: msgIMG,
        msgVid: msgVid,
        read: read,
        senderID: currUserID
    });
}

export const addNewPost = (user, postText, username, imgURL, vidURL) => {
    let ranID = uniqid();
    FirebaseElements.newPostRef(user, ranID).set({
    displayName: username,
    photoThumb: user.photoURL,
    userID: user.uid,
    postBody: postText,
    postIMG: imgURL,
    postVid: vidURL,
    addedAt: getTimeStamp()
}).finally(() => {
    addPostToAllPosts(user, postText, username, ranID, imgURL, vidURL, 0, getTimeStamp());
})
.catch(error => {
    console.log(error.message);
});
}

export const addPostToAllPosts = (user, postText, username, id, imgURL, vidURL, likes, added) => {
    FirebaseElements.allPostsByID(id).set({
        displayName: username,
        photoThumb: user.photoURL,
        userID: user.uid,
        postBody: postText,
        postIMG: imgURL,
        postVid: vidURL,
        addedAt: added
     });
}

export const addNewComment = (commentText, username, userID, userPhoto, postID) => {
    FirebaseElements.newCommentRef(postID).set({
        postID: postID,
        commentText: commentText,
        added: getTimeStamp(),
        userName: username,
        userPhoto: userPhoto,
        userID: userID
    });
}

export const likedPosts = (user, postID) => {
  FirebaseElements.addLikedRef(postID, user).set({
        postID: postID,
        userID: user.uid
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

export const removeFriend = userID => {
    FirebaseElements.newFriendRef(firebase.auth().currentUser, userID).remove();
}

export const deletePost = (user, postID) => {
       FirebaseElements.deletePostRef(user, postID).remove();
       FirebaseElements.allPostsByID(postID).remove();
}

export const deletePostImage = (file) => {
    firebase.storage().ref(`postPictures/${file}`).delete();
}

export const deletePostVideo = (file) => {
    firebase.storage().ref(`postVideos/${file}`).delete();
}

export const deleteOldDP = (file) => {
    firebase.storage().ref(`profilePictures/${file}`).delete();
}


export const viewMessage = (messageID, msgView) => {
            FirebaseElements.getMessageUsersRef(messageID).once("value", snapshot => {
                snapshot.forEach(data => {
                    var sender = data.val().senderID;
                    var currUserID = data.val().currUserID;
                    var otherUserID = data.val().otherID;
                    if(currUserID == getUserInfo().currentUser.uid || otherUserID == getUserInfo().currentUser.uid){
                        FirebaseElements.getMessageDataRef(messageID).once("value", snap => {
                            snap.forEach(data => {
                                var msgData = data.val();
                                var sender = msgData.senderID;
                                var html = new MessageHTML(messageID, getUserInfo().currentUser.photoURL, msgData.sentAt, msgData.messageText, "", "", "", getUserInfo().currentUser, sender);
                                const viewMessages = $(msgView);
                                if(viewMessages){
                                    $(viewMessages).before(html.viewMessage());
                                }
                            });
                        });
                    }
                });
            });
}

export const getMessages = (msgUsers) => {
    FirebaseElements.findMessages.once("value", sp => {
        sp.forEach(dt => {
            var messageID = dt.key;
            FirebaseElements.getMessageUsersRef(messageID).once("value", snapshot => {
                snapshot.forEach(data => {
                    var currUserID = data.val().currUserID;
                    var otherUserID = data.val().otherID;
                    var currUser = getUserInfo().currentUser;
                   
                    if(currUserID == currUser.uid || otherUserID == currUser.uid){
                        FirebaseElements.otherUser(getMessageOwner(currUserID, otherUserID)).once("value", snap => {
                            var userData = snap.val();
                            var html = new MessageHTML(messageID, userData.photoURL, "", "", userData.displayName, "", "", getUserInfo().currentUser);
                            const viewMsgUsers = $(msgUsers);
                            if(viewMsgUsers){
                                $(viewMsgUsers).append(html.getMessages());
                                getLastMessage();
                            }
                    });
                    }
                });
            })
        });
    });
}

export const getLastMessage = () => {
        var links = Array.from($(".nav-link"));
                links.forEach(item => {
                    var messageID = $(item).attr("id");
                    if(messageID){
                        FirebaseElements.newMessageRef(messageID).limitToLast(2).once("value", snap => {
                            snap.forEach(data => {
                                if(data.val().read){
                                    $(".no-msg").text(`Sorry, ${getUserInfo().currentUser.displayName} you don't have any new messages!`);
                                }else{
                                    $(".no-msg").text(`Whey! ${getUserInfo().currentUser.displayName} you have some new messages!`);
                                }
                               $(item).find(".msg-preview").text(data.val().messageText);
                    });
            });
                    }
    });
}

export const getMessageInfo = (messageID) => {
    FirebaseElements.getMessageUsersRef(messageID).once("value", snapshot => {
        snapshot.forEach(data => {
            var currUserID = data.val().currUserID;
            var otherUserID = data.val().otherID;
            var whichUser = currUserID;
                FirebaseElements.otherUser(getMessageOwner(currUserID, otherUserID)).once("value", snap => {
                        var userData = snap.val();
                        var html = new MessageHTML(messageID, userData.photoURL, "", "", userData.displayName, "", "", getUserInfo().currentUser, "", "");
                        html.coverInfo(userData.photoURL, userData.displayName, userData.coverPic, userData.isOnline, userData.addedAt);
                });
        });
    })
}

const getMessageOwner = (currUserID, otherUserID) => {
    var whichUser = currUserID;
        if(currUserID == getUserInfo().currentUser.uid){
            whichUser = otherUserID;
        }else{
             whichUser = currUserID;
        }
        return whichUser;
}

    export const deleteFile = type => {
        if(type === "postVid"){
            var vidURL = $(".post-vid").attr("src");
            var newVUrl = new URL(vidURL);
            var url = newVUrl.pathname;
            var vidName = url.substring(url.lastIndexOf('F') + 1);
            deletePostVideo(vidName);
        }else if(type === "postImg"){
            var imgURL = $(".post-img").attr("src");
            var newPUrl = new URL(imgURL);
            var url = newPUrl.pathname;
            var imgName = url.substring(url.lastIndexOf('F') + 1);
            deletePostImage(imgName);
        }
    }

  
    export const viewFriends = (user, ele) => {
        var postHTML;
    FirebaseElements.friendsRef(user).once("value", snapshot => {
        snapshot.forEach(dataChild => {
            var data = dataChild.val();
            var url = `./view-profile.html?id=${data.userID}&isFriend=true`;

            postHTML = `<div class="friend-item mx-auto shadow-sm rounded-lg bg-white clearfix mb-2 mt-2" id="${data.userID}">
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

    export const removeClickListeners = () => {
        $(".close").off("click");
        $(".comment-post").off("click");
        $(".btn-new-comm").off("click");
        $(".like-post").off("click");
    }

    export const setupClicks = () => {
        $(".content").on("click", ".close", function(event) {
                var id = $(event.target).closest(".myPostCards").attr("id");
        
                var vidEle = $(".post-vid").attr("src");
                var imgURL = $(".post-img").attr("src");
                if(vidEle.includes("http")){
                    deleteFile("postVid");
                }else if(imgURL.includes("http")){
                    deleteFile("postImg");
                }
                    deletePost(firebase.auth().currentUser, id);
                });

                $(".content").on("click", ".comment-post", eve => {
                    var id = $(event.target).closest(".myPostCards").attr("id");
                    $(`#${id}`).find(".comments").fadeToggle(1000);
                });
    
                $(".content").on("click", ".btn-new-comm", (event) => {
                        var id = $(event.target).closest(".myPostCards").attr("id");
                        var commentText = $(event.target).closest(".myPostCards").find(".commBox").val();
                        var user = firebase.auth().currentUser;
                        addNewComment(commentText, user.displayName, user.uid, user.photoURL, id);
                        $(commentText).val("");
                    });

                    $(".content").on("click", ".like-post", (event) => {
                        var id = $(event.target).closest(".myPostCards").attr("id");
                        FirebaseElements.removeLikeRef(id, getUserInfo().currentUser).once("value", snap => {
                            if(snap.exists()){
                                FirebaseElements.removeLikeRef(id, getUserInfo().currentUser).remove();
                                listenForChanges(id, "remove-like");
                            }else{
                                likedPosts(getUserInfo().currentUser, id);
                                listenForChanges(id, "likes");
                            }
                        });
                      });
                      
                      $(".content").on("click", ".del-com-btn", (eve) => {
                        var cID = $(eve.target).closest(".myPostCards").attr("id");
                        var commentID = $(eve.target).closest(".comment-item").attr("id");
                            app.FirebaseElements.DelCommentRef(cID, commentID).remove();
                            $(`#${commentID}`).remove();
                    });

                $(".post-pic").on("click", function(event) {
                    var id = $(event.target).closest($(".post-img")).attr("src");
                    $(".image-pop").modal("show");
                    $(".view-image").attr("src", id);
                    });
              
              $('.image-pop').on('hidden.bs.modal', function () {
                $(this).modal("dispose");
              });
    }

export const getUserInfo = () => {
    return UserInformation;
}