var numeral = require('numeral');
// load a language
numeral.language('fr', {
	delimiters: {
		thousands: '.',
		decimal: ','
	},
	abbreviations: {
		thousand: 'k',
		million: 'm',
		billion: 'b',
		trillion: 't'
	},
	ordinal : function (number) {
		return number === 1 ? 'er' : 'ème';
	},
	currency: {
		symbol: '€'
	}
});

// switch between languages
numeral.language('fr');

exports.numeral = function(x) {
    return numeral(x);
};
