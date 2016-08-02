$(function(){
  window.app = window.app || { };
  window.app.ListsView = Backbone.View.extend({
        className: "board_collection",
        template: Handlebars.compile($("#board_template").html()),
        events: {
      "click .add_list_btn" : "addList",
      "keypress .list_name_input" : "addList",
      "blur .add_list_container" : "hideAddListBtn",
        "click .add_list_container" : "showAddListBtn",
      "blur .board_title" : "updateBoardName",
      "drop" : "drop",
      "dragenter" : "dragEnter",
      "dragover" : "dragOver"
    },
    initialize: function(){
      this.render();
      this.listenTo(this.collection, "add", this.addOne); 
      this.listenTo(this.collection.board, "change:show", this.toggleBoard);
    },
    dragEnter: function(e){
      e = e.originalEvent;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
    },
    dragOver: function(e){
      e = e.originalEvent;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
    },
    drop: function(e){
      e = e.originalEvent;
      var $target = $(e.target);
      if($(e.target).closest(".board_collection").length == 0 || 
        $(e.target).hasClass("board_collection") || 
        $(e.target).hasClass("list_container")) return;
      var old_list_id = JSON.parse(e.dataTransfer.getData("list")).listId,
          listModel = this.collection.get(old_list_id),
          old_view = listModel.get("view"),
          viewAndHandlers = old_view.$el.detach();
      if($target.closest(".task_list").length){
        $target.closest(".task_list").before(viewAndHandlers);
      }
      else if($target.parent().hasClass("add_list_container")){
        $target.parent().before(viewAndHandlers);
      }
    },
    updateBoardName: function(){
      var name = this.$(".board_title").val();
      this.collection.board_name = name;
      this.collection.board.set("board_name", name);
    },  
    toggleBoard: function(){
      this.collection.board.get("show") ? this.$el.show():this.$el.hide();
    },
        showAddListBtn: function(){
      this.$(".add_list_container").addClass("selected");
      this.$(".add_list_buttons").show();
    },
    hideAddListBtn: function(){
      this.$(".add_list_container").removeClass("selected");
      this.$(".add_list_buttons").hide();
    },
        addList: function(e){
      if($(e.target).hasClass("add_list_btn") || e.keyCode == 13){
        var $input = this.$(".add_list_container").children("input");
        var newListName = $input.val();
        $input.val("");
        this.collection.add({list_name: newListName, list: this.collection});
      }
    },
        addOne:function(model){
      var a_listView = new app.ListView({model: model, board: this.collection});
      model.set("view" ,a_listView);
      this.$(".list_container").append(a_listView.el);
    },
        render: function(){
      this.$el.html(this.template({board_name: this.collection.board_name}));
      $("#board_main").append(this.el);
    }   
        
  });
  window.app.ListView = Backbone.View.extend({
    template: Handlebars.compile($("#list_template").html()),
        tagName: "div",
    attributes: function(){
      return {
        "draggable" : "true",
        "data-list-id": this.model.cid
      }
    },
    className: "task_list",
    initialize: function(){
      this.$el.html(this.template(this.model.toJSON()));
      this.listenTo(this.model.get("tasks"), "add", this.renderTask);
      this.render();

    },
        events: {
      "click .add_task_link" : "showAddTaskForm",
      "click .add_task_btn" : "submitNewTask",
      "click .close_add_task" : "hideAddTaskForm",
      "keypress .task_name_input" : "submitNewTask",
      "dragover" : "dragOver",
      "dragenter" : "dragEnter",
      "dragstart" : "dragStart",
      "dragleave" : "dragLeave",
      "drop" : "drop"
    },
    dragStart: function(e){
      e = e.originalEvent;
      $(e.target).addClass("dragged_list");
      e.dataTransfer.effectAllowed = "move";
      var html_data = $("<div>").append(this.$el.clone()).html();
      e.dataTransfer.setData('text/html', html_data);
      e.dataTransfer.setData("list",JSON.stringify(this.$el.data()));
    },
    drop: function(e){
      e = e.originalEvent;
      if(e.dataTransfer.types.indexOf("json") == -1){return};
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      var data = JSON.parse(e.dataTransfer.getData("json")),
          old_task = this.model.get("list").get(data.listId).get("tasks").get(data.taskId),
          new_task = this.model.get("tasks").add({
          list_name: this.model.get("list_name"),
          task_name: data.taskName,
                list: this.model,
          board_id: this.model.get("list").board_id,
          list_id: this.model.cid,
      });
      new_task.get("comments").add(old_task.get("comments").toJSON());
      old_task.destroy();
    },
    dragLeave: function(e){
      e = e.originalEvent;
      if(e.dataTransfer.types.indexOf("json") == -1){return};
    },
    dragEnter: function(e){
      e = e.originalEvent;
      if(e.dataTransfer.types.indexOf("json") == -1){return};
      e.preventDefault();
      e.stopPropagation();
    },
    dragOver: function(e){
      e = e.originalEvent;
      if(e.dataTransfer.types.indexOf("json") == -1){return};
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      if(this.$(".tasks").has(".spot").length == 0){
      }
    },
        renderTask: function(taskModel){
      var taskView = new app.TaskView({model: taskModel});
      taskModel.set("view", taskView);
      this.task_id =  this.cid;
      this.$(".tasks").append(taskView.el);
    },
        showAddTaskForm: function(e){
      $(e.target).hide();
      $(e.target).siblings(".add_task_form").show();
        },
        hideAddTaskForm: function(e){
      $(e.target).closest(".add_task_form").hide();
      $(e.target).parent().siblings(".add_task_link").show();
    },
    submitNewTask: function(e){
      if($(e.target).hasClass("add_task_btn") || e.keyCode == 13){
        var textArea = this.$(".task_name_input"),
            taskName = textArea.val(); 
        textArea.val("");
        this.model.toJSON().tasks.add({
          list_name: this.model.get("list_name"),
          task_name: taskName,
                list: this.model,
          board_id: this.model.get("list").board_id,
          list_id: this.model.cid
        }); 
        this.$(".close_add_task").trigger("click");
      }
    },
        render: function(){
      return this;
    }
  });
});