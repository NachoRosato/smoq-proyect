const express = require("express");
const Pedido = require("../models/Pedido");
const transporter = require("../config/email");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// POST /pedidos - Crear pedido y enviar por email
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      email,
      telefono,
      productos,
      metodoContacto = "email",
    } = req.body;

    // Validar datos requeridos
    if (
      !nombre ||
      !productos ||
      !Array.isArray(productos) ||
      productos.length === 0
    ) {
      return res.status(400).json({
        message: "Nombre y productos son requeridos",
      });
    }

    // Validar que al menos email o teléfono esté presente
    if (!email && !telefono) {
      return res.status(400).json({
        message: "Debe proporcionar al menos un email o teléfono",
      });
    }

    // Preparar productos para el pedido
    const productosPedido = productos.map((p) => ({
      productoId: p._id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
      subtotal: p.precio * p.cantidad,
    }));

    // Calcular total
    const total = productosPedido.reduce((sum, item) => sum + item.subtotal, 0);

    // Crear pedido en la base de datos
    const pedido = new Pedido({
      nombreCliente: nombre,
      email: email || null,
      telefono: telefono || null,
      productos: productosPedido,
      total,
      metodoContacto,
    });

    await pedido.save();

    // Preparar HTML para el email
    const htmlProductos = productosPedido
      .map(
        (p) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
          p.nombre
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${
          p.cantidad
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${p.precio.toLocaleString(
          "es-AR"
        )}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${p.subtotal.toLocaleString(
          "es-AR"
        )}</td>
      </tr>
    `
      )
      .join("");

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          🛒 Nuevo Pedido - SMOQ Tienda
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">📋 Información del Cliente</h3>
          <p><strong>Nombre:</strong> ${nombre}</p>
          ${email ? `<p><strong>Email:</strong> ${email}</p>` : ""}
          ${telefono ? `<p><strong>Teléfono:</strong> ${telefono}</p>` : ""}
          <p><strong>Método de contacto:</strong> ${
            metodoContacto === "email" ? "📧 Email" : "📱 WhatsApp"
          }</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString("es-AR")}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #007bff;">🛍️ Productos Solicitados</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #007bff; color: white;">
                <th style="padding: 12px; text-align: left;">Producto</th>
                <th style="padding: 12px; text-align: center;">Cantidad</th>
                <th style="padding: 12px; text-align: right;">Precio Unit.</th>
                <th style="padding: 12px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${htmlProductos}
            </tbody>
            <tfoot>
              <tr style="background-color: #e9ecef; font-weight: bold;">
                <td colspan="3" style="padding: 12px; text-align: right;">Total:</td>
                <td style="padding: 12px; text-align: right;">$${total.toLocaleString(
                  "es-AR"
                )}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            <strong>✅ Pedido recibido correctamente</strong><br>
            Nos pondremos en contacto contigo pronto para coordinar la entrega.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
          <p>Gracias por elegir SMOQ Tienda</p>
          <p>ID del pedido: ${pedido._id}</p>
        </div>
      </div>
    `;

    // Configurar opciones del email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Email destino (puede ser configurado)
      subject: `🛒 Nuevo Pedido de ${nombre} - SMOQ Tienda`,
      html: htmlEmail,
      replyTo: email || undefined,
    };

    // Enviar email
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("❌ Error enviando email:", emailError);
      // No fallar el pedido si el email falla
    }

    res.status(201).json({
      message: "Pedido creado y enviado correctamente",
      pedidoId: pedido._id,
    });
  } catch (error) {
    console.error("Error creando pedido:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /pedidos - Obtener pedidos (para admin, protegido)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { estado, page = 1, limit = 20 } = req.query;

    let query = {};

    if (estado) {
      query.estado = estado;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pedidos = await Pedido.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Pedido.countDocuments(query);

    res.json({
      pedidos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
