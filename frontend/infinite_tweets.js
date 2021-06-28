const APIUtil = require("../../solution/frontend/api_util");

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