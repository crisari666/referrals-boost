import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CustomerMetadataFieldDefinition } from '@/services/clientsService.types';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchCustomerMetadata,
  saveCustomerMetadata,
} from '@/store/clientsSlice';

const FIELD_LABEL_KEYS: Record<string, string> = {
  economicCapacity: 'clients.captureFieldEconomicCapacity',
  city: 'clients.captureFieldCity',
  timeToBuy: 'clients.captureFieldTimeToBuy',
  paymentMethod: 'clients.captureFieldPaymentMethod',
  buyMotive: 'clients.captureFieldBuyMotive',
  projectId: 'clients.captureFieldProjectId',
  urgencyLevel: 'clients.captureFieldUrgencyLevel',
  decisionMaker: 'clients.captureFieldDecisionMaker',
};

const TEXT_AUTOSAVE_MS = 450;

function optionI18nKey(fieldKey: string, code: string): string {
  return `clients.captureOption${fieldKey.charAt(0).toUpperCase()}${fieldKey.slice(1)}_${code}`;
}

/** Formats catalog codes like `20_30m` → `$20M - $30M`. */
function formatEconomicCapacityLabel(code: string): string | null {
  const match = /^(\d+)_(\d+)m$/.exec(code);
  if (!match) {
    return null;
  }
  return `$${match[1]}M - $${match[2]}M`;
}

function optionLabel(
  t: (key: string) => string,
  fieldKey: string,
  code: string,
): string {
  if (fieldKey === 'economicCapacity') {
    return formatEconomicCapacityLabel(code) ?? code;
  }
  return t(optionI18nKey(fieldKey, code));
}

function fieldLabelKey(fieldKey: string): string {
  return FIELD_LABEL_KEYS[fieldKey] ?? fieldKey;
}

function isFilled(value: string | undefined): boolean {
  return (value ?? '').trim() !== '';
}

function FieldCheckDecorator({
  filled,
  offset = 'right-2.5',
}: {
  filled: boolean;
  offset?: string;
}) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute top-1/2 -translate-y-1/2 transition-colors duration-200',
        offset,
        filled ? 'text-emerald-600' : 'text-muted-foreground/35',
      )}
      aria-hidden
    >
      <Check className="h-3.5 w-3.5" strokeWidth={filled ? 2.5 : 2} />
    </span>
  );
}

