const { useState, useEffect } = React;
const { Link, useSearchParams } = ReactRouterDOM;
import { bugService } from '../services/bug.service.remote.js';
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js';

import { BugFilter } from '../cmps/BugFilter.jsx';
import { BugList } from '../cmps/BugList.jsx';

export function BugIndex() {
	const [bugs, setBugs] = useState(null);
	const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter());

	useEffect(() => {
		loadBugs();
	}, [filterBy]);

	function loadBugs() {
		bugService
			.query(filterBy)
			.then((bugs) => {
				console.log(bugs);
				setBugs(bugs);
			})
			.catch((err) => showErrorMsg(`Couldn't load bugs - ${err}`));
	}

	function onRemoveBug(bugId) {
		bugService
			.remove(bugId)
			.then(() => {
				const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId);
				setBugs(bugsToUpdate);
				showSuccessMsg('Bug removed');
			})
			.catch((err) => showErrorMsg(`Cannot remove bug`, err));
	}

	// function onAddBug() {
	// 	const bug = {
	// 		title: prompt('Bug title?', 'Bug ' + Date.now()),
	// 		severity: +prompt('Bug severity?', 3),
	// 		description: prompt('Bug description?', 'Dangerous bug'),
	// 	};

	// 	bugService
	// 		.save(bug)
	// 		.then((savedBug) => {
	// 			setBugs([...bugs, savedBug]);
	// 			showSuccessMsg('Bug added');
	// 		})
	// 		.catch((err) => showErrorMsg(`Cannot add bug`, err));
	// }

	// function onEditBug(bug) {
	// 	const severity = +prompt('New severity?', bug.severity);
	// 	const bugToSave = { ...bug, severity };
	// 	//console.log(bugToSave);

	// 	bugService
	// 		.save(bugToSave)
	// 		.then((savedBug) => {
	// 			const bugsToUpdate = bugs.map((currBug) =>
	// 				currBug._id === savedBug._id ? savedBug : currBug
	// 			);
	// 			//console.log(bugs);
	// 			setBugs(bugsToUpdate);
	// 			showSuccessMsg('Bug updated');
	// 		})
	// 		.catch((err) => showErrorMsg('Cannot update bug', err));
	// }

	function onSetFilterBy(filterBy) {
		setFilterBy((prevFilter) => ({ ...prevFilter, ...filterBy }));
	}

	return (
		<section className="bug-index main-content">
			<button>
				<Link to="/bug/edit">Add Bug</Link>
			</button>

			<BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />

			<BugList bugs={bugs} onRemoveBug={onRemoveBug} />
		</section>
	);
}
