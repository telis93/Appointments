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
        'click .destroy': 'destroy'
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
    events: {
        "keypress #add": function(e) {
            var textField = $('#add');
            title = textField.attr('value');
            if(e.which == 13 && title) {
                var a = new Appointment({title: textField.attr('value')});
                appointmentList.add(a);
                a.save();
                textField.attr('value', '');
            }

        }
    },
    render: function () {
        var app = $(this.el);
        $('<h1>', {text: "Appointments"}).appendTo(app);
        $('<input>', {type:"text", id:"add"}).appendTo(app);
        var appointmentsView = new AppointmentsView({collection: appointmentList});
        appointmentsView.collection.fetch({silent: true}).complete(function () {
            appointmentsView.render();
            app.append(appointmentsView.el);
        });

    }
});
var app = new AppView();
app.render();
var $body = $('body');
$body.append(app.el);
$('#add').focus();
var overlay = $('<div>', {id: 'overlay'}),
    loginDiv = $('<div>', {id: 'login-container'}).appendTo($body),
    loginHeader = $('<div>', {id: 'login-header', text: 'Login'}).appendTo(loginDiv),
    login = $('<div>', {id: 'login'}).appendTo(loginDiv).
    on('click','a', function() {
            overlay.appendTo($body);
            loginDiv.css('left', parseFloat($body.css('width'),10)/2 - parseFloat(loginDiv.css('width'),10)/2);
            loginDiv.css('top', parseFloat($body.css('height'),10)/2 - parseFloat(loginDiv.css('height'),10)/2);

    });
    login.couchLogin({
        loggedIn: function() {
            overlay.remove();
            loginDiv.css('left','').css('top','');
        },
        loggedOut: function() {
            overlay.remove();
            loginDiv.css('left','').css('top','');
        }
    });
