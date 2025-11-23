import express from 'express';
import cookieParser from 'cookie-parser';
import { makeId } from './services/util.service.js';
import { bugService } from './services/bug.service.js';
import { loggerService } from './services/logger.service.js';
import { userService } from './services/user.service.js';
import { authService } from './services/auth.service.js';

const app = express();
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API USER
app.get('/api/user', (req, res) => {
	userService
		.query()
		.then((users) => {
			res.send(users);
		})
		.catch((err) => {
			loggerService.error('Cannot load user', err);
			res.status(400).send('Cannot load user');
		});
});

app.get('/api/user/:userId', (req, res) => {
	console.log(req.params);
	const { userId } = req.params;
	userService
		.getById(userId)
		.then((user) => res.send(user))
		.catch((err) => {
			loggerService.error('Cannot load user', err);
			res.status(400).send('Cannot load user');
		});
});
// API AUTH

app.post('/api/auth/login', (req, res) => {
	const { username, password } = req.body;
	authService
		.checkLogin({ username, password })
		.then((user) => {
			const loginToken = authService.getLoginToken(user);
			res.cookie('loginToken', loginToken);
			res.send(user);
		})
		.catch((err) => {
			loggerService.error('Cannot login', err);
			res.status(404).send('Invalid Credentials');
		});
});
app.post('/api/auth/logout', (req, res) => {
	res.clearCookie('loginToken');
	res.send('Logged out');
});

app.post('/api/auth/signup', (req, res) => {
	const { username, password, fullname } = req.body;
	userService
		.add({ username, password, fullname })
		.then((user) => {
			const loginToken = authService.getLoginToken(user);
			res.cookie('loginToken', loginToken);
			res.send(user);
		})
		.catch((err) => {
			loggerService.error('Cannot signup', err);
			res.status(404).send('Invalid Credentials');
		});
});

//API BUG
app.get('/', (req, res) => res.send('Hello there me'));

// app.get('/api/bug/save', (req, res) => {
// 	console.log(req.query);
// 	const { _id, title, description, severity } = req.query;
// 	const bug = { _id, title, description, severity: +severity };
// 	bugService
// 		.save(bug)
// 		.then((bug) => res.send(bug))
// 		.catch((err) => {
// 			loggerService.error(err);
// 			res.status(404).send(err);
// 		});
// });

app.get('/api/bug', (req, res) => {
	//console.log(req.query);
	// const filterBy = {
	// 	txt: req.query.txt || '',
	// 	minSeverity: +req.query.minSeverity || 0,
	// };
	// bugService.query(filterBy).then((bugs) => res.send(bugs));

	const loggedinUser = authService.validateToken(req.cookies.loginToken);
	if (!loggedinUser) return res.status(401).send('Cannot add bug');

	const queryOptions = parseQueryParams(req.query);
	bugService
		.query(queryOptions)
		.then((bugs) => {
			res.send(bugs);
		})
		.catch((err) => {
			loggerService.error('Cannot get bug', err);
			res.status(404).send('Cannot get bug');
		});
});

app.get('/api/bug/:id', (req, res) => {
	const bugId = req.params.id;
	//console.log(bugId);
	const { vistedBugs = [] } = req.cookies;
	//console.log('Cookies: ', req.cookies);
	if (!vistedBugs.includes(bugId)) vistedBugs.push(bugId);
	if (vistedBugs.length > 3) return res.status(429).send('Wait for a bit');

	res.cookie('vistedBugs', vistedBugs, { maxAge: 1000 * 7 });
	bugService
		.getById(bugId)
		.then((bug) => res.send(bug))
		.catch((err) => {
			loggerService.error('Cannot get bug', err);
			res.status(404).send('Cannot get bug');
		});
});

app.post('/api/bug', (req, res) => {
	const loggedinUser = authService.validateToken(req.cookies.loginToken);
	if (!loggedinUser) return res.status(401).send('Cannot add bug');

	console.log(req.body);
	const bug = {
		title: req.body.title,
		description: req.body.description || '',
		severity: +req.body.severity,
		labels: req.body.lables || [],
	};

	if (!bug.title || bug.severity === undefined)
		return res.status(400).send('Missing mandatory fields');

	bugService
		.save(bug)
		.then((savedBug) => {
			res.send(savedBug);
		})
		.catch((err) => {
			loggerService.error('Cannot get bug', err);
			res.status(404).send('Cannot get bug');
		});
});

app.put('/api/bug/:id', (req, res) => {
	const loggedinUser = authService.validateToken(req.cookies.loginToken);
	if (!loggedinUser) return res.status(401).send('Cannot update bug');

	console.log(req.body);
	const { title, description, severity, labels, _id, creator } = req.body;
	if (!_id || !title || severity === undefined)
		return res.status(400).send('Missing mandatory fields');

	const bug = {
		_id,
		title,
		description,
		severity: +severity,
		labels: labels || [],
		creator,
	};
	bugService
		.save(bug)
		.then((savedBug) => {
			res.send(savedBug);
		})
		.catch((err) => {
			loggerService.error('Cannot get bug', err);
			res.status(404).send('Cannot get bug');
		});
});

app.delete('/api/bug/:bugId', (req, res) => {
	const loggedinUser = authService.validateToken(req.cookies.loginToken);
	if (!loggedinUser) return res.status(401).send('Cannot delete bug');

	const { bugId } = req.params;
	bugService
		.remove(bugId)
		.then(() => {
			loggerService.info(`Bug ${bugId} was removed`);
			res.status(204).send('Removed');
		})
		.catch((err) => {
			loggerService.error('Cannot get bug', err);
			res.status(404).send('Cannot get bug');
		});
});

app.listen(3030, () => loggerService.info('Server ready at port 3030'));

function parseQueryParams(queryParams) {
	const filterBy = {
		txt: queryParams.txt || '',
		minSeverity: +queryParams.minSeverity || 0,
		labels: queryParams.labels || [],
	};

	const sortBy = {
		sortField: queryParams.sortField || '',
		sortDir: +queryParams.sortDir || 1,
	};
	const pagination = {
		pageIdx:
			queryParams.pageIdx !== undefined
				? +queryParams.pageIdx || 0
				: queryParams.pageIdx,
		pageSize: +queryParams.pageSize || 3,
	};
	return { filterBy, sortBy, pagination };
}
