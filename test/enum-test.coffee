assert    = require('chai').assert
Enum      = require('../src/enum.js').Enum
EnumError = require('../src/enum.js').EnumError

# Test object
HTTPEnum = null

keys =
  A: 1
  B: "b"
  C: false

suite "Enum.js", ->
  setup ->
    HTTPEnum = Enum.extend
      OK:    200
      ERROR: 500

  # Enum#make() method
  suite "#make", ->
    test "Created enum should be instance of HTTPEnum", ->
      OK = HTTPEnum.make('OK');
      assert.instanceOf OK, HTTPEnum

    test "Created enum should be instance of Enum", ->
      OK = HTTPEnum.make('OK');
      assert.instanceOf OK, Enum

  suite "#keyOf", ->
    test "Should return property name if it have existing value", ->
      assert.isTrue HTTPEnum.keyOf(HTTPEnum.OK) == "OK"

    test "Should return null if doesn't have value", ->
      assert.isNull HTTPEnum.keyOf(123)

  suite "#has", ->
    test "Should return true if have existing value", ->
      assert.isTrue HTTPEnum.has HTTPEnum.OK

    test "Should return false if doesn't have existing value", ->
      assert.isFalse HTTPEnum.has(123)

  suite "#values", ->
    test "Should return correct list of values", ->
      keysWrong =
        A: 0
        B: "c"

      MyEnum = Enum.extend keys

      assert.deepEqual MyEnum.values(), keys
      assert.notDeepEqual MyEnum.values(), keysWrong

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