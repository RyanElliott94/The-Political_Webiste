const $ = require("jquery");
import firebase from "firebase/app";
import * as app from "../models/Firebase";

const Elements = {
            profilePic: $(".view-profile-pic-src"),
            coverPic: $(".view-cover-pic-src"),
            username: $(".view-username"),
            bioView: $(".view-bio-desc"),
            links: $(".view-links"),
            addFriend: $(".add-friend"),
            navLinks: $(".nav-link"),
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
            app.getOtherUsersPosts(userID);
            viewProfileInfo(userID);
        });

        Elements.addFriend.on("click", () => {
            getFriendStatus();
        });

        const viewProfileInfo = (id) => {
            firebase.database().ref(`/users/${id}`).once('value', snapshot => {
                var data = snapshot.val();
                Elements.profilePic.attr("src", data.photoURL);
                Elements.coverPic.attr("src", data.coverPic);
                Elements.username.text(data.displayName);
                Elements.bioView.text(data.userBio);
                Elements.links.text(data.userLinks);
            });
        }

        $(Elements.navLinks).click(function(){
            var id = $(this).attr('id');
            switch(id){
              case "myProPosts-tab":
                        removeItems(".card");
                        app.getOtherUsersPosts(userID);
                  break;
                case "aboutMe-tab":
                        viewProfileInfo(userID);
                  break;
                case "friendList-tab":
                // removeItems(".friend-item");
                // app.viewFriends(app.getUserInfo().currentUser, ".tab-friend-sect");
                  break;
            }
      });

      const removeItems = ele => {
        $(ele).remove();
      }