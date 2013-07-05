(function(global, undefined) {

    "use strict";

    // Helper methods
    // --------------

    /**
     * Each iterator.
     *
     * @param {object}   props
     * @param {function} func
     * @param {object} [context]
     *
     * @returns {*}
     */
    var each = function(props, func, context) {
        var result;

        context || (context = null);

        for (var x in props) {
            if (props.hasOwnProperty(x)) {
                result = func.call(context, props[x], x, props);

                if (result !== undefined) {
                    return result;
                }
            }
        }

        return result;
    };

    /**
     * Extends one object by multiple others.
     *
     * @param {object} to
     *
     * @returns {object}
     */
    var extend = function(to) {
        var from = Array.prototype.slice.call(arguments, 1);

        for (var x = 0; x < from.length; x++) {
            each(from[x], function(value, prop) {
                to[prop] = value;
            });
        }

        return to;
    };

    var indexOf = function(val, obj) {
        return each(obj, function(value, key) {
            if (value === val) {
                return key;
            }

            return undefined;
        });
    };

    var hasEnumKey = function(needle, object) {
        return typeof object[needle] !== 'function' && typeof object[needle] !== 'object' && needle.substr(0,2) !== '__';
    };

    // Package exception
    // -----------------

    var EnumError = function EnumError(msg) {
        Error.prototype.constructor.apply(this, arguments);

        // don't know reasons why upper line doesn't apply this:
        this.message = msg;
    };

    var _Error = function(){};
    _Error.prototype = Error.prototype;
    EnumError.prototype = new _Error();

    extend(EnumError.prototype, {
        constructor: EnumError,
        name:        "EnumError",
        message:     ""
    });



    // Enum base class
    // ---------------

    var Enum = function Enum(val) {
        var value = null,
            key = indexOf(val, this.constructor.values());

        if (key === undefined) {
            throw new EnumError("'" + this.name + "' does not have value '" + val + "'");
        }

        value = val;

        this.value = function() {
            return value;
        };

        this.key = function() {
            return key;
        }
    };

    Enum.prototype = {
        constructor: Enum,

        name: "AbstractEnum",

        equal: function(value) {
            return this.value() === value;
        },

        equalEnum: function(e) {
            if (!e instanceof Enum) {
                throw new EnumError("Enum object is expected");
            }

            return this.value() === e.value();
        },

        valueOf: function() {
            return this.value();
        },

        toLocaleString: function() {
            return this.value();
        },

        toString: function() {
            return this.value();
        }
    };

    // Static methods:
    var statics = {
        /**
         * Creates new Enum object by key.
         *
         * Some kind of syntax-sugar: not need to write something like new MyEnum(MyEnum.MyValue);
         * just MyEnum.create("MyValue")
         *
         * @param {string} key
         *
         * @throws EnumError
         *
         * @returns {this}
         */
        make: function(key) {
            if (hasEnumKey(key, this)) {
                return new this(this[key]);
            }

            throw new EnumError("'" + this.name + "' does not have value for key '" + key + "'");
        },

        /**
         * Checks, if this Enum has needle.
         *
         * @param {*} needle
         *
         * @returns {boolean}
         */
        has: function(needle) {
            return !!this.keyOf(needle);
        },

        /**
         * Trying to find a key of needle.
         *
         * @param {*} needle
         *
         * @returns {*}
         */
        keyOf: function(needle) {
            var prop = each(this.values(), function(val, prop) {
                if (needle === val) {
                    return prop;
                }

                return undefined;
            });

            return prop ? prop : null;
        },

        /**
         * Lists all keys and values of this Enum.
         *
         * @returns {{}}
         */
        values: function() {
            var response = {},
                self = this;

            each(self, function(value, key) {
                if (hasEnumKey(key, self)) {
                    response[key] = self[key];
                }
            });

            return response;
        },

        /**
         * Lists all keys and values of this Enum.
         * Overriding standard method.
         *
         * @proxy this.values()
         *
         * @returns {{}}
         */
        valueOf: function() {
            return this.values();
        },

        /**
         * Lists all keys and values of this Enum concatenated.
         * Overriding standard method.
         *
         * @see this.values()
         *
         * @returns {string}
         */
        toString: function() {
            var result = "";

            each(this.values(), function(value, key) {
                result+= (result.length == 0 ? "" : "; ") + key + ' = '+ value;
            });

            return result;
        },

        /**
         * Realizes inheritance ability.
         *
         * @param {object} staticProps
         * @param {object} prototypeProps
         *
         * @todo Maybe differ staticProps to Constants and StaticMethods
         * @returns {*}
         */
        extend: function(staticProps, prototypeProps) {
            var parent = this,
                child;

            staticProps || (staticProps = {});
            prototypeProps || (prototypeProps = {});

            if (prototypeProps.hasOwnProperty("constructor") && typeof prototypeProps.constructor === 'function') {
                child = prototypeProps.constructor;
            } else {
                child = function child(){parent.apply(this, arguments);}
            }

            // set the static props to the new Enum
            extend(child, parent, staticProps);

            // create prototype of child, that created with parent prototype
            // (without making child.prototype = new parent())
            //
            // __proto__  <----  __proto__
            //     ^                 ^
            //     |                 |
            //    base             child
            //
            function Surrogate(){}
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate();

            // extend prototype
            extend(child.prototype, prototypeProps, {constructor: child});

            // link to parent prototype
            child.__super__ = parent.prototype;

            // freeze enum if it possible
            if (typeof Object.freeze === 'function') {
                Object.freeze(child);
            }

            return child;
        }
    };

    // Apply all static methods to class.
    extend(Enum, statics);

    // AMD Functionality or global object
    // ----------------------------------

    //if (typeof define === 'function') {
    //	define([], function() {return Enum});
    //} else {
    global.Enum = Enum;
    global.EnumError = EnumError;
    //}

})(this);
