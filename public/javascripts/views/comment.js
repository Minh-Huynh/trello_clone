$(function(){
  window.app = window.app || { };
  window.app.CommentView = Backbone.View.extend({
    template: Handlebars.compile($("#comment_template").html()),
    initialize: function(){
      this.render();
    },
    events: {
      "click .delete_comment" : "deleteComment",
      "blur input" : "updateComment"
    },
    render: function(){
      this.$el.html(this.template({comment_body: this.model.get("body")}));
      return this;
    },
    updateComment: function(e){
      this.model.set({body: this.$("input").val()});
    },
    deleteComment: function(){
      this.remove();
      this.model.destroy();
    },
  });
});