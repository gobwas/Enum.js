/**
 * Enum.js - Javascript enum object.
 *
 * Version: 0.1.0
 * Date: 2013-07-09 18:11:31
 *
 * Copyright 2013, Sergey Kamardin.
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Location: Moscow, Russia.
 * Contact: gobwas@gmail.com
 *
 *
 *         ___         ___           ___           ___           ___
 *        /\  \       /\__\         /\  \         /\__\         /\__\
 *       /::\  \     /:/ _/_       /::\  \       /:/  /        /:/ _/_
 *      /:/\:\__\   /:/ /\__\     /:/\:\  \     /:/  /        /:/ /\__\
 *     /:/ /:/  /  /:/ /:/ _/_   /:/ /::\  \   /:/  /  ___   /:/ /:/ _/_
 *    /:/_/:/  /  /:/_/:/ /\__\ /:/_/:/\:\__\ /:/__/  /\__\ /:/_/:/ /\__\
 *    \:\/:/  /   \:\/:/ /:/  / \:\/:/  \/__/ \:\  \ /:/  / \:\/:/ /:/  /
 *     \::/__/     \::/_/:/  /   \::/__/       \:\  /:/  /   \::/_/:/  /
 *      \:\  \      \:\/:/  /     \:\  \        \:\/:/  /     \:\/:/  /
 *       \:\__\      \::/  /       \:\__\        \::/  /       \::/  /
 *        \/__/       \/__/         \/__/         \/__/         \/__/
 *
 */



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

        var func = function(value, prop) {
            to[prop] = value;
        };

        for (var x = 0; x < from.length; x++) {
            each(from[x], func);
        }

        return to;
    };

    /**
     * Finds property name for given value in given object.
     *
     * @param {*} needle
     * @param {object} obj
     * @returns {string|number|undefined}
     */
    var indexOf = function(needle, obj) {
        return each(obj, function(value, key) {
            if (value === needle) {
                return key;
            }

            return undefined;
        });
    };

    /**
     * Checks if given pair key-value is correct Enum constant.
     *
     * @param needle
     * @param object
     * @returns {boolean}
     */
    var hasEnumKey = (function() {
        return function(needle, object) {
            return typeof object[needle] !== 'function' && typeof object[needle] !== 'object' && needle.substr(0,2) !== '__';
        };
    })();


    // Package exception
    // -----------------

    var EnumError = function EnumError(msg) {
        var error =  Error.apply(null, arguments);

        this.__error = error;

        this.message = error.message;
        this.stack   = error.stack;
    };

    var EError = function(){};
    EError.prototype = Error.prototype;
    EnumError.prototype = new EError();

    extend(EnumError.prototype, {
        constructor: EnumError,
        name:        "EnumError",
        message:     ""
    });


    // Enum base class
    // ---------------

    /**
     * Constructor.
     *
     * @param val
     * @constructor
     */
    var Enum = function Enum(val) {
        var value = null,
            key = indexOf(val, this.constructor.values());

        if (key === undefined) {
            throw new EnumError("'" + this.name + "' does not have the value '" + val + "'");
        }

        value = val;

        this.value = function() {
            return value;
        };

        this.key = function() {
            return key;
        };
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
         * @returns {object}
         */
        make: function(key) {
            if (hasEnumKey(key, this)) {
                // old version was: return new this(this[key]);
                // avoid code like: new this(this[key]);
                // so need to emulate work of 'new' command:
                var F = function(){};
                F.prototype = this.prototype;
                var obj = new F();

                this.call(obj, this[key]);

                return obj;
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
                result+= (result.length === 0 ? "" : "; ") + key + ' = '+ value;
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
                child = function child(){parent.apply(this, arguments);};
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
        },

        /**
         * Reference to custom Error constructor.
         * Default value is EnumError.
         *
         * @type {Error}
         */
        __error: EnumError
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
