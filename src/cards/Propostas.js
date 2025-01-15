/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from 'moment';
// funções.
import toast from '../functions/toast';
import modal from '../functions/modal';
import checkinput from '../functions/checkinput';
// imagens.
import deletar from '../images/deletar.png';
import salvar from '../images/salvar.png';
import novo from '../images/novo.png';
import flag from '../images/flag_green.png';
import fail from '../images/flag_red.png';
import back from '../images/back.png';
// componentes.
import Gravador from '../components/Gravador';

function Propostas() {

  // context.
  const {
    html,
    settoast, setdialogo,
    usuario, // objeto com {id e nome_usuario}.
    atendimento, // id_atendimento.
    propostas, setpropostas,
    arraypropostas, setarraypropostas,
    card, setcard,
    mobilewidth,
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-propostas') {
      loadPropostas();
    }
    // eslint-disable-next-line
  }, [card]);

  // carregando as propostas do atendimento.
  const loadPropostas = () => {
    axios.get(html + 'list_propostas/' + atendimento).then((response) => {
      setpropostas(response.data.rows);
      setarraypropostas(response.data.rows);
    });
  }

  // atualizando uma proposta.
  const [proposta, setproposta] = useState(0);
  const updateProposta = (item, inputproposta, inputprazo, status) => {
    var obj = {
      id_atendimento: item.id_atendimento,
      proposta: document.getElementById(inputproposta).value.toUpperCase(),
      status: status,
      data_proposta: item.data_proposta,
      id_usuario: item.id_usuario,
      prazo: inputprazo == null ? moment().startOf('day').add(4, 'day') : moment().startOf('day').add(1, 'day').add(document.getElementById(inputprazo).value, 'days'),
      data_conclusao: status == 0 ? null : moment(),
    }
    axios.post(html + 'update_proposta/' + item.id_proposta, obj).then(() => {
      loadPropostas();
      // toast(settoast, 'DADOS DA PROPOSTA ATUALIZADOS COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    })
  }

  // inserindo uma proposta.
  const insertProposta = () => {
    var obj = {
      id_atendimento: atendimento,
      proposta: document.getElementById("inputProposta").value.toUpperCase(),
      status: 0,
      data_proposta: moment(),
      id_usuario: usuario.id,
      prazo: moment().startOf('day').add(1, 'day').add(document.getElementById("inputPrazo").value, 'days'),
      data_conclusao: null,
    }
    axios.post(html + 'insert_proposta', obj).then(() => {
      loadPropostas();
      setviewinsertproposta(0);
      toast(settoast, 'PROPOSTA REGISTRADA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    })
  }

  // inserindo uma proposta por voz.
  const insertVoiceProposta = ([proposta]) => {
    var obj = {
      id_atendimento: atendimento,
      proposta: proposta,
      status: 0,
      data_proposta: moment(),
      id_usuario: usuario.id,
      prazo: moment().add(7, 'days'),
      data_conclusao: null,
    }
    axios.post(html + 'insert_proposta', obj).then(() => {
      loadPropostas();
      setviewinsertproposta(0);
      toast(settoast, 'PROPOSTA REGISTRADA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    })
  }

  // excluir uma proposta.
  const deleteProposta = (proposta) => {
    axios.get(html + 'delete_proposta/' + proposta.id_proposta).then(() => {
      loadPropostas();
      toast(settoast, 'PROPOSTA EXCLUÍDA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    })
  }

  // registro de textarea por voz.
  function Botoes() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div id="botão de retorno"
          className="button-yellow"
          style={{
            display: 'flex',
            width: 50, height: 50
          }}
          onClick={() => setcard('')}>
          <img
            alt=""
            src={back}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
        <Gravador funcao={insertVoiceProposta} continuo={true}></Gravador>
        <div id="btnsalvarevolucao"
          className='button-green'
          style={{ width: 50, height: 50 }}
          onClick={(e) => {
            setviewinsertproposta(1);
            e.stopPropagation();
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
    );
  }

  const [viewinsertproposta, setviewinsertproposta] = useState(0);
  const InsertProposta = useCallback(() => {
    return (
      <div className="fundo" style={{ display: viewinsertproposta == 1 ? 'flex' : 'none' }}
        onClick={(e) => { setviewinsertproposta(0); e.stopPropagation() }}>
        <div className="janela" onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className='text3'>PROPOSTA</div>
            <input
              id="inputProposta"
              title="PROPOSTA."
              autoComplete="off"
              placeholder='PROPOSTA...'
              className="input"
              type="text"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'PROPOSTA...')}
              defaultValue={proposta.proposta}
              maxLength={300}
              style={{
                display: 'flex',
                flexDirection: 'center', justifyContent: 'center', alignSelf: 'center',
                whiteSpace: 'pre-wrap',
                width: window.innerWidth < mobilewidth ? '70vw' : '40vw',
                height: 50,
              }}
            >
            </input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className='text3'>DIAS PARA EFETIVAÇÃO</div>
            <input
              id="inputPrazo"
              title='DIAS PARA O CUMPRIMENTO DA PROPOSTA (META).'
              autoComplete="off"
              placeholder="DIAS..."
              className="input"
              type="text"
              inputMode='numeric'
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'DIAS...')}
              maxLength={3}
              style={{
                width: 75,
                height: 50,
                alignSelf: 'center',
              }}
            ></input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div id="botão de retorno"
              className="button-yellow"
              style={{
                display: 'flex',
                alignSelf: 'center',
              }}
              onClick={() => setviewinsertproposta(0)}>
              <img
                alt=""
                src={back}
                style={{ width: 30, height: 30 }}
              ></img>
            </div>
            <div id='btnsalvarproposta' className='button-green'
              onKeyUp={(e) => {
                if (isNaN(e.target.value) == true || e.target.value == '') {
                  document.getElementById("inputPrazo").value = '';
                  document.getElementById("inputPrazo").focus();
                  e.stopPropagation();
                }
              }}
              onClick={() => checkinput('input', settoast, ['inputProposta', 'inputPrazo'], "btnsalvarproposta", insertProposta, [])}
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
  }, [viewinsertproposta]);

  function FilterPropostas() {
    return (
      <div className='input-special'
        style={{
          position: 'sticky',
          top: window.innerWidth < mobilewidth ? 70 : 10,
          display: 'flex', alignSelf: 'center',
          zIndex: 20,
        }}>
        <input
          className="input"
          autoComplete="off"
          placeholder="BUSCAR NAS PROPOSTAS..."
          onFocus={(e) => (e.target.placeholder = '')}
          onBlur={(e) => (e.target.placeholder = 'BUSCAR NAS PROPOSTAS...')}
          onClick={(e) => e.stopPropagation()}
          onKeyUp={(e) => { filterProposta(); e.stopPropagation(); }}
          type="text"
          id="inputFilterProposta"
          defaultValue={filterproposta}
          maxLength={100}
          style={{ margin: 5, width: window.innerWidth < mobilewidth ? '65vw' : '30vw' }}
        ></input>
      </div>
    )
  }

  const [filterproposta, setfilterproposta] = useState('');
  var searchproposta = '';
  const filterProposta = () => {
    clearTimeout(timeout);
    searchproposta = document.getElementById("inputFilterProposta").value.toUpperCase();
    timeout = setTimeout(() => {
      document.getElementById("inputFilterProposta").blur();
      setTimeout(() => {
        if (searchproposta == '') {
          setfilterproposta('');
          setarraypropostas(propostas);
          document.getElementById("inputFilterProposta").value = '';
        } else {
          setfilterproposta(document.getElementById("inputFilterProposta").value.toUpperCase());
          setarraypropostas(propostas.filter(item => item.proposta.includes(searchproposta)));
          document.getElementById("inputFilterProposta").value = searchproposta;
        }
      }, 500);
    }, 2000);
  }

  var timeout = null;
  return (
    <div id="scroll-propostas"
      className='card-aberto'
      style={{ display: card == 'card-propostas' ? 'flex' : 'none' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column', justifyContent: 'center',
        }}>
        <div className="text3">PROPOSTAS</div>
        <Botoes item={proposta}></Botoes>
        <FilterPropostas></FilterPropostas>
        {arraypropostas.sort((a, b) => moment(a.data_proposta) < moment(b.data_proposta) ? 1 : -1).map((item) => (
          <div
            key={'proposta ' + item.id_proposta}
            className='row'
            style={{
              margin: 5,
              alignContent: 'center', alignItems: 'center',
            }}
          >
            <div style={{
              display: 'flex', flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
              justifyContent: 'center', alignContent: 'center',
              flex: 5, alignItems: 'center',
            }}>
              <div id="identificador"
                className='button cor1opaque'
                style={{
                  flex: 1,
                  flexDirection: window.innerWidth < mobilewidth ? 'row' : 'column',
                  justifyContent: window.innerWidth < mobilewidth ? 'space-between' : 'center',
                  alignSelf: 'center',
                  margin: 0, padding: 5,
                  width: window.innerWidth < mobilewidth ? '95%' : '',
                  height: window.innerWidth < mobilewidth ? 60 : 130,
                  marginBottom: 0,
                  marginRight: 0,
                  marginLeft: 0,
                  borderTopLeftRadius: window.innerWidth < mobilewidth ? 5 : 5,
                  borderTopRightRadius: window.innerWidth < mobilewidth ? 5 : 0,
                  borderBottomLeftRadius: window.innerWidth < mobilewidth ? 0 : 5,
                  borderBottomRightRadius: window.innerWidth < mobilewidth ? 0 : 0,
                  backgroundColor: item.status == 1 ? 'rgb(82, 190, 128, 0.7)' : moment().startOf('day').add(1, 'day').diff(item.prazo, 'days') > -1 ? 'rgb(229, 126, 52, 0.5)' : ''
                }}>
                <div style={{
                  display: window.innerWidth < mobilewidth ? 'none' : 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div className='text2 cor 1' >{moment(item.data_proposta).format('DD/MM/YY')}</div>
                  <div className='text2 cor 1' >{moment(item.data_proposta).format('HH:mm')}</div>
                </div>
                <div style={{
                  display: window.innerWidth < mobilewidth ? 'flex' : 'none',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div className='text2 cor 1'>{moment(item.data_proposta).format('DD/MM/YY - HH:mm')}</div>
                </div>
                <div className='button-yellow'
                  style={{ width: 25, minWidth: 25, height: 25, minHeight: 25 }}
                  onClick={(e) => {
                    modal(setdialogo, 'CONFIRMAR EXCLUSÃO DA EVOLUÇÃO ?', deleteProposta, item);
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
              <div id="conteúdo da proposta"
                className='cor0'
                style={{
                  display: 'flex', flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
                  justifyContent: 'center',
                  flex: 4,
                  padding: 5,
                  paddingBottom: window.innerWidth < mobilewidth ? 10 : 5,
                  height: window.innerWidth < mobilewidth ? 100 : 130,
                  borderTopLeftRadius: window.innerWidth < mobilewidth ? 0 : 0,
                  borderTopRightRadius: window.innerWidth < mobilewidth ? 0 : 5,
                  borderBottomLeftRadius: window.innerWidth < mobilewidth ? 5 : 0,
                  borderBottomRightRadius: window.innerWidth < mobilewidth ? 5 : 5,
                  margin: 0,
                  marginTop: 0,
                  width: window.innerWidth < mobilewidth ? '95%' : '',
                }}>
                <div style={{
                  display: 'flex', flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
                  flex: window.innerWidth < mobilewidth ? 1 : 3,
                  width: window.innerWidth < mobilewidth ? '95%' : '',
                  paddingRight: window.innerWidth < mobilewidth ? '' : 10,
                  alignItems: 'center',
                  alignSelf: 'center',
                }}>
                  <textarea id={"inputProposta " + item.id_proposta}
                    className="textarea"
                    autoComplete="off"
                    placeholder='PROPOSTA...'
                    onFocus={(e) => (e.target.placeholder = '')}
                    onBlur={(e) => (e.target.placeholder = 'INSERIR PROPOSTA...')}
                    defaultValue={item.proposta}
                    onClick={(e) => {
                      setproposta(item);
                      e.stopPropagation();
                    }}
                    onKeyUp={(e) => {
                      clearTimeout(timeout);
                      timeout = setTimeout(() => {
                        document.getElementById("inputProposta " + item.id_proposta).blur();
                        setTimeout(() => {
                          if (document.getElementById("inputProposta " + item.id_proposta).value != '' && document.getElementById("inputPrazo " + item.id_proposta).value != '') {
                            updateProposta(item, "inputProposta " + item.id_proposta, "inputPrazo " + item.id_proposta, item.status);
                          }
                          e.stopPropagation();
                        }, 500);
                      }, 2000);
                    }}
                    style={{
                      flex: window.innerWidth < mobilewidth ? 1 : 3,
                      display: 'flex',
                      margin: 0,
                      flexDirection: 'center', justifyContent: 'center', alignSelf: 'center',
                      whiteSpace: 'pre-wrap',
                      height: 70,
                      width: '90%'
                    }}
                    title="PROPOSTA."
                  >
                  </textarea>
                  <div id="prazo"
                    className="cor2"
                    style={{
                      position: 'relative',
                      display: 'flex', flexDirection: 'row', justifyContent: 'center',
                      alignItems: 'flex-end',
                      alignSelf: 'center',
                      padding: 10,
                      marginTop: window.innerWidth < mobilewidth ? 10 : '',
                      borderRadius: 5,
                      height: 90,
                    }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className='text1' style={{ margin: 0 }}>PRAZO</div>
                      <input id={"inputPrazo " + item.id_proposta}
                        autoComplete="off"
                        inputMode='numeric'
                        placeholder="DIAS..."
                        className="input"
                        type="text"
                        onFocus={(e) => (e.target.placeholder = '')}
                        onBlur={(e) => (e.target.placeholder = 'DIAS...')}
                        maxLength={3}
                        style={{
                          pointerEvents: item.status == 1 ? 'none' : 'auto',
                          width: 50,
                          height: 50,
                          backgroundColor: moment(item.prazo).diff(moment(), 'days') > 0 || item.status == 1 ? '' : 'rgb(231, 76, 60, 0.7)',
                          color: moment(item.prazo).diff(moment(), 'days') > 0 || item.status == 1 ? '' : 'white',
                        }}
                        defaultValue={
                          moment(item.prazo).diff(moment(), 'days') > 0 && item.status == 0 ? moment(item.prazo).diff(moment(), 'days') :
                            moment(item.prazo).diff(moment(), 'days') < 1 && item.status == 0 ? 0 : moment(item.data_conclusao).diff(moment(item.data_proposta), 'days')}
                        onClick={(e) => {
                          setproposta(item);
                          e.stopPropagation()
                        }}
                        onKeyUp={(e) => {
                          if (isNaN(e.target.value) == true || e.target.value == '') {
                            document.getElementById("inputPrazo " + item.id_proposta).value = '';
                            document.getElementById("inputPrazo " + item.id_proposta).focus();
                            e.stopPropagation();
                          } else {
                            clearTimeout(timeout);
                            timeout = setTimeout(() => {
                              document.getElementById("inputFilterProposta").blur();
                              setTimeout(() => {
                                updateProposta(item, "inputProposta " + item.id_proposta, "inputPrazo " + item.id_proposta, item.status);
                                e.stopPropagation();
                              }, 500);
                            }, 2000);
                          }
                        }}
                      ></input>
                    </div>
                    <img
                      onClick={(e) => {
                        if (item.status == 0) {
                          setTimeout(() => {
                            updateProposta(item, "inputProposta " + item.id_proposta, "inputPrazo " + item.id_proposta, 1);
                          }, 500);
                        } else {
                          updateProposta(item, "inputProposta " + item.id_proposta, "inputPrazo " + item.id_proposta, 0);
                        }
                        e.stopPropagation();
                      }}
                      alt=""
                      src={item.status == 1 ? flag : fail}
                      className='cor0'
                      style={{
                        opacity: 1,
                        margin: 5,
                        padding: 5,
                        height: 40,
                        width: 40,
                        backgroundColor: 'white',
                        borderRadius: 5,
                      }}
                    ></img>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <InsertProposta></InsertProposta>
    </div>
  )
}

export default Propostas;