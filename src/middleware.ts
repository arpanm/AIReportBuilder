import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            // If there is a token, the user is authenticated
            if (req.nextUrl.pathname.startsWith("/dashboard/admin")) {
                return token?.role === "SUPER_ADMIN";
            }
            return !!token;
        },
    },
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
