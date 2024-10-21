/* eslint eqeqeq: "off" */
import React, { useContext, useEffect } from "react";
import Context from "./Context";
// import salvar from "../images/salvar.svg";
import "moment/locale/pt-br";

function Faturamento() {

  // context.
  const {
    pagina
  } = useContext(Context);

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'FATURAMENTO') {
      console.log('PÁGINA DE FATURAMENTO');
    }
    // eslint-disable-next-line
  }, [pagina]);

  return (
    <div id="tela de faturamento"
      className='main'
      style={{
        display: pagina == 'FATURAMENTO' ? 'flex' : 'none',
      }}
    >
      <div className='chassi'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly',
        }}>
        {'IMPORTAR MÓDULO DE FATURAMENTO TISS DO PEP (CONSULTAS E SADT)'}
      </div>
    </div>
  )
}

export default Faturamento;