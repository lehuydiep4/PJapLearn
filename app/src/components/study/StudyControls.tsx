import React from 'react';
import { SRSData } from '../../types';
import { calculateSM2 } from '../../utils/sm2';

interface StudyControlsProps {
  currentSrsData: SRSData;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
}

export const StudyControls: React.FC<StudyControlsProps> = ({ currentSrsData, onRate }) => {
  const getIntervalLabel = (rating: 1 | 2 | 3 | 4) => {
    // Dry run SM-2 calculation
    const nextData = calculateSM2(rating, currentSrsData);
    if (nextData.interval === 0) {
      return '< 10 phút';
    } else if (nextData.interval === 1) {
      return '1 ngày';
    } else if (nextData.interval < 30) {
      return `${nextData.interval} ngày`;
    } else if (nextData.interval < 365) {
      return `${Math.round(nextData.interval / 30)} tháng`;
    } else {
      return `${Math.round(nextData.interval / 365)} năm`;
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-md mt-6">
      <button 
        onClick={() => onRate(1)}
        className="flex flex-col justify-center items-center py-2 px-1 bg-red-100 hover:bg-red-200 text-red-900 rounded transition-colors"
      >
        <span className="font-bold text-sm">Chưa nhớ</span>
        <span className="text-[10px] opacity-80 mt-1">{getIntervalLabel(1)}</span>
      </button>
      <button 
        onClick={() => onRate(2)}
        className="flex flex-col justify-center items-center py-2 px-1 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded transition-colors"
      >
        <span className="font-bold text-sm">Khó</span>
        <span className="text-[10px] opacity-80 mt-1">{getIntervalLabel(2)}</span>
      </button>
      <button 
        onClick={() => onRate(3)}
        className="flex flex-col justify-center items-center py-2 px-1 bg-green-100 hover:bg-green-200 text-green-900 rounded transition-colors"
      >
        <span className="font-bold text-sm">Đã nhớ</span>
        <span className="text-[10px] opacity-80 mt-1">{getIntervalLabel(3)}</span>
      </button>
      <button 
        onClick={() => onRate(4)}
        className="flex flex-col justify-center items-center py-2 px-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded transition-colors"
      >
        <span className="font-bold text-sm">Dễ</span>
        <span className="text-[10px] opacity-80 mt-1">{getIntervalLabel(4)}</span>
      </button>
    </div>
  );
};
