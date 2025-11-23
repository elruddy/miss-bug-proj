import fs from 'fs';

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

function remove(bugId, loggedInUser) {
	const idx = bugs.findIndex((bug) => bug._id === bugId);
	if (idx === -1) return Promise.reject('Bug not found!');
	if (!loggedInUser.isAdmin && bugs[idx].creator._id !== loggedInUser._id) {
		return Promise.reject('Not Your Bug');
	}
	bugs.splice(idx, 1);
	return _saveBugsToFile();
}

function save(bug, loggedInUser) {
	//console.log('user', loggedInUser);

	if (bug._id) {
		const bugToUpdate = bugs.find((b) => b._id === bug._id);
		//console.log('bug toupdate', bugToUpdate);

		if (!loggedInUser.isAdmin && bugToUpdate.creator._id !== loggedInUser._id) {
			return Promise.reject('Not Your Bug');
		}
		bugToUpdate.title = bug.title;
		bugToUpdate.severity = bug.severity;
	} else {
		bug._id = makeId();
		bug.createdAt = Date.now();
		bug.creator = {
			_id: loggedInUser._id,
			fullname: loggedInUser.fullname,
		};
		bugs.unshift(bug);
	}

	return _saveBugsToFile().then(() => bug);
}

function getById(bugId) {
	const bug = bugs.find((bug) => bug._id === bugId);
	if (!bug) return Promise.reject('Bug not found!');
	return Promise.resolve(bug);
}

// function _saveBugs() {
// 	return writeJsonFile('./data/bugs.json', bugs);
// }

function _saveBugsToFile() {
	return new Promise((resolve, reject) => {
		const data = JSON.stringify(bugs, null, 2);
		fs.writeFile('data/bug.json', data, (err) => {
			if (err) {
				loggerService.error('Cannot write to bugs file', err);
				return reject(err);
			}
			console.log('The file was saved!');
			resolve();
		});
	});
}
