
$(function(){
	var Comment = Backbone.Model.extend({
	});
	var Comments = Backbone.Collection.extend({
		model: Comment
	});
	var CommentView = Backbone.View.extend({
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

	var Task = Backbone.Model.extend({
		initialize: function(){
			this.set("comments", new Comments());
			this.set("task_id", this.cid);
		}
	});

	var TaskView = Backbone.View.extend({
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
			var commentView = new CommentView({model: comment});
			this.$(".comments_container").append(commentView.el);
		},
		render: function(){
			var context = this.model;
			this.$el.html(this.template(context.toJSON()));
			return this;
		}
	});
	var List = Backbone.Model.extend({
		defaults: {
			"type" : "list"
		},
	    	initialize: function(){
			this.set("tasks" , new Tasks());
			this.set("cid", this.cid);
		}
	});

	var ListsView = Backbone.View.extend({
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
			var a_listView = new ListView({model: model, board: this.collection});
			model.set("view" ,a_listView);
			this.$(".list_container").append(a_listView.el);
		},
    		render: function(){
			this.$el.html(this.template({board_name: this.collection.board_name}));
			$("#board_main").append(this.el);
		}		
				
	});
	var ListView = Backbone.View.extend({
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
			var taskView = new TaskView({model: taskModel});
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
	var board = Backbone.Model.extend({
		initialize: function(){
			this.set("lists", new Lists([], {"board": this, "board_id": this.cid, "board_name": this.toJSON().board_name}));
			this.set("cid", this.cid);
			this.set("show", false);
		}
	});
	var BoardCollection = Backbone.Collection.extend({
		model: board
	});

	var BoardMenuView = Backbone.View.extend({
		el: "#all_boards",
		
		initialize: function(){
			this.listenTo(this.collection, "add", this.addOne);
			this.listenTo(this.collection, "remove", this.render);
		},
		addOne: function(board){
			var entry = new BoardMenuEntryView({model: board});
			this.$el.append(entry.el);	
		},
		render: function(data){
			this.$el.html("");
			this.collection.each(function(board){
				var entry = new BoardMenuEntryView({model: board});
				this.$el.append(entry.el);
			});
		}
	});

	var BoardMenuEntryView = Backbone.View.extend({
		template: Handlebars.compile($('#board_menu_entry').html()),
		attributes: function(){
			return{
				id: this.model.cid,
				class: "board_menu_entries"
			};
		},
		initialize: function(){
			this.render();
			this.listenTo(this.model, "change", this.render);
		},
		render: function(){
			this.$el.html(this.template(this.model.toJSON()));
			this.$("a")[0].click();
			return this;
		},
		events: {
			"click .remove_icon" : "destroy"
		},
		destroy: function(){
			this.model.destroy();
		}		
	});

	var Routes = Backbone.Router.extend({
		routes: {
			"board/:cid" : "toggleBoards",
			"board/:board_id/list/:list_id/task/:task_id" : "showTaskForm"
		},
		showTaskForm: function(board_id, list_id, task_id){
			App.boards.get(board_id).get("lists").get(list_id).get("tasks").get(task_id).get("view").$(".modal_layer").show();
		},
		toggleBoards: function(cid){
			App.boards.each(function(model){model.set("show", false)});
			App.boards.get(cid).set({show: true});
			$("#board_menu").hide();
		}
	});	
	var App = {
		boards : new BoardCollection, 
		init: function(){
			this.boardMenuView = new BoardMenuView({collection: this.boards});
			$("input#board_name").on("keypress", function(e){
				if(e.keyCode == 13){
				App.boards.add({board_name: $(this).val()});
				$(this).val("");
				}
			});
			
			$("#boards_btn").on("click",function(){
			$("#board_menu").toggle();
			});
			$("#modal_layer").hide();	
			$(".add_list_buttons").hide();
			this.appRouter = new Routes();
			Backbone.history.start();
		},
	}
	App.init();
});






