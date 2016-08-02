  $(function(){
    window.app = window.app || {};

    window.app.Comments = Backbone.Collection.extend({
    model: app.Comment
  });
  });

  