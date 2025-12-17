export const API = {
	AUTH: {
		REGISTER: "/auth/register",
		LOGIN: "/auth/login",
		LOGOUT: "/auth/logout",
		ME: "/auth/me",
		PROFILE: "/auth/profile",
		AVATAR: "/auth/avatar",
		CHANGE_PASSWORD: "/auth/change-password",
		SEND_VERIFICATION_OTP: "/auth/send-verification-otp",
		VERIFY_EMAIL: "/auth/verify-email",
		FORGOT_PASSWORD: "/auth/forgot-password",
		VERIFY_RESET_OTP: "/auth/verify-reset-otp",
		RESET_PASSWORD: "/auth/reset-password"
	},

	MOVIES: {
		LIST: "/movies",
		DETAILS: (slug) => `/movies/${slug}`
	},

	DISCOVERY: {
		TRENDING: "/discover/trending",
		TOP_RATED: "/discover/top-rated",
		LATEST: "/discover/latest",
		UPCOMING: "/discover/upcoming",
		SIMILAR: (id) => `/discover/similar/${id}`
	},

	FAVORITES: {
		BASE: "/favorites",
		BY_MOVIE: (id) => `/favorites/${id}`,
		CHECK: (id) => `/favorites/check/${id}`
	},

	WISHLIST: {
		BASE: "/wishlist",
		BY_MOVIE: (id) => `/wishlist/${id}`,
		CHECK: (id) => `/wishlist/check/${id}`
	},

	REVIEWS: {
		CREATE: "/reviews",
		UPDATE: (id) => `/reviews/${id}`,
		DELETE: (id) => `/reviews/${id}`,
		BY_MOVIE: (id) => `/reviews/movie/${id}`,
		LIKE: (id) => `/reviews/${id}/like`,
		HELPFUL: (id) => `/reviews/${id}/helpful`,
		REPORT: (id) => `/reviews/${id}/report`,
        REPORT_REASONS: "/reviews/report-reasons",
		WITHDRAW_REPORT: (id) => `/reviews/${id}/report`
	},

	SEARCH: {
		BASE: "/search"
	},

	ADMIN: {
		STATS: "/admin/dashboard/stats",
		RECENT: "/admin/dashboard/recent",
		ANALYTICS: "/admin/dashboard/analytics",
		USERS: "/admin/users",
		USER_STATUS: (id) => `/admin/users/${id}/status`,
		REPORTED_REVIEWS: "/admin/reviews/reported",
		REVIEW_STATUS: (id) => `/admin/reviews/${id}/status`,
		REVIEW: (id) => `/admin/reviews/${id}`
	},
};
