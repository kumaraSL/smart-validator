import React from 'react';

export type ChipStatus = 'completed' | 'in-progress' | 'error' | 'locked' | 'neutral' | 'warning' | 'action';

interface StatusChipProps {
  status: ChipStatus;
  label: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label }) => {
  const cls = status === 'in-progress' ? 'chip chip-in-progress' : `chip chip-${status}`;
  return <span className={cls}>{label}</span>;
};
