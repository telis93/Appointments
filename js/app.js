Backbone.couch_connector.config.db_name = "appointments";
Backbone.couch_connector.config.ddoc_name = "appointments";
Backbone.couch_connector.config.global_changes = false;

var Appointment = Backbone.Model.extend({urlRoot: '/appointments',
    defaults: function () {
        return {title: 'Checkup', date: new Date()}
    }
});
var appointment = new Appointment({id: '1'});
appointment.fetch().complete(function () {
    appointment.set('cancelled', true);
    appointment.on('change:cancelled', function () {
        alert('The appointmentment ' + this.attributes.title + ' was cancelled!');
    });
    appointment.save();
});
/*appointment.set('description', 'My knee hurts');
 appointment.save();*/
var AppointmentView = Backbone.View.extend({
    tagName: 'ul',
    id: "appointments",
    events: {
        'dblclick li': 'alert'
    },
    alert: function(e) {
        alert(this.model.get('description'));
    },
    template: _.template('<li><%= title %></li>'),
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