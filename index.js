const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const tools = require('./tools');

const memeDir = './public/meme';

const app = express();
const handlebars = exphbs.create({
	defaultLayout: 'main',
	helpers: {
		raw: param => param.fn(),
		matches: function (value, test, options) {
			return value == test ? options.fn(this) : options.inverse(this);
		},
		nmatches: function (value, test, options) {
			return value != test ? options.fn(this) : options.inverse(this);
		},
		equals: function (value, test, options) {
			return value === test ? options.fn(this) : options.inverse(this);
		},
		nequals: function (value, test, options) {
			return value !== test ? options.fn(this) : options.inverse(this);
		},
		switch: function (value, options) {
			this.switchValue = value;
			let html = options.fn(this); // process the body of the switch block
			delete this.switchValue;
			return html;
		},
		case: function (value, options) {
			if (value === this.switchValue)
				return options.fn(this);
		}
	}
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 8000);
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
	response.redirect('/archive');
});

app.get('/archive*', function (request, response) {
	const params = decodeURI(request.url).split('/').filter(value => value !== '').splice(1);
	const currPath = memeDir + '/' + params.join('/');
	let render = function (memes) {
		// sort the memes
		let sortFunc = (a, b) => a.filename > b.filename;
		let memesDirOnly = memes.filter(value => value.isDirectory).sort(sortFunc);
		let memesNoDirs = memes.filter(value => !value.isDirectory).sort(sortFunc);
		memes = memesDirOnly.concat(memesNoDirs);

		// path for images and links
		let pathPrefix = currPath.substr(memeDir.length);
		if (pathPrefix === '/')
			pathPrefix = '';

		// back path
		let backPath = '/archive' + pathPrefix;
		backPath = backPath.substr(0, backPath.lastIndexOf('/'));

		// backItemCount
		let backRealPath = currPath.substr(0, currPath.lastIndexOf('/'));

		fs.readdir(backRealPath, (err, filesInside) => {
			response.render('home', {
				backPath: backPath,
				backItemCount: suffixNumber(filesInside.length, 'item'),
				pathPrefix: pathPrefix,
				memes: memes
			});
		});
	};
	let getFileType = function (fileName) {
		const extImage = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'];
		const extVideo = ['.webm', '.mp4', '.gifv'];
		let fn = fileName.toLowerCase();

		if (extImage.some(s => fn.endsWith(s)))
			return 'image';
		else if (extVideo.some(s => fn.endsWith(s)))
			return 'video';
		else
			return 'binary';
	};
	let suffixNumber = (number, suffix) => number + ' ' + suffix + (number !== 1 ? 's' : '');

	// ls current dir to build the meme array and render it
	fs.readdir(currPath, (err, files) => {
		let memes = [];
		if (files.length === 0)
			render(memes);

		files.forEach(file => {
			// get file info
			fs.stat(currPath + '/' + file, (err, stats) => {
				if (stats.isDirectory()) {
					// read the dir to get item count
					fs.readdir(currPath + '/' + file, (err, filesInside) => {
						memes.push({
							filename: file,
							isDirectory: true,
							itemCount: suffixNumber(filesInside.length, 'item')
						});

						if (memes.length === files.length)
							render(memes);
					});
				} else {
					memes.push({
						filename: file,
						isDirectory: false,
						fileType: getFileType(file),
						size: tools.prettySize(stats.size)
					});

					if (memes.length === files.length)
						render(memes);
				}
			});
		});
	})
});

app.listen(app.get('port'), function () {
	console.log('Listening on port ' + app.get('port') + '.');
});
