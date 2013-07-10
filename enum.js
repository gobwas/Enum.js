/**
 * Enum.js - Javascript enum object.
 *
 * https://github.com/gobwas/Enum.js.git
 *
 * Version: 0.1.1
 * Commit: "50b0b24cdc235925bd6900e512ceb1bdb9b4fbf8"
 * Date: 2013-07-10 11:24:57
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
    var hasEnumKey = function(needle, object) {
        return object.hasOwnProperty(needle) &&
            typeof object[needle] !== 'function' &&
            typeof object[needle] !== 'object' &&
            needle.substr(0,2) !== '__';
    };



    /**
     * Inheritance function.
     *
     * @param {function} Parent
     * @param {object} [protoProps]
     * @param {object} [staticProps]
     *
     * @returns {function}
     */
    var inherit = function(Parent, protoProps, staticProps) {
        var Child;

        protoProps || (protoProps = {});
        staticProps || (staticProps = {});

        if (protoProps.hasOwnProperty("constructor") && typeof protoProps.constructor === 'function') {
            Child = protoProps.constructor;
        } else {
            Child = function Child(){Parent.apply(this, arguments);};
        }

        // set the static props to the new Enum
        extend(Child, Parent, staticProps);

        // create prototype of Child, that created with Parent prototype
        // (without making Child.prototype = new Parent())
        //
        // __proto__  <----  __proto__
        //     ^                 ^
        //     |                 |
        //   Parent            Child
        //
        function Surrogate(){}
        Surrogate.prototype = Parent.prototype;
        Child.prototype = new Surrogate();

        // extend prototype
        extend(Child.prototype, protoProps, {constructor: Child});

        // link to Parent prototype
        Child.__super__ = Parent.prototype;

        return Child;
    };


    // Package exception
    // -----------------

    var EnumError = inherit(Error, {
        constructor: function EnumError() {
            var error =  Error.apply(null, arguments);

            this.__error = error;

            this.message = error.message;
            this.stack   = error.stack;
        },
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
            throw new this.constructor.__error("'" + this.name + "' does not have the value '" + val + "'");
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
                throw new this.constructor.__error("Enum object is expected");
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

    // Static methods of Enum
    // ----------------------

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
                // avoid code like: new this.prototype.constructor(this[key]);
                // so need to emulate work of 'new' command:
                /*var Child = function Child(){};
                Child.prototype = this.prototype;
                var obj = new Child();

                this.call(obj, this[key]);

                return obj;*/
                return new this.prototype.constructor(this[key]);
            }

            throw new this.__error("'" + this.prototype.name + "' does not have value for key '" + key + "'");
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
            prototypeProps || (prototypeProps = {});

            // Resulted constructor
            var Child = inherit(this, prototypeProps, staticProps);

            // freeze enum if it possible
            if (typeof Object.freeze === 'function') {
                Object.freeze(Child);
            }

            return Child;
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
