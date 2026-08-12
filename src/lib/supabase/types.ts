export const STATUS_VALUES = ['applied', 'phone_screen', 'interview', 'offer', 'rejected'] as const;

export type ApplicationStatus = (typeof STATUS_VALUES)[number];

export type ApplicationRow = {
	id: string;
	user_id: string;
	company: string;
	role: string;
	status: ApplicationStatus;
	date_applied: string;
	follow_up_date: string | null;
	notes: string | null;
	job_url: string | null;
	created_at: string;
	updated_at: string;
};

export type Database = {
	public: {
		Tables: {
			applications: {
				Row: ApplicationRow;
				Insert: Partial<ApplicationRow> & Pick<ApplicationRow, 'company' | 'role'>;
				Update: Partial<ApplicationRow>;
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};
