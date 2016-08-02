
$(function(){
	window.app = window.app || { };
	window.app.main = {
		boards : new app.BoardCollection, 
		init: function(){
			this.boardMenuView = new app.BoardMenuView({collection: this.boards});
			$("input#board_name").on("keypress", function(e){
				if(e.keyCode == 13){
				app.main.boards.add({board_name: $(this).val()});
				$(this).val("");
				}
			});
			
			$("#boards_btn").on("click",function(){
			$("#board_menu").toggle();
			});
			$("#modal_layer").hide();	
			$(".add_list_buttons").hide();
			this.appRouter = new app.Routes();
			Backbone.history.start();
		},
	}
	window.app.main.init();
});






