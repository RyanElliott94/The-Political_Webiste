const $ = require("jquery");
const moment = require("moment");
import {FirebaseElements, getUserInfo, likedPosts, listenForRemovedComments} from "./Firebase";
import Comments from "./Comments";

export default class PostHTML {
    constructor(postID, photoThumb, addedAt, postBody, displayName, postIMG, postVid, likes, comments, currentUser, userID){
    this.postID = postID;
    this.photoThumb = photoThumb;
    this.addedAt = addedAt;
    this.postBody = postBody;
    this.displayName = displayName;
    this.postIMG = postIMG;
    this.postVid = postVid;
    this.likes = likes;
    this.comments = comments;
    this.currentUser = currentUser;
    this.userID = userID;
    // this.getComments(this.postID);

    FirebaseElements.allCommentsRef(this.postID).on('child_removed', function(snapshot) {
      var postID = snapshot.key;
      const item = $(`#${postID}`);
      if(item){
        item.remove();
      }
  });

    }

    getHTML() {
      var url = `./view-profile.html?id=${this.userID}&isFriend=true`;
        var postHTML = `<div class="card border-0 shadow-sm rounded-lg my-3 pb-3 mx-auto myPostCards" id="${this.postID}">
        <div class="card-header pb-0 border-0 bg-white">
        <a href="${url}"><img src="${this.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2 mb-2"></a>
        <p class="username w-0 mt-1 mb-0">${this.displayName}</p>
        <p class="postDate w-auto mt-0">${moment(this.addedAt).fromNow()}</p>
        <video controls src="${this.postVid}" width="100%" height="300px" class="img post-vid rounded-lg mb-2" style="${this.getVideoStatus()}"></video>
        <div class="post-pic">
        <img src="${this.postIMG}" alt="" width="100%" height="250px" class="img post-img rounded-lg mb-2">
        </div>
        </div>
        <hr class="mx-auto mt-0" style="width:90%">
      <div class="card-body pt-0 pb-0 px-4 text-dark border-0">
        <p class="card-text postText">${this.postBody}</p>
        <div class="post-options border-top w-100 p-1">
        <i class="fas fa-heart" style="display:none;"></i>
        <button class="btn btn-sm like-post"><i class="far fa-heart icon"></i> Likes <span class"num-likes">${this.getLikes(this.postID)}</span></button>
        <button class="btn btn-sm comment-post"><i class="far fa-comment"></i> Comments <span class="num-coms">${this.comments}</span></button>
        <div class="comments border-top" style="display:none;">
        </div>
        <input type="text" class="form-control commBox p-2 mt-3 mx-auto w-100 rounded-pill bg-light" style="min-width: 100px;width:600px;" spellcheck="value" id="inputMessage" placeholder="Leave a comment!"></input>
        <button type="button" class="btn btn-sm btn-new-comm mt-2 rounded-pill btn-outline-dark float-right">Submit</button>
        </div>
      </div>`;
      return postHTML;
    }


    getMyHTML() {
      var url = `./profile.html`;
        var postHTML = `<div class="card border-0 shadow-sm rounded-lg my-3 pb-3 mx-auto myPostCards" id="${this.postID}">
        <div class="card-header pb-0 border-0 bg-white">
        <button type="button" class="close mr-2" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
        <a href="${url}"><img src="${this.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2 mb-2"></a>
        <p class="username w-0 mt-1 mb-0">${this.displayName}</p>
        <p class="postDate w-auto mt-0">${moment(this.addedAt).fromNow()}</p>
        <video controls src="${this.postVid}" width="100%" height="300px" class="img post-vid rounded-lg mb-2" style="${this.getVideoStatus()}"></video>
        <div class="post-pic">
        <img src="${this.postIMG}" alt="" width="100%" height="250px" class="img post-img rounded-lg mb-2">
        </div>
        </div>
        <hr class="mx-auto mt-0" style="width:90%">
      <div class="card-body pt-0 pb-0 px-4 text-dark border-0">
        <p class="card-text postText">${this.postBody}</p>
        <div class="post-options border-top w-100 p-1">
        <i class="fas fa-heart" style="display:none;"></i>
        <button class="btn btn-sm like-post"><i class="far fa-heart icon"></i> Likes <span class"num-likes">${this.getLikes(this.postID)}</span></button>
        <button class="btn btn-sm comment-post"><i class="far fa-comment"></i> Comments <span class="num-coms">${this.comments}</span></button>
        <div class="comments border-top" style="display:none;">
        </div>
        <input type="text" class="form-control commBox p-2 mt-3 mx-auto w-100 rounded-pill bg-light" style="min-width: 100px;width:600px;" spellcheck="value" id="inputMessage" placeholder="Leave a comment!"></input>
        <button type="button" class="btn btn-sm btn-new-comm mt-2 rounded-pill btn-outline-dark float-right">Submit</button>
        </div>
      </div>`;
      return postHTML;
    }

