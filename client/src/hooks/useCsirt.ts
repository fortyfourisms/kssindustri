import { useEffect } from 'react';
import { useCsirtStore } from '@/stores/csirt.store';
import type { CreateCsirtPayload } from '@/types/csirt.types';

/**
 * useCsirt — ergonomic wrapper around useCsirtStore.
 * Automatically initializes (lazy-loads) CSIRT data on first use.
 */
export function useCsirt() {
  const store = useCsirtStore();

  useEffect(() => {
    store.initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    csirts: store.csirts,
    loading: store.loading,
    error: store.error,
    getCsirtById: (id: number) => store.getCsirtById(id),
    create: (payload: CreateCsirtPayload) => store.createCsirt(payload),
    update: (id: number, updates: Partial<CreateCsirtPayload>) => store.updateCsirtById(id, updates),
    remove: (id: number) => store.deleteCsirtById(id),
    refresh: () => store.refresh(),
    generateSlug: (name: string) => store.generateSlug(name),
  };
}