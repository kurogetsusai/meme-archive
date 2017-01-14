const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const tools = require('./tools');

const memeDir = './public/meme';

const app = express();
const handlebars = exphbs.create({
	defaultLayout: 'main',
	helpers: {
		raw: param => param.fn()
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
	let params = request.url.split('/').filter(value => value !== '').splice(1);
	let currPath = memeDir + '/' + params.join('/');
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
				backItemCount: filesInside.length + ' items',
				pathPrefix: pathPrefix,
				memes: memes
			});
		});
	};

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
							itemCount: filesInside.length + ' items'
						});

						if (memes.length === files.length)
							render(memes);
					});
				} else {
					memes.push({
						filename: file,
						isDirectory: false,
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
