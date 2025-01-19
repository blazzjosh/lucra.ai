import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async (event) => {
    if (!event.locals.user) {
        return redirect(302, '/auth/login');
    }
    return { user: event.locals.user };
};
