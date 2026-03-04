const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configuração e-mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL, pass: process.env.SENHA_EMAIL }
});

// Criar comunicado (somente gestor)
router.post("/", authMiddleware, async (req, res) => {
  if (req.usuario.tipo !== "gestor") return res.status(403).json({ erro: "Acesso negado" });

  const { titulo, mensagem } = req.body;
  await pool.query("INSERT INTO comunicados (titulo, mensagem) VALUES ($1,$2)", [titulo, mensagem]);

  // Enviar e-mail para todos os moradores
  const moradores = await pool.query("SELECT email FROM usuarios WHERE tipo='morador'");
  moradores.rows.forEach(m => {
    transporter.sendMail({
      from: process.env.EMAIL,
      to: m.email,
      subject: `[Comunicado] ${titulo}`,
      text: mensagem
    });
  });

  res.json({ msg: "Comunicado criado e enviado" });
});

module.exports = router;