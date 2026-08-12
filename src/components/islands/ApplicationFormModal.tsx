import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';
import {
	STATUS_VALUES,
	type ApplicationRow,
	type ApplicationStatus,
	type ApplicationStatusHistoryRow
} from '../../lib/supabase/types';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
	applied: 'Applied',
	phone_screen: 'Phone Screen',
	interview: 'Interview',
	offer: 'Offer',
	rejected: 'Rejected'
};

const EMPTY_FORM = {
	company: '',
	role: '',
	status: 'applied' as ApplicationStatus,
	date_applied: new Date().toISOString().slice(0, 10),
	follow_up_date: '',
	notes: '',
	job_url: ''
};

export default function ApplicationFormModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState(EMPTY_FORM);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [history, setHistory] = useState<Pick<ApplicationStatusHistoryRow, 'status' | 'changed_at'>[]>([]);

	useEffect(() => {
		function onOpen(event: Event) {
			const detail = (event as CustomEvent<ApplicationRow | null>).detail;
			setError(null);
			setHistory([]);
			if (detail) {
				setEditingId(detail.id);
				setForm({
					company: detail.company,
					role: detail.role,
					status: detail.status,
					date_applied: detail.date_applied,
					follow_up_date: detail.follow_up_date ?? '',
					notes: detail.notes ?? '',
					job_url: detail.job_url ?? ''
				});
				actions.getApplicationHistory({ id: detail.id }).then(({ data }) => {
					if (data) setHistory(data);
				});
			} else {
				setEditingId(null);
				setForm(EMPTY_FORM);
			}
			setIsOpen(true);
		}

		window.addEventListener('open-application-modal', onOpen);
		return () => window.removeEventListener('open-application-modal', onOpen);
	}, []);

	if (!isOpen) return null;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		setError(null);

		const payload = { ...form };
		const { error: actionError } = editingId
			? await actions.updateApplication({ id: editingId, ...payload })
			: await actions.createApplication(payload);

		setSubmitting(false);

		if (actionError) {
			setError(actionError.message);
			return;
		}

		window.location.reload();
	}

	const inputClass =
		'mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft';
	const labelClass = 'text-xs font-medium text-muted';

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
			<div className="card-shadow-lg w-full max-w-md rounded-xl border border-line bg-surface p-6">
				<h2 className="text-lg font-semibold tracking-tight text-ink">
					{editingId ? 'Edit application' : 'Add application'}
				</h2>
				<p className="mt-0.5 text-sm text-muted">
					{editingId ? 'Update the details for this application.' : 'Log a new application to track its progress.'}
				</p>

				{history.length > 0 && (
					<div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg bg-canvas px-3 py-2 text-xs">
						{history.map((entry, i) => (
							<span key={i} className="flex items-center gap-1.5">
								{i > 0 && <span className="text-subtle">→</span>}
								<span className="font-medium text-ink">{STATUS_LABELS[entry.status]}</span>
								<span className="text-subtle">
									{new Date(entry.changed_at).toLocaleDateString(undefined, {
										month: 'short',
										day: 'numeric'
									})}
								</span>
							</span>
						))}
					</div>
				)}

				{error && (
					<p className="mt-3 rounded-lg border border-danger/20 bg-danger-soft p-2.5 text-sm text-danger">{error}</p>
				)}

				<form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
					<label className={labelClass}>
						Company
						<input
							required
							value={form.company}
							onChange={(e) => setForm({ ...form, company: e.target.value })}
							className={inputClass}
						/>
					</label>

					<label className={labelClass}>
						Role
						<input
							required
							value={form.role}
							onChange={(e) => setForm({ ...form, role: e.target.value })}
							className={inputClass}
						/>
					</label>

					<label className={labelClass}>
						Status
						<select
							value={form.status}
							onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
							className={inputClass}
						>
							{STATUS_VALUES.map((status) => (
								<option key={status} value={status}>
									{STATUS_LABELS[status]}
								</option>
							))}
						</select>
					</label>

					<div className="grid grid-cols-2 gap-3">
						<label className={labelClass}>
							Date applied
							<input
								type="date"
								required
								value={form.date_applied}
								onChange={(e) => setForm({ ...form, date_applied: e.target.value })}
								className={inputClass}
							/>
						</label>

						<label className={labelClass}>
							Follow-up date
							<input
								type="date"
								value={form.follow_up_date}
								onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
								className={inputClass}
							/>
						</label>
					</div>

					<label className={labelClass}>
						Job URL
						<input
							type="url"
							value={form.job_url}
							onChange={(e) => setForm({ ...form, job_url: e.target.value })}
							className={inputClass}
							placeholder="https://…"
						/>
					</label>

					<label className={labelClass}>
						Notes
						<textarea
							value={form.notes}
							onChange={(e) => setForm({ ...form, notes: e.target.value })}
							rows={3}
							className={inputClass}
						/>
					</label>

					<div className="mt-2 flex justify-end gap-2">
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="press rounded-md px-3.5 py-2 text-sm font-medium text-muted hover:bg-canvas hover:text-ink"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={submitting}
							className="press rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-dim disabled:opacity-50"
						>
							{submitting ? 'Saving…' : 'Save'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
