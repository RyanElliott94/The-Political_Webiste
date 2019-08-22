    const $ = require("jquery");
    import * as firebase from "../models/Firebase";

    const Elements = {
        emailTextbox: $("#emailLab"),
        passTextbox: $("#passLab"),
        fullName: $("#nameLab"),
        loginBtn: $(".btn-register"),
        errorAlert: $(".alert")
    }


    Elements.loginBtn.on("click", () => {
        firebase.signUp(Elements.emailTextbox.val(), Elements.passTextbox.val()).then(user => {
            firebase.setUserInfo(user);
            // firebase.setProfileInfo(user, Elements.fullName.val());
            // window.location.href = '../edit-profile.html';
        })
        .catch(error => {
            switch(error.code){
                case "auth/email-already-in-use":
                        Elements.errorAlert.css({
                            display: "block"
                        });
                        Elements.errorAlert.toggleClass(".error");
                        Elements.errorAlert.text("Sorry, This Email-Address already exists! Please try again.");
                break;
            }
    });
    });
