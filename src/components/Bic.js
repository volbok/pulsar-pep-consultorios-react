import React from 'react';

export default function Logo() {

  // definindo cores do logo conforme as cores do css.
  var r = document.querySelector(':root');
  var rs = getComputedStyle(r);
  var cor1 = rs.getPropertyValue('--cor1opaque');
  var cor2 = rs.getPropertyValue('--cor2');

  return (
    <svg
      width="120pt"
      height="120pt"
      viewBox="0 0 120 120"
    >
      <rect
        ry="3.6054208"
        rx="3.3919411"
        y="34.958183"
        x="39.662296"
        height="77.176331"
        width="71.241447"
        id="bomba de infusão"
        style={{
          opacity: 1,
          fill: cor1,
          fillOpacity: 1,
          stroke: cor1,
          strokeWidth: 3.74042463,
          strokeLinecap: 'butt',
          strokeLinejoin: 'round',
          strokeMiterlimit: 4,
          strokeDasharray: 'none',
          strokeOpacity: 1
        }}
      />
      <path
        id="linha"
        d="m 20.320755,45.820755 v 46.188682 h 23.547169 v 0.679245"
        style={{
          fill: 'none',
          stroke: cor1,
          strokeWidth: 2.83464575,
          strokeLinecap: 'butt',
          strokeLinejoin: 'round',
          strokeMiterlimit: 4,
          strokeDasharray: 'none',
          strokeOpacity: 1
        }}
      />
      <rect
        ry="4.2442169"
        rx="3.1215661"
        y="6.4145179"
        x="6.5164952"
        height="40.831341"
        width="27.653896"
        id="frasco de soro"
        style={{
          opacity: 1, fill: cor1, fillOpacity: 1,
          stroke: cor1, strokeWidth: 1.59558523,
          strokeLinecap: 'butt', strokeLinejoin: 'round',
          strokeMiterlimit: 4, strokeDasharray: 'none',
          strokeOpacity: 1, paintOrder: 'stroke fill markers'
        }} />
      <rect
        ry="2.3906138"
        rx="2.3660834"
        y="9.3307791"
        x="9.84021"
        height="22.998817"
        width="20.961088"
        id="conteúdo do soro"
        style={{
          opacity: 1, fill: cor2, fillOpacity: 1,
          stroke: cor2, strokeWidth: 1.04256868,
          strokeLinecap: 'butt', strokeLinejoin: 'round',
          strokeMiterlimit: 4, strokeDasharray: 'none',
          strokeOpacity: 1, paintOrder: 'stroke fill markers'
        }} />
    </svg>
  )
}
