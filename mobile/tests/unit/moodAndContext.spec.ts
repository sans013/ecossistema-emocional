import { DEFAULT_MOOD_CATALOG, getMoodDefinition } from '../../src/domain/entities/MoodCatalog';
import { getDayShiftContext } from '../../src/domain/services/ContextService';

describe('MoodCatalog e Sensibilidade ao Contexto', () => {
  it('mantém 5 níveis padronizados sem duplicação de ícones', () => {
    expect(DEFAULT_MOOD_CATALOG).toHaveLength(5);
    const icons = new Set(DEFAULT_MOOD_CATALOG.map((item) => item.iconKey));
    expect(icons.size).toBe(5);
  });

  it('aplica rótulo customizado do usuário quando informado', () => {
    const mood = getMoodDefinition(4, { '4': 'Sereno' });
    expect(mood.displayLabel).toBe('Sereno');
    expect(mood.climateLabel).toBe('Sol ameno');
  });

  it('retorna rótulo padrão quando não há customização', () => {
    const mood = getMoodDefinition(2);
    expect(mood.displayLabel).toBe('Mal');
    expect(mood.climateLabel).toBe('Névoa');
  });

  it('adapta saudação ao turno do dia (manhã, tarde e noite)', () => {
    expect(getDayShiftContext(new Date(2026, 10, 21, 9, 0)).greeting).toBe('Bom dia');
    expect(getDayShiftContext(new Date(2026, 10, 21, 15, 0)).greeting).toBe('Boa tarde');
    expect(getDayShiftContext(new Date(2026, 10, 21, 21, 0)).greeting).toBe('Boa noite');
  });
});