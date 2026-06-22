export const validationSegment = {
  es: {
    nameRequired: 'El nombre es obligatorio',
    emailInvalid: 'Correo inválido',
    whatsappRequired: 'WhatsApp es obligatorio',
    whatsappInvalid: 'Ingresa un WhatsApp válido',
    phoneRequired: 'El teléfono es obligatorio',
    phoneInvalid: 'Ingresa un teléfono válido',
    phoneSameAsWhatsapp:
      'El teléfono coincide con el WhatsApp. Marca la casilla si es el mismo.',
    descriptionRequired: 'La descripción es obligatoria',
  },
  en: {
    nameRequired: 'Name is required',
    emailInvalid: 'Invalid email',
    whatsappRequired: 'WhatsApp is required',
    whatsappInvalid: 'Enter a valid WhatsApp number',
    phoneRequired: 'Phone is required',
    phoneInvalid: 'Enter a valid phone number',
    phoneSameAsWhatsapp:
      'Phone matches WhatsApp. Check the box if it is the same number.',
    descriptionRequired: 'Description is required',
  },
} as const;
