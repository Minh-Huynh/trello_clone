$(function(){
    window.app = window.app || { };
  window.app.Task = Backbone.Model.extend({
    initialize: function(){
      this.set("comments", new app.Comments());
      this.set("task_id", this.cid);
    }
  });
});