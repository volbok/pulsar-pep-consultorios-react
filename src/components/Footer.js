/* eslint eqeqeq: "off" */

import React, { useContext } from 'react';
import Context from '../pages/Context';

function Footer() {

  const {
    usuario,
    cliente,
  } = useContext(Context);

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        height: 100,
        fontFamily: 'Helvetica',
        breakInside: 'avoid',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        // backgroundColor: 'rgb(0,0,0, 0.1)',
        width: '100%',
        marginTop: 50,
      }}>
      <div> _______________________________________________ </div>
      <div id="identificação - documento"
        style={{
          fontFamily: 'Helvetica', fontWeight: 'bold', fontSize: 16,
          marginTop: 5, marginBottom: 50,
          textAlign: 'center'
        }}
      >
        {'DR(A). ' + usuario.nome_usuario + ' - ' + usuario.conselho + ' ' + usuario.n_conselho}
      </div>
      <hr style={{ display: 'flex', border: '1px solid black', width: '100%' }}></hr>
      <div
        style={{ fontFamily: 'Helvetica', fontSize: 12, marginTop: 5, textAlign: 'center' }}
      >
        {'CNPJ: ' + cliente.cnpj}
      </div>
    </div>
  )
}

export default Footer;
