const $ = require("jquery");
import * as firebase from "../models/Firebase";

var Elements = {
    reply_btn: $(".btn-reply-msg"),
    msgItem: $(".msgSidePanel"),
    msgContent: $(".msgContent"),
    tabPanel: $(".listItems"),
    toggleMsgs: $(".back-btn"),
};

firebase.getMessages(".msgSidePanel");

Elements.msgItem.on("click", (eve) => {
  var messageID = $(eve.target).closest(".nav-link").attr("id");
  // $(".msg-items").remove()

  firebase.listenForReply(messageID);
  firebase.listenForChanges(messageID, "messages");
  firebase.getMessageInfo(messageID);
  firebase.setMessageAsRead(messageID);

  $(".main-info").css({display:"block"});
  $(".no-msg").css({display:"none"});

  Elements.tabPanel.attr("id", messageID);

  if(Elements.msgContent.is(":hidden")){
    console.log("content hidden");
    Elements.msgItem.fadeToggle(1000);
    Elements.msgContent.fadeToggle(1500);
  }else{
    console.log("content not hidden");
  }
});

Elements.toggleMsgs.on("click", () => {
  Elements.msgItem.fadeToggle(1500);
  Elements.msgContent.fadeToggle(1000);
});

if($(".nav-link")){
  firebase.getLastMessage();
}

$(Elements.reply_btn).on("click", (eve) => {
      var msgID = Elements.tabPanel.attr("id");
      var msgText = $(".msgBox").val();
      firebase.addMessageReply(msgID, msgText, "", "", false, firebase.getUserInfo().currentUser.uid);
    });
