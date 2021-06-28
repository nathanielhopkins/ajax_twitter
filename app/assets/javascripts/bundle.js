/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./frontend/api_util.js":
/*!******************************!*\
  !*** ./frontend/api_util.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { createTweet } = __webpack_require__(/*! ../../solution/frontend/api_util */ "../solution/frontend/api_util.js");

const APIUtil = {

  followUser: id => APIUtil.changeFollowStatus(id, 'POST'),

  unfollowUser: id => APIUtil.changeFollowStatus(id, 'DELETE'),

  changeFollowStatus: (id, method) => (
    $.ajax({
      url: `/users/${id}/follow`,
      dataType: 'json',
      method
    })
  ),

  searchUsers: query => (
    $.ajax({
      url: '/users/search',
      dataType: 'json',
      method: 'GET',
      data: { query }
    })
  ),

  createTweet: form => (
    $.ajax({
      url: '/tweets',
      dataType: 'json',
      method: 'POST',
      data: form
    })
  ),

  fetchTweets: data => (
    $.ajax({
      url: '/feed',
      dataType: 'json',
      method: 'GET',
      data
    })
  )
}

module.exports = APIUtil;

/***/ }),

/***/ "./frontend/follow_toggle.js":
/*!***********************************!*\
  !*** ./frontend/follow_toggle.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let APIUtil = __webpack_require__(/*! ./api_util */ "./frontend/api_util.js");

class FollowToggle {
  constructor($el, options) {
    this.$el = $($el);
    this.userId = this.$el.data("user-id") || options.userId;
    this.followState = (this.$el.data("initial-follow-state") || options.followState);
    this.render();
    this.$el.on("click", (e)=>{
      this.handleClick(e);
    });
  }

  render() {
    switch(this.followState) {
      case 'followed':
        this.$el.prop("disabled", false);
        this.$el.html("Unfollow!");
        break;
      case 'unfollowed':
        this.$el.prop("disabled", false);
        this.$el.html("Follow!");
        break;
      case 'following':
        this.$el.prop("disabled", true);
        this.$el.html("Following...");
        break;
      case 'unfollowing':
        this.$el.prop("disabled", true);
        this.$el.html("Unfollowing...");
        break;
    }
  }

  handleClick(e) {
    e.preventDefault;
    if(this.followState === "unfollowed") {
      this.followState = "following";
      this.render();
      APIUtil.followUser(this.userId).then(() => this.followSuccess());
    } else if (this.followState === "followed") {
      this.followState = "unfollowing";
      this.render();
      APIUtil.unfollowUser(this.userId).then(() => this.unfollowSuccess());
    }
  }

  followSuccess() {
    this.followState = "followed";
    this.render();
  }

  unfollowSuccess() {
    this.followState = "unfollowed";
    this.render();
  }
}

module.exports = FollowToggle;

/***/ }),

/***/ "./frontend/infinite_tweets.js":
/*!*************************************!*\
  !*** ./frontend/infinite_tweets.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const APIUtil = __webpack_require__(/*! ../../solution/frontend/api_util */ "../solution/frontend/api_util.js");

class InfiniteTweets {
  constructor($el) {
    this.$el = $($el);
    this.feed = this.$el.find('#feed');
    this.lastCreatedAt = null;
    this.fetchTweets();

    this.$el.on('click',".fetch-more", this.fetchTweets.bind(this));
    this.$el.on('insert-tweet', this.insertTweet.bind(this));
  }

  fetchTweets(e) {
    // e.preventDefault();
    
    let infiniteTweets = this;
    let data = {limit: 10}

    if (this.lastCreatedAt) data.max_created_at = this.lastCreatedAt;

    APIUtil.fetchTweets(data).then((data) => {
      infiniteTweets.insertTweets(data);


      if (data.length < 10) {
        infiniteTweets.$el
          .find('.fetch-more')
          .replaceWith('<b>No more tweets!</b>');
      }

      if (data.length > 0) {
        infiniteTweets.lastCreatedAt = data[data.length - 1].created_at;
      }
    });
  }

