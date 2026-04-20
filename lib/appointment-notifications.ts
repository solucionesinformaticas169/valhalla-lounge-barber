type AppointmentNotificationEvent = "CREATED" | "CANCELLED" | "RESCHEDULED";

type ScheduleSnapshot = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

type AppointmentNotificationPayload = {
  id: string;
  nombre: string;
  correo?: string;
  telefono: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  serviciosSeleccionados: string[];
  previousSchedule?: ScheduleSnapshot;
};

type NotificationChannelResult = {
  channel: "email" | "whatsapp";
  sent: boolean;
  skipped?: boolean;
  target?: "customer" | "owner";
  message: string;
};

type NotificationResults = {
  email: NotificationChannelResult;
  whatsappCustomer: NotificationChannelResult;
  whatsappOwner?: NotificationChannelResult;
};

const customerTemplateMap: Record<AppointmentNotificationEvent, string | undefined> = {
  CREATED: process.env.WHATSAPP_TEMPLATE_BOOKED,
  CANCELLED: process.env.WHATSAPP_TEMPLATE_CANCELLED,
  RESCHEDULED: process.env.WHATSAPP_TEMPLATE_RESCHEDULED
};

export async function sendAppointmentNotifications(
  event: AppointmentNotificationEvent,
  payload: AppointmentNotificationPayload
): Promise<NotificationResults> {
  const tasks: Promise<NotificationChannelResult>[] = [
    sendEmailNotification(event, payload),
    sendWhatsAppNotificationToCustomer(event, payload)
  ];

  const shouldNotifyOwner = event === "CREATED";

  if (shouldNotifyOwner) {
    tasks.push(sendWhatsAppNotificationToOwner(payload));
  }

  const [email, whatsappCustomer, whatsappOwner] = await Promise.all(tasks);

  return { email, whatsappCustomer, whatsappOwner };
}

export function buildNotificationSummary(results: NotificationResults) {
  return [results.email, results.whatsappCustomer, results.whatsappOwner]
    .filter(Boolean)
    .filter((result) => !result?.skipped)
    .map((result) => result!.message)
    .join(" ");
}

async function sendEmailNotification(
  event: AppointmentNotificationEvent,
  payload: AppointmentNotificationPayload
): Promise<NotificationChannelResult> {
  const serviceUrl = process.env.EMAIL_SERVICE_URL;
  const correo = payload.correo?.trim().toLowerCase() ?? "";

  if (!serviceUrl) {
    return {
      channel: "email",
      sent: false,
      skipped: true,
      message: "Canal de correo sin configurar."
    };
  }

  if (!correo) {
    return {
      channel: "email",
      sent: false,
      skipped: true,
      message: "La cita no tiene correo para notificar."
    };
  }

  try {
    const response = await fetch(serviceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event,
        appointmentId: payload.id,
        nombre: payload.nombre,
        correo,
        telefono: payload.telefono,
        fecha: payload.fecha,
        horaInicio: payload.horaInicio,
        horaFin: payload.horaFin,
        serviciosSeleccionados: payload.serviciosSeleccionados,
        duracionMinutos: payload.duracionMinutos,
        previousSchedule: payload.previousSchedule
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error sending appointment email notification", errorMessage);

      return {
        channel: "email",
        sent: false,
        message: "No se pudo enviar la notificacion por correo."
      };
    }

    return {
      channel: "email",
      sent: true,
      message: "Correo procesado correctamente."
    };
  } catch (error) {
    console.error("Error calling email notification service", error);

    return {
      channel: "email",
      sent: false,
      message: "No se pudo conectar al servicio de correo."
    };
  }
}

async function sendWhatsAppNotificationToCustomer(
  event: AppointmentNotificationEvent,
  payload: AppointmentNotificationPayload
) {
  return sendWhatsAppNotification({
    event,
    payload,
    target: "customer",
    recipientPhone: payload.telefono,
    templateName: customerTemplateMap[event],
    messageBuilder: () => buildWhatsAppTextMessage(event, payload)
  });
}

