/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from 'moment';
// funções.
import modal from '../functions/modal';
// imagens.
import deletar from '../images/deletar.png';
import novo from '../images/novo.png';
import back from '../images/back.png';

function Interconsultas() {

  // context.
  const {
    html,
    setdialogo,
    interconsultas, setinterconsultas,
    atendimento,
    card, setcard,
    mobilewidth,
    arrayespecialidades,
    usuario,
    paciente,
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-interconsultas') {
      loadInterconsultas();
    }
    // eslint-disable-next-line
  }, [card]);

  // atualizar lista de interconsultas.
  const loadInterconsultas = () => {
    axios.get(html + 'list_interconsultas/' + atendimento).then((response) => {
      setinterconsultas(response.data.rows);
    })
  }

  // deletar interconsulta.
  const deleteInterconsulta = (id) => {
    axios.get(html + 'delete_interconsulta/' + id).then(() => {
      // toast(settoast, 'INTERCONSULTA EXCLUÍDA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadInterconsultas();
    })
  }

  // inserir interconsulta.
  const insertInterconsulta = (especialidade) => {
    var obj = {
      id_atendimento: atendimento,
      especialidade: especialidade,
      status: 'PENDENTE',
      data_pedido: moment(),
      parecer: null,
      id_solicitante: usuario.id,
      id_interconsultor: null,
      id_paciente: paciente,
    }
    axios.post(html + 'insert_interconsulta', obj).then(() => {
      loadInterconsultas();
      setviewinsertinterconsulta(0);
    })
  }

  // componente para adição da interconsulta.
  const [viewinsertinterconsulta, setviewinsertinterconsulta] = useState();
  const InsertInterconsulta = useCallback(() => {
    return (
      <div className="fundo"
        onClick={(e) => { setviewinsertinterconsulta(0); e.stopPropagation() }}
        style={{ display: viewinsertinterconsulta == 1 ? 'flex' : 'none' }}>
        <div className="janela"
          onClick={(e) => e.stopPropagation()}
          style={{ flexDirection: 'column' }}>
          <div className='text3'>ESPECIALIDADE</div>
          <div className='scroll' style={{ height: '40vh', margin: 10, marginBottom: 20 }}>
            {arrayespecialidades.map(item => (
              <div className='button' style={{ width: 200 }}
                onClick={() => insertInterconsulta(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
    // eslint-disable-next-line
  }, [viewinsertinterconsulta]);

  // registro de interconsulta por voz.
  function Botoes() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
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
        <div id="btninputinterconsulta"
          className='button-green'
          onClick={(e) => { setviewinsertinterconsulta(1); e.stopPropagation() }}
          style={{ display: 'flex', alignSelf: 'center' }}
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
    );
  }

  // opções para status das interconsultas.
  const [viewopcoesstatus, setviewopcoesstatus] = useState(0);
  let arrayopcoesstatus = ['PENDENTE', 'ATIVA', 'ENCERRADA'];
  const [selectedinterconsulta, setselectedinterconsulta] = useState(0);
  function StatusInterconsulta() {
    return (
      <div className="fundo"
        style={{ display: viewopcoesstatus == 1 ? 'flex' : 'none' }}
        onClick={() => setviewopcoesstatus(0)}>
        <div className="janela" onClick={(e) => e.stopPropagation()}>
          <div className='text1' style={{ marginBottom: 15, width: 150 }}>STATUS DA INTERCONSULTA</div>
          {arrayopcoesstatus.map(item => (
            <div
              key={'opcao status interconsulta ' + item}
              onClick={() => {
                var obj = {
                  id_atendimento: atendimento,
                  especialidade: selectedinterconsulta.especialidade,
                  status: item,
                  data_pedido: selectedinterconsulta.data_pedido,
                  parecer: selectedinterconsulta.parecer,
                  id_solicitante: selectedinterconsulta.id_solicitante,
                  id_interconsultor: selectedinterconsulta.id_interconsultor,
                  id_paciente: selectedinterconsulta.id_paciente,
                }
                axios.post(html + 'update_interconsulta/' + selectedinterconsulta.id_interconsulta, obj).then(() => {
                  loadInterconsultas();
                  setviewopcoesstatus(0);
                })
              }}
              className='button' style={{ width: 150, minWidth: 150 }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }

  var timeout = null;
  return (
    <div id="scroll-interconsultas"
      className='card-aberto'
      style={{ display: card == 'card-interconsultas' ? 'flex' : 'none' }}
    >
      <div className="text3">
        INTERCONSULTAS
      </div>
      <Botoes></Botoes>
      <div
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center',
          flexWrap: 'wrap', width: '100%'
        }}>
        {interconsultas.sort((a, b) => moment(a.data_pedido) < moment(b.data_pedido) ? -1 : 1).map(item => (
          <div key={'interconsulta ' + item.id_interconsulta}
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
              justifyContent: 'center',
              margin: 5,
            }}>
            <div className='button'
              style={{
                flexDirection: window.innerWidth < mobilewidth ? 'row' : 'column',
                justifyContent: window.innerWidth < mobilewidth ? 'space-between' : 'center',
                padding: window.innerWidth < mobilewidth ? 5 : 15,
                paddingLeft: window.innerWidth < mobilewidth ? 20 : '',
                paddingRight: window.innerWidth < mobilewidth ? 8 : '',
                margin: 0,
                width: window.innerWidth < mobilewidth ? '' : 100,
                borderTopLeftRadius: window.innerWidth < mobilewidth ? 5 : 5,
                borderTopRightRadius: window.innerWidth < mobilewidth ? 5 : 0,
                borderBottomLeftRadius: window.innerWidth < mobilewidth ? 0 : 5,
                borderBottomRightRadius: window.innerWidth < mobilewidth ? 0 : 0,
              }}>
              {moment(item.data_pedido).format('DD/MM/YY')}
              <div className='button-yellow'
                style={{ width: 25, minWidth: 25, height: 25, minHeight: 25 }}
                onClick={(e) => {
                  modal(setdialogo, 'CONFIRMAR EXCLUSÃO DA INTERCONSULTA PARA ' + item.especialidade + '?', deleteInterconsulta, item.id_interconsulta);
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
            <div
              className='janela'
              style={{
                flex: 3,
                display: 'flex',
                flexDirection: 'column',
                padding: 2.5,
                borderTopLeftRadius: 0,
                borderTopRightRadius: window.innerWidth < mobilewidth ? 0 : 5,
                borderBottomLeftRadius: window.innerWidth < mobilewidth ? 5 : 0,
                borderBottomRightRadius: window.innerWidth < mobilewidth ? 5 : 5,
              }}>
              <div className='text1'>
                {item.especialidade}
              </div>
              <textarea id={"inputParecer " + item.id_interconsulta}
                className="textarea"
                autoComplete="off"
                placeholder='PARECER...'
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'PARECER...')}
                defaultValue={item.parecer}
                onKeyUp={(e) => {
                  clearTimeout(timeout);
                  var parecer = document.getElementById('inputParecer ' + item.id_interconsulta).value.toUpperCase();
                  timeout = setTimeout(() => {
                    var obj = {
                      id_atendimento: item.id_atendimento,
                      especialidade: item.especialidade,
                      status: item.status,
                      data_pedido: item.data_pedido,
                      parecer: parecer,
                      id_solicitante: item.id_solicitante,
                      id_interconsultor: usuario.id,
                      id_paciente: item.id_paciente,
                    }
                    axios.post(html + 'update_interconsulta/' + parseInt(item.id_interconsulta), obj).then(() => {
                      // loadInterconsultas();
                    });
                  }, 2000);
                  e.stopPropagation();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'center', justifyContent: 'center', alignSelf: 'center',
                  width: window.innerWidth < mobilewidth ? '60vw' : 300,
                  borderColor: 'transparent',
                }}
              >
              </textarea>
              <div
                className="button"
                style={{
                  width: 'calc(100% - 20px)',
                  backgroundColor: item.status == 'PENDENTE' ? '#EC7063' : item.status == 'ATIVA' ? '#F7DC6F' : 'rgb(82, 190, 128, 1)'
                }}
                onClick={(e) => { setselectedinterconsulta(item); setviewopcoesstatus(1); e.stopPropagation() }}
              >
                {item.status}
              </div>
            </div>
          </div>
        ))}
      </div>
      <InsertInterconsulta></InsertInterconsulta>
      <StatusInterconsulta></StatusInterconsulta>
    </div >
  )
}

export default Interconsultas;
