const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const result = await pool.query("SELECT * FROM usuarios WHERE email=$1", [email]);
  if (result.rows.length === 0) return res.status(404).json({ erro: "Usuário não encontrado" });

  const usuario = result.rows[0];
  const validSenha = await bcrypt.compare(senha, usuario.senha);
  if (!validSenha) return res.status(401).json({ erro: "Senha incorreta" });

  const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, tipo: usuario.tipo });
});

module.exports = router;