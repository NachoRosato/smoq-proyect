const express = require("express");
const transporter = require("../config/email");
const router = express.Router();

// POST /contacto - Enviar formulario de contacto
router.post("/", async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    // Validar datos requeridos
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email y mensaje son requeridos",
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato de email inválido",
      });
    }

    // Preparar HTML del email
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid rgb(124,79,0);">
            <h1 style="color: rgb(124,79,0); margin: 0; font-size: 28px; font-weight: bold;">
              📧 Nuevo Mensaje de Contacto
            </h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">
              SMOQ Tienda - Formulario de Contacto
            </p>
          </div>

          <!-- Información del remitente -->
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid rgb(124,79,0);">
            <h3 style="color: rgb(124,79,0); margin: 0 0 15px 0; font-size: 18px;">
              👤 Información del Cliente
            </h3>
            <div style="color: #333; line-height: 1.6;">
              <p style="margin: 8px 0;"><strong>Nombre:</strong> ${nombre}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              ${
                telefono
                  ? `<p style="margin: 8px 0;"><strong>Teléfono:</strong> ${telefono}</p>`
                  : ""
              }
              <p style="margin: 8px 0;"><strong>Fecha:</strong> ${new Date().toLocaleString(
                "es-AR"
              )}</p>
            </div>
          </div>

          <!-- Mensaje -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: rgb(124,79,0); margin: 0 0 15px 0; font-size: 18px;">
              💬 Mensaje
            </h3>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef;">
              <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${mensaje}</p>
            </div>
          </div>

          <!-- Botones de acción -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; margin: 0 10px;">
              <a href="mailto:${email}" 
                 style="display: inline-block; background: linear-gradient(135deg, rgb(124,79,0), rgb(90,57,0)); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                📧 Responder por Email
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
          <div style="background-color: rgb(255, 249, 225); border-radius: 12px; padding: 20px; border: 1px solid rgb(124,79,0);">
            <h4 style="color: rgb(124,79,0); margin: 0 0 10px 0; font-size: 16px;">
              ⚡ Acción Requerida
            </h4>
            <p style="color: rgb(124,79,0); margin: 0; font-size: 14px; line-height: 1.5;">
              Este mensaje fue enviado desde el formulario de contacto de la tienda SMOQ. 
              Por favor, responde al cliente lo antes posible para mantener una buena atención al cliente.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            © 2025 SMOQ Tienda. Todos los derechos reservados.
          </p>
          <p style="margin: 5px 0 0 0;">
            Enviado desde el formulario de contacto
          </p>
        </div>
      </div>
    `;

    // Configurar opciones del email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: "info@smoq.com.ar", // Email fijo para SMOQ
      subject: `📧 Nuevo mensaje de ${nombre} - SMOQ Tienda`,
      html: htmlEmail,
      replyTo: email, // Para que las respuestas vayan al cliente
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Mensaje enviado correctamente",
    });
  } catch (error) {
    console.error("Error enviando email de contacto:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje. Por favor, intenta nuevamente.",
    });
  }
});

module.exports = router;
