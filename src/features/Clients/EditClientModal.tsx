import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Field from './Field';
import { VENDOR_DOCUMENT_TYPE_OPTIONS } from './document-type-options';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  closeVendorCustomerEditModal,
  setVendorCustomerEditField,
  submitVendorCustomerEdit,
} from '@/store/clientsSlice';
import { fetchProjects } from '@/store/projectsSlice';
import { useEffect } from 'react';
import { CountryCodeSelect } from '@/components/country-code-select';
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '@/lib/country-codes';
import type { CountryCode } from '@/lib/country-codes';

export type EditClientFormState = {
  name: string;
  email: string;
  whatsapp: string;
  phone: string;
  whatsappCountryCode: string;
  phoneCountryCode: string;
  sameAsWhatsapp: boolean;
  documentType: string;
  document: string;
  projectInterest: string;
  isInternational: boolean;
};

function resolveCountry(code: string): CountryCode {
  return COUNTRY_CODES.find((country) => country.code === code) ?? DEFAULT_COUNTRY;
}

export function EditClientModal() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.clients.vendorCustomerEdit.open);
  const form = useAppSelector((s) => s.clients.vendorCustomerEdit.form);
  const errors = useAppSelector((s) => s.clients.vendorCustomerEdit.errors);
  const submitting = useAppSelector((s) => s.clients.vendorCustomerEdit.submitting);

  useEffect(() => {
    void dispatch(fetchProjects());
  }, [dispatch]);
  const projectList = useAppSelector((state) => state.projects.list);
  const formError = errors._form;

  const onClose = () => {
    dispatch(closeVendorCustomerEditModal());
  };

  const updateField = (field: string, value: string | boolean) => {
    dispatch(setVendorCustomerEditField({ field, value }));
  };

  const onSubmit = () => {
    void dispatch(submitVendorCustomerEdit());
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4 cursor-pointer"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t('clients.editClientTitle')}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-secondary/50 cursor-pointer"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {formError ? (
              <p
                role="alert"
                className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2"
              >
                {formError}
              </p>
            ) : null}

            <Field label={t('clients.nameLabel')} error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={t('clients.fullNamePlaceholder')}
                className="form-input"
              />
            </Field>

            <Field label={t('clients.emailLabel')} error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder={t('clients.emailPlaceholder')}
                className="form-input"
              />
            </Field>

            <Field label={t('clients.whatsappLabel')} error={errors.whatsapp}>
              <div className="flex gap-2">
                <CountryCodeSelect
                  value={resolveCountry(form.whatsappCountryCode)}
                  onChange={(country) => updateField('whatsappCountryCode', country.code)}
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.whatsapp}
                  onChange={(e) =>
                    updateField('whatsapp', e.target.value.replace(/[^\d\s-]/g, ''))
                  }
                  placeholder={t('clients.phonePlaceholder')}
                  className="form-input flex-1 min-w-0"
                />
              </div>
            </Field>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.sameAsWhatsapp}
                onChange={(e) => updateField('sameAsWhatsapp', e.target.checked)}
                className="rounded border-input"
              />
              <span>{t('clients.samePhoneAsWhatsapp')}</span>
            </label>

            {!form.sameAsWhatsapp ? (
              <Field label={t('clients.phoneLabel')} error={errors.phone}>
                <div className="flex gap-2">
                  <CountryCodeSelect
                    value={resolveCountry(form.phoneCountryCode)}
                    onChange={(country) => updateField('phoneCountryCode', country.code)}
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) =>
                      updateField('phone', e.target.value.replace(/[^\d\s-]/g, ''))
                    }
                    placeholder={t('clients.phonePlaceholder')}
                    className="form-input flex-1 min-w-0"
                  />
                </div>
              </Field>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('clients.documentType')} error={errors.documentType}>
                <select
                  value={form.documentType}
                  onChange={(e) => updateField('documentType', e.target.value)}
                  className="form-input cursor-pointer"
                >
                  <option value="">{t('common.selectPlaceholder')}</option>
                  {VENDOR_DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('clients.documentNumber')} error={errors.document}>
                <input
                  value={form.document}
                  onChange={(e) => updateField('document', e.target.value)}
                  placeholder={t('clients.documentNumberPlaceholder')}
                  className="form-input"
                />
              </Field>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                role="switch"
                aria-checked={form.isInternational}
                tabIndex={0}
                onClick={() => updateField('isInternational', !form.isInternational)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    updateField('isInternational', !form.isInternational);
                  }
                }}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.isInternational ? 'bg-accent' : 'bg-muted'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isInternational ? 'translate-x-4' : 'translate-x-0'}`}
                />
              </div>
              <span className="text-sm font-medium text-foreground">
                {t('clients.internationalCustomer')}
              </span>
            </label>

            <Field label={t('clients.projectInterest')} error={errors.projectInterest}>
              <select
                value={form.projectInterest}
                onChange={(e) => updateField('projectInterest', e.target.value)}
                className="form-input cursor-pointer"
              >
                <option value="">{t('clients.noProjectAssigned')}</option>
                {projectList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="button"
              disabled={submitting}
              onClick={onSubmit}
              className="w-full gradient-commission text-primary-foreground font-bold py-3 rounded-xl shadow-md text-sm disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? t('common.saving') : t('clients.saveChanges')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
