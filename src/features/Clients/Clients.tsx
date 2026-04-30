import AddClientModal from './AddClientModal';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClient } from './use-client';
import { ClientsListPanel } from './clients-list-panel';
import { ClientsStepFilter } from './clients-step-filter';
import { ClientsDateFilter } from './clients-date-filter';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSearch } from '@/store/clientsSlice';

const Clients = () => {
  const { t } = useTranslation();
  const {
    clientList,
    loadingList,
    showModal,
    setShowModal,
    closeAddModal,
    form,
    errors,
    updateField,
    submitNewClient,
  } = useClient();

  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.clients.search);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{t('clients.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('clients.totalCount', { count: clientList.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-10 h-10 gradient-commission rounded-xl flex items-center justify-center shadow-md cursor-pointer"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('clients.searchPlaceholder')}
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <ClientsStepFilter />
      </div>

      <div className="space-y-2">
        <ClientsDateFilter />
        <ClientsListPanel loadingList={loadingList} />
      </div>

      <AddClientModal
        open={showModal}
        onClose={closeAddModal}
        form={form}
        errors={errors}
        updateField={updateField}
        onSubmit={() => {
          void submitNewClient();
        }}
      />
    </div>
  );
};

export default Clients;
