var $ = require("jquery");
import {initFirebase} from "../models/FirebaseInit";
import firebase from "firebase/app";
require("firebase/auth");
require("firebase/database");
require("firebase/storage");
import {ProfileElements, setMyUser} from "../views/profileView";
import {setHomeUser} from "../index";
initFirebase();


export const sessPers = "session";
export const localPers = "local";
export const noPers = "none";

window.UserInformation = {
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
        setHomeUser(user);
        setMyUser(user);
        setUserInfo(user);
        setProfileInfo(user);
        getProfileInfoFromDB(user);
        $(".logged-out").toggleClass("logged-out");
    }else{
        $(".logged-in").toggleClass("logged-in");
    }
});

export const fetchProfilePicture = (user, element) => {
    if(user.photoURL){
        $(element).attr("src", user.photoURL);
    }else{
        $(element).attr("src", "https://i.stack.imgur.com/l60Hf.png");
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
firebase.auth().signOut().then(function() {
        console.log("Signed out!!");
    }).catch(function (error) {
    });
}

export const uploadProfilePicture = (file, userID, meta, type) => {
    if(type === "profilePic"){
        return FirebaseElements.profilePicRef.child(userID).put(file, meta);
    }else if(type === "coverPic"){
        return FirebaseElements.coverPicRef.child(userID).put(file, meta);
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

export const FirebaseElements = {
    coverPicRef: firebase.storage().ref('coverPictures/'),
    profilePicRef: firebase.storage().ref('profilePictures/'),
    allUsers: firebase.database().ref(`/users/`),
    userRef: (user) => {
        return firebase.database().ref(`/users/${user.uid}`)
    },
    getPostsRef: (user) => {
        return firebase.database().ref(`/users/${user.uid}/posts/`)
    },
    allPosts: (user) => {
        return firebase.database().ref(`/posts/`)
    },
    otherUser: (userID) => {
        return firebase.database().ref(`/users/${userID}`)
    },
    database: firebase.database(),
    storage: firebase.storage()
}

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

export const setLinks = (user, linksText) => {
    FirebaseElements.userRef(user).update({
        userLinks: linksText,
        addedAt: getTimeStamp()
    }).catch(error => {
        console.log(error.message);
    });
}

export const setUsername = (user, usernameText) => {
    FirebaseElements.userRef(user).update({
        displayName: usernameText,
        addedAt: getTimeStamp()
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
            ProfileElements.links.text(data.userLinks);
        }
    }).catch(error => {
        console.log(error.message);
    });
};

// Currently not needed but will keppe just in case!!

// export const getPostType = (user, type) => {
//     var isMyPost;
//     if(type === "myPost"){
//         isMyPost = FirebaseElements.getPostsRef(user);
//     }else{
//         isMyPost = FirebaseElements.allPosts(user);
//     }
//     return isMyPost;
// }
//////////////////////////////////////////////////////

export const addNewPost = (user, postText, username, type) => {
    FirebaseElements.getPostsRef(user).push().set({
    displayName: username,
    photoThumb: user.photoURL,
    postBody: postText
}).then(() => {
    FirebaseElements.allPosts(user).push().set({
        displayName: username,
        photoThumb: user.photoURL,
        postBody: postText
    });
})
.catch(error => {
    console.log(error.message);
});
}

export const getUserInfo = () => {
    return UserInformation;
}