/* eslint eqeqeq: "off" */

import React, { useContext } from 'react';
import Context from '../pages/Context';
import moment from "moment";
import { QRCodeSVG } from 'qrcode.react';

function Header() {

  const {
    cliente,
    atendimento, // corresponde ao id_atendimento das tabela "atendimento".
    objatendimento, // todos os parâmetros do objeto atendimento.
    selecteddocumento,
    tipodocumento,
    alergias,
  } = useContext(Context);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignSelf: 'center',
      fontFamily: 'Helvetica',
      breakInside: 'avoid',
      // backgroundColor: 'rgb(0,0,0, 0.1)',
      width: '100%',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <img
            alt=""
            src={cliente.logo}
            style={{
              margin: 0, marginBottom: 10,
              width: 150,
            }}
          ></img>
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', fontSize: 10,
            marginRight: 50,
            width: '30vw',
          }}>
            <div style={{ fontSize: 10 }}>{cliente.razao_social}</div>
            <div style={{ fontSize: 10 }}>{'ENDEREÇO: ' + cliente.endereco}</div>
            <div style={{ fontSize: 10 }}>{'TELEFONE: ' + cliente.telefone}</div>
          </div>
        </div>
        <div
          style={{
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            borderRadius: 5, backgroundColor: 'gray',
            color: 'white', fontSize: 10, fontWeight: 'bold',
            padding: 5,
          }}
        >
          <div>{moment(selecteddocumento.data).format('DD/MM/YY - HH:mm')}</div>
          <div style={{ marginBottom: 5 }}>{'ATENDIMENTO: ' + atendimento}</div>
          <QRCodeSVG style={{ height: 100, width: 100 }} value="https://www.instagram.com/pediatrianarede/reel/DB_E3aVNjL9/" />
        </div>
      </div>
      <div style={{ fontFamily: 'Helvetica', fontWeight: 'bold', fontSize: 20, marginTop: 10 }}>
        {objatendimento != undefined ? 'CLIENTE: ' + objatendimento.nome_paciente : ''}
      </div>
      <div
        style={{
          display: alergias.length > 0 ? 'flex' : 'none',
          fontFamily: 'Helvetica', fontWeight: 'bold', fontSize: 16, marginTop: 10, color: 'red', textDecoration: 'underline'
        }}>
        {'ALERGIAS: ' + alergias.map(item => ' ' + item.alergia + ' ')}
      </div>
      <hr style={{ display: 'flex', border: '1px solid black', width: '100%' }}></hr>
      <div style={{ fontFamily: 'Helvetica', fontWeight: 'bold', fontSize: 22, marginTop: 20, textAlign: 'center' }}>
        {tipodocumento}
      </div>
    </div>
  )
}

export default Header;
