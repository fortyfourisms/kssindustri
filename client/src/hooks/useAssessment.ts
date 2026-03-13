import { useEffect } from 'react';
import { useAssessmentStore } from '@/stores/assessment.store';

/**
 * useAssessment — auto-initializes the assessment store and optionally sets the
 * active stakeholder slug. Returns the full store for detailed page use.
 *
 * @param stakeholderSlug - current stakeholder slug from the URL/route
 */
export function useAssessment(stakeholderSlug?: string) {
    const store = useAssessmentStore();

    useEffect(() => {
        store.initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (stakeholderSlug) {
            store.setCurrentStakeholder(stakeholderSlug);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stakeholderSlug]);

    return store;
}
