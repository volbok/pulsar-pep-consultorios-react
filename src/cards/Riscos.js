/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from 'moment';
// funções.
import modal from '../functions/modal';
// imagens.
import deletar from '../images/deletar.svg';
import novo from '../images/novo.svg';
import back from '../images/back.svg';

function Riscos() {

  // context.
  const {
    html,
    setdialogo,
    riscos, setriscos,
    paciente,
    card, setcard,
    mobilewidth,
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-riscos') {
      loadRiscos();
    }
    // eslint-disable-next-line
  }, [card]);

  // atualizar lista de riscos.
  const loadRiscos = () => {
    axios.get(html + 'paciente_riscos/' + paciente).then((response) => {
      setriscos(response.data.rows);
    })
  }

  // deletar risco.
  const deleteRisco = (id) => {
    axios.get(html + 'delete_risco/' + id).then(() => {
      // toast(settoast, 'RISCO EXCLUÍDO COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadRiscos();
    })
  }

  // inserir risco.
  const insertRisco = (risco) => {
    var obj = {
      id_paciente: paciente,
      risco: risco,
      data_inicio: moment(),
      data_termino: null,
    }
    console.log(obj);
    axios.post(html + 'insert_risco', obj).then(() => {
      console.log('RISCO REGISTRADO');
      loadRiscos();
      setviewinsertrisco(0);
    })
  }

  // opções de precaução.
  var arrayopcoesrisco = [
    'QUEDA',
    'LESÃO',
    'SEPSE',
    'PAVM',
    'EVASÃO',
    'TAE',
  ]
  const [tiporisco, settiporisco] = useState('SELECIONE');
  const [viewopcoesrisco, setviewopcoesrisco] = useState();
  function OpcoesRisco() {
    return (
      <div className="fundo"
        onClick={(e) => { setviewopcoesrisco(0); e.stopPropagation() }}
        style={{ display: viewopcoesrisco == 1 ? 'flex' : 'none' }}>
        <div className="janela">
          {arrayopcoesrisco.map(item => (
            <div
              key={'riscos ' + item}
              className='button'
              style={{ width: 100 }}
              onClick={() => {
                settiporisco(item);
                insertRisco(item);
                setviewopcoesrisco(0);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // componente para adição do risco.
  const [viewinsertrisco, setviewinsertrisco] = useState();
  const InsertRisco = useCallback(() => {
    return (
      <div className="fundo"
        onClick={(e) => { setviewinsertrisco(0); e.stopPropagation() }}
        style={{ display: viewinsertrisco == 1 ? 'flex' : 'none' }}>
        <div className="janela"
          onClick={(e) => e.stopPropagation()}
          style={{ flexDirection: 'column' }}>
          <div className='text3'>RISCO</div>
          <div
            className="button"
            onClick={(e) => {
              setviewopcoesrisco(1);
              e.stopPropagation();
            }}
            style={{
              width: window.innerWidth < mobilewidth ? '50vw' : '15vw',
              margin: 5,
            }}
            id="inputRisco"
          >
            {tiporisco}
          </div>
          <div id="botão de retorno"
            className="button-red"
            style={{
              display: 'flex',
              alignSelf: 'center',
            }}
            onClick={() => setviewinsertrisco(0)}>
            <img
              alt=""
              src={back}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
        </div>
      </div>
    )
    // eslint-disable-next-line
  }, [viewinsertrisco]);

  return (
    <div id="scroll-riscos"
      className='card-aberto'
      style={{ display: card == 'card-riscos' ? 'flex' : 'none' }}
    >
      <div className="text3">
        RISCOS
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div id="botão de retorno"
          className="button-red"
          style={{
            display: 'flex',
            alignSelf: 'center',
          }}
          onClick={() => setcard('')}>
          <img
            alt=""
            src={back}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
        <div id="btninputrisco"
          className='button-green'
          onClick={(e) => { setviewinsertrisco(1); e.stopPropagation() }}
          style={{ width: 50, height: 50 }}
        >
          <img
            alt=""
            src={novo}
            style={{
              margin: 10,
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
      </div>
      <div
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center',
          flexWrap: 'wrap', width: '100%'
        }}>
        {riscos.map(item => (
          <div className='button' key={'risco ' + item.id_risco}
            style={{ width: 200, maxWidth: 200 }}>
            <div style={{ width: '100%' }}>
              {item.risco}
            </div>
            <div className='button-yellow'
              style={{ width: 25, minWidth: 25, height: 25, minHeight: 25 }}
              onClick={(e) => {
                modal(setdialogo, 'CONFIRMAR EXCLUSÃO DO RISCO ' + item.risco + '?', deleteRisco, item.id_risco);
                e.stopPropagation();
              }}>
              <img
                alt=""
                src={deletar}
                style={{
                  margin: 10,
                  height: 25,
                  width: 25,
                }}
              ></img>
            </div>
          </div>
        ))}
      </div>
      <InsertRisco></InsertRisco>
      <OpcoesRisco></OpcoesRisco>
    </div >
  )
}

export default Riscos;
