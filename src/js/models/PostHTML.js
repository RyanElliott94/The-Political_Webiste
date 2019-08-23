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
        var postHTML = `<div class="card border-0 rounded-lg my-3 mx-auto myPostCards" id="${this.postID}">
        <div class="card-header pb-0 border-0 bg-white">
        <img src="${this.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2 mb-2">
        <p class="username w-0 mt-1 mb-0">${this.displayName}</p>
        <p class="postDate w-auto mt-0">${moment(this.addedAt).fromNow()}</p>
        <video controls src="${this.postVid}" width="100%" height="250px" class="img post-vid rounded-lg mb-2" style="display:none;"></video>
        <img src="${this.postIMG}" alt="" width="100%" height="250px" class="img post-img rounded-lg mb-2">
        </div>
        <hr class="mx-auto" style="width:90%">
        <div class="card-body pt-0 pb-0 px-4 text-dark border-0">
        <p class="card-text postText mb-3">${this.postBody}</p>
      </div>`;
      return postHTML;
    }

    getMyHTML() {
        var postHTML = `<div class="card border-0 rounded-lg my-3 mx-auto myPostCards" id="${this.postID}">
        <div class="card-header pb-0 border-0 bg-white">
        <button type="button" class="close mr-2" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
        <img src="${this.photoThumb}" alt="" class="userPhoto rounded-circle img img-thumbnail float-left mr-2 mb-2">
        <p class="username w-0 mt-1 mb-0">${this.displayName}</p>
        <p class="postDate w-auto mt-0">${moment(this.addedAt).fromNow()}</p>
        <video controls src="${this.postVid}" width="100%" height="250px" class="img post-vid rounded-lg mb-2" style="display:none;"></video>
        <img src="${this.postIMG}" alt="" width="100%" height="250px" class="img post-img rounded-lg mb-2">
        </div>
        <hr class="mx-auto" style="width:90%">
      <div class="card-body pt-0 pb-0 px-4 text-dark border-0">
        <p class="card-text postText">${this.postBody}</p>
      </div>`;
      return postHTML;
    }
}