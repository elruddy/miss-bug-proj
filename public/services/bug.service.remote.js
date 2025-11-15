import { utilService } from './util.service.js';
import { storageService } from './async-storage.service.js';

const BASE_URL = 'api/bug/';
const STORAGE_KEY = 'bugs';

_createBugs();

export const bugService = {
	query,
	getById,
	save,
	remove,
	getDefaultFilter,
	getLabels,
};

function query(queryOptions) {
	//const queryParams = `?txt=${filterBy.txt}&minSeverity=${filterBy.minSeverity}`;
	return axios.get(BASE_URL, { params: queryOptions }).then((res) => res.data);
}

function getById(bugId) {
	return axios.get(BASE_URL + bugId).then((res) => res.data);
	//storageService.get(STORAGE_KEY, bugId);
}

function remove(bugId) {
	return axios.delete(BASE_URL + bugId);
	//storageService.remove(STORAGE_KEY, bugId);
}

function save(bug) {
	// const queryStr =
	// 	'/save?' +
	// 	`_id=${bug._id || ''}&` +
	// 	`title=${bug.title}&` +
	// 	`severity=${bug.severity}&` +
	// 	`description=${bug.description}`;
	// return axios.get(BASE_URL + queryStr).then((res) => res.data);
	const method = bug._id ? 'put' : 'post';
	const bugId = bug._id || '';
	return axios[method](BASE_URL + bugId, bug).then((res) => res.data);
}

function _createBugs() {
	let bugs = utilService.loadFromStorage(STORAGE_KEY);
	if (bugs && bugs.length > 0) return;

	bugs = [
		{
			title: 'Infinite Loop Detected',
			severity: 4,
			_id: '1NF1N1T3',
		},
		{
			title: 'Keyboard Not Found',
			severity: 3,
			_id: 'K3YB0RD',
		},
		{
			title: '404 Coffee Not Found',
			severity: 2,
			_id: 'C0FF33',
		},
		{
			title: 'Unexpected Response',
			severity: 1,
			_id: 'G0053',
		},
	];
	utilService.saveToStorage(STORAGE_KEY, bugs);
}

function getDefaultFilter() {
	return { txt: '', minSeverity: 0, labels: [], sortField: '', sortDir: 1 };
}

function getLabels() {
	return ['back', 'front', 'critical', 'fixed', 'in progress', 'stuck'];
}
