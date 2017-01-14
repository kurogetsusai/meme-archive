module.exports = {
	prettySize: function (bytes, mode) {
		let multiplier = mode === 'binary' ? 1024 : 1000;
		let number = bytes;
		let unit = 'B';

		loop:
		while (number > multiplier) {
			number /= multiplier;

			switch (unit) {
			case 'B':
				unit = multiplier === 1000 ? 'kB' : 'KiB';
				break;
			case 'kB':
				unit ='MB'
				break;
			case 'KiB':
				unit ='MiB'
				break;
			case 'MB':
				unit ='GB'
				break;
			case 'MiB':
				unit ='GiB'
				break;
			case 'GB':
				unit ='TB'
				break;
			case 'GiB':
				unit ='TiB'
				break;
			case 'TB':
				unit ='PB'
				break;
			case 'TiB':
				unit ='PiB'
				break;
			case 'PB':
				unit ='EB'
				break;
			case 'PiB':
				unit ='EiB'
				break;
			case 'EB':
				unit ='ZB'
				break;
			case 'EiB':
				unit ='ZiB'
				break;
			case 'ZB':
				unit ='YB'
				break loop;
			case 'ZiB':
				unit ='YiB'
				break loop;
			}
		}

		let result = number.toFixed(1);
		if (result[result.length - 1] === '0')
			result = number.toFixed(0);

		return result + ' ' + unit;
	}
};
