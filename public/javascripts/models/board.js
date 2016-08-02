$(function(){
    window.app = window.app || { };
  window.app.board = Backbone.Model.extend({
    initialize: function(){
      this.set("lists", new app.Lists([], {"board": this, "board_id": this.cid, "board_name": this.toJSON().board_name}));
      this.set("cid", this.cid);
      this.set("show", false);
    }
  });
});