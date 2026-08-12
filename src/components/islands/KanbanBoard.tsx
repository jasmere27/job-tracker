import { useState } from 'react';
import { DndContext, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';
import { actions } from 'astro:actions';
import { STATUS_VALUES, type ApplicationRow, type ApplicationStatus } from '../../lib/supabase/types';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
	applied: 'Applied',
	phone_screen: 'Phone Screen',
	interview: 'Interview',
	offer: 'Offer',
	rejected: 'Rejected'
};

const STATUS_DOT: Record<ApplicationStatus, string> = {
	applied: 'bg-subtle',
	phone_screen: 'bg-accent',
	interview: 'bg-warning',
	offer: 'bg-success',
	rejected: 'bg-danger'
};

interface Props {
	applications: ApplicationRow[];
}

function Column({
	status,
	applications,
	justMovedId
}: {
	status: ApplicationStatus;
	applications: ApplicationRow[];
	justMovedId: string | null;
}) {
	const { setNodeRef, isOver } = useDroppable({ id: status });

	return (
		<div
			ref={setNodeRef}
			className={`flex w-64 flex-shrink-0 flex-col rounded-xl border bg-canvas p-2.5 transition-colors ${
				isOver ? 'border-accent bg-accent-soft' : 'border-line'
			}`}
		>
			<h2 className="mb-2.5 flex items-center gap-1.5 px-1 text-xs font-medium text-muted">
				<span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT[status]}`} />
				{STATUS_LABELS[status]}
				<span className="text-subtle">{applications.length}</span>
			</h2>
			<div className="flex flex-col gap-2">
				{applications.map((app) => (
					<KanbanCard key={app.id} application={app} justMoved={app.id === justMovedId} />
				))}
			</div>
		</div>
	);
}

export default function KanbanBoard({ applications: initialApplications }: Props) {
	const [applications, setApplications] = useState(initialApplications);
	const [justMovedId, setJustMovedId] = useState<string | null>(null);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	async function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over) return;

		const newStatus = over.id as ApplicationStatus;
		const appId = active.id as string;
		const current = applications.find((a) => a.id === appId);
		if (!current || current.status === newStatus) return;

		const previous = applications;
		setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));

		const { error } = await actions.updateApplicationStatus({ id: appId, status: newStatus });
		if (error) {
			setApplications(previous);
			alert(`Could not update status: ${error.message}`);
			return;
		}

		setJustMovedId(appId);
		setTimeout(() => setJustMovedId((current) => (current === appId ? null : current)), 600);
	}

	return (
		<DndContext id="kanban-board" sensors={sensors} onDragEnd={handleDragEnd}>
			<div className="mt-6 flex gap-3 overflow-x-auto pb-4">
				{STATUS_VALUES.map((status) => (
					<Column
						key={status}
						status={status}
						applications={applications.filter((a) => a.status === status)}
						justMovedId={justMovedId}
					/>
				))}
			</div>
		</DndContext>
	);
}
