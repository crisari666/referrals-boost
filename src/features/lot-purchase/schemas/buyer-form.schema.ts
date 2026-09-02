import type { TFunction } from 'i18next';
import { z } from 'zod';

export const buildBuyerDataSchema = (translate: TFunction) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(2, translate('lotPurchase.formFullNameRequired'))
      .max(120),
    documentId: z
      .string()
      .trim()
      .min(3, translate('lotPurchase.formDocumentInvalid'))
      .max(40),
    city: z
      .string()
      .trim()
      .min(2, translate('lotPurchase.formCityRequired'))
      .max(80),
    email: z
      .string()
      .trim()
      .email(translate('lotPurchase.formEmailInvalid'))
      .max(120)
      .transform((value) => value.toLowerCase()),
    phone: z
      .string()
      .trim()
      .min(7, translate('lotPurchase.formPhoneInvalid'))
      .max(25),
  });

export type BuyerDataFormValues = z.infer<ReturnType<typeof buildBuyerDataSchema>>;

export const buildBuyerAccountSchema = (translate: TFunction) =>
  z.object({
    email: z
      .string()
      .trim()
      .email(translate('lotPurchase.formEmailInvalid'))
      .max(120)
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(6, translate('lotPurchase.formPasswordMin'))
      .max(80),
    fullName: z.string().trim().max(120).optional(),
  });

export type BuyerAccountFormValues = z.infer<ReturnType<typeof buildBuyerAccountSchema>>;
