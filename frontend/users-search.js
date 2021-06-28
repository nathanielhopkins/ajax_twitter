const FollowToggle = require("../../solution/frontend/follow_toggle");
const APIUtil = require("./api_util");

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