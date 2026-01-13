import React from 'react';
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';

const TimelineView = ({ projects }) => {
  const startDate = startOfMonth(new Date('2024-05-01'));
  const endDate = endOfMonth(new Date('2024-08-31'));
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getLeftOffset = (dateStr) => {
    const diff = differenceInDays(new Date(dateStr), startDate);
    return (diff / days.length) * 100;
  };

  const getWidth = (startStr, endStr) => {
    const diff = differenceInDays(new Date(endStr), new Date(startStr));
    return (diff / days.length) * 100;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          Program Timeline
        </h1>
        <p className="text-slate-500 mt-2">
          Gantt visualization of active project windows
        </p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="relative overflow-x-auto min-w-[800px]">
          {/* Timeline Header */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <div className="w-64 border-r border-slate-200 p-4 shrink-0 font-bold text-slate-600 text-sm">
              Project Name
            </div>
            <div className="flex-1 flex min-w-[1200px]">
              {['May', 'Jun', 'Jul', 'Aug'].map((month) => (
                <div
                  key={month}
                  className="flex-1 p-4 text-center border-r border-slate-200 last:border-r-0 font-bold text-slate-400 text-xs uppercase tracking-widest"
                >
                  {month} 2024
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Content */}
          <div className="divide-y divide-slate-100 relative">
            {/* Today Marker */}
            <div
              className="absolute top-0 bottom-0 w-px bg-indigo-500 z-10 pointer-events-none opacity-50 flex items-start"
              style={{
                left: `calc(16rem + ${getLeftOffset(today)}%)`,
              }}
            >
              <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-b font-bold whitespace-nowrap -ml-4">
                TODAY
              </span>
            </div>

            {projects.map((p) => {
              const isDelayed =
                p.calculatedEndDate > p.originalEndDate;

              return (
                <div
                  key={p.id}
                  className="flex items-center group hover:bg-slate-50/50 transition-colors h-16"
                >
                  <div className="w-64 border-r border-slate-200 p-4 shrink-0 font-semibold text-slate-700 text-sm truncate">
                    {p.name}
                  </div>

                  <div className="flex-1 relative h-full min-w-[1200px] flex items-center">
                    {/* Project Bar */}
                    <div
                      className={`absolute h-8 rounded-lg shadow-sm flex items-center px-3 text-[11px] font-bold text-white transition-all overflow-hidden ${
                        isDelayed
                          ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-500'
                      }`}
                      style={{
                        left: `${getLeftOffset(p.startDate)}%`,
                        width: `${getWidth(
                          p.startDate,
                          p.calculatedEndDate
                        )}%`,
                      }}
                    >
                      <span className="truncate">
                        {p.progress}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span>On Track</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span>At Risk / Delayed</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <div className="w-px h-3 bg-indigo-500 opacity-50" />
          <span>Current Date</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
