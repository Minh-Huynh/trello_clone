$(function(){
	$("#boards_btn").on("click",function(){
		$("#board_menu").toggle();
	});
});

$(function(){
	var Task = Backbone.Model.extend({
	});
	var Tasks = Backbone.Collection.extend({
		model: Task
	});
	var TaskView = Backbone.View.extend({
		className: "task",
		initialize: function(){
			this.render();
		},
		render: function(){
			this.$el.html(this.model.get("task_name"));
			return this;
		}
	});
	var List = Backbone.Model.extend({
		defaults: {
			"type" : "list"
		},
	    	initialize: function(){
			this.set("tasks" , new Tasks({model: this}));
		}
	});
	var Lists = Backbone.Collection.extend({
		model: List,
	    	initialize: function(models, options){
			this.board_id = options.board_id;
			this.board_name = options.board_name;
			this.view = new ListsView({collection: this});
		}
	});
	var ListsView = Backbone.View.extend({
	    	className: "board_collection",
	    	template: Handlebars.compile($("#board_template").html()),
	    	events: {
			"click .add_list_btn" : "addList",
	   		"click .add_list_container" : "toggleAddListBtn"
		},
		initialize: function(){
			this.render();
			this.listenTo(this.collection, "add", this.addOne); 
		},
	    	toggleAddListBtn: function(){
			this.$(".add_list_container").toggleClass("selected");
			this.$(".add_list_buttons").toggle();
		},
	    	addList: function(e){
			var $input = $(e.target).closest(".add_list_container").children("input");
			var newListName = $input.val();
			$input.val("");
			this.collection.add({list_name: newListName});
		},
	    	addOne:function(model){
			var a_listView = new ListView({model: model});
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
		className: "task_list",
		initialize: function(){
			this.$el.html(this.template(this.model.toJSON()));
			this.listenTo(this.model.get("tasks"), "add", this.renderTask);
			this.render();

		},
	    	events: {
			"click .add_task_link" : "showAddTaskForm",
			"click .add_task_btn" : "submitNewTask",
			"click .close_add_task" : "hideAddTaskForm"
		},
	    	renderTask: function(taskModel){
			var taskView = new TaskView({model: taskModel});
			this.$el.append(taskView.el);
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
			var taskName = $(e.target).siblings("textarea").val();
			this.model.toJSON().tasks.add({task_name: taskName});	
			this.$(".close_add_task").trigger("click");
		},
	    	render: function(){
			return this;
		}
	});
	var board = Backbone.Model.extend({
		initialize: function(){
			this.set("lists", new Lists([], {"board_id": this.cid, "board_name": this.toJSON().board_name}));
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
			new BoardMenuEntryView({model: board});
		},
		render: function(data){
			console.log(data.toJSON());
			this.$el.html("");
			this.collection.each(function(board){
				new BoardMenuEntryView({model: board});
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
		},
		render: function(){
			this.$el.html(this.template(this.model.toJSON()));
			$("#all_boards").append(this.$el);
		},
		events: {
			"click .remove_icon" : "destroy"
		},
		destroy: function(){
			this.model.destroy();
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
			$("#modal_layer").hide();	
			$(".add_list_buttons").hide();
			this.bind();
		},
		bind: function(){
			
		}
	}

	App.init();
	window.applet = App;
});