  insertTweet(data) {
    this.feed.prepend(this.tweetElement(data));
  }

  insertTweets(data) { 
    this.feed.append(data.map(this.tweetElement));
  }

  tweetElement(tweet) {
    const mentions = tweet.mentions.map(mention =>
      `<li class='tweetee'>
        <a href='/users/${mention.user.id}'>@${mention.user.username}</a>
      </li>`).join('');

    let elementString = `
      <li>
        <div class='tweet'>
          <h3 class='tweeter'>
            <a href='users/${tweet.user.id}'>@${tweet.user.username}</a></h3>
          <p>${tweet['content']}</p>
          <ul class='mentions'>
            Mentions
            ${mentions}
          </ul>
        </div>
      </li>
    `

    return $(elementString);
  }
}

module.exports = InfiniteTweets;

/***/ }),

/***/ "./frontend/tweet_compose.js":
/*!***********************************!*\
  !*** ./frontend/tweet_compose.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let APIUtil = __webpack_require__(/*! ./api_util */ "./frontend/api_util.js");

class TweetCompose {
  constructor($el) {
    this.$el = $($el);
    this.$input = this.$el.find('textarea[name=tweet\\[content\\]]');
    this.$mentionedUsers = this.$el.find('.mentioned-users');

    this.$el.find('.add-mentioned-user').on("click", (e) => this.addMentionedUser(e));
    this.$el.on('click','a.remove-mentioned-user', (e) => this.removeMentionedUser(e));
    this.$el.on("submit", this.submit.bind(this));
    this.$el.on("input","textarea", this.handleInput.bind(this));
  }

  addMentionedUser(event) {
    event.preventDefault();

    this.$mentionedUsers.append(this.newUserSelect());
  }

  removeMentionedUser(e) {
    let div = e.currentTarget.parentNode;
    div.remove();
  }

  newUserSelect() {
    let users = window.users.map(user => 
      `<option value='${user.id}'>${user.username}</option>`)
    .join('');
    
    let html = `
      <div>
        <p>@ </p>
        <select name='tweet[mentioned_user_ids][]'>
          ${users}
        <select>
        <a class='remove-mentioned-user' href='#'>Remove</a>
      </div>
    `

    return $(html);
  }

  handleInput() {
    let charUsed = this.$input.val().length;
    let charLeft = 140 - charUsed;

    this.$el.find('.char-left').text(`Characters Left: ${charLeft}`);

  }

  submit(event) {
    event.preventDefault();
    var formData = this.$el.serializeJSON();

    this.$el.find(':input').prop('disabled', true);

    APIUtil.createTweet(formData).then(tweet => this.handleSuccess(tweet));
  }

  clearInput() {
    this.$input.val('');
    this.$el.find(':input').prop('disabled', false);
    this.$mentionedUsers.empty();
    this.$el.find('.char-left').empty();
  }

  handleSuccess(data) {
    const $feed = $(this.$el.data('tweets-ul'));
    $feed.trigger('insert-tweet', data);

    this.clearInput();
  }
}

module.exports = TweetCompose;

/***/ }),

/***/ "./frontend/users-search.js":
/*!**********************************!*\
  !*** ./frontend/users-search.js ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const FollowToggle = __webpack_require__(/*! ../../solution/frontend/follow_toggle */ "../solution/frontend/follow_toggle.js");
const APIUtil = __webpack_require__(/*! ./api_util */ "./frontend/api_util.js");

class UsersSearch {
  constructor($el) {
    this.$el = $($el);
    this.input = $(this.$el.find('input'));
    this.ul = $(this.$el.find('ul.users'));
    this.input.on('input',(e) => {
      this.handleInput(e);
    });
  }

  handleInput(e) {
    if(this.input.val == '') {
      this.renderResults([]);
      return;
    }
    APIUtil.searchUsers(this.input.val()).then(users => this.renderResults(users));
  }

