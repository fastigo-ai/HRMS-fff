import useSWR from 'swr';
import { salesService } from '../services/salesService';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  withCredentials: true,
});

export function useSalesData() {
  const { data: leads, error: leadsError, mutate: mutateLeads, isValidating: isValidatingLeads } = useSWR('/api/sales/leads', salesService.fetchLeads, {
    revalidateOnFocus: false, // Prevents excessive fetching
  });
  
  const { data: activities, error: activitiesError, mutate: mutateActivities, isValidating: isValidatingActivities } = useSWR('/api/sales/activities', salesService.fetchActivities, {
    revalidateOnFocus: false,
  });

  const { data: analytics, mutate: mutateAnalytics } = useSWR('/api/sales/analytics', salesService.fetchAnalytics, {
    revalidateOnFocus: false,
  });

  const { data: quotations, error: quotationsError, mutate: mutateQuotations, isValidating: isValidatingQuotations } = useSWR('/api/sales/quotations', salesService.fetchQuotations, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    const handleLeadChange = () => mutateLeads();
    const handleActivityChange = () => mutateActivities();
    const handleQuotationChange = () => mutateQuotations();

    socket.on('lead_created', () => { handleLeadChange(); mutateAnalytics(); });
    socket.on('lead_updated', () => { handleLeadChange(); mutateAnalytics(); });
    socket.on('activity_added', handleActivityChange);
    socket.on('quotation_updated', handleQuotationChange);
    socket.on('quotation_deleted', handleQuotationChange);

    return () => {
      socket.off('lead_created', handleLeadChange);
      socket.off('lead_updated', handleLeadChange);
      socket.off('activity_added', handleActivityChange);
      socket.off('quotation_updated', handleQuotationChange);
      socket.off('quotation_deleted', handleQuotationChange);
    };
  }, [mutateLeads, mutateActivities, mutateQuotations]);

  return {
    leads: leads || [],
    activities: activities || [],
    quotations: quotations || [],
    analytics: analytics || { velocity: 0, avgConversionTimeDays: 0, funnel: {} },
    isLoading: (!leads && !leadsError) || (!activities && !activitiesError) || (!quotations && !quotationsError),
    isError: leadsError || activitiesError || quotationsError,
    isValidating: isValidatingLeads || isValidatingActivities || isValidatingQuotations,
    mutateLeads,
    mutateActivities,
    mutateQuotations
  };
}
