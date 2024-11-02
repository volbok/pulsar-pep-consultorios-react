/* eslint eqeqeq: "off" */

import React, { useContext } from 'react';
import Context from '../pages/Context';

function Footer() {

  const {
    usuario,
  } = useContext(Context);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      height: 100, width: '100%',
      fontFamily: 'Helvetica',
      breakInside: 'avoid',
    }}>
      <div className="text1">
        _______________________________________________
      </div>
      <div id="identificação - documento" className="text1">
        {'DR(A). ' + usuario.nome_usuario + ' - ' + usuario.conselho + ' ' + usuario.n_conselho}
      </div>
    </div>
  )
}

export default Footer;
