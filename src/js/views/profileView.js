    const $ = require("jquery");
    import "style-loader";
    import * as app from "../models/Firebase";
    import "firebase/auth";
    var uniqid = require('uniqid');
    import {getDefaultProPic} from "../index";

    // TODO: PUSH USER DETAILS TO DATABASE WHEN UPLOADING THE PROFILE PICTURE. NOT WHEN REGISTERING IS COMEPLETE!!!
    export const ProfileElements = {
        coverPhotoSrc: $(".cover-pic-src"),
        profilePicSrc: $(".profile-pic-src"),
        uploadProfilePic: $("#profile-pic-upload"),
        uploadCoverPhoto: $("#cover-pic-upload"),
        chooseProfilePic: $(".choose-pro-pic"),
        chooseCoverPic: $(".choose-cover-pic"),
        toggleEditMode: $(".edit-mode"),
        updateUsername: $(".setUsername"),
        updateBio: $(".setBio"),
        updateLinks: $(".setLinks"),
        updateLinkName: $(".setLinkName"),
        editProfileBtn: $(".edit-profile"),
        confirmEditBtn: $(".c-edit"),
        bioDesc: $(".bio-desc"),
        userName: $(".username"),
        linkName: $(".link-name"),
        linkURL: $(".open-link"),
        viewProfile: $(".view-user"),
        coverPicProBar: $(".cover-progress"),
        profilePicProBar: $(".profile-progress"),
        navLinks: $(".nav-link"),
        searchUsers: $(".search-users")
    };

    var currUser = null;
    export const setMyUser = (user) => {
        app.setOnline(user);
        getDefaultProPic();
        app.fetchCoverPhoto(user, ProfileElements.coverPhotoSrc);
        app.fetchProfilePicture(user, ProfileElements.profilePicSrc);
        app.getPosts(user, "my-posts", ".empty-2");
        app.viewFriends(user, ".friend-sect");
        if(ProfileElements.navLinks.is(":hidden")){
            showElements(ProfileElements.editProfileBtn);
            showElements(ProfileElements.bioDesc);
            showElements(ProfileElements.userName);
            showElements(ProfileElements.links);
        }else if(ProfileElements.navLinks.is(":visible")){
            removeItems(".card");
            app.getPosts(user, "my-posts", ".my-tab-posts");
        }
        currUser = user;
        }

     
            $(".empty-2, .tab-empty").on("click", ".close", function(event) {
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
        
              $(".empty-2, .tab-empty").on("click", ".comment-post", eve => {
                  var id = $(event.target).closest(".myPostCards").attr("id");
                  $(`#${id}`).find(".comments").fadeToggle(1000);
              });
        
                  $(".empty-2, .tab-empty").on("click", ".btn-new-comm", (event) => {
                      var id = $(event.target).closest(".myPostCards").attr("id");
                      var commentText = $(event.target).closest(".myPostCards").find(".commBox").val();
                      console.log(commentText);
                      app.addNewComment(commentText, currUser.displayName, currUser.uid, currUser.photoURL, id);
                      $(".commBox").val("");
                  });
        
                  $(".empty-2, .tab-empty").on("click", ".like-post", (event) => {
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
        
                    $(".empty-2, .tab-empty").on("click", ".del-com-btn", (eve) => {
                      var cID = $(eve.target).closest(".myPostCards").attr("id");
                      var commentID = $(eve.target).closest(".comment-item").attr("id");
                          app.FirebaseElements.DelCommentRef(cID, commentID).remove();
                          $(`#${commentID}`).remove();
                  });
          
                  $(".empty-2, .tab-empty").on("click", ".post-pic", function(event) {
                    var id = $(event.target).closest($(".post-img")).attr("src");
                    $(".image-pop").modal("show");
                    $(".view-image").attr("src", id);
                    });
              
              $('.image-pop').on('hidden.bs.modal', function () {
                $(this).modal("dispose");
              });

    $(ProfileElements.uploadCoverPhoto).on("click", () => {
            ProfileElements.chooseCoverPic.focus().trigger('click');
        ProfileElements.chooseCoverPic.on('change',(evt) => {
            let res = evt.target.files[0];
            ProfileElements.coverPicProBar.css({display: "block"});
            uploadPhoto(res, "coverPic", evt.target.files[0].type);
        });
    });

    $(ProfileElements.uploadProfilePic).on("click", () => {
        ProfileElements.chooseProfilePic.focus().trigger('click');
    ProfileElements.chooseProfilePic.on('change',(evt) => {
        let res = evt.target.files[0];
        
        ProfileElements.profilePicProBar.css({display: "block"});
        uploadPhoto(res, "profilePic", evt.target.files[0].type);
    });
    });


    ProfileElements.editProfileBtn.on("click", () => {
        ProfileElements.toggleEditMode.toggle(1000, () => {
            hideElements(ProfileElements.editProfileBtn);
            hideElements(ProfileElements.bioDesc);
            hideElements(ProfileElements.userName);
            hideElements(ProfileElements.links);
            showElements(ProfileElements.confirmEditBtn);
        });
    });

    ProfileElements.confirmEditBtn.on("click", () => {
        if(!ProfileElements.updateBio.val() && !ProfileElements.updateUsername.val() && !ProfileElements.updateLinks.val()){
            ProfileElements.toggleEditMode.toggleClass();
            hideElements(ProfileElements.confirmEditBtn);
        }
        if(ProfileElements.updateBio.val()){
            app.setUserBio(app.getUserInfo().currentUser, ProfileElements.updateBio.val());
        }
        if(ProfileElements.updateUsername.val()){
            app.setUsername(app.getUserInfo().currentUser, ProfileElements.updateUsername.val());
        }
        if(ProfileElements.updateLinks.val()){
            app.setLinks(app.getUserInfo().currentUser, ProfileElements.updateLinks.val(), ProfileElements.updateLinkName.val());
        }

        ProfileElements.toggleEditMode.toggle(1000, () => {
        showElements(ProfileElements.editProfileBtn);
        showElements(ProfileElements.bioDesc);
        showElements(ProfileElements.userName);
        showElements(ProfileElements.links);
        hideElements(ProfileElements.confirmEditBtn);

        });
    });

    $(ProfileElements.navLinks).on("click", function(){
        var id = $(this).attr('id');
        switch(id){
          case "myPosts-tab":
            removeItems(".card");
            app.getPosts(app.getUserInfo().currentUser, "my-posts", ".tab-empty");
              break;
            case "aboutMe-tab":
                    showElements(ProfileElements.editProfileBtn);
                    showElements(ProfileElements.bioDesc);
                    showElements(ProfileElements.userName);
                    showElements(ProfileElements.links);
              break;
            case "friendList-tab":
            removeItems(".friend-item");
            app.viewFriends(app.getUserInfo().currentUser, ".tab-friend-sect");
              break;
        }
  });
    
    const hideElements = ele => {
        $(ele).css({display: "none"});
    }

    const showElements = ele => {
        $(ele).css({display: "block"});
    }

    const removeItems = ele => {
        $(ele).remove();
      }

    const uploadPhoto = (file, type, fileType) => {
        const metadata = {
            contentType: fileType
        };
        let uploadProfile = app.uploadPicture(file, app.getUserInfo().currentUser.uid, metadata, type)
        uploadProfile.on(app.getUploadStateChanged(),
            (snapshot) => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if(type === "profilePic"){
                    ProfileElements.profilePicProBar.text(`${Math.round(progress)}%`);
                }else if(type === "coverPic"){
                    ProfileElements.coverPicProBar.text(`${Math.round(progress)}%`);
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
                    if(type === "profilePic"){
                        var oldURL = $(".profile-pic-src").attr("src");
                        var newUrl = new URL(oldURL);
                        var url = newUrl.pathname;
                        var filename = url.substring(url.lastIndexOf('F') + 1);

                        ProfileElements.profilePicProBar.css({display: "none"});
                        app.updateProfilePicture(downloadURL);
                        app.setProfilePhoto(app.getUserInfo().currentUser, downloadURL);
                        ProfileElements.profilePicSrc.attr("src", downloadURL);
                    }else if(type === "coverPic"){
                        ProfileElements.coverPicProBar.css({display: "none"});
                        ProfileElements.coverPhotoSrc.attr("src", downloadURL);
                        app.setCoverPhoto(app.getUserInfo().currentUser, downloadURL);
                    }
                });
            });
    }