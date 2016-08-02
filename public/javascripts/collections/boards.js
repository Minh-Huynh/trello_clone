
$(function(){
  window.app = window.app || { };
  app.BoardCollection = Backbone.Collection.extend({
    model: app.board
  });
});