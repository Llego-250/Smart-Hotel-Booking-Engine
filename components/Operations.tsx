import React, { useState } from 'react';
import { MOCK_ROOMS } from '../constants';
import { Room, RoomStatus } from '../types';
import { Card, Badge, Button } from './UI';
import { Filter, RotateCcw, BedDouble, Wrench, SprayCan, UserCheck } from 'lucide-react';

const RoomCard: React.FC<{ room: Room }> = ({ room }) => {
  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600';
      case RoomStatus.OCCUPIED: return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600';
      case RoomStatus.RESERVED: return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600';
      case RoomStatus.MAINTENANCE: return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600';
      case RoomStatus.DIRTY: return 'bg-gray-200 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500';
      default: return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: RoomStatus) => {
     switch(status) {
       case RoomStatus.OCCUPIED: return <UserCheck size={14} className="text-blue-600 dark:text-blue-400"/>;
       case RoomStatus.MAINTENANCE: return <Wrench size={14} className="text-red-600 dark:text-red-400"/>;
       case RoomStatus.DIRTY: return <SprayCan size={14} className="text-gray-600 dark:text-gray-400"/>;
       default: return <BedDouble size={14} className="text-green-600 dark:text-green-400"/>;
     }
  };

  return (
    <div className={`p-4 rounded-lg border transition-all cursor-pointer relative group ${getStatusColor(room.status)}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-gray-800 dark:text-gray-100 text-lg">{room.number}</span>
        {getStatusIcon(room.status)}
      </div>
      <div className="min-h-[40px]">
        {room.guestName ? (
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{room.guestName}</p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{room.type}</p>
        )}
        {room.status === RoomStatus.OCCUPIED && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Out: {room.checkOut}</p>
        )}
      </div>
      
      {/* Tooltip on Hover */}
      <div className="absolute z-10 invisible group-hover:visible bg-gray-900 dark:bg-black text-white text-xs rounded p-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 shadow-lg">
        <p>Price: ${room.price}</p>
        <p>Status: {room.status}</p>
      </div>
    </div>
  );
};

export const OperationsDashboard: React.FC = () => {
  const [filter, setFilter] = useState<RoomStatus | 'ALL'>('ALL');

  const stats = {
    available: MOCK_ROOMS.filter(r => r.status === RoomStatus.AVAILABLE).length,
    occupied: MOCK_ROOMS.filter(r => r.status === RoomStatus.OCCUPIED).length,
    dirty: MOCK_ROOMS.filter(r => r.status === RoomStatus.DIRTY).length,
    maintenance: MOCK_ROOMS.filter(r => r.status === RoomStatus.MAINTENANCE).length,
  };

  const filteredRooms = filter === 'ALL' ? MOCK_ROOMS : MOCK_ROOMS.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Operations Center</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time room status and housekeeping management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilter('ALL')}><RotateCcw size={16}/> Refresh</Button>
          <Button><Filter size={16}/> Filter View</Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between !p-4 border-l-4 border-l-green-500 dark:border-l-green-400">
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Available</p><p className="text-xl font-bold dark:text-white">{stats.available}</p></div>
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full"><BedDouble size={20} className="text-green-600 dark:text-green-400"/></div>
        </Card>
        <Card className="flex items-center justify-between !p-4 border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Occupied</p><p className="text-xl font-bold dark:text-white">{stats.occupied}</p></div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full"><UserCheck size={20} className="text-blue-600 dark:text-blue-400"/></div>
        </Card>
        <Card className="flex items-center justify-between !p-4 border-l-4 border-l-gray-500 dark:border-l-gray-400">
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Dirty</p><p className="text-xl font-bold dark:text-white">{stats.dirty}</p></div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"><SprayCan size={20} className="text-gray-600 dark:text-gray-400"/></div>
        </Card>
        <Card className="flex items-center justify-between !p-4 border-l-4 border-l-red-500 dark:border-l-red-400">
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Maintenance</p><p className="text-xl font-bold dark:text-white">{stats.maintenance}</p></div>
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full"><Wrench size={20} className="text-red-600 dark:text-red-400"/></div>
        </Card>
      </div>

      {/* Room Grid */}
      <Card title="Room Status Grid">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'DIRTY', 'MAINTENANCE'].map((s) => (
             <button
               key={s}
               onClick={() => setFilter(s as any)}
               className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === s 
                 ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-gray-800 dark:border-gray-200' 
                 : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
             >
               {s}
             </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredRooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </Card>
    </div>
  );
};