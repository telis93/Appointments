Backbone.couch_connector.config.db_name = "appointments";
Backbone.couch_connector.config.ddoc_name = "appointments";
Backbone.couch_connector.config.global_changes = true;

var Appointment = Backbone.Model.extend({urlRoot: '/appointments',
    defaults: function () {
        return {title: 'Checkup',
            date: new Date(),
            cancelled: false,
            description: 'No description'};
    },
    cancel: function() {
        this.set('cancelled', true);
    }
});
var AppointmentList = Backbone.Collection.extend({
    url: '/appointments',
    model: Appointment,
});
//var appointment = new Appointment({id: '1'});
//appointment.fetch()//.complete(function () {
//    appointment.set('cancelled', true);
//    appointment.save();})
//;
/*
appointment.set('title', 'Checkup');
appointment.set('description', 'My knee hurts');
appointment.save();
*/
appointmentList = new AppointmentList();
//appointmentList.add(appointment);
var AppointmentsView = Backbone.View.extend({
    id: "appointments",
    tagName: 'ul',
    initialize: function() {
        this.collection.on('reset', this.render, this);
        this.collection.on('remove', this.hideModel);
        this.collection.on('add', function(a) {
            alert('New Appointment!!!\n' + a.get('title'));
        });
        this.collection.on('add', this.addOne, this);
    },
    hideModel: function(a) {
        a.trigger('hide');
    },
    render: function() {
        this.$el.empty();
        this.collection.forEach(this.addOne, this);
    },
    addOne: function(a) {
        var aV = new AppointmentView({model: a});
        this.$el.append(aV.render().el);
    }
});
var AppointmentView = Backbone.View.extend({
    tagName: 'li',
    className: function() {
        return (this.model.get('cancelled'))? "cancelled":"";
    },
    initialize: function() {
        this.model.on('destroy', this.remove, this );
        this.model.on('change:cancelled', this.render, this);
        this.model.on('change:cancelled', function () {
            if(this.model.get('cancelled')) {
                alert('The appointmentment ' + this.model.get('title') + ' was cancelled!');
                this.$el.addClass('cancelled');
            }
            else {
                this.$el.removeClass('cancelled');
            }
        }, this);
        this.model.on('hide', this.remove, this);
    },
    destroy: function() {
        this.model.destroy();
    },
    remove: function() {
        this.$el.remove();
    },
    events: {
        'dblclick': 'alert',
        'click .cancel': 'cancel',
        'click .destroy': 'destroy',
        'click span': 'navigate'
    },
    navigate: function() {
        router.navigate('appointments/'+this.model.get('id'), {trigger: true});
    },
    cancel: function() {
        this.model.cancel();
        this.model.save();
    },
    alert: function() {
        alert(this.model.get('description'));
    },
    template: _.template(
        '<button type="button" class="destroy"></button>' +
        '<span><%= title %></span>' +
        '<button type="button" class="cancel"' +
        '<% if(cancelled) print(" disabled") %>' +
        '>Cancel</button>'),
    render: function () {
        var attributes = this.model.toJSON();
        $(this.el).html(this.template(attributes));
        return this;
    }
});
var AppView = Backbone.View.extend({
    id: "app",
    initialize: function() {
        this.appointmentsView = new AppointmentsView({collection: appointmentList});
    },
    events: {
        "keypress #add": function(e) {
            var textField = $('#add');
            var title = textField.attr('value');
            if(e.which == 13 && title) {
                var a = new Appointment({title: textField.attr('value')});
                appointmentList.add(a);
                a.save();
                textField.attr('value', '');
            }

        }
    },
    afterFetch: function () {
        this.appointmentsView.render();
        $(this.el).append(this.appointmentsView.el);
    },
    render: function () {
        var app = $(this.el);
        app.empty();
        $('<h1>', {text: "Appointments"}).appendTo(app);
        $('<input>', {type:"text", id:"add"}).appendTo(app);
        var $this = this;
        this.appointmentsView.collection.fetch({silent: true}).complete(function () {
            $this.afterFetch.apply($this);
        });
    },
    focusOnAppointmentItem: function(id) {
        $(this.el).empty();
        var a = new Appointment({id: id}),
            $this = this;
        a.fetch().complete(function() {
            appointmentList.reset(a, {silent: true});
            $this.afterFetch();
        });
    }
});
var AppointmentRouter = Backbone.Router.extend({
    routes: {
        '': 'index',
        'appointments/:id': 'show'
    },
    start: function() {
        Backbone.history.start({
            root: '/appointments/_design/appointments/index.html/'
        });
        $('body').html(this.app.el);
    },
    index: function() {
        this.app.render();
        $('#add').focus();
    },
    show: function(id) {
        this.app.focusOnAppointmentItem(id);
    },
    initialize: function(options) {
        this.app = new AppView();

    }
});
var router = new AppointmentRouter();
$(function() {router.start({trigger: true})});
