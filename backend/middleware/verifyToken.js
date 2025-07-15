const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token de acceso requerido",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.userId).select("-password");

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        message: "Usuario no válido o inactivo",
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
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
