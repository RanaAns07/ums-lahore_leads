import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/login`, {
                        email: credentials.email,
                        password: credentials.password,
                    });

                    const user = res.data;

                    if (user && user.access_token) {
                        return {
                            id: user.user.id,
                            email: user.user.email,
                            name: user.user.name,
                            accessToken: user.access_token,
                            roles: user.user.roles || [],
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Login failed:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.id = user.id;
                token.roles = user.roles;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.accessToken = token.accessToken as string;
            session.user.id = token.id as string;
            session.user.roles = token.roles as string[];
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