export function ClientDetailCaptureSection() {
  const { t } = useTranslation();
  const { id: routeId } = useParams();
  const dispatch = useAppDispatch();
  const isPhysical = useAppSelector((s) => s.auth.user?.physical === true);
  const status = useAppSelector((s) => s.clients.customerMetadataStatus);
  const saving = useAppSelector((s) => s.clients.customerMetadataSaving);
  const error = useAppSelector((s) => s.clients.customerMetadataError);
  const data = useAppSelector((s) => {
    if (!routeId || s.clients.customerMetadataCustomerId !== routeId) {
      return null;
    }
    return s.clients.customerMetadata;
  });
  const projects = useAppSelector((s) => s.projects.list);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const draftRef = useRef(draft);
  const textSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canEdit = isPhysical;

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    if (!routeId) {
      return;
    }
    const req = dispatch(fetchCustomerMetadata(routeId));
    return () => {
      req.abort();
      if (textSaveTimer.current) {
        clearTimeout(textSaveTimer.current);
      }
    };
  }, [routeId, dispatch]);

  useEffect(() => {
    if (data) {
      setDraft({ ...data.values });
    }
  }, [data]);

  const completeness = useMemo(() => {
    const fields = data?.fields ?? [];
    const required = fields.filter((f) => f.required);
    let completed = 0;
    for (const field of required) {
      if (isFilled(draft[field.key])) {
        completed += 1;
      }
    }
    return {
      completed,
      total: required.length,
      isComplete: required.length > 0 && completed === required.length,
    };
  }, [data?.fields, draft]);

  const persistValues = (values: Record<string, string>) => {
    if (!routeId || !canEdit) {
      return;
    }
    void dispatch(saveCustomerMetadata({ customerId: routeId, values }));
  };

  const commitField = (key: string, value: string, immediate: boolean) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      draftRef.current = next;
      return next;
    });
    if (!canEdit) {
      return;
    }
    if (!immediate) {
      if (textSaveTimer.current) {
        clearTimeout(textSaveTimer.current);
      }
      textSaveTimer.current = setTimeout(() => {
        persistValues(draftRef.current);
      }, TEXT_AUTOSAVE_MS);
      return;
    }
    if (textSaveTimer.current) {
      clearTimeout(textSaveTimer.current);
      textSaveTimer.current = null;
    }
    persistValues({ ...draftRef.current, [key]: value });
  };

  if (status === 'loading' && data === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-4 border border-border shadow-sm"
      >
        <p className="text-sm text-muted-foreground">{t('clients.captureLoading')}</p>
      </motion.div>
    );
  }

  if (status === 'failed' && error && data === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-4 border border-destructive/30 shadow-sm"
      >
        <p className="text-sm text-destructive">{error}</p>
      </motion.div>
    );
  }

  const fields: CustomerMetadataFieldDefinition[] = data?.fields ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ClipboardList className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-tight">
              {t('clients.captureStageLabel')}
            </h3>
            <p className="text-xs text-muted-foreground leading-tight">
              {t('clients.captureProgress', {
                completed: completeness.completed,
                total: completeness.total,
              })}
              {saving ? ` · ${t('clients.captureSaving')}` : null}
            </p>
          </div>
        </div>
      </div>

      {!completeness.isComplete ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50/80 dark:bg-amber-950/25 px-2.5 py-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 dark:text-amber-100 leading-snug">
            {t('clients.captureWarning')}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5">
        {fields.map((field) => {
          const filled = isFilled(draft[field.key]);
          return (
            <div
              key={field.key}
              className={cn(
                'space-y-1',
                field.type === 'text' || field.type === 'project'
                  ? 'sm:col-span-2'
                  : undefined,
              )}
            >
              <Label
                htmlFor={`capture-${field.key}`}
                className="text-xs font-medium text-foreground"
              >
                {t(fieldLabelKey(field.key))}
                {field.required ? ' *' : ''}
              </Label>
              {field.type === 'text' ? (
                <div className="relative">
                  <Input
                    id={`capture-${field.key}`}
                    value={draft[field.key] ?? ''}
                    onChange={(e) => commitField(field.key, e.target.value, false)}
                    onBlur={() => {
                      if (textSaveTimer.current) {
                        clearTimeout(textSaveTimer.current);
                        textSaveTimer.current = null;
                      }
                      persistValues(draftRef.current);
                    }}
                    placeholder={t('clients.captureCityPlaceholder')}
                    disabled={!canEdit}
                    className="h-9 pr-8 text-sm"
                  />
                  <FieldCheckDecorator filled={filled} />
                </div>
              ) : null}
              {field.type === 'select' ? (
                <div className="relative">
                  <Select
                    value={draft[field.key] || undefined}
                    onValueChange={(v) => commitField(field.key, v, true)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger
                      id={`capture-${field.key}`}
                      className="cursor-pointer h-9 pr-10 text-sm"
                    >
                      <SelectValue placeholder={t('clients.captureSelectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.optionCodes ?? []).map((code) => (
                        <SelectItem key={code} value={code} className="cursor-pointer">
                          {optionLabel(t, field.key, code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldCheckDecorator filled={filled} offset="right-8" />
                </div>
              ) : null}
              {field.type === 'project' ? (
                <div className="relative">
                  <Select
                    value={draft[field.key] || undefined}
                    onValueChange={(v) => commitField(field.key, v, true)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger
                      id={`capture-${field.key}`}
                      className="cursor-pointer h-9 pr-10 text-sm"
                    >
                      <SelectValue placeholder={t('clients.captureSelectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem
                          key={project.id}
                          value={project.id}
                          className="cursor-pointer"
                        >
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldCheckDecorator filled={filled} offset="right-8" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
