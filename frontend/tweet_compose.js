let APIUtil = require("./api_util");

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