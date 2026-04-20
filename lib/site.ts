export type Service = {
  name: string;
  description: string;
  duration: string;
  price: string;
};

export const siteConfig = {
  name: "Valhalla Lounge Barber",
  description:
    "Barberia premium con esencia vikinga, reservas online y atencion personalizada en Cuenca.",
  phone: "098 192 6275",
  whatsappNumber: "593981926275",
  instagram: "@valhallabarberia593",
  address: "Av. Guapondelig y Viracochabamba, Cuenca",
  hours: [
    "Martes a Sabado: 9:00 AM - 9:00 PM",
    "Domingo: 10:00 AM - 3:00 PM"
  ]
};

export const services: Service[] = [
  {
    name: "Corte de Cabello",
    description:
      "Diseño clásico o contemporáneo con asesoría de estilo para un acabado impecable.",
    duration: "45 min",
    price: "$12"
  },
  {
    name: "Afeitado con Navaja",
    description:
      "Ritual de toallas calientes, espuma premium y afeitado al ras con acabado preciso.",
    duration: "35 min",
    price: "$10"
  },
  {
    name: "Corte + Barba",
    description:
      "Experiencia integral con degradado, perfilado y definición de barba según tu rostro.",
    duration: "60 min",
    price: "$18"
  },
  {
    name: "Tratamientos",
    description:
      "Hidratación capilar, limpieza facial y cuidado profundo para elevar tu rutina de grooming.",
    duration: "50 min",
    price: "$16"
  }
];

export const testimonials = [
  {
    name: "Mateo R.",
    role: "Cliente frecuente",
    quote:
      "La experiencia se siente premium desde que entras. El detalle en barba y corte es impecable."
  },
  {
    name: "Daniel P.",
    role: "Empresario",
    quote:
      "La reserva fue rápida y el resultado superó lo que esperaba. Ambiente elegante y excelente atención."
  },
  {
    name: "Javier C.",
    role: "Creativo",
    quote:
      "Encontré un estilo muy marcado y consistente con la identidad Valhalla. Volveré sin dudar."
  }
];

export const galleryItems = [
  {
    title: "Fade nordico",
    subtitle: "Textura limpia y lineas precisas",
    position: "center 38%"
  },
  {
    title: "Ritual de afeitado",
    subtitle: "Toalla caliente y acabado clasico",
    position: "center 55%"
  },
  {
    title: "Perfilado premium",
    subtitle: "Barba definida con presencia",
    position: "center 70%"
  }
];

export const navigation = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Galería", href: "#galeria" },
  { label: "Opiniones", href: "#opiniones" },
  { label: "Ubicación", href: "#ubicacion" },
  { label: "Contacto", href: "#contacto" }
];
