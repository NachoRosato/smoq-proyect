const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const verifyToken = async (req, res, next) => {
  try {
    console.log("🔍 Verificando token...");
    console.log("Headers:", req.headers.authorization ? "Presente" : "Ausente");

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("❌ No se encontró token en headers");
      return res.status(401).json({
        message: "Token de acceso requerido",
      });
    }

    console.log("✅ Token encontrado, verificando...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token válido, buscando usuario...");

    const usuario = await Usuario.findById(decoded.userId).select("-password");

    if (!usuario || !usuario.activo) {
      console.log("❌ Usuario no encontrado o inactivo");
      return res.status(401).json({
        message: "Usuario no válido o inactivo",
      });
    }

    console.log("✅ Usuario autenticado:", usuario.email);
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error("❌ Error en verifyToken:", error.name, error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Token inválido",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expirado",
      });
    }

    console.error("Error verificando token:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = verifyToken;
