/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState } from 'react';
import Context from './Context';
import axios from 'axios';
// imagens.
import deletar from '../images/deletar.png';
import back from '../images/back.png';
import moment from "moment";
import whatsapp from '../images/whatsapp.png';
import salvar from '../images/salvar.png';
// cards.
import GuiaConsulta from '../cards/GuiaConsulta';
// components.
import Pagamento from '../components/Pagamento';
// router.
import { useHistory } from "react-router-dom";
// funções.
import mountage from '../functions/mountage';
import toast from '../functions/toast';
import modal from '../functions/modal';
// criação dos documentos PDF.
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.addVirtualFileSystem(pdfFonts);

function AgendamentoExames() {

  // context.
  const {
    pagina, setpagina,
    html,
    paciente, setpaciente,
    setdialogo,
    cliente,
    settoast,
    agendaexame, setagendaexame,
    setpagamento,
    faturamento, setfaturamento,
    selectdate, setselectdate,
    arrayexames, setarrayexames,
  } = useContext(Context);

  // history (router).
  let history = useHistory();

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'AGENDAMENTO-EXAMES') {
      setselectdate(moment().format('DD/MM/YYYY'));
      loadFaturamentos();
      loadProcedimentos();
      loadAgendaExames();
      currentMonth();
    }
    // eslint-disable-next-line
  }, [pagina]);

  const loadAgendaExames = () => {
    axios.get(html + 'list_agenda_exames/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setagendaexame(x);
    })
  }

  const loadFaturamentos = () => {
    axios.get(html + 'list_faturamento_clinicas/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setfaturamento(x);
      console.log(x);
      console.log('LISTA DE FATURAMENTOS CARREGADA');
    })
  }

  // carregando registros de procedimentos realizados para o cliente.
  const [allprocedimentos, setallprocedimentos] = useState([]);
  const loadProcedimentos = () => {
    axios
      .get(html + "all_procedimentos")
      .then((response) => {
        setallprocedimentos(response.data.rows);
      });
  };

  const [selecionaexame, setselecionaexame] = useState(1);
  function SelecionaExame() {
    return (
      <div
        className="fundo"
        style={{ display: selecionaexame == 1 ? "flex" : "none" }}
        onClick={() => { setselecionaexame(0) }}
      >
        <div className="janela scroll cor2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className='text1' style={{ fontSize: 18, marginBottom: 5 }}>SELECIONE UM EXAME OU PROCEDIMENTO</div>
          <div className='grid'
            style={{
              height: '80vh',
              alignContent: 'flex-start',
            }}
          >
            {allprocedimentos.map(item => (
              <div
                key={'exame: ' + item.id}
                className='button' style={{ width: 200, height: 120, paddingLeft: 20, paddingRight: 20 }}
                onClick={() => {
                  localStorage.setItem('procedimento', item.tuss_rol_ans_descricao);
                  localStorage.setItem('codigo_tuss', item.tuss_codigo);
                  localStorage.setItem('valor_convenio', item.valor);
                  localStorage.setItem('valor_particular', item.valor_part);
                  setselecionaexame(0);
                }}
              >
                {item.tuss_rol_ans_descricao}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const [viewconvenioparticular, setviewconvenioparticular] = useState((0));
  function SelecionaParticularConvenio() {
    return (
      <div
        className="fundo"
        style={{ display: viewconvenioparticular == 1 ? "flex" : "none" }}
        onClick={() => { setviewconvenioparticular(0) }}
      >
        <div className="janela cor2" style={{ display: 'flex', flexDirection: 'row' }}>
          <div
            className='button' style={{ width: 200 }}
            onClick={() => insertProcedimento(0, 1, JSON.parse(localStorage.getItem('obj_agendado')).data_exame)}
          >
            CONVÊNIO
          </div>
          <div className='button' style={{ width: 200 }}
            onClick={() => {
              insertProcedimento(1, 0, JSON.parse(localStorage.getItem('obj_agendado')).data_exame);
            }}
          >
            PARTICULAR
          </div>
        </div>
      </div >
    )
  }

  // DATEPICKER (CALENDÁRIO);
  // preparando a array com as datas.
  var arraydate = [];
  const [arraylist, setarraylist] = useState([]);
  // preparando o primeiro dia do mês.
  const [startdate] = useState(moment().startOf('month'));
  // descobrindo o primeiro dia do calendário (último domingo do mês anteior).
  const firstSunday = (x, y) => {
    while (x.weekday() > 0) {
      x.subtract(1, 'day');
      y.subtract(1, 'day');
    }
    // se o primeiro domingo da array ainda cair no mês atual:
    if (x.month() == startdate.month()) {
      x.subtract(7, 'days');
      y.subtract(7, 'days');
    }
  }
  // criando array com 42 dias a partir da startdate.
  const setArrayDate = (x, y) => {
    arraydate = [x.format('DD/MM/YYYY')];
    while (y.diff(x, 'days') > 1) {
      x.add(1, 'day');
      arraydate.push(x.format('DD/MM/YYYY').toString());
    }
  }
  // criando a array de datas baseada no mês atual.
  const currentMonth = () => {
    var x = moment(startdate, 'DD/MM/YYYY');
    var y = moment(startdate).add(42, 'days');
    firstSunday(x, y);
    setArrayDate(x, y);
    setarraylist(arraydate);
  }
  // percorrendo datas do mês anterior.
  const previousMonth = () => {
    startdate.subtract(1, 'month');
    var x = moment(startdate);
    var y = moment(startdate).add(42, 'days');
    firstSunday(x, y);
    setArrayDate(x, y);
    setarraylist(arraydate);
  }
  // percorrendo datas do mês seguinte.
  const nextMonth = () => {
    startdate.add(1, 'month');
    var month = moment(startdate).format('MM');
    var year = moment(startdate).format('YYYY');
    var x = moment('01/' + month + '/' + year, 'DD/MM/YYYY');
    var y = moment('01/' + month + '/' + year, 'DD/MM/YYYY').add(42, 'days');
    firstSunday(x, y);
    setArrayDate(x, y);
    setarraylist(arraydate);
  }

  function DatePicker() {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'sticky', top: 5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignSelf: 'center',
          marginRight: -2.5,
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
          }}>
            <button
              className="button"
              onClick={(e) => { previousMonth(); e.stopPropagation(); }}
              id="previous"
              style={{
                width: 50,
                height: 50,
                margin: 2.5,
                color: '#ffffff',
              }}
              title={'MÊS ANTERIOR'}
            >
              {'◄'}
            </button>
            <p
              className="text1"
              style={{
                flex: 1,
                fontSize: 16,
                margin: 2.5
              }}>
              {startdate.format('MMMM').toUpperCase() + ' ' + startdate.year()}
            </p>
            <button
              className="button"
              onClick={(e) => { nextMonth(); e.stopPropagation(); }}
              id="next"
              style={{
                width: 50,
                height: 50,
                margin: 2.5,
                color: '#ffffff',
              }}
              title={'PRÓXIMO MÊS'}
            >
              {'►'}
            </button>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            width: window.innerWidth < 426 ? '85vw' : 400,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            padding: 0, margin: 0,
          }}>
            <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>DOM</p>
            <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>SEG</p>
            <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>TER</p>
            <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>QUA</p>
            <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>QUI</p>
            <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>SEX</p>
            <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>SAB</p>
          </div>
          <div
            id="LISTA DE DATAS"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              margin: 0,
              padding: 0,
              height: window.innerWidth < 426 ? 340 : '',
              width: window.innerWidth < 426 ? 300 : 400,
              boxShadow: 'none'
            }}
          >
            {arraylist.map((item) => (
              <button
                key={'dia ' + item}
                className={selectdate == item ? "button-selected" : "button"}
                onClick={(e) => {
                  setselectdate(item);
                  montaArrayAgenda(item);
                  localStorage.setItem('selectdate', item);
                  e.stopPropagation();
                }}
                style={{
                  height: 50,
                  margin: 2.5,
                  color: '#ffffff',
                  width: window.innerWidth < 426 ? 33 : 50,
                  minWidth: window.innerWidth < 426 ? 33 : 50,
                  opacity: item.substring(3, 5) === moment(startdate).format('MM') ? 1 : 0.5,
                  position: 'relative',
                }}
                title={item}
              >
                {item.substring(0, 2)}
                <div id='botão para buscar horários...'
                  style={{
                    display: 'none',
                    borderRadius: 50,
                    borderWidth: 3,
                    borderStyle: 'solid',
                    width: 20, height: 20,
                    position: 'absolute',
                    bottom: -5, right: -5,
                    alignContent: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: 'rgb(82, 190, 128, 1)',
                    borderColor: 'rgba(242, 242, 242)'
                  }}
                  onClick={() => {
                    setviewopcoeshorarios(1);
                  }}
                >
                  <div>+</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const montaArrayAgenda = (data) => {
    // atualizando lista de exames agendados.
    axios.get(html + 'list_exames_clinicas/' + cliente.id_cliente).then((response) => {
      var x = [];
      x = response.data.rows;
      console.log('MONTANDO AGENDA...');
      let localarrayexames = []
      // preenchendo a array com os exames já agendados.
      let arrayexamesdodia = x.filter(item => item.id_cliente == cliente.id_cliente && moment(item.data_exame, 'DD/MM/YYYY - HH:mm').format('DD/MM/YYYY') == data);
      arrayexamesdodia.map(item => {
        let obj = {
          id: item.id,
          nome_exame: item.nome_exame,
          data_exame: item.data_exame,
          id_profisisonal_executante: item.id_profissional_executante,
          nome_profissional_executante: item.nome_profissional_executante,
          conselho: item.n_conselho_profissional_executante,
          id_paciente: item.id_paciente,
          nome_paciente: item.nome_paciente,
          dn_paciente: item.dn_paciente,
          status: item.status,
          codigo_operadora: item.codigo_operadora,
          codigo_tuss: item.codigo_tuss,
          particular: item.particular,
        }
        localarrayexames.push(obj);
        return null;
      });
      // preenchendo a array com os horários disponíveis para agendamento, excluindo os já agendados.
      let arrayagendadodia = agendaexame.filter(item => item.id_cliente == cliente.id_cliente && item.dia_semana == moment(data, 'DD/MM/YYYY').format('dddd').toUpperCase());
      arrayagendadodia.map(item => {
        if (arrayexamesdodia.filter(valor => moment(valor.data_exame, 'DD/MM/YYYY - HH:mm').format('HH:mm') == item.hora_inicio).length == 0) {
          let obj = {
            id: null,
            nome_exame: item.exame,
            data_exame: data + ' - ' + item.hora_inicio,
            id_profissional_executante: item.id_usuario,
            nome_profissional_executante: item.id_nome_usuario,
            conselho: null,
            nome_paciente: null,
            dn_paciente: null,
          }
          localarrayexames.push(obj);
        }
        return null;
      })
      setarrayexames(localarrayexames);
    });
  }

  const checkProcedimentos = (lista, data_inicio) => {
    if (lista.filter(item => item.nome_exame == localStorage.getItem("procedimento") && item.data_exame == data_inicio).length > 0) {
      toast(settoast, 'JÁ EXISTE UM AGENDAMENTO PARA ESTE EXAME NESTE HORÁRIO', 3000);
    } else {
      insertProcedimento(0, 1, data_inicio);
    }
  }

  const [viewopcoeshorarios, setviewopcoeshorarios] = useState(0);
  const ViewOpcoesHorarios = () => {
    function TimeComponent() {
      var timeout = null;
      const fixHour = (valor) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (valor > 23 || valor < 0) {
            document.getElementById("inputHour").value = '';
            document.getElementById("inputHour").focus();
          } else {
            localStorage.setItem('hora', valor);
          }
        }, 100);
      };
      const fixMin = (valor) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (valor > 59 || valor < 0) {
            document.getElementById("inputMin").value = '';
            document.getElementById("inputMin").focus();
          } else {
            localStorage.setItem('min', valor);
          }
        }, 100);
      };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <input
              autoComplete="off"
              className="input"
              placeholder="HH"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'HH')}
              onKeyUp={(e) => fixHour(e.target.value)}
              title="HORAS."
              maxLength={2}
              style={{
                width: 100,
                height: 50,
              }}
              min={0}
              max={23}
              id="inputHour"
            ></input>
            <div className='text1'>{' : '}</div>
            <input
              autoComplete="off"
              className="input"
              placeholder="MM"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'MM')}
              onKeyUp={(e) => fixMin(e.target.value)}
              title="MINUTOS."
              maxLength={2}
              style={{
                width: 100,
                height: 50,
              }}
              min={0}
              max={59}
              id="inputMin"
            ></input>
          </div>
          <div id="btnAdd"
            className="button-green"
            title="CONFIRMAR DATA E HORA."
            onClick={() => {
              let hora = localStorage.getItem('hora');
              let min = localStorage.getItem('min');
              console.log(selectdate + ' - ' + hora + ':' + min);
              let inputHour = document.getElementById("inputMin").value;
              let inputMin = document.getElementById("inputHour").value;
              if (inputHour != '' && inputMin != '') {
                checkProcedimentos(selectdate + ' - ' + hora + ':' + min);
              }
            }}
            style={{ width: 50, maxWidth: 50, alignSelf: 'center', marginTop: 20 }}
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
      )
    }
    return (
      <div
        className="fundo"
        style={{ display: viewopcoeshorarios == 1 ? "flex" : "none" }}
        onClick={() => {
          setviewopcoeshorarios(0);
        }}
      >
        <div className="janela"
          style={{
            display: 'flex', flexDirection: 'column', justifyItems: 'flex-start',
            justifyContent: 'flex-start',
            position: 'relative',
            padding: 20,
          }}
          onClick={(e) => e.stopPropagation()}>
          <div className='text1' style={{ fontSize: 18, marginBottom: 0 }}>HORÁRIO DO EXAME</div>
          <TimeComponent></TimeComponent>
        </div>
      </div>
    )
  }

  const insertProcedimento = (particular, convenio, data) => {
    let obj = {
      id_exame: null,
      nome_exame: localStorage.getItem('procedimento'),
      codigo_tuss: localStorage.getItem('codigo_tuss'),
      particular: particular,
      convenio: convenio,
      codigo_operadora: paciente.convenio_codigo,
      id_paciente: paciente.id_paciente,
      nome_paciente: paciente.nome_paciente,
      dn_paciente: moment(paciente.dn_paciente).format('DD/MM/YYYY'),
      id_profissional_executante: localStorage.getItem('id_profissional'),
      nome_profissional_executante: localStorage.getItem('profissional'),
      conselho_profissional_executante: '',
      n_conselho_profissional_executante: '',
      status: 0, // 0 = solicitado, 1 = executado, 2 = cancelado, 3 = desistência.
      laudohtml: '',
      id_cliente: cliente.id_cliente,
      data_exame: data,
    }
    console.log(obj);
    axios.post(html + 'insert_exames_clinicas', obj).then(() => {
      console.log('EXAME OU PROCEDIMENTO AGENDADO COM SUCESSO.');
      setviewopcoeshorarios(0);
      montaArrayAgenda(selectdate);
    })
  }

  const deleteExameAgendado = (id) => {
    axios.get(html + 'delete_exames_clinicas/' + id).then(() => {
      console.log('ITEM DE EXAME AGENDADO EXCLUÍDO');
      montaArrayAgenda(selectdate);
    })
  }

  // ENVIO DE MENSAGENS DE AGENDAMENTO DA CONSULTA PELO WHATSAPP.
  function geraWhatsappExame(item) {
    const gzappy_url_envia_mensagem = "https://api.gzappy.com/v1/message/send-message/";
    const instance_id = 'L05K3GC2YX03DGWYLDKZQW5L';
    const instance_token = '2d763c00-4b6d-4842-99d7-cb32ea357a80';
    const USER_TOKEN_ID = '3a1d021d-ad34-473e-9255-b9a3e6577cf9';
    const GZAPPY_API_TOKEN = 'bfd2b508d013fbbde6ae4765bbc4eaf83b5514201a7970ae46ff91ade3b2b1a032fe9c8a961a7c572a547b52d745e433f317bd825eb471d0f609c1e843e3d0a9';

    const message =
      'Olá, ' + item.nome_paciente + '!\n' +
      'Você tem o exame/procedimento ' + item.nome_exame + ', agendado na CLÍNICA ' + cliente.razao_social + ', para o dia ' + item.data_exame + ' a ser realizado pelo Dr(a). ' + item.nome_profissional_executante + '.'

    const rawphone = paciente.telefone;
    console.log(rawphone);
    let cleanphone = rawphone.replace("(", "");
    cleanphone = cleanphone.replace(")", "");
    cleanphone = cleanphone.replace("-", "");
    cleanphone = cleanphone.replace(" ", "");
    cleanphone = "55" + cleanphone;
    console.log(cleanphone);

    fetch(gzappy_url_envia_mensagem, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user_token_id': USER_TOKEN_ID,
        'Authorization': `Bearer ${GZAPPY_API_TOKEN}`
      },
      body: JSON.stringify({
        instance_id: instance_id,
        instance_token: instance_token,
        message: [message],
        phone: [cleanphone]
      })
    })
  }

  function ListaDeExamesAgendados() {
    return (
      <div
        id="scroll de exames e procedimentos"
        className='scroll'
        style={{
          display: "flex",
          flexDirection: 'column',
          justifyContent: "flex-start",
          height: '80vh',
          width: '55vw',
          marginLeft: 20
        }}
      >
        {arrayexames.filter(item => item.nome_exame == localStorage.getItem("procedimento")).sort((a, b) => (moment(a.data_exame, 'DD/MM/HHHH - HH:mm') > moment(b.data_exame, 'DD/MM/HHHH - HH:mm') ? 1 : -1)).map(item => (
          <div
            key={'item - ' + Math.random()}
          >
            <div id="horário ocupado."
              style={{
                display: item.nome_paciente != null ? 'flex' : 'none',
                flexDirection: 'row', justifyContent: 'flex-start', width: '100%', height: '100%',
                position: 'relative',
              }}
              onClick={() => {
                localStorage.setItem('exame', JSON.stringify(item));
              }}
            >
              <div className='button'
                style={{
                  position: 'absolute', top: -5, left: -5,
                  maxHeight: 30, minHeight: 30,
                  backgroundColor: item.particular == 1 ? '#52be80' : '#85C1E9',
                  zIndex: 2,
                }}>
                {item.particular == 1 ? 'PARTICULAR' : 'CONVÊNIO'}
              </div>
              <div
                className='button'
                style={{
                  marginRight: 0,
                  padding: 10,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  opacity: 0.9,
                  alignSelf: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'calc(100% - 30px)',
                  width: 120
                }}>
                <div>{item.data_exame.slice(0, 10)}</div>
                <div>{item.data_exame.slice(13, 18)}</div>
              </div>
              <div className={item.nome_paciente == null ? 'button cor3' : 'button'}
                style={{
                  borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: 0,
                  display: 'flex', flexDirection: 'column',
                  width: '100%'
                }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                  alignContent: 'flex-start', width: '100%', textAlign: 'left', marginLeft: 5,
                }}>
                  <div>{item.nome_exame}</div>
                  <div>{'PACIENTE: ' + item.nome_paciente}</div>
                  <div>{'DN: ' + moment(item.dn_paciente).format('DD/MM/YYYY')}</div>
                  <div>{'MÉDICO(A): ' + item.nome_profissional_executante}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <div className='button'
                      style={{
                        display: 'flex',
                        backgroundColor: item.status == 0 ? '#f4d03f' : item.situacao == 1 ? '#52be80' : '#EC7063', width: 150, minWidth: 150, height: 30, minHeight: 30, maxHeight: 30,
                        alignSelf: 'flex-end'
                      }}
                    >
                      {item.status == 0 ? 'AGENDADO' : item.situacao == 1 ? 'EXECUTADO' : item.situacao == 2 ? 'CANCELADO' : 'DESISTÊNCIA'}
                    </div>
                    <div id='botão para cobrar faturamento'
                      className='button red'
                      style={{
                        display: faturamento.filter(fat => fat.procedimento_id == item.id).length > 0 ? 'none' : 'flex',
                        minHeight: 30, maxHeight: 30,
                        width: 150, alignSelf: 'flex-end'
                      }}
                      onClick={(e) => {
                        let procedimento = [];
                        procedimento = allprocedimentos.filter(proc => proc.tuss_codigo == item.codigo_tuss).pop();
                        console.log('## PROCEDIMENTO ##');
                        console.log(procedimento);
                        localStorage.setItem('tipo_faturamento', 'PROCEDIMENTO');
                        localStorage.setItem('obj_procedimento', JSON.stringify(procedimento));
                        localStorage.setItem('obj_agendado', JSON.stringify(item));
                        setpagamento(1);
                        localStorage.setItem('forma_pagamento', 'indefinida');
                        setTimeout(() => {
                          document.getElementById('inputValorParticular').value = procedimento.valor_part;
                          document.getElementById('inputValorConvenio').value = procedimento.valor;
                        }, 1000);
                        e.stopPropagation();
                      }}
                    >
                      FATURAR
                    </div>
                    <div id='botão para exibir faturamento já realizado'
                      className='button green'
                      style={{
                        display: faturamento.filter(fat => fat.procedimento_id == item.id).length > 0 ? 'flex' : 'none',
                        minHeight: 30, maxHeight: 30, width: 150, alignSelf: 'flex-end'
                      }}
                      onClick={(e) => {
                        console.log('CRIAR COMPONENTE COM O RESUMO DO FATURAMENTO');
                        // PENDENTE!
                      }}
                    >
                      FATURADO
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <div id="btnDeleteAgendamento"
                      title="EXCLUIR AGENDAMENTO"
                      className="button-yellow"
                      onClick={(e) => {
                        modal(
                          setdialogo,
                          "TEM CERTEZA QUE DESEJA EXCLUIR ESTE AGENDAMENTO?",
                          deleteExameAgendado, item.id
                        );
                        montaArrayAgenda(selectdate);
                        e.stopPropagation();
                      }}
                      style={{
                        display: item.status > 0 || faturamento.filter(fat => fat.procedimento_id == item.id).length > 0 ? 'none' : 'flex',
                        width: 50, height: 50, alignSelf: "center"
                      }}
                    >
                      <img
                        alt=""
                        src={deletar}
                        style={{
                          margin: 10,
                          height: 30,
                          width: 30,
                        }}
                      ></img>
                    </div>
                    <div id="btn lembrar exame"
                      title="LEMBRAR CONSULTA PARA O CLIENTE"
                      className="button-green"
                      onClick={(e) => {
                        geraWhatsappExame(item);
                        e.stopPropagation();
                      }}
                      style={{
                        display: item.status > 1 ? 'none' : 'flex',
                        width: 50, height: 50, alignSelf: 'flex-end'
                      }}
                    >
                      <img
                        alt=""
                        src={whatsapp}
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
            </div>
            <div id="horário livre."
              className='button cor3'
              style={{
                display: item.nome_paciente == null ? 'flex' : 'none',
                flexDirection: 'row', justifyContent: 'flex-start',
              }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className='button green' style={{ display: 'flex', flexDirection: 'column', width: 120, maxWidth: 120, minWidth: 120 }}>
                  <div>{item.data_exame.slice(0, 10)}</div>
                  <div>{item.data_exame.slice(13, 18)}</div>
                </div>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                alignContent: 'flex-start', width: '100%', textAlign: 'left', marginLeft: 5,
                alignSelf: 'center',
              }}>
                <div>HORÁRIO DISPONÍVEL!</div>
                <div>{item.nome_exame}</div>
                <div>{'MÉDICO(A): ' + item.nome_profissional_executante}</div>
              </div>
              <div className='button-green'
                style={{ maxHeight: 50, width: 150, alignSelf: 'flex-end' }}
                onClick={(e) => {
                  localStorage.setItem('obj_agendado', JSON.stringify(item));
                  setviewconvenioparticular(1);
                  e.stopPropagation();
                }}
              >
                AGENDAR
              </div>
            </div>
          </div>
        ))
        }
      </div >
    )
  }

  return (
    <div id="tela de agendamento de exames"
      className='main cor2'
      style={{
        display: pagina == 'AGENDAMENTO-EXAMES' ? 'flex' : 'none',
      }}
    >
      <div
        className="chassi"
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignContent: 'center',

        }}
        id="conteúdo do agendamento"
      >
        <div style={{ display: 'flex', flexDirection: 'row', width: 'calc(100vw - 20px)', justifyContent: 'flex-start' }}>
          <div id="botão para sair da tela de agendamento"
            className="button-yellow" style={{ maxHeight: 50, maxWidth: 50, alignSelf: 'center' }}
            onClick={() => {
              if (localStorage.getItem('prevScreen') == 'CONSULTA') {
                setpagina(-2);
                //history.push("/consultas"); >> MUDAR PARA A TELA DE REALIZAÇÃO DOS EXAMES (EQUIVALENTE À TELA DE CONSULTAS).
              } else {
                setpagina(0);
                history.push("/");
                setpaciente([]);
              }
            }}>
            <img
              alt=""
              src={back}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
          <div className='text1' style={{
            fontSize: 18, justifyContent: 'flex-start',
            textAlign: 'left',
            margin: 0,
            alignSelf: 'center',
          }}>
            {'AGENDAMENTO DE ' + localStorage.getItem('procedimento') + ' PARA ' + paciente.nome_paciente + ' - DN: ' + moment(paciente.dn_paciente).format('DD/MM/YYYY - ') + mountage(moment(paciente.dn_paciente).format('DD/MM/YYYY'))}
          </div>
        </div>
        <SelecionaExame></SelecionaExame>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', justifyContent: 'center',
            alignItems: 'flex-start', textAlign: 'center', alignSelf: 'center',
            marginTop: 5, marginBottom: 10,
          }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignSelf: 'center' }}>
            <DatePicker></DatePicker>
            <ListaDeExamesAgendados></ListaDeExamesAgendados>
          </div>
        </div>
        <Pagamento></Pagamento>
        <ViewOpcoesHorarios></ViewOpcoesHorarios>
        <GuiaConsulta></GuiaConsulta>
        <SelecionaParticularConvenio></SelecionaParticularConvenio>
      </div>
    </div>
  )
}

export default AgendamentoExames;