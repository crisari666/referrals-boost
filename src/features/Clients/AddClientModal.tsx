import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Field from './Field';
import { VENDOR_DOCUMENT_TYPE_OPTIONS } from './document-type-options';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProjects } from '@/store/projectsSlice';
import { useEffect } from 'react';
import { CountryCodeSelect } from '@/components/country-code-select';
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '@/lib/country-codes';
import type { CountryCode } from '@/lib/country-codes';

export interface AddClientFormState {
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
  description: string;
}

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  form: AddClientFormState;
  errors: Record<string, string>;
  updateField: (field: string, value: string | boolean) => void;
  onSubmit: () => void;
}

function resolveCountry(code: string): CountryCode {
  return COUNTRY_CODES.find((country) => country.code === code) ?? DEFAULT_COUNTRY;
}

const AddClientModal = ({
  open,
  onClose,
  form,
  errors,
  updateField,
  onSubmit,
}: AddClientModalProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchProjects());
  }, [dispatch]);
  const projectList = useAppSelector((state) => state.projects.list);
  const formError = errors._form;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t('clients.newClientTitle')}</h2>
              <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-secondary/50 cursor-pointer">
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
                  className="form-input"
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

            <Field label={t('clients.projectInterest')} error={errors.projectInterest}>
              <select
                value={form.projectInterest}
                onChange={(e) => updateField('projectInterest', e.target.value)}
                className="form-input"
              >
                <option value="">{t('clients.noProjectAssigned')}</option>
                {projectList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t('clients.descriptionLabel')} error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder={t('clients.descriptionPlaceholder')}
                className="form-input min-h-[96px] resize-y"
              />
            </Field>

            <button
              type="button"
              onClick={onSubmit}
              className="w-full gradient-commission text-primary-foreground font-bold py-3 rounded-xl shadow-md text-sm cursor-pointer"
            >
              {t('clients.addClientSubmit')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddClientModal;
