import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Field from './Field';
import type { DocumentType } from '@/data/mockData';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  closeVendorCustomerEditModal,
  setVendorCustomerEditField,
  submitVendorCustomerEdit,
} from '@/store/clientsSlice';
import { fetchProjects } from '@/store/projectsSlice';
import { useEffect } from 'react';

const DOCUMENT_TYPES: DocumentType[] = ['INE', 'Pasaporte', 'CURP', 'RFC', 'Otro'];

export type EditClientFormState = {
  name: string;
  email: string;
  whatsapp: string;
  phone: string;
  documentType: string;
  document: string;
  projectInterest: string;
};

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

  const onClose = () => {
    dispatch(closeVendorCustomerEditModal());
  };

  const updateField = (field: string, value: string) => {
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
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                placeholder={t('clients.phonePlaceholder')}
                className="form-input"
              />
            </Field>

            <Field label={t('clients.phoneLabel')} error={errors.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder={t('clients.phonePlaceholder')}
                className="form-input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('clients.documentType')} error={errors.documentType}>
                <select
                  value={form.documentType}
                  onChange={(e) => updateField('documentType', e.target.value)}
                  className="form-input cursor-pointer"
                >
                  <option value="">{t('common.selectPlaceholder')}</option>
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
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
