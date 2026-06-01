import React from 'react';
import HolidayCalendar from '../../../pages/shared/HolidayCalendar';
import { useUiStore } from '../../../store/uiStore';

export default function HolidaysPage() {
  const { triggerToast } = useUiStore();

  return (
    <HolidayCalendar canEdit={false} triggerToast={triggerToast} />
  );
}
