    const $ = require("jquery");
    import * as firebase from "../models/Firebase";

    const Elements = {
        emailTextbox: $("#emailLab"),
        passTextbox: $("#passLab"),
        fullName: $("#nameLab"),
        loginBtn: $(".btn-register")
    }


    Elements.loginBtn.on("click", () => {
        firebase.signUp(Elements.emailTextbox.val(), Elements.passTextbox.val()).then(user => {
            firebase.setUserInfo(user);
            firebase.setProfileInfo(user);
            // window.location.href = '../edit-profile.html';
        })
        .catch(error => {
            switch(error.code){
                case "auth/email-already-in-use":
                break;
            }
    });
    });
