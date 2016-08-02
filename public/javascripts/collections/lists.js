$(function(){
  window.app = window.app || {};
  window.app.Lists = Backbone.Collection.extend({
    model: app.List,
        initialize: function(models, options){
      this.task_name = options.task_name;
      this.list_name = options.list_name;
      this.board_id = options.board_id;
      this.list_id = options.list_id;
      this.board_name = options.board_name;
      this.board = options.board;
      this.view = new app.ListsView({collection: this});
    }
  });

});
  