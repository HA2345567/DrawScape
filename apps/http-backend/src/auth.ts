import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { prismaClient } from "@repo/db";
import { JWT_SECRET } from "@repo/backend-common";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = prismaClient;

function getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/v1/auth/google/callback";

    if (!clientId || !clientSecret) {
        throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables");
    }

    return new OAuth2Client(clientId, clientSecret, redirectUri);
}

// Step 1: Redirect to Google
router.get("/google", (_req, res) => {
    try {
        const client = getOAuth2Client();
        const url = client.generateAuthUrl({
            access_type: "offline",
            scope: ["profile", "email"],
            prompt: "select_account",
        });
        res.redirect(url);
    } catch (e: any) {
        console.error("Google Auth error:", e?.message || e);
        res.status(500).json({ message: e?.message || "Failed to initialize Google authentication" });
    }
});

// Step 2: Handle Google callback
router.get("/google/callback", async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL;

    const error = req.query.error as string | undefined;
    if (error) {
        if (frontendUrl) {
            res.redirect(`${frontendUrl.replace(/\/+$/, "")}/signin?error=${encodeURIComponent(`Google authentication denied: ${error}`)}`);
            return;
        }
        res.status(400).json({ message: `Google authentication denied: ${error}` });
        return;
    }

    const code = req.query.code as string | undefined;
    if (!code) {
        if (frontendUrl) {
            res.redirect(`${frontendUrl.replace(/\/+$/, "")}/signin?error=${encodeURIComponent("Missing authorization code")}`);
            return;
        }
        res.status(400).json({ message: "Missing authorization code" });
        return;
    }

    try {
        const client = getOAuth2Client();

        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Fetch user profile from Google
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            if (frontendUrl) {
                res.redirect(`${frontendUrl.replace(/\/+$/, "")}/signin?error=${encodeURIComponent("Invalid Google token")}`);
                return;
            }
            res.status(401).json({ message: "Invalid Google token" });
            return;
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            if (frontendUrl) {
                res.redirect(`${frontendUrl.replace(/\/+$/, "")}/signin?error=${encodeURIComponent("Email not provided by Google")}`);
                return;
            }
            res.status(400).json({ message: "Email not provided by Google" });
            return;
        }

        // Upsert user: find by googleId or email, then link/create
        let user = await prisma.user.findFirst({
            where: {
                OR: [{ googleId }, { email }],
            },
        });

        if (user) {
            // Link googleId if signing in via email-password account for first time with Google
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId, photo: picture ?? user.photo },
                });
            }
        } else {
            // New user — create account
            user = await prisma.user.create({
                data: {
                    email,
                    name: name ?? email,
                    googleId,
                    photo: picture,
                },
            });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        // If frontend URL is provided, redirect with token to the frontend app
        if (frontendUrl) {
            res.redirect(`${frontendUrl.replace(/\/+$/, "")}/signin?token=${encodeURIComponent(token)}`);
            return;
        }

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, photo: user.photo } });

    } catch (e: any) {
        console.error("Google OAuth error:", e);
        if (frontendUrl) {
            res.redirect(`${frontendUrl.replace(/\/+$/, "")}/signin?error=${encodeURIComponent(e?.message || "OAuth authentication failed")}`);
            return;
        }
        res.status(500).json({ message: e?.message || "OAuth authentication failed" });
    }
});

export default router;
