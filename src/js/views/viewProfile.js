const $ = require("jquery");
import firebase from "firebase/app";
import * as app from "../models/Firebase";

const Elements = {
            profilePic: $(".view-profile-pic-src"),
            coverPic: $(".view-cover-pic-src"),
            username: $(".view-username"),
            bioView: $(".view-bio-desc"),
            links: $(".view-links"),
            searchUsers: $(".search-users"),
            addFriend: $(".add-friend"),
            navLinks: $(".nav-link"),
            sendMsg: $(".send-msg"),
            newMsg: $(".new-msg"),
            msgText: $("#message-text")
        }

        var oldURL = window.location.href;
        var newUrl = new URL(oldURL);

        var isFriend = newUrl.searchParams.get("isFriend");
        var userID = newUrl.searchParams.get("id");

        const getFriendStatus = () => {
            if(isFriend){
                app.removeFriend(userID);
            }else{
                app.addAsFriend(userID);
            }
        }

        $(document).ready(() => {
            if(isFriend == "true"){
                Elements.addFriend.text("Remove Friend");
            }
            app.getPosts(userID, "profile-posts", ".empty-3");
            viewProfileInfo(userID);
        });

        Elements.addFriend.on("click", () => {
            getFriendStatus();
        });

        Elements.sendMsg.on("click", (eve) => {
            $("#exampleModal").modal("show");
        });

        Elements.newMsg.on("click", eve => {
            app.addNewMessage(Elements.msgText.val(), "", "", false, app.getUserInfo().currentUser.uid, userID);
        });

        const viewProfileInfo = (id) => {
            firebase.database().ref(`/users/${id}`).once('value', snapshot => {
                var data = snapshot.val();
                if(window.location.pathname.includes("view-profile.html")){
                Elements.profilePic.attr("src", data.photoURL);
                Elements.coverPic.attr("src", data.coverPic);
                Elements.username.text(data.displayName);
                Elements.bioView.text(data.userBio);
                Elements.links.text(data.userLinks);
                }
            });
        }

        $(Elements.navLinks).click(function(){
            var id = $(this).attr('id');
            switch(id){
              case "otherPosts-tab":
                        removeItems(".card");
                        app.getPosts(userID, "profile-posts", ".tab-empty-2");
                  break;
                case "about-tab":
                        viewProfileInfo(userID);
                  break;
                case "friendsList-tab":
                // removeItems(".friend-item");
                // app.viewFriends(app.getUserInfo().currentUser, ".f-friend-sect");
                  break;
            }
      });

  
        $(".view-profile-content, .tab-empty-2").on("click", ".comment-post", eve => {
            var id = $(event.target).closest(".myPostCards").attr("id");
            $(`#${id}`).find(".comments").fadeToggle(1000);
        });
  
            $(".view-profile-content, .tab-empty-2").on("click", ".btn-new-comm", (event) => {
                var id = $(event.target).closest(".myPostCards").attr("id");
                var commentText = $(event.target).closest(".myPostCards").find(".commBox").val();
                app.addNewComment(commentText, app.getUserInfo().currentUser.displayName, app.getUserInfo().currentUser.uid, app.getUserInfo().currentUser.photoURL, id);
                $(".commBox").val("");
            });
  
            $(".view-profile-content, .tab-empty-2").on("click", ".like-post", (event) => {
                var id = $(event.target).closest(".myPostCards").attr("id");
                app.FirebaseElements.removeLikeRef(id, app.getUserInfo().currentUser).once("value", snap => {
                    if(snap.exists()){
                        app.FirebaseElements.removeLikeRef(id, app.getUserInfo().currentUser).remove();
                        app.listenForChanges(id, "remove-like");
                    }else{
                        app.likedPosts(app.getUserInfo().currentUser, id);
                        app.listenForChanges(id, "likes");
                    }
                });
              });
  
              $(".view-profile-content, .tab-empty-2").on("click", ".del-com-btn", (eve) => {
                var cID = $(eve.target).closest(".myPostCards").attr("id");
                var commentID = $(eve.target).closest(".comment-item").attr("id");
                    app.FirebaseElements.DelCommentRef(cID, commentID).remove();
                    $(`#${commentID}`).remove();
            });

            $(".view-profile-content, .tab-empty-2").on("click", ".post-pic", function(event) {
                var id = $(event.target).closest($(".post-img")).attr("src");
                $(".image-pop").modal("show");
                $(".view-image").attr("src", id);
                });
          
          $('.image-pop').on('hidden.bs.modal', function () {
            $(this).modal("dispose");
          });

      const removeItems = ele => {
        $(ele).remove();
      }