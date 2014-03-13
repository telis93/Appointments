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
var appointment = new Appointment({id: '1'});
appointment.fetch().complete(function () {
//    appointment.set('cancelled', true);
    appointment.on('change:cancelled', function () {
        if(appointment.get('cancelled'))
            alert('The appointmentment ' + this.attributes.title + ' was cancelled!');
    });
//    appointment.save();
});
/*
appointment.set('title', 'Checkup');
appointment.set('description', 'My knee hurts');
appointment.save();
*/
appointmentList = new AppointmentList();
appointmentList.add(appointment);
appointmentList.on('add', function(a) {
    alert('New Appointment!!!\n' + a.get('title'));
});
descriptions = appointmentList.map(function(a) {
    return a.get('description');
});
var AppointmentView = Backbone.View.extend({
    tagName: 'ul',
    id: "appointments",
    initialize: function() {
        this.model.on('destroy', this.remove, this );
        this.model.on('change:cancelled', this.render, this);
    },
    destroy: function() {
        this.model.destroy();
    },
    remove: function() {
        this.$el.remove();
    },
    events: {
        'dblclick li': 'alert',
        'click #cancel': 'cancel',
        'click #destroy': 'destroy'
    },
    cancel: function() {
        this.model.cancel();
    },
    alert: function() {
        alert(this.model.get('description'));
    },
    template: _.template('<li' +
        '<% if(cancelled) print(\' class="cancelled"\') %> >' +
        '<button type="button" id="destroy"></button>' +
        '<%= title %>' +
        '<button type="button" id="cancel"' +
        '<% if(cancelled) print(" disabled") %>' +
        '>Cancel</button>' +
        '</li>'),
    render: function () {
        var attributes = this.model.toJSON();
        $(this.el).html(this.template(attributes));
    }
});
var AppView = Backbone.View.extend({
    id: "app",
    render: function () {
        var app = $(this.el);
        $('<h1></h1>', {text: "Appointments"}).appendTo(app);
        var appointmentView = new AppointmentView({model: appointment});
        appointmentView.model.fetch().complete(function () {
            appointmentView.render();
            app.append(appointmentView.el);
        });

    }
});
var app = new AppView();
app.render();
$('body').append(app.el);
