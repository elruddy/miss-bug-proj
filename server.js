import express from 'express';
import { makeId } from './services/util.service.js';
import { bugService } from './services/bug.service.js';
import { loggerService } from './services/logger.service.js';

const app = express();
app.use(express.static('public'));

app.get('/', (req, res) => res.send('Hello there me'));
app.get('/api/bug/save', (req, res) => {
	const { id: _id, title, description, severity } = req.query;
	const bug = { _id, title, description, severity: +severity };
	bugService
		.save(bug)
		.then((bug) => res.send(bug))
		.catch((err) => {
			loggerService.error(err);
			res.status(404).send(err);
		});
});

app.get('/api/bug', (req, res) => {
	//console.log(req.query);
	const filterBy = {
		txt: req.query.txt,
		minSeverity: +req.query.minSeverity,
	};
	bugService.query(filterBy).then((bugs) => res.send(bugs));
});
app.get('/api/bug/:id', (req, res) => {
	const bugId = req.params.id;
	bugService
		.getById(bugId)
		.then((bug) => res.send(bug))
		.catch((err) => {
			loggerService.error(err);
			res.status(404).send(err);
		});
});

app.get('/api/bug/:id/remove', (req, res) => {
	const bugId = req.params.id;
	bugService
		.remove(bugId)
		.then(() => res.send('OK'))
		.catch((err) => {
			loggerService.error(err);
			res.status(404).send(err);
		});
});

app.listen(3030, () => loggerService.info('Server ready at port 3030'));
