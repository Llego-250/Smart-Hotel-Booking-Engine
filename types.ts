import React from 'react';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
  DIRTY = 'DIRTY'
}

export enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  EXECUTIVE = 'EXECUTIVE'
}

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  price: number;
}

export interface KPI {
  label: string;
  value: string | number;
  trend: number; // percentage
  trendLabel?: string;
  icon?: React.ReactNode;
  format?: 'currency' | 'percent' | 'number';
}

export interface GuestSegment {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  expenses: number;
  projected: number;
}

export interface BookingForecast {
  date: string;
  occupancy: number;
  confidenceLower: number;
  confidenceUpper: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  message: string;
  timestamp: string;
}

export type View = 'EXECUTIVE' | 'OPERATIONS' | 'FINANCIAL' | 'GUEST_ANALYTICS' | 'BI_ANALYTICS';