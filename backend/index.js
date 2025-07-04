const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const productosRoutes = require("./routes/productos");
const pedidosRoutes = require("./routes/pedidos");
const configRoutes = require("./routes/config");

const app = express();
const PORT = process.env.PORT || 3002;

// Conectar a MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
});

// Middleware básico
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(helmet());
app.use(limiter);

// Rutas
app.use("/auth", authRoutes);
app.use("/productos", productosRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/api/config", configRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "API SMOQ Tienda funcionando correctamente",
    version: "1.0.0",
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Ruta 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📧 SMTP configurado: ${process.env.SMTP_HOST}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI}`);
});
