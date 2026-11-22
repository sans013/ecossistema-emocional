import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

interface FlowerIllustrationProps {
  nivelHumor: number | null;
  size?: number;
}

export function FlowerIllustration({ nivelHumor, size = 64 }: FlowerIllustrationProps) {
  const height = Math.round(size * 1.2);

  return (
    <Svg width={size} height={height} viewBox="0 0 80 96" accessibilityElementsHidden>
      {/* Sombra sutil na prateleira */}
      <Ellipse cx="40" cy="92" rx="22" ry="3.5" fill="rgba(45, 35, 28, 0.14)" />

      {/* Terra do vaso */}
      <Ellipse cx="40" cy="64" rx="21" ry="4" fill="#5D4037" />

      {/* Planta / Flor conforme o humor */}
      {nivelHumor === null && (
        <G>
          {/* Vaso em repouso acolhedor (sem punição) */}
          <Circle cx="35" cy="63" r="1.6" fill="#795548" />
          <Circle cx="44" cy="64" r="1.4" fill="#795548" />
          <Path d="M40 63 Q40 58 43 56" stroke="#7FA68A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <Ellipse cx="44.5" cy="55.5" rx="3" ry="1.8" fill="#8FB99A" transform="rotate(-20 44.5 55.5)" />
        </G>
      )}

      {nivelHumor === 1 && (
        /* Nível 1: Lírio-da-paz */
        <G>
          <Path d="M40 64 Q27 52 20 40 Q28 41 37 55 Z" fill="#2E6B4F" />
          <Path d="M40 64 Q54 52 60 40 Q52 41 43 55 Z" fill="#3B8261" />
          <Path d="M40 64 Q39 46 40 31" stroke="#2D6A4F" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          {/* Espata branca do lírio-da-paz */}
          <Path
            d="M40 39 C29 36 28 19 40 12 C52 19 51 36 40 39 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* Espádice dourado-creme */}
          <Path d="M40 33 L40 21" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" />
          <Path d="M40 32 L40 22" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
        </G>
      )}

      {nivelHumor === 2 && (
        /* Nível 2: Lavanda */
        <G>
          <Line x1="40" y1="64" x2="29" y2="28" stroke="#4D7C5D" strokeWidth="2.2" strokeLinecap="round" />
          <Line x1="40" y1="64" x2="40" y2="18" stroke="#3F6E50" strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="40" y1="64" x2="51" y2="28" stroke="#4D7C5D" strokeWidth="2.2" strokeLinecap="round" />
          {/* Espigas de lavanda */}
          {[22, 27, 32, 37].map((y, idx) => (
            <G key={`center-${idx}`}>
              <Ellipse cx="37.5" cy={y} rx="3.2" ry="2.2" fill="#8B5CF6" />
              <Ellipse cx="42.5" cy={y + 1} rx="3.2" ry="2.2" fill="#A78BFA" />
            </G>
          ))}
          <Circle cx="40" cy="17" r="3" fill="#C4B5FD" />
          {[30, 35, 40].map((y, idx) => (
            <G key={`left-${idx}`}>
              <Ellipse cx={27 + idx * 1.2} cy={y} rx="2.8" ry="2" fill="#7C3AED" />
              <Ellipse cx={31 + idx * 1.2} cy={y + 1} rx="2.8" ry="2" fill="#A78BFA" />
            </G>
          ))}
          {[30, 35, 40].map((y, idx) => (
            <G key={`right-${idx}`}>
              <Ellipse cx={53 - idx * 1.2} cy={y} rx="2.8" ry="2" fill="#7C3AED" />
              <Ellipse cx={49 - idx * 1.2} cy={y + 1} rx="2.8" ry="2" fill="#A78BFA" />
            </G>
          ))}
        </G>
      )}

      {nivelHumor === 3 && (
        /* Nível 3: Camomila */
        <G>
          <Path d="M40 64 Q36 48 28 36" stroke="#4D8B5F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <Path d="M40 64 Q44 46 51 35" stroke="#4D8B5F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <Path d="M40 64 L40 24" stroke="#3B7A4F" strokeWidth="2.6" strokeLinecap="round" />
          <Ellipse cx="33" cy="52" rx="6" ry="2.5" fill="#5EA372" transform="rotate(-25 33 52)" />
          <Ellipse cx="47" cy="52" rx="6" ry="2.5" fill="#5EA372" transform="rotate(25 47 52)" />
          {/* 3 flores pequenas de camomila */}
          {[
            { cx: 40, cy: 22, r: 1 },
            { cx: 27, cy: 35, r: 0.8 },
            { cx: 52, cy: 34, r: 0.8 },
          ].map((f, i) => (
            <G key={`cam-${i}`}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const px = f.cx + Math.cos(rad) * (8 * f.r);
                const py = f.cy + Math.sin(rad) * (8 * f.r);
                return <Circle key={deg} cx={px} cy={py} r={3.2 * f.r} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.6" />;
              })}
              <Circle cx={f.cx} cy={f.cy} r={4.5 * f.r} fill="#FACC15" />
            </G>
          ))}
        </G>
      )}

      {nivelHumor === 4 && (
        /* Nível 4: Margarida */
        <G>
          <Path d="M40 64 Q39 48 40 31" stroke="#3F8E57" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <Ellipse cx="31" cy="51" rx="8" ry="3.5" fill="#4FA66A" transform="rotate(-28 31 51)" />
          <Ellipse cx="49" cy="50" rx="8" ry="3.5" fill="#4FA66A" transform="rotate(26 49 50)" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const px = 40 + Math.cos(rad) * 11.5;
            const py = 27 + Math.sin(rad) * 11.5;
            return (
              <Ellipse
                key={deg}
                cx={px}
                cy={py}
                rx="5.5"
                ry="2.8"
                fill="#FFFFFF"
                stroke="#E2E8F0"
                strokeWidth="0.7"
                transform={`rotate(${deg} ${px} ${py})`}
              />
            );
          })}
          <Circle cx="40" cy="27" r="6.8" fill="#F59E0B" />
          <Circle cx="40" cy="27" r="4.5" fill="#FCD34D" />
        </G>
      )}

      {nivelHumor === 5 && (
        /* Nível 5: Girassol */
        <G>
          <Path d="M40 64 L40 30" stroke="#2F7A45" strokeWidth="3.8" strokeLinecap="round" />
          <Ellipse cx="29" cy="50" rx="9" ry="4.2" fill="#3E9456" transform="rotate(-25 29 50)" />
          <Ellipse cx="51" cy="49" rx="9" ry="4.2" fill="#3E9456" transform="rotate(25 51 49)" />
          {[0, 25.7, 51.4, 77.1, 102.8, 128.5, 154.2, 180, 205.7, 231.4, 257.1, 282.8, 308.5, 334.2].map(
            (deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const px = 40 + Math.cos(rad) * 14.5;
              const py = 25 + Math.sin(rad) * 14.5;
              return (
                <Ellipse
                  key={i}
                  cx={px}
                  cy={py}
                  rx="6.2"
                  ry="3"
                  fill={i % 2 === 0 ? '#FACC15' : '#F59E0B'}
                  transform={`rotate(${deg} ${px} ${py})`}
                />
              );
            }
          )}
          <Circle cx="40" cy="25" r="9.2" fill="#78350F" />
          <Circle cx="37" cy="23" r="1.2" fill="#B45309" />
          <Circle cx="43" cy="23" r="1.2" fill="#B45309" />
          <Circle cx="40" cy="27.5" r="1.2" fill="#B45309" />
          <Circle cx="37" cy="27" r="1" fill="#B45309" />
          <Circle cx="43" cy="27" r="1" fill="#B45309" />
        </G>
      )}

      {/* Vaso de cerâmica terracota */}
      <Path d="M21 71 L59 71 L54 90 Q53 92 50 92 L30 92 Q27 92 26 90 Z" fill="#C4744B" />
      <Path d="M24 71 L31 71 L29 91 L27 91 Z" fill="rgba(255,255,255,0.14)" />
      <Rect x="17" y="64" width="46" height="8" rx="3" fill="#D98A5F" />
    </Svg>
  );
}