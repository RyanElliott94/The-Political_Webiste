const $ = require("jquery");
import firebase from "firebase/app";
import * as app from "../models/Firebase";

const Elements = {
            profilePic: $(".view-profile-pic-src"),
            coverPic: $(".view-cover-pic-src"),
            username: $(".view-username"),
            bioView: $(".view-bio-desc"),
            links: $(".view-links")
        }

        var url = window.location.href;
        var id = url.substring(url.lastIndexOf('=') + 1);

        $(document).ready(() => {
            viewProfileInfo(id);
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