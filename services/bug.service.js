import { readJsonFile, writeJsonFile, makeId } from './util.service.js';
import { loggerService } from './logger.service.js';
export const bugService = {
	query,
	remove,
	save,
	getById,
};

var bugs = readJsonFile('./data/bugs.json');
function query() {
	return Promise.resolve(bugs);
}

function remove(bugId) {
	const idx = bugs.findIndex((bug) => bug._id === bugId);
	if (idx === -1) return Promise.reject('Bug not found!');

	bugs.splice(idx, 1);
	return _saveBugs();
}

function save(bug) {
	if (bug._id) {
		const idx = bugs.findIndex((b) => b._id === bug_id);
		if (idx === -1) return Promise.reject('Bug not found!');
		bugs[idx] = { ...bugs[idx], ...bug };
	} else {
		bug._id = makeId();
		bug.createdAt = Date.now();
		bugs.push(bug);
	}

	return _saveBugs().then(() => bug);
}

function getById(bugId) {
	const bug = bugs.find((bug) => bug._id === bugId);
	if (!bug) return Promise.reject('Bug not found!');
	return Promise.resolve(bug);
}

function _saveBugs() {
	return writeJsonFile('./data/bugs.json', bugs);
}
