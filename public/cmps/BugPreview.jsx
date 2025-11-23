const { Link } = ReactRouterDOM;
export function BugPreview({ bug }) {
	return (
		<article className="bug-preview">
			<p className="title">{bug.title}</p>
			<p>
				Severity: <span>{bug.severity}</span>
			</p>
			{bug.creator && (
				<h4>
					Owner:{' '}
					<Link to={`/user/${bug.creator._id}`}>{bug.creator.fullname}</Link>
				</h4>
			)}
		</article>
	);
}
