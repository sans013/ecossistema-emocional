export type DayShift = 'manha' | 'tarde' | 'noite';

export interface DayShiftContext {
  shift: DayShift;
  greeting: string;
  subtitle: string;
}

export function getDayShiftContext(date: Date = new Date()): DayShiftContext {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return {
      shift: 'manha',
      greeting: 'Bom dia',
      subtitle: 'Comece o dia no seu ritmo, sem pressa.',
    };
  }

  if (hour >= 12 && hour < 18) {
    return {
      shift: 'tarde',
      greeting: 'Boa tarde',
      subtitle: 'Que tal reservar um minutinho para você hoje?',
    };
  }

  return {
    shift: 'noite',
    greeting: 'Boa noite',
    subtitle: 'Um respiro tranquilo para encerrar o seu dia.',
  };
}