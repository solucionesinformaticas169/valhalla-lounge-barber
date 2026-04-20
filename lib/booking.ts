export type AppointmentInput = {
  nombre: string;
  correo?: string;
  telefono: string;
  fecha: string;
  horaInicio: string;
  serviciosSeleccionados: string[];
};

export const serviceOptions = [
  "Corte de hombre",
  "Corte de mujer",
  "Barba",
  "Uñas"
] as const;

export const serviceDurations: Record<(typeof serviceOptions)[number], number> = {
  "Corte de hombre": 30,
  "Corte de mujer": 60,
  Barba: 15,
  Uñas: 60
};

const SLOT_INTERVAL_MINUTES = 15;

export function normalizeAppointmentServices(services: string[] | string) {
  if (Array.isArray(services)) {
    return services.map((service) => service.trim()).filter(Boolean);
  }

  return services
    .split(" + ")
    .map((service) => service.trim())
    .filter(Boolean);
}

export function calculateAppointmentDuration(services: string[] | string) {
  const selectedServices = normalizeAppointmentServices(services);

  return selectedServices.reduce((total, service) => {
    if (service in serviceDurations) {
      return total + serviceDurations[service as keyof typeof serviceDurations];
    }

    return total;
  }, 0);
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function calculateAppointmentEndTime(startTime: string, duration: number) {
  return minutesToTime(timeToMinutes(startTime) + duration);
}

export function getBusinessHours(dateString: string) {
  if (!dateString) return null;

  const date = new Date(`${dateString}T12:00:00`);
  const day = date.getDay();

  if (day >= 2 && day <= 6) {
    return {
      open: "09:00",
      close: "21:00",
      label: "Martes a sábado, 9:00 AM a 9:00 PM"
    };
  }

  if (day === 0) {
    return {
      open: "10:00",
      close: "15:00",
      label: "Domingo, 10:00 AM a 3:00 PM"
    };
  }

  return null;
}

export function buildAvailableSlots(dateString: string, duration: number) {
  const hours = getBusinessHours(dateString);
  if (!hours || duration <= 0) return [];

  const open = timeToMinutes(hours.open);
  const close = timeToMinutes(hours.close);
  const lastStart = close - duration;
  const slots: string[] = [];

  for (let time = open; time <= lastStart; time += SLOT_INTERVAL_MINUTES) {
    slots.push(minutesToTime(time));
  }

  return slots;
}

export function appointmentsOverlap(
  startA: string,
  durationA: number,
  startB: string,
  durationB: number
) {
  const aStart = timeToMinutes(startA);
  const aEnd = aStart + durationA;
  const bStart = timeToMinutes(startB);
  const bEnd = bStart + durationB;

  return aStart < bEnd && bStart < aEnd;
}

export function validateAppointment(data: AppointmentInput) {
  const errors: Partial<Record<keyof AppointmentInput, string> & { servicio: string }> = {};

  const cleanedName = data.nombre.trim();
  if (cleanedName.length < 3) {
    errors.nombre = "Ingresa un nombre válido.";
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(cleanedName)) {
    errors.nombre = "El nombre no puede contener números.";
  }

  const email = data.correo?.trim() ?? "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.correo = "Ingresa un correo válido.";
  }

  const phone = data.telefono.replace(/\D/g, "");
  if (!/^\d{10}$/.test(phone)) {
    errors.telefono = "El teléfono debe tener exactamente 10 dígitos.";
  }

  const selectedServices = normalizeAppointmentServices(data.serviciosSeleccionados);
  const hasValidServices =
    selectedServices.length > 0 &&
    selectedServices.every((service) =>
      serviceOptions.includes(service as (typeof serviceOptions)[number])
    );

  if (!hasValidServices) {
    errors.servicio = "Selecciona al menos un servicio válido.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.fecha)) {
    errors.fecha = "Selecciona una fecha válida.";
  } else if (!getBusinessHours(data.fecha)) {
    errors.fecha = "Los lunes no están disponibles para reservas.";
  }

  if (!/^\d{2}:\d{2}$/.test(data.horaInicio)) {
    errors.horaInicio = "Selecciona una hora válida.";
  }

  const duration = calculateAppointmentDuration(selectedServices);
  const validSlots = buildAvailableSlots(data.fecha, duration);

  if (duration <= 0 || (data.horaInicio && !validSlots.includes(data.horaInicio))) {
    errors.horaInicio = "La hora elegida no encaja con la duración de la cita.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    duration,
    selectedServices
  };
}
