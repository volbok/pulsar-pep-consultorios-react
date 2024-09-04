/* eslint eqeqeq: "off" */

import React from 'react';

function Footer() {

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
        {'NOME E CARIMBO DO RESPONSÁVEL PELO DOCUMENTO'}
      </div>
    </div>
  )
}

export default Footer;
