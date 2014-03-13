Backbone.couch_connector.config.db_name = "appointments";
Backbone.couch_connector.config.ddoc_name = "appointments";
Backbone.couch_connector.config.global_changes = false;

var Appointment = Backbone.Model.extend({urlRoot: '/appointments',
    defaults: function () {
        return {title: 'Checkup', date: new Date()}
    },
    cancel: function() {
        this.set('cancelled', true);
    }
});
var AppointmentList = Backbone.Collection.extend({
    url: '/appointments',
    model: Appointment
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
descriptions = appointmentList.map(function(a) {
    return a.get('description');
});
var AppointmentsView = Backbone.View.extend({
    id: "appointments",
    tagName: 'ul',
    initialize: function() {
        this.collection.on('reset', this.render, this);
        this.collection.on('remove', this.hideModel);
    },
    hideModel: function(a) {
        a.trigger('hide');
    },
    render: function() {
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
    evalClass: function() {
        return (this.model.get('cancelled'))? "cancelled":"";
    },
    destroy: function() {
        this.model.destroy();
    },
    remove: function() {
        this.$el.remove();
    },
    events: {
        'dblclick li': 'alert',
        'click .cancel': 'cancel',
        'click .destroy': 'destroy'
    },
    cancel: function() {
        this.model.cancel();
    },
    alert: function() {
        alert(this.model.get('description'));
    },
    template: _.template(
        '<button type="button" class="destroy"></button>' +
        '<%= title %>' +
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
    render: function () {
        var app = $(this.el);
        $('<h1></h1>', {text: "Appointments"}).appendTo(app);
        var appointmentsView = new AppointmentsView({collection: appointmentList});
        appointmentsView.collection.fetch().complete(function () {
            appointmentsView.render();
            app.append(appointmentsView.el);
            appointmentList.on('add', function(a) {
                alert('New Appointment!!!\n' + a.get('title'));
            });
            appointmentList.on('add', appointmentsView.addOne, appointmentsView);
        });

    }
});
var app = new AppView();
app.render();
$('body').append(app.el);
