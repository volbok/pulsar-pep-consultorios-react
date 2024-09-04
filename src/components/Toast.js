/* eslint eqeqeq: "off" */
import React, { useContext } from 'react';
import Context from '../pages/Context';

function Toast() {

  const {
    toast,
  } = useContext(Context)

  return (
    <div
      style={{
        display: toast.display,
        zIndex: 999, position: 'fixed',
        bottom: window.innerWidth > 426 ? 20 : '',
        top: window.innerWidth > 426 ? '' : 20,
        left: window.innerWidth > 426 ? '' : 20,
        right: window.innerWidth > 426 ? 20 : 20,
        flexDirection: 'column', justifyContent: 'center',
        alignContent: 'center', alignItems: 'center',
      }}>
      <div
        className='toasty'
        style={{
          display: 'flex',
          backgroundColor: '#ffffff',
          padding: 5,
          minHeight: 50,
          maxHeight: 300,
          borderRadius: 5,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: 14,
            backgroundColor: toast.cor,
            padding: 5,
            borderRadius: 5,
            paddingLeft: 10, paddingRight: 10
          }}>
          {toast.mensagem}
        </div>
      </div>
    </div >
  );
}

export default Toast;
