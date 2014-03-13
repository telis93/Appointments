// Generated by CoffeeScript 1.3.3

/*
(c) 2012 Jan Monschke
v1.3
backbone-couchdb.js is licensed under the MIT license.
*/


(function() {
  var con,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Backbone.couch_connector = con = {
    config: {
      db_name: "backbone_connect",
      ddoc_name: "backbone_example",
      view_name: "byCollection",
      list_name: null,
      global_changes: false,
      single_feed: false,
      base_url: null
    },
    _global_db_inst: null,
    _global_changes_handler: null,
    _global_changes_callbacks: [],
    helpers: {
      extract_collection_name: function(model) {
        var _name, _splitted;
        if (model == null) {
          throw new Error("No model has been passed");
        }
        if (!(((model.collection != null) && (model.collection.url != null)) || (model.url != null))) {
          return "";
        }
        if (model.url != null) {
          _name = _.isFunction(model.url) ? model.url() : model.url;
        } else {
          _name = _.isFunction(model.collection.url) ? model.collection.url() : model.collection.url;
        }
        if (_name[0] === "/") {
          _name = _name.slice(1, _name.length);
        }
        _splitted = _name.split("/");
        if (_splitted.length > 0) {
          if (model.id === _splitted[_splitted.length - 1]) {
            _splitted.pop();
          }
          _name = _splitted.join('/');
        }
        if (_name.indexOf("/") === 0) {
          _name = _name.replace("/", "");
        }
        return _name;
      },
      filter_collection: function(results, collection_name) {
        var entry, _i, _len, _ref, _results;
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          entry = results[_i];
          if ((entry.deleted === true) || (((_ref = entry.doc) != null ? _ref.collection : void 0) === collection_name)) {
            _results.push(entry);
          }
        }
        return _results;
      },
      make_db: function() {
        var db;
        db = $.couch.db(con.config.db_name);
        if (con.config.base_url != null) {
          db.uri = "" + con.config.base_url + "/" + con.config.db_name + "/";
        }
        return db;
      }
    },
    read: function(model, opts) {
      if (model.models) {
        return con.read_collection(model, opts);
      } else {
        return con.read_model(model, opts);
      }
    },
    read_collection: function(coll, opts) {
      var keys, option, view_options, _ddoc, _i, _len, _list, _opts, _view,
        _this = this;
      _view = this.config.view_name;
      _ddoc = this.config.ddoc_name;
      _list = this.config.list_name;
      keys = [this.helpers.extract_collection_name(coll)];
      if (coll.db != null) {
        if (coll.db.changes || this.config.global_changes) {
          coll.listen_to_changes();
        }
        if (coll.db.view != null) {
          _view = coll.db.view;
        }
        if (coll.db.ddoc != null) {
          _ddoc = coll.db.ddoc;
        }
        if (coll.db.keys != null) {
          keys = coll.db.keys;
        }
        if (coll.db.list != null) {
          _list = coll.db.list;
        }
      }
      _opts = {
        keys: keys,
        success: function(data) {
          var doc, _i, _len, _ref, _temp;
          _temp = [];
          _ref = data.rows;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            doc = _ref[_i];
            if (doc.value) {
              _temp.push(doc.value);
            } else {
              _temp.push(doc.doc);
            }
          }
          opts.success(_temp);
          return opts.complete();
        },
        error: function(status, error, reason) {
          var res;
          res = {
            status: status,
            error: error,
            reason: reason
          };
          opts.error(res);
          return opts.complete(res);
        }
      };
      view_options = ["key", "keys", "startkey", "startkey_docid", "endkey", "endkey_docid", "limit", "stale", "descending", "skip", "group", "group_level", "reduce", "include_docs", "inclusive_end", "update_seq"];
      for (_i = 0, _len = view_options.length; _i < _len; _i++) {
        option = view_options[_i];
        if (opts[option] != null) {
          _opts[option] = opts[option];
        }
      }
      if ((coll.db != null) && (coll.db.view != null) && !(coll.db.keys != null)) {
        delete _opts.keys;
      }
      if (_list) {
        return this.helpers.make_db().list("" + _ddoc + "/" + _list, "" + _view, _opts);
      } else {
        return this.helpers.make_db().view("" + _ddoc + "/" + _view, _opts);
      }
    },
    init_global_changes_handler: function(callback) {
      var _this = this;
      this._global_db_inst = con.helpers.make_db();
      return this._global_db_inst.info({
        "success": function(data) {
          var opts;
          opts = _.extend({
            include_docs: true
          }, con.config.global_changes_opts);
          _this._global_changes_handler = _this._global_db_inst.changes(data.update_seq || 0, opts);
          _this._global_changes_handler.onChange(function(changes) {
            var cb, _i, _len, _ref, _results;
            _ref = _this._global_changes_callbacks;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              cb = _ref[_i];
              _results.push(cb(changes));
            }
            return _results;
          });
          return callback();
        }
      });
    },
    register_global_changes_callback: function(callback) {
      var _this = this;
      if (callback == null) {
        return;
      }
      if (!(this._global_db_inst != null)) {
        return this.init_global_changes_handler(function() {
          return _this._global_changes_callbacks.push(callback);
        });
      } else {
        return this._global_changes_callbacks.push(callback);
      }
    },
    read_model: function(model, opts) {
      if (!model.id) {
        throw new Error("The model has no id property, so it can't get fetched from the database");
      }
      return this.helpers.make_db().openDoc(model.id, {
        success: function(doc) {
          opts.success(doc);
          return opts.complete();
        },
        error: function(status, error, reason) {
          var res;
          res = {
            status: status,
            error: error,
            reason: reason
          };
          opts.error(res);
          return opts.complete(res);
        }
      });
    },
    create: function(model, opts) {
      var coll, vals;
      vals = model.toJSON();
      coll = this.helpers.extract_collection_name(model);
      if (coll.length > 0) {
        vals.collection = coll;
      }
        if(vals.id)
            vals._id=vals.id;
      return this.helpers.make_db().saveDoc(vals, {
        success: function(doc) {
          opts.success({
            _id: (vals.id)? vals.id:doc.id,
            _rev: doc.rev
          });
          return opts.complete();
        },
        error: function(status, error, reason) {
          var res;
          res = {
            status: status,
            error: error,
            reason: reason
          };
          opts.error(res);
          return opts.complete(res);
        }
      });
    },
    update: function(model, opts) {
      return this.create(model, opts);
    },
    del: function(model, opts) {
      return this.helpers.make_db().removeDoc(model.toJSON(), {
        success: function() {
          return opts.success();
        },
        error: function(nr, req, error) {
          var res;
          if (error === "deleted") {
            opts.success();
            return opts.complete();
          } else {
            res = {
              error: error
            };
            opts.error(res);
            return opts.complete(res);
          }
        }
      });
    }
  };

  Backbone.sync = function(method, model, opts) {
    var _ref, _ref1, _ref2;
    if ((_ref = opts.success) == null) {
      opts.success = function() {};
    }
    if ((_ref1 = opts.error) == null) {
      opts.error = function() {};
    }
    if ((_ref2 = opts.complete) == null) {
      opts.complete = function() {};
    }
     //todo: remove that
    if(model.models)
         console.log('hi');
    else if(model.attributes.id)
          model.id = model.attributes.id;
    switch (method) {
      case "read":
        return con.read(model, opts);
      case "create":
        return con.create(model, opts);
      case "update":
        return con.update(model, opts);
      case "delete":
        return con.del(model, opts);
    }
  };

  Backbone.Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.idAttribute = "_id";

    Model.prototype.clone = function() {
      var new_model;
      new_model = new this.constructor(this);
      if (new_model.attributes._id) {
        delete new_model.attributes._id;
      }
      if (new_model.attributes._rev) {
        delete new_model.attributes._rev;
      }
      return new_model;
    };

    return Model;

  })(Backbone.Model);

  Backbone.Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection() {
      this._db_on_change = __bind(this._db_on_change, this);

      this._db_prepared_for_global_changes = __bind(this._db_prepared_for_global_changes, this);

      this._db_prepared_for_changes = __bind(this._db_prepared_for_changes, this);
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.model = Backbone.Model;

    Collection.prototype.initialize = function() {
      if (!this._db_changes_enabled && ((this.db && this.db.changes) || con.config.global_changes)) {
        return this.listen_to_changes();
      }
    };

    Collection.prototype.listen_to_changes = function() {
      if (!this._db_changes_enabled) {
        this._db_changes_enabled = true;
        if (con.config.single_feed) {
          return this._db_prepared_for_global_changes();
        } else {
          if (!this._db_inst) {
            this._db_inst = con.helpers.make_db();
          }
          return this._db_inst.info({
            "success": this._db_prepared_for_changes
          });
        }
      }
    };

    Collection.prototype.stop_changes = function() {
      this._db_changes_enabled = false;
      if (this._db_changes_handler != null) {
        this._db_changes_handler.stop();
        return this._db_changes_handler = null;
      }
    };

    Collection.prototype._db_prepared_for_changes = function(data) {
      var opts,
        _this = this;
      this._db_update_seq = data.update_seq || 0;
      opts = {
        include_docs: true,
        collection: con.helpers.extract_collection_name(this),
        filter: "" + con.config.ddoc_name + "/by_collection"
      };
      _.extend(opts, this.db);
      return _.defer(function() {
        _this._db_changes_handler = _this._db_inst.changes(_this._db_update_seq, opts);
        return _this._db_changes_handler.onChange(_this._db_on_change);
      });
    };

    Collection.prototype._db_prepared_for_global_changes = function() {
      return con.register_global_changes_callback(this._db_on_change);
    };

    Collection.prototype._db_on_change = function(changes) {
      var obj, results, _doc, _i, _len, _results;
      results = changes.results;
      if (this.db && this.db.local_filter) {
        results = this.db.local_filter(results);
      } else if (con.config.single_feed) {
        results = con.helpers.filter_collection(results, con.helpers.extract_collection_name(this));
      }
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        _doc = results[_i];
        obj = this.get(_doc.id);
        if (obj != null) {
          if (_doc.deleted) {
            _results.push(this.remove(obj));
          } else {
            if (obj.get("_rev") !== _doc.doc._rev) {
              _results.push(obj.set(_doc.doc));
            } else {
              _results.push(void 0);
            }
          }
        } else {
          if (!_doc.deleted) {
            _results.push(this.add(_doc.doc));
          } else {
            _results.push(void 0);
          }
        }
      }
      return _results;
    };

    return Collection;

  })(Backbone.Collection);

}).call(this);
