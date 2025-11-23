const { useNavigate, useParams } = ReactRouterDOM;

const { useState, useEffect } = React;
import { bugService } from '../services/bug.service.remote.js';
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js';

export function BugEdit() {
	const [bugToEdit, setBugToEdit] = useState(bugService.getEmptyBug());
	const navigate = useNavigate();
	const { bugId } = useParams();

	useEffect(() => {
		if (bugId) loadBug();
	}, []);

	function loadBug() {
		bugService
			.getById(bugId)
			.then(setBugToEdit)
			.catch((err) => console.log('err:', err));
	}

	function onSaveBug(ev) {
		ev.preventDefault();
		bugService
			.save(bugToEdit)
			.then(() => {
				navigate('/bug');
				showSuccessMsg(`Bug saved successfully!`);
			})
			.catch((err) => {
				console.log('err:', err);
				showErrorMsg('Cannot save bug');
			});
	}

	function handleChange({ target }) {
		const field = target.name;
		let value = target.value;

		switch (target.type) {
			case 'number':
			case 'range':
				value = +value;
				break;

			case 'checkbox':
				value = target.checked;
				break;

			default:
				break;
		}

		setBugToEdit((prevBug) => ({ ...prevBug, [field]: value }));
	}

	const { title, severity } = bugToEdit;
	return (
		<section className="bug-edit">
			<h1>{bugId ? 'Edit' : 'Add'} Bug</h1>
			<form onSubmit={onSaveBug}>
				<label htmlFor="title">Title</label>
				<input
					onChange={handleChange}
					value={title}
					type="text"
					name="title"
					id="title"
				/>

				<label htmlFor="severity">Severity</label>
				<input
					onChange={handleChange}
					value={severity}
					type="number"
					name="severity"
					id="severity"
				/>

				<button>Save</button>
			</form>
		</section>
	);
}
