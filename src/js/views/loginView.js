    const $ = require("jquery");
    import * as firebase from "../models/Firebase";
    import "firebase/auth";

    const Elements = {
        emailTextbox: $("#emailLab"),
        passTextbox: $("#passLab"),
        loginBtn: $(".btn-login"),
        RememberMe: $(".remBox")
    }
    const getCheckboxState = () => {
        let isChecked = Elements.RememberMe.is(":checked");
        if(isChecked === true){
            isChecked = firebase.sessPers;
        }else{
            isChecked = firebase.noPers;
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
                        break;
                        case "auth/user-not-found":
                        break;
                        case "auth/wrong-password":
                        break;
                    }
                });
        });
    });