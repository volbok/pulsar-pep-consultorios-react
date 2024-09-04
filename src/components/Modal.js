/* eslint eqeqeq: "off" */
import React, { useContext } from 'react';
import Context from '../pages/Context';

function Modal() {

  // context.
  const {
    dialogo, setdialogo,
  } = useContext(Context);

  return (
    <div className="fundo"
      style={{ display: dialogo.id !== 0 ? 'flex' : 'none' }}
      onClick={() => setdialogo({ id: 0, mensagem: '', funcao: null, parametros: [] })}
    >
      <div className="janela" style={{ width: window.innerWidth < 426 ? '80vw' : '' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text1">{dialogo.mensagem}</div>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 426 ? 'column' : 'row',
          justifyContent: 'center', margin: 10
        }}>
          <div
            className="button-red" style={{ width: 200 }}
            onClick={() => { dialogo.funcao(dialogo.parametros); setdialogo({ id: 0, mensagem: '', funcao: null, parametros: [] }); }}
          >
            SIM
          </div>
          <div className="button-green" style={{ width: 200 }}
            onClick={() => setdialogo({ id: 0, mensagem: '', funcao: null, parametros: [] })}
          >
            NÃO
          </div>
        </div>
      </div>
    </div >
  )
}

export default Modal;
