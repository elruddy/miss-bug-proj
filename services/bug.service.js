import { readJsonFile, writeJsonFile, makeId } from './util.service.js';
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
	bugs.splice(idx, 1);
	return _saveBugs();
}

function save(bug) {
	if (bug._id) {
		const idx = bugs.findIndex((b) => b._id === bug_id);
		bugs[idx] = bug;
	} else {
		bug._id = makeId();
		bugs.push(bug);
	}

	return _saveBugs().then(() => bug);
}

function getById(bugId) {
	const bug = bugs.find((bug) => bug._id === bugId);
	return Promise.resolve(bug);
}

function _saveBugs() {
	return writeJsonFile('./data/bugs.json', bugs);
}