    removeComments(ele) {
      $(ele).remove();
      return "";
    }

    getComments(postID) {
      FirebaseElements.commentsRef(postID).off();
      FirebaseElements.commentsRef(postID).on("child_added", snap => {
            var comKey = snap.key;
            var commentData = snap.val();
            var comHtml = new Comments(comKey, commentData.userPhoto, commentData.added, commentData.commentText, commentData.userName, commentData.userID, this.currentUser);
            if(commentData.postID == postID){
              var ele = $(`#${postID}`).find(".comments");
                $(ele).prepend(comHtml.getCommentItem());
            }   
        });
        return "";
    }

    getLikes(id) {return this.likes;}

    getPostID() {return this.postID;}

    updateLikes(id, numLikes){
      $(`#${id}`).find(".like-post span").text(numLikes);
      $(`#${id}`).find(".f-like-post span").text(numLikes);
    }

    whosLiked(id){
      FirebaseElements.getLikeInfoRef(id).once("value", snap => {
        snap.forEach(data => {
          if(data.val().postID == id && data.key.includes(getUserInfo().currentUser.uid)){
            $(`#${id}`).find(".icon").removeClass("far").addClass("fas").addClass("liked");
          }else{
            $(`#${id}`).find(".icon").removeClass("fas").addClass("far").removeClass("liked");
          }
        });
      });
    }

    getVideoStatus(){
      var data = this.postVid;
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

}

    // I DON'T NEED THIS CODE BUT I'M KEEPING IT FOR FUTURE REFERENCE OR FOR THE OFF CHANCE I NEED TO USE IT AGAIN!
    
    // var icons = Array.from($(".myPostCards"));
      // icons.forEach(item => {
      //   var postID = $(item).attr("id");
      //   FirebaseElements.getLikeInfoRef(postID, this.currentUser).once("value", snap => {
      //     snap.forEach(data => {
      //       if(postID == data.val().postID && data.val().userID == getUserInfo().currentUser.uid){
      //         $(`#${postID}`).find(".icon").replaceWith('<i class="fas fa-heart liked icon"></i>');
      //       }else{
      //         $(".icon").replaceWith('<i class="far fa-heart icon"></i>');
      //       }
      //     });
      //   });
      // });

      // <i class="far fa-heart icon"></i>


    // addLike(postID) {
    //   FirebaseElements.allPostsByID(postID).once("value", data => {
    //     var likeData = data.val().likes;
    //     var currPostID = data.key
    //     var numLikes = likeData;
    //     if(currPostID == postID){
    //       FirebaseElements.allPostsByID(postID).update({likes: ++numLikes});
    //     }
    //   });



    //     //   FirebaseElements.getMyPostsRef(this.currentUser).once("value", snap => {
    //     //     snap.forEach(data => {
    //     //       var likeData = data.val();
    //     //       var id = data.key;
    //     //       var numLikes = likeData.likes;
    //     //       if(this.likes >= 0){
    //     //         FirebaseElements.allPostsByID(postID).update({likes: numLikes});
    //     //       }
    //     //     });
    //     // });
    //   }