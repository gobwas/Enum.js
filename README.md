Enum.js
=======

Simple Enumerable object in javascript.

Usage
-----

##### Creating custom Enum

Enum.extend function expect two parameters:
 - first is a static properties aka Enum constants,
 - second is a custom prototype methods.

```javascript

var HTTPCodeEnum = Enum.extend({
    CONTINUE:         "100",
    OK:               "200",
    MULTIPLE_CHOISES: "300",
    BAD_REQUEST:      "400",
    INTERNAL_ERROR:   "500"
});

```

You can also pass in first object:
 - static functions, that will can be accessed like ```MyEnum.myFunction()```
 - static objects,
 - static values, needed for internal usage. To prevent parsing them as Enum constant, add double underscore as prefix, like: ```__myInternalValue```

Enum throws error in some usual cases. So there is an ability to use custom Errors for your custom Enums, to catch them upper and check with ```instanceOf``` function:

```javascript

var HTTPCodeEnum = Enum.extend({
    ... // constants

    __error: MyOwnError // reference to your Error constructor
});

```

> If ```__error``` does not present in first parameter object, then Enum uses its own EnumError constructor.
> Anyway, u can always get the reference to Error function via ```Enum.__error```


##### Simple usage

```javascript

function ajaxCallback(data) {
    if (data.code == HTTPCodeEnum.OK) {
        // ...
    }
}

```

##### Enum usage:

```javascript

function ajaxCallback(data) {

    // Throws a EnumError if catch non existing code
    var status = new HTTPCodeEnum(data.code);

    // Returns mapped message
    // getMessage must be implemented in HTTPCodeEnum.prototype
    console.log(status.getMessage());
}

// Exceptions handling

function indexController() {
    try {
        var request = $.ajax(...).done(ajaxCallback);
    } catch(e) {
        if (e instanceof HTTPCodeEnum.__error) {
            console.log('Catched non existing HTTP code!', e.message);
        }
    }
}

```