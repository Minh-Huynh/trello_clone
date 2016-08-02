  $(function(){
    window.app = window.app || {};

    window.app.Tasks = Backbone.Collection.extend({
    model: app.Task
  });
});
  