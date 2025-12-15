/**
 * Event constants for PulseLog
 * Shared source of truth for all event dropdowns and labels
 */

export interface EventOption {
  value: string
  label: string
  category: 'track' | 'xc' | 'road'
  timeFormat: 'seconds' | 'minutes' | 'hours'
}

export const TRACK_EVENTS: EventOption[] = [
  { value: '60m', label: '60m', category: 'track', timeFormat: 'seconds' },
  { value: '100m', label: '100m', category: 'track', timeFormat: 'seconds' },
  { value: '200m', label: '200m', category: 'track', timeFormat: 'seconds' },
  { value: '400m', label: '400m', category: 'track', timeFormat: 'seconds' },
  { value: '800m', label: '800m', category: 'track', timeFormat: 'minutes' },
  { value: '1000m', label: '1000m', category: 'track', timeFormat: 'minutes' },
  { value: '1500m', label: '1500m', category: 'track', timeFormat: 'minutes' },
  { value: 'mile', label: 'Mile', category: 'track', timeFormat: 'minutes' },
  { value: '3000m', label: '3000m', category: 'track', timeFormat: 'minutes' },
  { value: '3200m', label: '3200m', category: 'track', timeFormat: 'minutes' },
  { value: '5000m', label: '5000m', category: 'track', timeFormat: 'minutes' },
  { value: '10000m', label: '10000m', category: 'track', timeFormat: 'minutes' },
  { value: '110mh', label: '110mH', category: 'track', timeFormat: 'seconds' },
  { value: '100h', label: '100H', category: 'track', timeFormat: 'seconds' },
  { value: '400h', label: '400H', category: 'track', timeFormat: 'seconds' },
  { value: 'steeple', label: 'Steeple', category: 'track', timeFormat: 'minutes' },
  { value: '4x100', label: '4x100', category: 'track', timeFormat: 'seconds' },
  { value: '4x400', label: '4x400', category: 'track', timeFormat: 'minutes' },
]

export const XC_ROAD_EVENTS: EventOption[] = [
  { value: '5k', label: '5K', category: 'xc', timeFormat: 'minutes' },
  { value: '8k', label: '8K', category: 'xc', timeFormat: 'minutes' },
  { value: '10k', label: '10K', category: 'xc', timeFormat: 'minutes' },
  { value: 'half_marathon', label: 'Half Marathon', category: 'road', timeFormat: 'hours' },
  { value: 'marathon', label: 'Marathon', category: 'road', timeFormat: 'hours' },
]

export const ALL_EVENTS: EventOption[] = [...TRACK_EVENTS, ...XC_ROAD_EVENTS]

export function getEventByValue(value: string): EventOption | undefined {
  return ALL_EVENTS.find(event => event.value === value)
}

export function getTimePlaceholder(event: EventOption | undefined): string {
  if (!event) return 'MM:SS (e.g., 15:30)'
  
  switch (event.timeFormat) {
    case 'seconds':
      return 'SS.MS (e.g., 10.50)'
    case 'minutes':
      return event.value === '800m' ? 'M:SS (e.g., 1:50)' : 'MM:SS (e.g., 15:30)'
    case 'hours':
      return 'H:MM:SS (e.g., 1:15:30)'
    default:
      return 'MM:SS (e.g., 15:30)'
  }
}

export function getTimePattern(event: EventOption | undefined): string {
  if (!event) return '[0-9]{1,2}:[0-5][0-9]'
  
  switch (event.timeFormat) {
    case 'seconds':
      return '[0-9]{1,2}\\.[0-9]{1,2}'
    case 'minutes':
      return '[0-9]{1,2}:[0-5][0-9]'
    case 'hours':
      return '[0-9]{1,2}:[0-5][0-9]:[0-5][0-9]'
    default:
      return '[0-9]{1,2}:[0-5][0-9]'
  }
}

