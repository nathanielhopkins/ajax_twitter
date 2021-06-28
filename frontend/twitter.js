let FollowToggle = require("./follow_toggle");
let TweetCompose = require("./tweet_compose");
let UsersSearch = require("./users-search");
let InfiteTweets = require("./infinite_tweets");
const APIUtil = require("../../solution/frontend/api_util");

$(() => {
  $("button.follow-toggle").each((i, fT)=> new FollowToggle(fT, {}));
  $("nav.users-search").each((i, uS) => new UsersSearch(uS));
  $("form.tweet-compose").each((i, tC) => new TweetCompose(tC));
  $("div.infinite-tweets").each((i, iT) => new InfiteTweets(iT));
});