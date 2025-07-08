const transporter = require("./config/email");

async function testEmail() {
  try {
    console.log("📧 Probando envío de email...");

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || "tu-email@gmail.com",
      subject: "🧪 Prueba de Email - SMOQ Tienda",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">✅ Email de Prueba - SMOQ Tienda</h2>
          <p>Este es un email de prueba para verificar que la configuración SMTP funciona correctamente.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>📋 Detalles de la configuración:</h3>
            <ul>
              <li><strong>Servidor:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>Puerto:</strong> ${process.env.SMTP_PORT || 465}</li>
              <li><strong>Usuario:</strong> ${process.env.SMTP_USER}</li>
              <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 12px;">
            Si recibes este email, significa que la configuración está funcionando correctamente.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado exitosamente!");
    console.log("📧 Message ID:", info.messageId);
    console.log("📤 Enviado a:", mailOptions.to);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    console.log("\n🔧 Posibles soluciones:");
    console.log("1. Verifica las credenciales SMTP");
    console.log("2. Asegúrate de que el puerto sea correcto (587 o 465)");
    console.log("3. Verifica que la cuenta de email esté activa");
    console.log("4. Revisa que no haya firewall bloqueando el puerto");
  }
}

testEmail();
