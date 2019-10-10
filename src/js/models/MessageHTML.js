const $ = require("jquery");
const moment = require("moment");
import {FirebaseElements, getUserInfo, addMessageReply} from "./Firebase";

export default class MessageHTML {
    constructor(messageID, photoThumb, sentAt, msgBody, displayName, msgIMG, msgVid, currentUser, senderID, readStatus){
    this.messageID = messageID;
    this.photoThumb = photoThumb;
    this.sentAt = sentAt;
    this.msgBody = msgBody;
    this.displayName = displayName;
    this.msgIMG = msgIMG;
    this.msgVid = msgVid;
    this.currentUser = currentUser;
    this.senderID = senderID;
    this.readStatus = readStatus;

    if(this.readStatus == true){
      $(".read-status").text("Read");
    }else{
      $(".read-status").text("");
  }
  
  // $(".msg-items").on("mouseenter", () => {
  //   $(".msg-sent").fadeIn(1000);
  // });

  // $(".msg-items").on("mouseleave", () => {
  //   $(".msg-sent").fadeOut(1000);
  // });
        // if(String(this.msgBody).length < 15){
        //   this.msgBody = `${this.msgBody}...`;
        // }
  }

    getMessages(){
        var html = `<a class="nav-link msg-panel-item mx-2 mt-1" id="${this.messageID}" data-toggle="tab" href="#${this.messageID}" role="tab" aria-controls="messages" aria-selected="true">
              <img class="photoThumb rounded-circle img img-thumbnail float-left my-0 mr-2" src="${this.photoThumb}" style="object-fit:cover;width:60px;height:60px;"> 
              <p class="username w-0 mt-1 mb-0">${this.displayName}</p>
              <p class="msg-preview">${this.msgBody}</p>
          </p></a>`;
        return html;
    }

    getMessageItem(){
      // TODO
      // <div class="msg-media">
      //   <img src="" alt="" width="35%" height="170px" class="img pre-post-img rounded-lg ${this.bubbleColour()} p-2" style="${this.getImageStatus()}>
      //   </div>

        var html = `<div class="m-0 mx-0 m-md-2 mx-md-5 msg-items ${this.whosMsg()}">
        <p class="msg-text text-wrap badge w-auto ${this.bubbleColour()} px-3 py-2 m-2">${this.msgBody} 
        </p>
        <span class="msg-sent">${moment(this.sentAt).calendar()}</span>
        </div>`
        return html;
    }

    whosMsg(){
        var who = "text-left"
        if(this.senderID == getUserInfo().currentUser.uid){
            who = "text-left";
        }else{
            who = "text-right";
        }
        return who;
    }

    bubbleColour() {
      var colour = "msg-left border"
        if(this.senderID == getUserInfo().currentUser.uid){
            colour = "msg-left border";
        }else{
            colour = "msg-right";
        }
        return colour;
    }

    coverInfo(photoThumb, displayName, coverPic, onlineStatus, lastActive){
      $(".senderThumb").attr("src", photoThumb);
      $(".senderName").text(displayName);
      $(".msgCover").attr("src", coverPic);
      if(onlineStatus){
        $(".last-active").text("Online").css({color: "rgb(64, 202, 64)"});
      }else{
        $(".last-active").text(`Last Active: ${moment(lastActive).fromNow()}`).css({color:"white"});
      }
    }

    getVideoStatus(){
      var data = this.msgVid;
      if(data){
        data = 'display:block;';
      }else{
        data = 'display:none;';
      }
      return data;
    }

    getImageStatus(){
      var data = this.msgIMG;
      if(data){
        data = 'display:block;';
      }else{
        data = 'display:none;';
      }
      return data;
    }

    viewImage() {
      $(".post-pic").on("click", function(event) {
        var id = $(event.target).closest($(".post-img")).attr("src");
        $(".image-pop").modal("show");
        $(".view-image").attr("src", id);
        });
  
  $('.image-pop').on('hidden.bs.modal', function () {
    $(this).modal("dispose");
  });
    }

    setupMessageFuncs() {
      $(".nav-item").on("click", (eve) => {
        $(".tab-pane").attr("id", this.messageID);
      });
    }
}