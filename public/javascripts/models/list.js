$(function(){
  window.app = window.app || { };
  window.app.List = Backbone.Model.extend({
    defaults: {
      "type" : "list"
    },
        initialize: function(){
      this.set("tasks" , new app.Tasks());
      this.set("cid", this.cid);
    }
  });
});