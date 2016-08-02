$(function(){
  window.app = window.app || { };
  window.app.BoardMenuView = Backbone.View.extend({
    el: "#all_boards",
    
    initialize: function(){
      this.listenTo(this.collection, "add", this.addOne);
      this.listenTo(this.collection, "remove", this.render);
    },
    addOne: function(board){
      var entry = new app.BoardMenuEntryView({model: board});
      this.$el.append(entry.el);  
    },
    render: function(data){
      this.$el.html("");
      this.collection.each(function(board){
        var entry = new app.BoardMenuEntryView({model: board});
        this.$el.append(entry.el);
      });
    }
  });
window.app.BoardMenuEntryView = Backbone.View.extend({
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
});