$(function(){
  window.app = window.app || { };
  window.app.TaskView = Backbone.View.extend({
    className: "task",
    template: Handlebars.compile($("#task_form_template").html()),
    attributes: function(){
      return {
        "draggable" : true,
        "data-task-id" : this.model.cid,
        "data-task-name" : this.model.get("task_name"),
        "data-board-id" : this.model.get("board_id"),
        "data-list-id" : this.model.get("list_id")
      }
    },
    events: {
      "click .close_button" : "closeForm",
      "click .save_comment_button" : "createComment",
      "keypress .comment_field" : "createComment",
      "click .delete_task" : "deleteTask",
      "dragstart" : "dragStart"
    },
    initialize: function(){
      this.listenTo(this.model.get("comments"), "add",this.renderComment); 
      this.listenTo(this.model, "remove", this.remove);
      this.render();
    },
    dragStart: function(e){
      e = e.originalEvent;
      e.dataTransfer.effectAllowed = 'move';
      var draggable = $(e.target);
      e.dataTransfer.setData('json',JSON.stringify(draggable.data())); 
      draggable.addClass("dragged");
    },
    closeForm: function(){
      history.back();
      this.$(".modal_layer").hide();
    },
    deleteTask: function(e){
      e.stopPropagation();
      this.model.destroy();
      this.remove();
      return false;
    },
    createComment: function(e){
      if($(e.target).hasClass("save_comment_button") || e.keyCode == 13){ 
        this.model.get("comments").add({body: this.$(".comment_field").val()});
      }
    },
    renderComment: function(comment){
      this.$("textarea").val('');
      var commentView = new app.CommentView({model: comment});
      this.$(".comments_container").append(commentView.el);
    },
    render: function(){
      var context = this.model;
      this.$el.html(this.template(context.toJSON()));
      return this;
    }
  });
});