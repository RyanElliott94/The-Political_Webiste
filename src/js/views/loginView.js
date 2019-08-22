    const $ = require("jquery");
    import * as firebase from "../models/Firebase";
    import "firebase/auth";

    const Elements = {
        emailTextbox: $("#emailLab"),
        passTextbox: $("#passLab"),
        loginBtn: $(".btn-login"),
        RememberMe: $(".remBox"),
        errorAlert: $(".alert")
    }
    const getCheckboxState = () => {
        let isChecked = Elements.RememberMe.is(":checked");
        if(isChecked === true){
            isChecked = firebase.localPers;
        }else{
            isChecked = firebase.sessPers;
        }
        return isChecked;
    }

    $(document).ready(() => {
        Elements.loginBtn.on("click", () => {
                firebase.signInWithPersistence(Elements.emailTextbox.val(), Elements.passTextbox.val(), getCheckboxState())
                .then(user => {
                    firebase.setUserInfo(user);
                    // firebase.setProfileInfo(user);
                    window.location.href = '../profile.html';
                })
                .catch(error => {
                    console.log(error);
                    switch(error.code){
                        case "auth/invalid-email":
                                Elements.errorAlert.css({
                                    display: "block"
                                });
                                Elements.errorAlert.toggleClass(".error");
                                Elements.errorAlert.text("Sorry, This Email-Address is not valid! Please try again.");
                        break;
                        case "auth/user-not-found":
                                Elements.errorAlert.css({
                                    display: "block"
                                });
                                Elements.errorAlert.toggleClass(".error");
                                Elements.errorAlert.text("Sorry, I don't seem to be able to find you! Please try again.");
                        break;
                        case "auth/wrong-password":
                                Elements.errorAlert.css({
                                    display: "block"
                                });
                                Elements.errorAlert.toggleClass(".error");
                                Elements.errorAlert.text("Sorry, That password doesn't quite match! Please try again.");
                        break;
                    }
                });
        });
    });