  renderResults(results) {
    this.ul.empty();

    for (let i=0;i<results.length;i++) {
      let result = results[i];

      let $newResult = $(`<li><a href="/users/${result.id}">@${result.username}</a></li>`);
      let $followToggle = $('<button></button>');
      let toggle = new FollowToggle($followToggle, {
        userId: result.id,
        followState: result.followed ? 'followed' : 'unfollowed'
      });

      $newResult.append($followToggle);
      $(this.ul).append($newResult);
    }
  }
}

module.exports = UsersSearch;

/***/ }),

/***/ "../solution/frontend/api_util.js":
/*!****************************************!*\
  !*** ../solution/frontend/api_util.js ***!
  \****************************************/
/***/ ((module) => {

const APIUtil = {

  followUser: id => APIUtil.changeFollowStatus(id, 'POST'),

  unfollowUser: id => APIUtil.changeFollowStatus(id, 'DELETE'),

  changeFollowStatus: (id, method) => (
    $.ajax({
      url: `/users/${id}/follow`,
      dataType: 'json',
      method
    })
  ),

  searchUsers: query => (
    $.ajax({
      url: '/users/search',
      dataType: 'json',
      method: 'GET',
      data: { query }
    })
  ),

  createTweet: data => (
    $.ajax({
      url: '/tweets',
      method: 'POST',
      dataType: 'json',
      data
    })
  ),

  fetchTweets: data => (
    $.ajax({
      url: '/feed',
      method: 'GET',
      dataType: 'json',
      data
    })
  )
};

module.exports = APIUtil;


/***/ }),

/***/ "../solution/frontend/follow_toggle.js":
/*!*********************************************!*\
  !*** ../solution/frontend/follow_toggle.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const APIUtil = __webpack_require__(/*! ./api_util */ "../solution/frontend/api_util.js");

class FollowToggle {
  constructor(el, options) {
    this.$el = $(el);
    this.userId = this.$el.data('user-id') || options.userId;
    this.followState = (this.$el.data('initial-follow-state') ||
                        options.followState);
    this.render();

    this.$el.on('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const followToggle = this;

    event.preventDefault();

    if (this.followState === 'followed') {
      this.followState = 'unfollowing';
      this.render();
      APIUtil.unfollowUser(this.userId).then(() => {
        followToggle.followState = 'unfollowed';
        followToggle.render();
      });
    } else if (this.followState === 'unfollowed') {
      this.followState = 'following';
      this.render();
      APIUtil.followUser(this.userId).then(() => {
        followToggle.followState = 'followed';
        followToggle.render();
      });
    }
  }

  render() {
    switch (this.followState) {
      case 'followed':
        this.$el.prop('disabled', false);
        this.$el.html('Unfollow!');
        break;
      case 'unfollowed':
        this.$el.prop('disabled', false);
        this.$el.html('Follow!');
        break;
      case 'following':
        this.$el.prop('disabled', true);
        this.$el.html('Following...');
        break;
      case 'unfollowing':
        this.$el.prop('disabled', true);
        this.$el.html('Unfollowing...');
        break;
    }
  }
}

module.exports = FollowToggle;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./frontend/twitter.js ***!
  \*****************************/
let FollowToggle = __webpack_require__(/*! ./follow_toggle */ "./frontend/follow_toggle.js");
let TweetCompose = __webpack_require__(/*! ./tweet_compose */ "./frontend/tweet_compose.js");
let UsersSearch = __webpack_require__(/*! ./users-search */ "./frontend/users-search.js");
let InfiteTweets = __webpack_require__(/*! ./infinite_tweets */ "./frontend/infinite_tweets.js");
const APIUtil = __webpack_require__(/*! ../../solution/frontend/api_util */ "../solution/frontend/api_util.js");

$(() => {
  $("button.follow-toggle").each((i, fT)=> new FollowToggle(fT, {}));
  $("nav.users-search").each((i, uS) => new UsersSearch(uS));
  $("form.tweet-compose").each((i, tC) => new TweetCompose(tC));
  $("div.infinite-tweets").each((i, iT) => new InfiteTweets(iT));
});
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map