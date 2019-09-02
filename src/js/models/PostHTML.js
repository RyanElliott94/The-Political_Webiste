const $ = require("jquery");
const moment = require("moment");

export default class PostHTML {
    constructor(postID, photoThumb, addedAt, postBody, displayName, postIMG, postVid){
    this.postID = postID;
    this.photoThumb = photoThumb;
    this.addedAt = addedAt;
    this.postBody = postBody;
    this.displayName = displayName;
    this.postIMG = postIMG;
    this.postVid = postVid;
    }

    getHTML() {
        var postHTML = `<div class="card border-0 shadow-sm rounded-lg my-3 pb-3 mx-auto myPostCards" id="${this.postID}">
        <div class="card-header pb-0 border-0 bg-white">
        <img src="${this.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2 mb-2">
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
        <button class="btn  btn-sm like-post"><i class="far fa-heart"></i> Likes <span class"num-likes">500</span></button>
        <button class="btn btn-sm comment-post"><i class="far fa-comment"></i> Comment</button>
        <div class="comments border-top">
        </div>
        <textarea class="form-control postBox p-2 mt-3 mx-auto w-100"  style="min-width: 100px;width:600px;" spellcheck="value" id="inputMessage" placeholder="Give your opnion!"></textarea>
      </div>
      </div>`;
      return postHTML;
    }


    getMyHTML() {
        var postHTML = `<div class="card border-0 shadow-sm rounded-lg my-3 pb-3 mx-auto myPostCards" id="${this.postID}">
        <div class="card-header pb-0 border-0 bg-white">
        <button type="button" class="close mr-2" aria-label="Close" id="${this.postID}">
        <span aria-hidden="true">&times;</span>
        </button>
        <img src="${this.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2 mb-2">
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
        <button class="btn  btn-sm like-post"><i class="far fa-heart"></i> Likes <span class"num-likes">500</span></button>
        <button class="btn btn-sm comment-post"><i class="far fa-comment"></i> Comment</button>
        <div class="comments border-top">
        </div>
        <textarea class="form-control postBox p-2 mt-3 mx-auto w-100"  disabled style="min-width: 100px;width:600px;" spellcheck="value" id="inputMessage" placeholder="Comments and likes have been disabled as I haven't implemented the feature yet"></textarea>
      </div>
      </div>`;
      return postHTML;
    }

    getCommentItem() {
      var html = `<div class="comment-item clearfix p-2 m-0">
      <img src="${this.photoThumb}" alt="" class="img img-thumbnail float-left friendsPhoto rounded-circle friend-profile-pic-src m-2 border-right">
      <p class="friend-username mt-2 mb-0"><a href="">${this.displayName}</a></p>
      <p class="postDate w-auto mt-0 mb-0">${moment(this.addedAt).fromNow()}</p>
      <p class="card-text postText p-0 mt-1">${this.postBody}</p>
      </div>`

      return html;
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
}