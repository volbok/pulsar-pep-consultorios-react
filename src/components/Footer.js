/* eslint eqeqeq: "off" */

import React, { useContext } from 'react';
import Context from '../pages/Context';

function Footer() {

  const {
    usuario,
    cliente,
  } = useContext(Context);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      height: 100, width: '100%',
      fontFamily: 'Helvetica',
      breakInside: 'avoid',
      alignContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    }}>
      <div className="text1" style={{ marginBottom: 10 }}>
        _______________________________________________
      </div>
      <div id="identificação - documento" className="text1">
        {'DR(A). ' + usuario.nome_usuario + ' - ' + usuario.conselho + ' ' + usuario.n_conselho}
      </div>
      <hr style={{ border: '1px solid black', width: 'calc(100vw - 20px)' }}></hr>
      <div className='text1' style={{ fontSize: 10 }}>{'CNPJ: ' + cliente.cnpj}</div>
    </div>
  )
}

export default Footer;
