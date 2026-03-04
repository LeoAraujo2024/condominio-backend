const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// Criar reserva
router.post("/", authMiddleware, async (req, res) => {
  if (req.usuario.tipo !== "morador") return res.status(403).json({ erro: "Acesso negado" });

  const { tipo, data_reserva } = req.body;
  const usuarioId = req.usuario.id;
  const hoje = new Date();
  const data = new Date(data_reserva);

  // Verifica prazo máximo 30 dias
  const diff = (data - hoje) / (1000 * 60 * 60 * 24);
  if (diff > 30) return res.status(400).json({ erro: "Reserva só pode ser feita com até 30 dias" });

  // Verifica adimplência
  const usuario = await pool.query("SELECT adimplente FROM usuarios WHERE id=$1", [usuarioId]);
  if (!usuario.rows[0].adimplente) return res.status(403).json({ erro: "Usuário inadimplente" });

  // Verifica se já existe reserva no mesmo dia
  const existe = await pool.query("SELECT * FROM reservas WHERE tipo=$1 AND data_reserva=$2", [tipo, data_reserva]);
  if (existe.rows.length > 0) return res.status(400).json({ erro: "Data já reservada" });

  await pool.query("INSERT INTO reservas (usuario_id,tipo,data_reserva) VALUES ($1,$2,$3)", [usuarioId, tipo, data_reserva]);
  res.json({ msg: "Reserva efetuada com sucesso" });
});

module.exports = router;