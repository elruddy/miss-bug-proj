import { readJsonFile, writeJsonFile, makeId } from './util.service.js';
import { loggerService } from './logger.service.js';
export const bugService = {
	query,
	remove,
	save,
	getById,
};

var bugs = readJsonFile('./data/bugs.json');
function query({ filterBy, sortBy, pagination }) {
	var filteredBugs = [...bugs];
	// const { filterBy, sortBy, pagination } = queryOptions;
	if (filterBy.txt) {
		const regExp = new RegExp(filterBy.txt, 'i');
		filteredBugs = filteredBugs.filter((bug) => regExp.test(bug.title));
	}

	if (filterBy.minSeverity) {
		filteredBugs = filteredBugs.filter(
			(bug) => bug.severity >= filterBy.minSeverity
		);
	}

	if (filterBy.labels && filterBy.labels.length > 0) {
		filteredBugs = filteredBugs.filter((bug) =>
			filterBy.labels.some((label) => bug?.labels?.includes(label))
		);
	}

	if (sortBy.sortField === 'severity' || sortBy.sortField === 'CreatedAt') {
		const { sortField } = sortBy;
		filteredBugs.sort(
			(bug1, bug2) => (bug1[sortField] - bug2[sortField]) * sortBy.sortDir
		);
	} else if (sortBy.sortField === 'title') {
		filteredBugs.sort(
			(bug1, bug2) => bug1.title.localeCompare(bug2.title) * sortBy.sortDir
		);
	}

	if (pagination.pageIdx !== undefined) {
		const { pageIdx, pageSize } = pagination;

		const startIdx = pageIdx * pageSize;
		filteredBugs = filteredBugs.slice(startIdx, startIdx + pageSize);
	}

	return Promise.resolve(filteredBugs);
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
		bugs.unshift(bug);
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
