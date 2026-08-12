import { useDraggable } from '@dnd-kit/core';
import type { ApplicationRow, ApplicationStatus } from '../../lib/supabase/types';

interface Props {
	application: ApplicationRow;
	justMoved?: boolean;
}

const STATUS_ACCENT: Record<ApplicationStatus, string> = {
	applied: '#9ca3af',
	phone_screen: '#3b4fe0',
	interview: '#a15c07',
	offer: '#16794f',
	rejected: '#c0362c'
};

export default function KanbanCard({ application, justMoved }: Props) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: application.id
	});

	const style = {
		...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
		borderTopColor: STATUS_ACCENT[application.status]
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`press rounded-lg border border-t-2 border-line bg-surface p-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
				isDragging ? 'z-10 opacity-50' : ''
			} ${justMoved ? 'status-flash' : ''}`}
		>
			<div className="flex items-start gap-2">
				<button
					type="button"
					className="touch-none rounded p-0.5 text-subtle hover:text-muted"
					aria-label="Drag to move"
					{...listeners}
					{...attributes}
				>
					<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
						<circle cx="9" cy="6" r="1.25" />
						<circle cx="9" cy="12" r="1.25" />
						<circle cx="9" cy="18" r="1.25" />
						<circle cx="15" cy="6" r="1.25" />
						<circle cx="15" cy="12" r="1.25" />
						<circle cx="15" cy="18" r="1.25" />
					</svg>
				</button>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-ink">{application.company}</p>
					<p className="truncate text-xs text-muted">{application.role}</p>
					{application.follow_up_date && (
						<p className="mt-1 font-mono text-[11px] tabular text-warning">Follow up: {application.follow_up_date}</p>
					)}
				</div>
				<button
					type="button"
					className="rounded p-0.5 text-subtle hover:text-accent"
					aria-label="Edit application"
					onClick={() =>
						window.dispatchEvent(new CustomEvent('open-application-modal', { detail: application }))
					}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
						<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
					</svg>
				</button>
			</div>
		</div>
	);
}
