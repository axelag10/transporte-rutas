import { Router } from "express";

const router = Router();

const ADMIN_USER = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? "";

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!ADMIN_PASS) {
    res.status(500).json({ error: "El servidor no tiene ADMIN_PASSWORD configurado." });
    return;
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    req.session.save((err) => {
      if (err) {
        res.status(500).json({ error: "Error al guardar sesión." });
        return;
      }
      res.json({ ok: true });
    });
  } else {
    res.status(401).json({ ok: false, error: "Credenciales incorrectas." });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("transbus.sid");
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res) => {
  if (req.session.isAdmin) {
    res.json({ ok: true, username: ADMIN_USER });
  } else {
    res.status(401).json({ ok: false });
  }
});

export default router;
