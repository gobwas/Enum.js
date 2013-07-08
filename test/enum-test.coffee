assert    = require('chai').assert
Enum      = require('../src/enum.js').Enum
EnumError = require('../src/enum.js').EnumError

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

    test "Should throw the EnumError", ->
      error = null

      try
        result = new HTTPEnum 123
      catch err
        error = err

      assert.isNotNull error
      assert.instanceOf error, Error
      assert.instanceOf error, EnumError

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


  # Enum#keyOf
  # ----------

  suite "#keyOf", ->

    test "Should return property name if it exists", ->
      result = HTTPEnum.keyOf(HTTPEnum.OK);

      assert.isString result
      assert.isTrue result == "OK"


    test "Should return null if property doesn't exist", ->
      result = HTTPEnum.keyOf(123);

      assert.isNull result

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

    test "Should return instance of TestEnum", ->
      TestEnum = Enum.extend(keys)

      obj = new TestEnum 1

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