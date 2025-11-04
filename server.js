import express from 'express';
import { makeId } from './services/util.service.js';
import { bugService } from './services/bug.service.js';

const app = express();

app.get('/', (req, res) => res.send('Hello there me'));

app.get('/api/bug/save', (req, res) => {
	const { id: _id, title, severity } = req.query;
	const bug = { title, severity: +severity };
	bugService.save(bug).then((bug) => res.send(bug));
});

app.get('/api/bug', (req, res) => {
	bugService.query().then((bugs) => res.send(bugs));
});
app.get('/api/bug/:id', (req, res) => {
	const bugId = req.params.id;
	bugService.getById(bugId).then((bug) => res.send(bug));
});

app.get('/api/bug/:id/remove', (req, res) => {
	const bugId = req.params.id;
	bugService.remove(bugId).then(() => res.send('OK'));
});

app.listen(3030, () => console.log('Server ready at port 3030'));
