import fs from 'node:fs';
import path from 'node:path';

export interface FlowerMaterial {
  nivelHumor: number;
  rotuloPadrao: string;
  clima: string;
  flor: string;
  nomeCientifico: string;
  simbolismo: string;
  tomRecomendado: string;
  focoPratico: string;
}

export interface LoadedMaterials {
  flores: FlowerMaterial[];
  diretrizes: string;
}

export function loadMaterials(
  materialsDir: string = path.resolve(__dirname, '../../materiais')
): LoadedMaterials {
  const flowersPath = path.join(materialsDir, 'catalogo-flores.json');
  const guidelinesPath = path.join(materialsDir, 'diretrizes-acolhimento.md');

  const rawFlowers = fs.readFileSync(flowersPath, 'utf-8');
  const flores = JSON.parse(rawFlowers) as FlowerMaterial[];
  const diretrizes = fs.readFileSync(guidelinesPath, 'utf-8');

  return { flores, diretrizes };
}

export function findFlowerByMood(
  flores: FlowerMaterial[],
  nivelHumor: number
): FlowerMaterial {
  return flores.find((item) => item.nivelHumor === nivelHumor) ?? flores[2];
}