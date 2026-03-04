const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");

// Criar morador (somente gestor)
router.post("/", authMiddleware, async (req, res) => {
  if (req.usuario.tipo !== "gestor") return res.status(403).json({ erro: "Acesso negado" });
  const { nome, email, senha, tipo, adimplente } = req.body;
  const hash = await bcrypt.hash(senha, 10);
  await pool.query(
    "INSERT INTO usuarios (nome,email,senha,tipo,adimplente) VALUES ($1,$2,$3,$4,$5)",
    [nome, email, hash, tipo, adimplente]
  );
  res.json({ msg: "Morador criado" });
});

// Listar todos os usuários (somente gestor)
router.get("/", authMiddleware, async (req, res) => {
  if (req.usuario.tipo !== "gestor") return res.status(403).json({ erro: "Acesso negado" });
  const result = await pool.query("SELECT id, nome, email, tipo, adimplente FROM usuarios");
  res.json(result.rows);
});

// Atualizar adimplência (somente gestor)
router.put("/:id/adimplente", authMiddleware, async (req, res) => {
  if (req.usuario.tipo !== "gestor") return res.status(403).json({ erro: "Acesso negado" });
  const { id } = req.params;
  const { adimplente } = req.body;
  await pool.query("UPDATE usuarios SET adimplente=$1 WHERE id=$2", [adimplente, id]);
  res.json({ msg: "Adimplência atualizada" });
});

module.exports = router;