!function() {
	var HTTPCodeEnum = Enum.extend({
		CONTINUE:         "100",
		OK:               "200",
		MULTIPLE_CHOISES: "300",
		BAD_REQUEST:      "400",
		INTERNAL_ERROR:   "500"
	}, {
		name: "HTTPCodeEnum",
		weight: {
			CONTINUE:         1,
			OK:               2,
			MULTIPLE_CHOISES: 3,
			BAD_REQUEST:      4,
			INTERNAL_ERROR:   5
		},
		getWeight: function() {

		},
		isGreater: function(e) {

		}
	});

	window.HTTPCodeEnum = HTTPCodeEnum;
}();

