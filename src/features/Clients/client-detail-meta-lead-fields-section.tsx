import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCustomerMetaLeadMappedFields } from '@/store/clientsSlice';

export function ClientDetailMetaLeadFieldsSection() {
  const { t } = useTranslation();
  const { id: routeId } = useParams();
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.clients.metaLeadMappedFieldsStatus);
  const error = useAppSelector((s) => s.clients.metaLeadMappedFieldsError);
  const data = useAppSelector((s) => {
    if (!routeId || s.clients.metaLeadMappedFieldsCustomerId !== routeId) {
      return null;
    }
    return s.clients.metaLeadMappedFields;
  });

  useEffect(() => {
    if (!routeId) {
      return;
    }
    const req = dispatch(fetchCustomerMetaLeadMappedFields(routeId));
    return () => {
      req.abort();
    };
  }, [routeId, dispatch]);

  if (status === 'loading' && data === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm"
      >
        <p className="text-sm text-muted-foreground">{t('clients.metaLeadLoading')}</p>
      </motion.div>
    );
  }

  if (status === 'failed' && error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09 }}
        className="bg-card rounded-2xl p-5 border border-destructive/30 shadow-sm"
      >
        <p className="text-sm text-destructive">{error}</p>
      </motion.div>
    );
  }

  if (!data?.hasLead || data.items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm"
      >
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">{t('clients.metaLeadTitle')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t('clients.metaLeadEmpty')}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.09 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground">{t('clients.metaLeadTitle')}</h3>
      </div>
      <dl className="space-y-3">
        {data.items.map((item) => (
          <div key={item.label} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
            <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
            <dd className="text-sm text-foreground mt-0.5 break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
