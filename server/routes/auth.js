const express = require('express');
const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bidnsteal.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Tufayel@142003";

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        // Basic fallback auth; ideally JWT in real prod
        res.cookie('bidnsteal_admin_session', 'mock-token-xyz', { maxAge: 9000000, httpOnly: true });
        return res.json({ ok: true, user: { name: 'Admin User', email: ADMIN_EMAIL, role: 'admin' } });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

router.post('/logout', (req, res) => {
    res.cookie('bidnsteal_admin_session', '', { maxAge: 0 });
    res.json({ ok: true });
});

router.get('/me', (req, res) => {
    // If no auth middleware rejects it, say we're logged in.
    res.json({ id: "admin_local", name: "Admin User", email: ADMIN_EMAIL, role: "admin" });
});

module.exports = router;
