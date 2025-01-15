/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
// componentes.
import Gravador from '../components/Gravador';
// funções.
import modal from '../functions/modal';
// import toast from '../functions/toast';
import checkinput from '../functions/checkinput';
// imagens.
import deletar from '../images/deletar.png';
import salvar from '../images/salvar.png';
import novo from '../images/novo.png';
import back from '../images/back.png';

function Alergias() {

  // context.
  const {
    html,
    settoast,
    setdialogo,
    alergias, setalergias,
    paciente,
    card, setcard,
    mobilewidth,
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-alergias') {
      loadAlergias();
    }
    // eslint-disable-next-line
  }, [card]);

  // atualizar lista de alergias.
  const loadAlergias = () => {
    axios.get(html + 'paciente_alergias/' + paciente).then((response) => {
      setalergias(response.data.rows);
    })
  }

  // deletar alergia.
  const deleteAlergia = (id) => {
    axios.get(html + 'delete_alergia/' + id).then(() => {
      // toast(settoast, 'ALERGIA EXCLUÍDA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadAlergias();
    })
  }

  // inserir alergia.
  const insertAlergia = ([alergia]) => {
    var obj = {
      id_paciente: paciente,
      alergia: alergia,
    }
    axios.post(html + 'insert_alergia', obj).then(() => {
      // toast(settoast, 'ALERGIA ADICIONADA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadAlergias();
      setviewinsertalergia(0);
    })
  }

  // componente para adição da alergia.
  const [viewinsertalergia, setviewinsertalergia] = useState();
  const InsertAlergia = useCallback(() => {
    return (
      <div className="fundo"
        onClick={(e) => { setviewinsertalergia(0); e.stopPropagation() }}
        style={{ display: viewinsertalergia == 1 ? 'flex' : 'none' }}>
        <div className="janela"
          onClick={(e) => e.stopPropagation()}
          style={{ flexDirection: 'column' }}>
          <div className='text3'>ALERGIA</div>
          <input
            className="input"
            autoComplete="off"
            placeholder="ALERGIA..."
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'ALERGIA...')}
            style={{
              width: window.innerWidth < mobilewidth ? '50vw' : '15vw',
              margin: 5,
            }}
            type="text"
            id="inputAlergia"
            maxLength={100}
          ></input>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div id="botão de retorno"
              className="button-yellow"
              style={{
                display: 'flex',
                alignSelf: 'center',
              }}
              onClick={() => setviewinsertalergia(0)}>
              <img
                alt=""
                src={back}
                style={{ width: 30, height: 30 }}
              ></img>
            </div>
            <div id="btnsalvaralergia"
              className='button-green'
              onClick={() => checkinput('input', settoast, ['inputAlergia'], "btnsalvaralergia", insertAlergia, [document.getElementById("inputAlergia").value.toUpperCase()])}
            >
              <img
                alt=""
                src={salvar}
                style={{
                  margin: 10,
                  height: 30,
                  width: 30,
                }}
              ></img>
            </div>
          </div>
        </div>
      </div>
    )
    // eslint-disable-next-line
  }, [viewinsertalergia]);

  // registro de alergia por voz.
  function Botoes() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div id="botão de retorno"
            className="button-yellow"
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
          <Gravador funcao={insertAlergia} continuo={false} ></Gravador>
          <div id="btninputalergia"
            className='button-green'
            onClick={(e) => { setviewinsertalergia(1); e.stopPropagation() }}
            style={{
              display: 'flex',
              alignSelf: 'center',
            }}
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
      </div>
    );
  }

  return (
    <div id="scroll-alergias"
      className='card-aberto'
      style={{ display: card == 'card-alergias' ? 'flex' : 'none' }}
    >
      <div className="text3">ALERGIAS</div>
      <Botoes></Botoes>
      <div
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center',
          flexWrap: 'wrap', width: '100%'
        }}>
        {alergias.map(item => (
          <div className='button' key={'alergia ' + item.id_alergia}
            style={{ width: 200, maxWidth: 200 }}>
            <div style={{ width: '100%' }}>
              {item.alergia}
            </div>
            <div className='button-yellow'
              style={{ width: 25, minWidth: 25, height: 25, minHeight: 25 }}
              onClick={(e) => {
                modal(setdialogo, 'CONFIRMAR EXCLUSÃO DA ALERGIA ' + item.alergia + '?', deleteAlergia, item.id_alergia);
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
      <InsertAlergia></InsertAlergia>
    </div>
  )
}

export default Alergias;
