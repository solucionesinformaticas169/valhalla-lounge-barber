type SendBookingConfirmationInput = {
  nombre: string;
  correo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  serviciosSeleccionados: string[];
  duracionMinutos: number;
};

export async function sendBookingConfirmation(input: SendBookingConfirmationInput) {
  const serviceUrl = process.env.EMAIL_SERVICE_URL;

  if (!serviceUrl) {
    console.warn("EMAIL_SERVICE_URL no está configurado. Se omite el envío de correo.");
    return {
      sent: false,
      message: "Servicio de correo no configurado."
    };
  }

  try {
    const response = await fetch(serviceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input),
      cache: "no-store"
    });

    if (!response.ok) {
      const payload = await response.text();
      console.error("Error SMTP service:", payload);
      return {
        sent: false,
        message: "No se pudo enviar el correo de confirmación."
      };
    }

    return {
      sent: true,
      message: "Correo de confirmación enviado."
    };
  } catch (error) {
    console.error("Error calling SMTP service", error);
    return {
      sent: false,
      message: "No se pudo conectar con el servicio de correo."
    };
  }
}