async function sendWhatsAppNotificationToOwner(payload: AppointmentNotificationPayload) {
  return sendWhatsAppNotification({
    event: "CREATED",
    payload,
    target: "owner",
    recipientPhone: process.env.WHATSAPP_OWNER_PHONE ?? "",
    templateName: process.env.WHATSAPP_TEMPLATE_OWNER_BOOKED,
    messageBuilder: () => buildWhatsAppOwnerTextMessage(payload)
  });
}

async function sendWhatsAppNotification(input: {
  event: AppointmentNotificationEvent;
  payload: AppointmentNotificationPayload;
  target: "customer" | "owner";
  recipientPhone: string;
  templateName?: string;
  messageBuilder: () => string;
}): Promise<NotificationChannelResult> {
  const enabled = process.env.WHATSAPP_ENABLED === "true";
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const apiToken = process.env.WHATSAPP_API_TOKEN?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v22.0";
  const messageMode = process.env.WHATSAPP_MESSAGE_MODE?.trim().toLowerCase() || "text";

  if (!enabled) {
    return {
      channel: "whatsapp",
      target: input.target,
      sent: false,
      skipped: true,
      message:
        input.target === "owner"
          ? "Aviso por WhatsApp al dueno desactivado."
          : "Canal de WhatsApp desactivado."
    };
  }

  const phone = normalizeWhatsappPhone(input.recipientPhone);

  if (!phone) {
    return {
      channel: "whatsapp",
      target: input.target,
      sent: false,
      skipped: input.target === "owner",
      message:
        input.target === "owner"
          ? "Numero del dueno no configurado para WhatsApp."
          : "El telefono no se pudo convertir al formato esperado por WhatsApp."
    };
  }

  const metaUrl =
    phoneNumberId && apiToken
      ? `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`
      : null;

  if (!metaUrl && !serviceUrl) {
    return {
      channel: "whatsapp",
      target: input.target,
      sent: false,
      message: "Falta configurar WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_SERVICE_URL."
    };
  }

  try {
    const isMetaCloudApi = Boolean(metaUrl);
    const url = metaUrl ?? serviceUrl!;
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (isMetaCloudApi && apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }

    const body = isMetaCloudApi
      ? buildMetaWhatsAppBody({
          event: input.event,
          phone,
          messageMode,
          templateName: input.templateName,
          messageBody: input.messageBuilder(),
          payload: input.payload,
          target: input.target
        })
      : {
          event: input.event,
          appointmentId: input.payload.id,
          target: input.target,
          patientName: input.payload.nombre,
          phone,
          date: input.payload.fecha,
          startTime: input.payload.horaInicio,
          endTime: input.payload.horaFin,
          durationMinutes: input.payload.duracionMinutos,
          services: input.payload.serviciosSeleccionados,
          templateName: input.templateName,
          previousSchedule: input.payload.previousSchedule
        };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store"
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(`Error sending WhatsApp notification to ${input.target}`, errorMessage);

      return {
        channel: "whatsapp",
        target: input.target,
        sent: false,
        message:
          input.target === "owner"
            ? "No se pudo entregar el aviso de WhatsApp al dueno."
            : "No se pudo entregar la notificacion de WhatsApp."
      };
    }

    return {
      channel: "whatsapp",
      target: input.target,
      sent: true,
      message:
        input.target === "owner"
          ? "WhatsApp al dueno enviado correctamente."
          : "WhatsApp enviado correctamente."
    };
  } catch (error) {
    console.error(`Error calling WhatsApp provider for ${input.target}`, error);

    return {
      channel: "whatsapp",
      target: input.target,
      sent: false,
      message:
        input.target === "owner"
          ? "No se pudo conectar con el proveedor de WhatsApp para avisar al dueno."
          : "No se pudo conectar con el proveedor de WhatsApp."
    };
  }
}

function normalizeWhatsappPhone(rawPhone: string) {
  const digits = rawPhone.replace(/\D/g, "");
  const defaultCountryCode = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE ?? "593").replace(
    /\D/g,
    ""
  );

  if (!digits) {
    return null;
  }

  if (digits.startsWith(defaultCountryCode)) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `${defaultCountryCode}${digits.slice(1)}`;
  }

  return digits;
}

