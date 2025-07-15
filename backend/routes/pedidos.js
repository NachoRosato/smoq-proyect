const express = require("express");
const Pedido = require("../models/Pedido");
const Config = require("../models/Config");
const transporter = require("../config/email");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// Función para enviar email de confirmación al cliente
const enviarEmailConfirmacionCliente = async (pedido, productos) => {
  if (!pedido.email) {
    console.log(
      "⚠️ No se puede enviar email de confirmación: cliente no tiene email"
    );
    return;
  }

  // Obtener configuración de WhatsApp
  let whatsappNumber = "5491112345678"; // Número por defecto
  try {
    const config = await Config.findOne();
    if (config && config.whatsappNumber) {
      whatsappNumber = config.whatsappNumber.replace(/\D/g, "");
    }
  } catch (error) {
    console.warn("⚠️ Error obteniendo configuración de WhatsApp:", error);
  }

  // Preparar HTML para el email de confirmación
  const htmlProductos = productos
    .map(
      (p) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${
        p.nombre
      }</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">${
        p.cantidad
      }</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">$${p.precio.toLocaleString(
        "es-AR"
      )}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">$${p.subtotal.toLocaleString(
        "es-AR"
      )}</td>
    </tr>
  `
    )
    .join("");

  const total = productos.reduce((sum, item) => sum + item.subtotal, 0);

  const htmlEmailCliente = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido - SMOQ</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 30px; text-align: center;">
          <h1 style="color: #92400e; margin: 0; font-size: 28px; font-weight: bold;">
            🎉 ¡Realizaste tu pedido!
          </h1>
          <p style="color: #92400e; margin: 10px 0 0 0; font-size: 16px;">
            En breve nos contactaremos contigo
          </p>
        </div>

        <!-- Contenido principal -->
        <div style="padding: 30px;">
          
          <!-- Mensaje de bienvenida -->
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #f59e0b;">
            <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px;">
              ¡Gracias por elegirnos!
            </h2>
            <p style="color: #92400e; margin: 0; line-height: 1.6;">
              Tu pedido ha sido recibido correctamente. Nos pondremos en contacto contigo pronto 
              para coordinar la entrega de tus productos.
            </p>
          </div>

          <!-- Información del pedido -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">
              📋 Detalles del Pedido
            </h3>
            <div style="color: #6b7280; font-size: 14px;">
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${
                pedido.nombreCliente
              }</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleString(
                "es-AR"
              )}</p>
              <p style="margin: 5px 0;"><strong>ID del pedido:</strong> ${
                pedido._id
              }</p>
            </div>
          </div>

          <!-- Tabla de productos -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">
              🛍️ Resumen de Productos
            </h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(135deg, #92400e, #b45309); color: white;">
                  <th style="padding: 15px; text-align: left; font-weight: 600;">Producto</th>
                  <th style="padding: 15px; text-align: center; font-weight: 600;">Cantidad</th>
                  <th style="padding: 15px; text-align: right; font-weight: 600;">Precio Unit.</th>
                  <th style="padding: 15px; text-align: right; font-weight: 600;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${htmlProductos}
              </tbody>
              <tfoot>
                <tr style="background-color: #f3f4f6;">
                  <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; color: #374151;">Total:</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; color: #92400e; font-size: 18px;">$${total.toLocaleString(
                    "es-AR"
                  )}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Botones de acción -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; margin: 0 10px;">
              <a href="https://wa.me/${whatsappNumber}?text=Hola! Tengo una consulta sobre mi pedido ${
    pedido._id
  }" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                💬 Contactar por WhatsApp
              </a>
            </div>
            <div style="display: inline-block; margin: 0 10px;">
              <a href="https://smoq.com.ar" 
                 style="display: inline-block; background: linear-gradient(135deg, #374151, #1f2937); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                🏠 Ir a la página
              </a>
            </div>
          </div>

          <!-- Información adicional -->
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 20px; border: 1px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">
              📞 Próximos pasos
            </h4>
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
              Te contactaremos por email o teléfono para coordinar la entrega de tu pedido. 
              ¡Mantente atento a tu bandeja de entrada!
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #374151; color: #9ca3af; text-align: center; padding: 20px; font-size: 12px;">
          <p style="margin: 0;">
            © 2024 SMOQ Tienda. Todos los derechos reservados.
          </p>
          <p style="margin: 5px 0 0 0;">
            Gracias por tu confianza
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  // Configurar opciones del email al cliente
  const mailOptionsCliente = {
    from: process.env.SMTP_USER,
    to: pedido.email,
    subject: `🎉 ¡Pedido confirmado! - SMOQ Tienda`,
    html: htmlEmailCliente,
  };

  // Enviar email al cliente
  try {
    await transporter.sendMail(mailOptionsCliente);
    console.log("✅ Email de confirmación enviado al cliente:", pedido.email);
  } catch (emailError) {
    console.error(
      "❌ Error enviando email de confirmación al cliente:",
      emailError
    );
  }
};

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

    // Preparar HTML para el email al admin
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

    // Configurar opciones del email al admin
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Email destino (puede ser configurado)
      subject: `🛒 Nuevo Pedido de ${nombre} - SMOQ Tienda`,
      html: htmlEmail,
      replyTo: email || undefined,
    };

    // Enviar email al admin
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email enviado al admin");
    } catch (emailError) {
      console.error("❌ Error enviando email al admin:", emailError);
      // No fallar el pedido si el email falla
    }

    // Enviar email de confirmación al cliente
    await enviarEmailConfirmacionCliente(pedido, productosPedido);

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
