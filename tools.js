module.exports = {
	prettySize: function (bytes, mode = 'metric') {
		let modes = {
			metric: {
				multiplier: 1000,
				prefixes: ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
			},
			binary: {
				multiplier: 1024,
				prefixes: ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi']
			}
		};

		if (typeof modes[mode] === 'undefined')
			return 'unsupported mode'

		for (var i = 0; bytes > modes[mode].multiplier; ++i)
			bytes /= modes[mode].multiplier;

		let result = bytes.toFixed(1);
		if (result[result.length - 1] === '0')
			result = bytes.toFixed(0);

		return result + ' ' + modes[mode].prefixes[i] + 'B';
	}
};
