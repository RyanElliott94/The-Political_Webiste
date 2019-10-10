const $ = require("jquery");
const moment = require("moment");
import {getUserInfo} from "./Firebase";

export default class Comments {
    constructor(commentID, photoThumb, addedAt, commentText, displayName, userID, currentUser){
    this.commentID = commentID;
    this.photoThumb = photoThumb;
    this.addedAt = addedAt;
    this.commentText = commentText;
    this.displayName = displayName;
    this.userID = userID;
    this.currentUser = currentUser;
    // this.postIMG = postIMG;
    // this.postVid = postVid;
    }

    getCommentItem() {
        var url = `./view-profile.html?id=${this.userID}&isFriend=true`;

        var html = `<div class="comment-item clearfix p-2 m-0" id="${this.commentID}">
        <img src="${this.photoThumb}" alt="" class="img img-thumbnail float-left userPhoto rounded-circle friend-profile-pic-src m-2 border-right">
        <button class="btn btn-sm float-right del-com-btn" style="display:${this.getUser()}">delete</button>
        <p class="username mt-3 p-0 mb-0"><a href="${url}">${this.displayName}</a></p> <span class="com-sent m-0 p-0">${moment(this.addedAt).calendar()}</span>
        <span style="display: none">${this.userID}</span>
        <p class="card-text commentText p-0">${this.commentText}</p>
        </div>`
        return html;
    }

    getUser(){
        var view = "none";
        if(this.currentUser.uid == this.userID){
            view = "block";
            // $(".del-com-btn").css({display: "block"});
        }else{
            view = "none";
        }
        return view;
    }
}