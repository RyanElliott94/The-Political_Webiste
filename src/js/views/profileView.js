    const $ = require("jquery");
    import "style-loader";
    import * as app from "../models/Firebase";
    import "firebase/auth";
    var uniqid = require('uniqid');
    import {getTempCoverPic} from "../index";

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
        editProfileBtn: $(".edit-profile"),
        confirmEditBtn: $(".confirm-edit"),
        bioDesc: $(".bio-desc"),
        userName: $(".username"),
        links: $(".links"),
        viewProfile: $(".view-user")
    };

    export const setMyUser = (user) => {
        // getMyPosts(user);
        app.fetchCoverPhoto(user, ProfileElements.coverPhotoSrc);
        app.fetchProfilePicture(user, ProfileElements.profilePicSrc);
        }

        const getMyPosts = (user) => {
            app.FirebaseElements.getPostsRef(user).once('value', function(snapshot) {
                snapshot.forEach(function(childData) {
                  var postData = childData.val();
                  var postHTML = `<div class="card border my-3 mx-auto w-50 clearfix" id="${uniqid()}">
                  <div class="card-header">
                  <img src="${postData.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2">
                  <p class="username w-0 mt-1">${postData.displayName}</p></div>
                <div class="card-body text-dark">
                  <p class="card-text postText">${postData.postBody}</p>
                </div>`;
                  const item = document.querySelector(".empty-1")
                  item.insertAdjacentHTML('afterend', postHTML);
                });
              });
            }

    $(document).ready(()=> {
    $(ProfileElements.uploadCoverPhoto).on("click", () => {
            ProfileElements.chooseCoverPic.focus().trigger('click');
        ProfileElements.chooseCoverPic.on('change',(evt) => {
            let res = evt.target.files[0];
            uploadPhoto(res, "coverPic");
        });
    });

    // KEEP FOR FUTURE REFERENCE!!
    // ProfileElements.viewProfile.on("click", () => {
    //     var url = 'http://localhost:8080/view-profile.html?id=TPtJN31snCX3BKFJYMSYcsxirAs2';
    //     window.location.href = url;
    // });

    $(ProfileElements.uploadProfilePic).on("click", () => {
        ProfileElements.chooseProfilePic.focus().trigger('click');
    ProfileElements.chooseProfilePic.on('change',(evt) => {
        let res = evt.target.files[0];
        uploadPhoto(res, "profilePic");
    });
    });


    ProfileElements.editProfileBtn.on("click", () => {
        ProfileElements.toggleEditMode.toggle(1000, () => {
            ProfileElements.confirmEditBtn.toggleClass("confirm-edit");
            ProfileElements.editProfileBtn.css({display: "none"});

            ProfileElements.confirmEditBtn.on("click", () => {
                if(ProfileElements.updateBio.val()){
                    app.setUserBio(app.getUserInfo().currentUser, ProfileElements.updateBio.val());
                }else{
                    ProfileElements.toggleEditMode.toggle();
                    ProfileElements.confirmEditBtn.toggleClass("confirm-edit");
                }
                if(ProfileElements.updateUsername.val()){
                    app.setUsername(app.getUserInfo().currentUser, ProfileElements.updateUsername.val());
                }else{
                    ProfileElements.toggleEditMode.toggle();
                    ProfileElements.confirmEditBtn.toggleClass("confirm-edit");
                }
                if(ProfileElements.updateLinks.val()){
                    app.setLinks(app.getUserInfo().currentUser, ProfileElements.updateLinks.val());
                }else{
                    ProfileElements.toggleEditMode.toggle();
                    ProfileElements.confirmEditBtn.toggleClass("confirm-edit");
                }
            });
        });
    });


    });
    
    const uploadPhoto = (file, type) => {
        const metadata = {
            contentType: 'image/jpg'
        };
        let uploadProfile = app.uploadProfilePicture(file, app.getUserInfo().currentUser.uid, metadata, type)
        uploadProfile.on(app.getUploadStateChanged(),
            (snapshot) => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
                        app.updateProfilePicture(downloadURL);
                        app.setProfilePhoto(app.getUserInfo().currentUser, downloadURL);
                        ProfileElements.profilePicSrc.attr("src", downloadURL);
                    }else if(type === "coverPic"){
                        ProfileElements.coverPhotoSrc.attr("src", downloadURL);
                        app.setCoverPhoto(app.getUserInfo().currentUser, downloadURL);
                    }
                });
            });
    }