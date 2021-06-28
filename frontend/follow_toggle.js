let APIUtil = require("./api_util");

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