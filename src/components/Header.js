/* eslint eqeqeq: "off" */

import React, { useContext } from 'react';
import Context from '../pages/Context';
import moment from "moment";

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
      flexDirection: 'column', justifyContent: 'center',
      fontFamily: 'Helvetica',
      breakInside: 'avoid',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
        width: '100%',
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
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontSize: 10, marginRight: 10 }}>
            <div className='text1' style={{ fontSize: 16 }}>{cliente.razao_social}</div>
            <div className='text1' style={{ fontSize: 16 }}>{'CNPJ: ' + cliente.cnpj}</div>
            <div className='text1' style={{ fontSize: 16 }}>{'ENDEREÇO: ' + cliente.endereco}</div>
            <div className='text1' style={{ fontSize: 16 }}>{'TELEFONE: ' + cliente.telefone}</div>
          </div>
        </div>
        <div
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignContent: 'center',
          }}>
          <div
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              alignContent: 'center',
              borderRadius: 5, backgroundColor: 'gray', color: 'white',
              padding: 10,
            }}
          >
            <div>{moment(selecteddocumento.data).format('DD/MM/YY - HH:mm')}</div>
            <div>{'ATENDIMENTO: ' + atendimento}</div>
          </div>
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
      <div style={{ fontFamily: 'Helvetica', fontWeight: 'bold', width: '100%', fontSize: 22, marginTop: 20, textAlign: 'center' }}>
        {tipodocumento}
      </div>
    </div>
  )
}

export default Header;
