$(function(){
  window.app = window.app || { };
  window.app.Routes = Backbone.Router.extend({
    routes: {
      "board/:cid" : "toggleBoards",
      "board/:board_id/list/:list_id/task/:task_id" : "showTaskForm"
    },
    showTaskForm: function(board_id, list_id, task_id){
      app.main.boards.get(board_id).get("lists").get(list_id).get("tasks").get(task_id).get("view").$(".modal_layer").show();
    },
    toggleBoards: function(cid){
      app.main.boards.each(function(model){model.set("show", false)});
      app.main.boards.get(cid).set({show: true});
      $("#board_menu").hide();
    }
  }); 
});
  