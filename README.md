Enum.js
=======

Simple Enumerable object in javascript.

Usage
-----

```javascript

var HTTPCodeEnum = Enum.extend({
    CONTINUE:         "100",
    OK:               "200",
    MULTIPLE_CHOISES: "300",
    BAD_REQUEST:      "400",
    INTERNAL_ERROR:   "500"
});

```

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
        if (e instanceof EnumError) {
            console.log('Catched non existing HTTP code!', e.message);
        }
    }
}

```