function buildMetaWhatsAppBody(input: {
  event: AppointmentNotificationEvent;
  payload: AppointmentNotificationPayload;
  phone: string;
  messageMode: string;
  templateName?: string;
  messageBody: string;
  target: "customer" | "owner";
}) {
  if (input.messageMode === "template") {
    const templateName = input.templateName?.trim();

    if (!templateName) {
      throw new Error(`Falta la plantilla de WhatsApp para ${input.target}.`);
    }

    return {
      messaging_product: "whatsapp",
      to: input.phone,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "es"
        },
        components: buildTemplateComponents(input.event, input.payload, input.target)
      }
    };
  }

  return {
    messaging_product: "whatsapp",
    to: input.phone,
    type: "text",
    text: {
      preview_url: false,
      body: input.messageBody
    }
  };
}

function buildTemplateComponents(
  event: AppointmentNotificationEvent,
  payload: AppointmentNotificationPayload,
  target: "customer" | "owner"
) {
  const bodyParameters =
    target === "owner"
      ? [
          payload.nombre,
          payload.telefono,
          payload.fecha,
          payload.horaInicio,
          payload.horaFin,
          payload.serviciosSeleccionados.join(", "),
          String(payload.duracionMinutos)
        ]
      : event === "CANCELLED"
        ? [
            payload.nombre,
            payload.fecha,
            payload.horaInicio,
            payload.horaFin,
            payload.serviciosSeleccionados.join(", ")
          ]
        : event === "RESCHEDULED"
          ? [
              payload.nombre,
              payload.previousSchedule?.fecha ?? "",
              payload.previousSchedule?.horaInicio ?? "",
              payload.previousSchedule?.horaFin ?? "",
              payload.fecha,
              payload.horaInicio,
              payload.horaFin,
              payload.serviciosSeleccionados.join(", ")
            ]
          : [
              payload.nombre,
              payload.fecha,
              payload.horaInicio,
              payload.horaFin,
              payload.serviciosSeleccionados.join(", "),
              String(payload.duracionMinutos)
            ];

  return [
    {
      type: "body",
      parameters: bodyParameters.map((value) => ({
        type: "text",
        text: value
      }))
    }
  ];
}

function buildWhatsAppTextMessage(
  event: AppointmentNotificationEvent,
  payload: AppointmentNotificationPayload
) {
  const services = payload.serviciosSeleccionados.join(", ");
  const schedule = `${payload.fecha} de ${payload.horaInicio} a ${payload.horaFin}`;

  if (event === "CANCELLED") {
    return [
      `Hola ${payload.nombre}, tu cita en Valhalla Lounge Barber fue cancelada.`,
      `Fecha y hora: ${schedule}.`,
      `Servicios: ${services}.`
    ].join("\n");
  }

  if (event === "RESCHEDULED") {
    const previousSchedule = payload.previousSchedule
      ? `Horario anterior: ${payload.previousSchedule.fecha} de ${payload.previousSchedule.horaInicio} a ${payload.previousSchedule.horaFin}.`
      : "";

    return [
      `Hola ${payload.nombre}, tu cita en Valhalla Lounge Barber fue reagendada.`,
      previousSchedule,
      `Nuevo horario: ${schedule}.`,
      `Servicios: ${services}.`
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Hola ${payload.nombre}, tu cita en Valhalla Lounge Barber esta confirmada.`,
    `Fecha y hora: ${schedule}.`,
    `Servicios: ${services}.`,
    `Duracion total: ${payload.duracionMinutos} minutos.`
  ].join("\n");
}

function buildWhatsAppOwnerTextMessage(payload: AppointmentNotificationPayload) {
  return [
    "Nueva cita registrada en Valhalla Lounge Barber.",
    `Cliente: ${payload.nombre}`,
    `Telefono: ${payload.telefono}`,
    `Fecha: ${payload.fecha}`,
    `Hora: ${payload.horaInicio} a ${payload.horaFin}`,
    `Servicios: ${payload.serviciosSeleccionados.join(", ")}`,
    `Duracion total: ${payload.duracionMinutos} minutos.`
  ].join("\n");
}
