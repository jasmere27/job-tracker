import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createSupabaseServerClient } from '../lib/supabase/server';
import { STATUS_VALUES } from '../lib/supabase/types';

const applicationFields = {
	company: z.string().min(1, 'Company is required'),
	role: z.string().min(1, 'Role is required'),
	status: z.enum(STATUS_VALUES),
	date_applied: z.string().min(1, 'Date applied is required'),
	follow_up_date: z.string().optional(),
	notes: z.string().optional(),
	job_url: z.string().optional()
};

function toRow(input: {
	company: string;
	role: string;
	status: (typeof STATUS_VALUES)[number];
	date_applied: string;
	follow_up_date?: string;
	notes?: string;
	job_url?: string;
}) {
	return {
		company: input.company,
		role: input.role,
		status: input.status,
		date_applied: input.date_applied,
		follow_up_date: input.follow_up_date || null,
		notes: input.notes || null,
		job_url: input.job_url || null
	};
}

export const server = {
	createApplication: defineAction({
		input: z.object(applicationFields),
		handler: async (input, context) => {
			const supabase = createSupabaseServerClient(context.request, context.cookies);
			const { data, error } = await supabase
				.from('applications')
				.insert(toRow(input))
				.select()
				.single();

			if (error) {
				throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
			}
			return data;
		}
	}),

	updateApplication: defineAction({
		input: z.object({ id: z.uuid(), ...applicationFields }),
		handler: async ({ id, ...fields }, context) => {
			const supabase = createSupabaseServerClient(context.request, context.cookies);
			const { data, error } = await supabase
				.from('applications')
				.update(toRow(fields))
				.eq('id', id)
				.select()
				.single();

			if (error) {
				throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
			}
			return data;
		}
	}),

	deleteApplication: defineAction({
		input: z.object({ id: z.uuid() }),
		handler: async ({ id }, context) => {
			const supabase = createSupabaseServerClient(context.request, context.cookies);
			const { error } = await supabase.from('applications').delete().eq('id', id);

			if (error) {
				throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
			}
			return { id };
		}
	}),

	updateApplicationStatus: defineAction({
		input: z.object({ id: z.uuid(), status: z.enum(STATUS_VALUES) }),
		handler: async ({ id, status }, context) => {
			const supabase = createSupabaseServerClient(context.request, context.cookies);
			const { data, error } = await supabase
				.from('applications')
				.update({ status })
				.eq('id', id)
				.select()
				.single();

			if (error) {
				throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
			}
			return data;
		}
	}),

	getApplicationHistory: defineAction({
		input: z.object({ id: z.uuid() }),
		handler: async ({ id }, context) => {
			const supabase = createSupabaseServerClient(context.request, context.cookies);
			const { data, error } = await supabase
				.from('application_status_history')
				.select('status, changed_at')
				.eq('application_id', id)
				.order('changed_at', { ascending: true });

			if (error) {
				throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
			}
			return data;
		}
	})
};
