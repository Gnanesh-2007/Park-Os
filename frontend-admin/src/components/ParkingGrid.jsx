import React from 'react';
import { Car, CheckCircle, Info, Clock } from 'lucide-react';

const ParkingGrid = ({ slots, onSlotClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {slots.map((slot) => {
        let bgColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
        let StatusIcon = CheckCircle;
        let statusText = "Available";

        if (slot.status === 'occupied') {
          bgColor = "bg-red-500/10 border-red-500/30 text-red-400";
          StatusIcon = Car;
          statusText = "Occupied";
        } else if (slot.status === 'reserved') {
          bgColor = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
          StatusIcon = Clock;
          statusText = "Reserved";
        }

        return (
          <div 
            key={slot._id}
            onClick={() => onSlotClick && onSlotClick(slot)}
            className={`
              ${bgColor} border rounded-2xl p-4 flex flex-col items-center justify-center 
              transition-all hover:scale-105 active:scale-95 cursor-pointer group relative
            `}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <Info size={14} />
            </div>
            
            <StatusIcon size={24} className="mb-2" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider mb-1">
              Slot {slot.slotNumber}
            </span>
            <span className="text-[10px] opacity-70">
              {statusText}
            </span>

            {/* Visual Floor Decor */}
            <div className={`absolute bottom-0 left-0 w-full h-1 rounded-b-2xl ${
              slot.status === 'occupied' ? 'bg-red-500/50' : 
              slot.status === 'reserved' ? 'bg-yellow-500/50' : 'bg-emerald-500/50'
            }`}></div>
          </div>
        );
      })}
    </div>
  );
};

export default ParkingGrid;
