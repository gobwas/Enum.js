assert    = require('chai').assert
Enum      = require('../src/enum.js');

# Test object
HTTPEnum = null

keys =
  A: 1
  B: "b"
  C: false

# ---------------------------
# Tests suite for Enum module
# ---------------------------

suite "Enum.js", ->

  # Setup
  # -----

  setup ->
    HTTPEnum = Enum.extend
      OK:    200
      ERROR: 500

  # Enum#constructor (new)
  # ----------------------

  suite "#prototype.constructor", ->

    test "Should throw the right Error", ->
      error = null

      try
        result = new HTTPEnum 123
      catch err
        error = err

      assert.isNotNull error
      assert.instanceOf error, HTTPEnum.Error

    test "Should return instance of HTTPEnum", ->
      result = new HTTPEnum(HTTPEnum.OK)

      assert.ok result
      assert.instanceOf result, HTTPEnum

    test "Should return instance of Enum", ->
      result = new HTTPEnum(HTTPEnum.OK)

      assert.ok result
      assert.instanceOf result, Enum

  # Enum#make
  # ---------

  suite "#make", ->

    test "Should return correct instance of HTTPEnum", ->
      result = HTTPEnum.make "OK"
      value = HTTPEnum.OK

      assert.ok         result
      assert.equal      result.value(), value
      assert.instanceOf result, HTTPEnum

    test "Should throw a correct Error if key does not present", ->
      try
        result = HTTPEnum.make "HELLOOUU"
      catch err
        error = err

      assert.isNotNull error
      assert.instanceOf error, Enum.Error

  # Enum#has
  # --------

  suite "#has", ->

    test "Should return true if property exists", ->
      result = HTTPEnum.has HTTPEnum.OK

      assert.isBoolean result
      assert.isTrue result

    test "Should return false if doesn't have existing value", ->
      result = HTTPEnum.has(123)

      assert.isBoolean result
      assert.isFalse result

  # Enum#values
  # -----------

  suite "#values", ->

    test "Should return correct list of values", ->
      keysWrong =
        A: 0
        B: "c"

      MyEnum = Enum.extend keys

      result = MyEnum.values()

      assert.isObject     result
      assert.deepEqual    result, keys
      assert.notDeepEqual result, keysWrong

  # Enum#extend
  # -----------

  suite "#extend", ->

    test "Should return instance of Enum", ->
      TestEnum = Enum.extend(keys)

      obj = new TestEnum 1

      assert.instanceOf obj, Enum
      assert.instanceOf obj, TestEnum

    test "Should save deep inheritance", ->
      TestEnum = Enum.extend(keys)
      DeeperTestEnum = TestEnum.extend(keys)

      obj = new TestEnum 1
      deepObj = new DeeperTestEnum 1

      assert.instanceOf deepObj, Enum
      assert.instanceOf deepObj, TestEnum
      assert.instanceOf deepObj, DeeperTestEnum

      assert.notInstanceOf obj, DeeperTestEnum

    test "Should return Enum, that have all given constants", ->
      TestEnum = Enum.extend keys

      assert.deepEqual TestEnum.values(), keys

    test "Should return Enum, that have all given prototype methods", ->
      TestEnum = Enum.extend keys, callMe: -> true

      obj = new TestEnum 1

      assert.isFunction obj.callMe
      assert.isTrue obj.callMe()

    test "Should return Enum, that have all given static methods", ->
      TestEnum = Enum.extend callMe: -> true

      assert.isFunction TestEnum.callMe
      assert.isTrue TestEnum.callMe()

    test "Should throw given Error", ->
      class MyOwnError extends Error
        constructor: (message) ->
          err = new Error message

          @message = err.message
          @stack   = err.stack

      TestEnum = Enum.extend Error: MyOwnError

      try
        result = new TestEnum 123
      catch err
        error = err

      assert.isNotNull error
      assert.instanceOf error, MyOwnError

    test "Should throw error with message, that contains Enum name", ->
      TestEnum = Enum.extend {}, name: "testEnum"

      try
        result = new TestEnum 123
      catch err
        error = err

      regexp = new RegExp('^.*' + TestEnum.prototype.name + '.*$', 'i')

      assert.isNotNull error
      assert.isTrue regexp.test error.message