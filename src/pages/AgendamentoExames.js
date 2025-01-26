/* eslint eqeqeq: "off" */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Context from './Context';
import axios from 'axios';
// imagens.
import deletar from '../images/deletar.png';
import back from '../images/back.png';
import moment from "moment";
// import lupa from '../images/lupa.png';
// import imprimir from '../images/imprimir.png';
// import whatsapp from '../images/whatsapp.png';
import salvar from '../images/salvar.png';
// funções.
// import maskdate from "../functions/maskdate";
// router.
import { useHistory } from "react-router-dom";
// import modal from '../functions/modal';
import GuiaConsulta from '../cards/GuiaConsulta';
import mountage from '../functions/mountage';
import toast from '../functions/toast';
import modal from '../functions/modal';
import selector from '../functions/selector';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import GuiaSadt from '../cards/GuiaSadt';
pdfMake.addVirtualFileSystem(pdfFonts);


function AgendamentoExames() {

  // context.
  const {
    pagina, setpagina,
    html,
    // hospital,
    // pacientes,
    // setpacientes,
    paciente, setpaciente,
    // setobjpaciente,
    setdialogo,
    // setcard,
    // setdono_documento,
    objpaciente,
    cliente,
    settoast,
    agendaexame, setagendaexame,
    setcard,
  } = useContext(Context);

  // history (router).
  let history = useHistory();

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'AGENDAMENTO-EXAMES') {
      setselectdate(moment().format('DD/MM/YYYY'));
      loadFaturamentoClinicaProcedimentos();
      loadAgendaExames();
      currentMonth();
    }
    // eslint-disable-next-line
  }, [pagina]);

  /*
  const loadOperadoras = () => {
    let exame = JSON.parse(localStorage.getItem('item_exame'));
    axios.get(html + 'all_operadoras').then((response) => {
      var y = [];
      var x = response.data.rows;
      y = x.filter(item => parseInt(item.id) == parseInt(exame.codigo_operadora));
      let operadora = y.pop();
      setoperadora(operadora);
      console.log(operadora);
    })
  }
 */

  const loadAgendaExames = () => {
    axios.get(html + 'list_agenda_exames/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setagendaexame(x);
    })
  }

  const [operadora, setoperadora] = useState(null);
  // carregando registros de procedimentos realizados para o cliente.
  const [procedimentos_cliente, setprocedimentos_cliente] = useState([]);
  const loadFaturamentoClinicaProcedimentos = () => {
    console.log(cliente.id_cliente);
    axios
      .get(html + "list_faturamento_clinicas_procedimentos/" + cliente.id_cliente)
      .then((response) => {
        setprocedimentos_cliente(response.data.rows);
      });
  };

  // ENVIO DE MENSAGENS DE AGENDAMENTO DA CONSULTA PELO WHATSAPP.
  /*
  function geraWhatsapp(id, inicio, especialista) {

    let paciente = pacientes.filter(item => item.id_paciente == id).pop();
    console.log(paciente);

    const gzappy_url_envia_mensagem = "https://api.gzappy.com/v1/message/send-message/";
    const instance_id = 'L05K3GC2YX03DGWYLDKZQW5L';
    const instance_token = '2d763c00-4b6d-4842-99d7-cb32ea357a80';
    const USER_TOKEN_ID = '3a1d021d-ad34-473e-9255-b9a3e6577cf9';
    const GZAPPY_API_TOKEN = 'bfd2b508d013fbbde6ae4765bbc4eaf83b5514201a7970ae46ff91ade3b2b1a032fe9c8a961a7c572a547b52d745e433f317bd825eb471d0f609c1e843e3d0a9';

    const message =
      'Olá, ' + paciente.nome_paciente + '!\n' +
      'Você tem uma consulta agendada pelo seu médico, Dr(a). ' + especialista.nome_usuario + ', ' + especialista.tipo_usuario + ',\n' +
      'para o dia ' + inicio + ', na CLÍNICA ' + cliente.razao_social + '.'

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
  */

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
            {procedimentos_cliente.map(item => (
              <div
                key={'exame: ' + item.id}
                className='button' style={{ width: 200, height: 120, paddingLeft: 20, paddingRight: 20 }}
                onClick={() => {
                  localStorage.setItem('procedimento', item.nome_procedimento);
                  localStorage.setItem('codigo_tuss', item.codigo_tuss);
                  localStorage.setItem('valor_convenio', item.valor_convenio);
                  localStorage.setItem('valor_particular', item.valor_particular);
                  setselecionaexame(0);
                }}
              >
                {item.nome_procedimento}
              </div>
            ))}
          </div>
        </div>
      </div>
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

  const [selectdate, setselectdate] = useState(localStorage.getItem('selectdate'));
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

  const [arrayexames, setarrayexames] = useState([]);
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
          nome_paciente: item.nome_paciente,
          dn_paciente: item.dn_paciente,
          valor_particular: item.valor_particular,
          valor_convenio: item.valor_convenio,
          status: item.status,
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

  const checkProcedimentos = (lista, forma_pagamento, data_inicio) => {
    if (lista.filter(item => item.nome_exame == localStorage.getItem("procedimento") && item.data_exame == data_inicio).length > 0) {
      toast(settoast, 'JÁ EXISTE UM AGENDAMENTO PARA ESTE EXAME NESTE HORÁRIO', 3000);
    } else {
      insertExameAgendado(0, 1, forma_pagamento, data_inicio);
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

  // inserir registro de procedimento/exame quando inserimos um agendamento do procedimento.
  // inserir item de exame laboratorial.
  const insertProcedimento = () => {
    let random = Math.random()
    var obj = {
      id_paciente: paciente,
      id_atendimento: null,
      data_pedido: moment(),
      data_resultado: null,
      codigo_exame: localStorage.getItem('codigo_tuss'),
      nome_exame: localStorage.getItem('procedimento'),
      material: null,
      resultado: null,
      status: null,
      profissional: localStorage.getItem('id_profissional'),
      unidade_medida: null,
      vref_min: null,
      vref_max: null,
      obs: null,
      random: random,
      array_campos: null,
      metodo: null,
    }
    console.log(obj);
    axios.post(html + 'insert_laboratorio', obj).then(() => {
      console.log('ITEM DE PROCEDIMENTO CADASTRADO COM SUCESSO');
    });
  }

  const insertExameAgendado = (particular, convenio, pagamento, data) => {
    let obj = {
      id_exame: null,
      nome_exame: localStorage.getItem('procedimento'),
      codigo_tuss: localStorage.getItem('codigo_tuss'),
      valor_particular: document.getElementById("inputValorParticular").value,
      valor_convenio: document.getElementById("inputValorConvenio").value,
      particular: particular,
      convenio: convenio,
      codigo_operadora: paciente.convenio_codigo,
      forma_pagamento: pagamento,
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
      insertProcedimento();
    })
  }

  const updateExameAgendado = (item, particular, convenio, valor_particular, valor_convenio, pagamento, status) => {

    console.log(valor_convenio);
    console.log(valor_particular);
    let exame = [];
    axios.get(html + 'list_exames_clinicas/' + cliente.id_cliente).then((response) => {
      var x = [];
      x = response.data.rows;
      exame = x.filter(valor => valor.id == item.id).pop();
      console.log('ID: ' + exame.id);
      let obj = {
        id_exame: null,
        nome_exame: exame.nome_exame,
        codigo_tuss: exame.codigo_tuss,
        valor_particular: valor_particular,
        valor_convenio: valor_convenio,
        particular: particular,
        convenio: convenio,
        codigo_operadora: exame.codigo_operadora,
        forma_pagamento: pagamento,
        id_paciente: exame.id_paciente,
        nome_paciente: exame.nome_paciente,
        dn_paciente: exame.dn_paciente,
        id_profissional_executante: exame.id_profissional_executante,
        nome_profissional_executante: exame.nome_profissional_executante,
        conselho_profissional_executante: exame.conselho_profissional_executante,
        n_conselho_profissional_executante: exame.n_conselho_profissional_executante,
        status: status, // 0 = solicitado, 1 = executado, 2 = cancelado, 3 = desistência.
        laudohtml: exame.laudohtml,
        id_cliente: exame.id_cliente,
        data_exame: exame.data_exame,
      }
      console.log(obj);
      axios.post(html + 'update_exames_clinicas/' + exame.id, obj).then(() => {
        console.log('ITEM DE AGENDAMENTO DE EXAME ATUALIZADO COM SUCESSO');
        montaArrayAgenda(selectdate);
      });
    });
  }

  const deleteExameAgendado = (id) => {
    axios.get(html + 'delete_exames_clinicas/' + id).then(() => {
      console.log('ITEM DE EXAME AGENDADO EXCLUÍDO');
      montaArrayAgenda(selectdate);
    })
  }

  const [selecteditemagendado, setselecteditemagendado] = useState(null);
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
          width: '50vw',
          marginLeft: 20
        }}
      >
        {arrayexames.filter(item => item.nome_exame == localStorage.getItem("procedimento")).sort((a, b) => (moment(a.data_exame, 'DD/MM/HHHH - HH:mm') > moment(b.data_exame, 'DD/MM/HHHH - HH:mm') ? 1 : -1)).map(item => (
          <div
            key={'item - ' + Math.random()}
            className={item.nome_paciente == null ? 'button cor3' : 'button'}
            style={{ width: 'calc(100% - 20px)' }}
          >
            <div
              style={{
                display: item.nome_paciente != null ? 'flex' : 'none',
                flexDirection: 'row', justifyContent: 'flex-start', width: '100%'
              }}
              onClick={() => {
                localStorage.setItem('item_exame', JSON.stringify(item));
                setselecteditemagendado(item);
                localStorage.setItem('valor_particular', item.valor_particular);
                localStorage.setItem('valor_convenio', item.valor_convenio);
                setviewinsereagendamento(2)
                setTimeout(() => {
                  document.getElementById('inputUpdateValorParticular').value = item.valor_particular;
                  document.getElementById('inputUpdateValorConvenio').value = item.valor_convenio;
                }, 500);
              }
              }
            >
              <div className='button green' style={{ display: 'flex', flexDirection: 'column', width: 120, maxWidth: 120, minWidth: 120 }}>
                <div>{item.data_exame.slice(0, 10)}</div>
                <div>{item.data_exame.slice(13, 18)}</div>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                alignContent: 'flex-start', width: '100%', textAlign: 'left', marginLeft: 5,
              }}>
                <div>{item.nome_exame}</div>
                <div>{'PACIENTE: ' + item.nome_paciente}</div>
                <div>{'DN: ' + moment(item.dn_paciente).format('DD/MM/YYYY')}</div>
                <div>{'MÉDICO(A): ' + item.nome_profissional_executante}</div>
              </div>
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
                style={{ display: item.status > 0 ? 'none' : 'flex', width: 50, height: 50, alignSelf: "center" }}
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
            </div>
            <div
              style={{
                display: item.nome_paciente == null ? 'flex' : 'none',
                flexDirection: 'row', justifyContent: 'flex-start', width: '100%',
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
                marginTop: 0
              }}>
                <div>HORÁRIO DISPONÍVEL!</div>
                <div>{item.nome_exame}</div>
                <div>{'MÉDICO(A): ' + item.nome_profissional_executante}</div>
              </div>
              <div className='button-green'
                style={{ maxHeight: 50, width: 150, alignSelf: 'flex-end' }}
                onClick={(e) => {
                  setviewinsereagendamento(1);
                  localStorage.setItem('data_agendamento_exame', item.data_exame);
                  localStorage.setItem('profissional', item.nome_profissional_executante);
                  localStorage.setItem('id_profissional', item.id_profissional_executante);
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

  let arrayformaspagamento = [
    {
      forma: 'PIX',
      lancamentos: 1,
    },
    {
      forma: 'DÉBITO',
      lancamentos: 1,
    },
    {
      forma: 'CRÉDITO 1X',
      lancamentos: 1,
    },
    {
      forma: 'CRÉDITO 2X',
      lancamentos: 2,
    },
    {
      forma: 'CRÉDITO 3X',
      lancamentos: 3,
    },
    {
      forma: 'CRÉDITO 4X',
      lancamentos: 4,
    },
    {
      forma: 'CRÉDITO 5X',
      lancamentos: 5,
    },
    {
      forma: 'CRÉDITO 6X',
      lancamentos: 6,
    },
  ]
  const formapagamento = (situacao) => {
    // lancamentos = quantas vezes um registro de faturamento/pagamento deve ser lançado.
    return (
      <div id={'lista de formas de pagamento ' + situacao}
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
        {arrayformaspagamento.map(item => (
          <div
            className='button'
            style={{ width: 150 }}
            id={'forma_pgto ' + situacao + item.forma}
            key={'forma_pgto ' + situacao + item.forma}
            onClick={() => {
              selector('lista de formas de pagamento ' + situacao, 'forma_pgto ' + situacao + item.forma, 300);
              for (let step = 0; step < item.lancamentos; step++) {
                lancafaturamento();
                localStorage.setItem('forma_pagamento', item.forma);
                localStorage.setItem('parcelas', item.lancamentos);
                let valor_total = document.getElementById('inputValorParticular').value
                let valor_parcela = valor_total / parseInt(item.lancamentos);
                localStorage.setItem('valor_total', valor_total);
                localStorage.setItem('valor_parcela', valor_parcela);
                localStorage.setItem('pagador', objpaciente.nome_paciente);
                localStorage.setItem('doc_pagador', objpaciente.tipo_documento + ': ' + objpaciente.numero_documento);
              }
            }}
          >
            {item.forma}
          </div>
        ))}
      </div>
    )
  }

  // impressão de recibo de pagamento.
  // ## CRIAÇÃO DE RECIBOS EM PDFMAKE ## //
  const printFile = () => {
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 200, 40, 120],
      header: {
        stack: [
          {
            columns: [
              {
                image: cliente.logo,
                width: 75,
                alignment: 'center',
              },
              {
                stack: [
                  { text: cliente.razao_social, alignment: 'left', fontSize: 10, width: 300 },
                  { text: 'ENDEREÇO: ' + cliente.endereco, alignment: 'left', fontSize: 6, width: 300 },
                  { text: 'TELEFONE: ' + cliente.telefone, alignment: 'left', fontSize: 6, width: 300 },
                  { text: 'EMAIL: ' + cliente.email, alignment: 'left', fontSize: 6, width: 300 },
                ],
                width: '*'
              },
              { qr: cliente.qrcode, width: '40%', fit: 75, alignment: 'right', margin: [0, 0, 10, 0] },
            ],
            columnGap: 10,
          },
          {
            "canvas": [{
              "lineColor": "gray",
              "type": "line",
              "x1": 0,
              "y1": 0,
              "x2": 524,
              "y2": 0,
              "lineWidth": 1
            }], margin: [0, 10, 0, 0], alignment: 'center',
          },

        ],
        margin: [40, 40, 40, 40],
      },
      footer: function (currentPage, pageCount) {
        return {
          stack: [
            {
              "canvas": [{
                "lineColor": "gray",
                "type": "line",
                "x1": 0,
                "y1": 0,
                "x2": 524,
                "y2": 0,
                "lineWidth": 1
              }], margin: [0, 10, 0, 0], alignment: 'center',
            },
            {
              columns: [
                {
                  stack: [
                    { text: '________________________________', alignment: 'center', width: 400 },
                    { text: 'DEPARTAMENTO FINANCEIRO', width: '*', alignment: 'center', fontSize: 8 },
                  ], with: '30%',
                },
                { text: 'PÁGINA ' + currentPage.toString() + ' DE ' + pageCount, fontSize: 8 },
                { text: '', width: '*' },
              ],
              margin: [40, 40, 40, 40], alignment: 'center',
            },
          ],
        }
      },
      content: [
        { text: 'RECIBO DE PAGAMENTO', alignment: 'center', fontSize: 14, bold: true, margin: 10 },
        { text: localStorage.getItem('texto_recibo'), fontSize: 10, bold: false },
        { text: '---x---', fontSize: 10, bold: true, color: '#ffffff' },
        { text: 'INFORMAÇÕES DO RECEBEDOR:', fontSize: 10, bold: true },
        { text: 'CNPJ: ' + cliente.cnpj, fontSize: 10, bold: false },
        { text: 'RAZÃO SOCIAL: ' + cliente.razao_social, fontSize: 10, bold: false },
        { text: 'ENDEREÇO: ' + cliente.endereco, fontSize: 10, bold: false },
      ],
    }
    // utilizando a lib pdfmake para gerar o pdf e converter em base64.
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.open();
  }

  const lancafaturamento = () => {
    // modal para confirmar forma de pagamento e inserir o agendamento.
    console.log('CHEGAREMOS LÁ EM BREVE...');
  }

  const [viewinsereagendamento, setviewinsereagendamento] = useState(0);
  function InsereAgendamento() {
    return (
      <div
        className="fundo"
        style={{ display: viewinsereagendamento == 1 ? "flex" : "none" }}
        onClick={() => { setviewinsereagendamento(0) }}
      >
        <div className="janela scroll cor2" style={{ height: '80vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className='button cor1'
              style={{ width: 350, minWidth: 350, maxWidth: 350, flexDirection: 'column', justifyContent: 'flex-start' }}>
              <div style={{ padding: 20, fontSize: 20 }}>PARTICULAR</div>
              <div style={{ opacity: 0.6 }}>{'VALOR (R$)'}</div>
              <input id="inputValorParticular"
                autoComplete="off"
                placeholder="VALOR PART..."
                className="input"
                type="text"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "VALOR PART...")}
                defaultValue={localStorage.getItem('valor_particular')}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  textAlign: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></input>
              <div style={{ opacity: 0.6, marginTop: 20 }}>{'FORMA DE PAGAMENTO'}</div>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                {formapagamento(1)}
              </div>
              <div style={{ opacity: 0.6, marginTop: 5 }}>{'EMISSÕES PARA O CLIENTE'}</div>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 10, marginTop: 0 }}>
                <div className='button'
                  onClick={() => {
                    localStorage.setItem('valor_total', document.getElementById('inputValorParticular').value);
                    setreciboform(1);
                  }}
                  style={{ width: 100 }}>
                  RECIBO
                </div>
                <div className='button' style={{ width: 100 }}>NFE</div>
              </div>
              <div className='button green'
                style={{ width: 200 }}
                onClick={() => {
                  insertExameAgendado(1, 0, localStorage.getItem('forma_pagamento'), localStorage.getItem('data_agendamento_exame'))
                  setviewinsereagendamento(0);
                }}
              >
                CONCLUIR AGENDAMENTO
              </div>
            </div>
            <div className='button cor1'
              style={{ width: 350, minWidth: 350, maxWidth: 350, flexDirection: 'column', justifyContent: 'flex-start' }}>
              <div style={{ padding: 20, paddingBottom: 5, fontSize: 20 }}>CONVÊNIO</div>
              <div style={{ marginTop: 0, color: '#52be80' }}>{paciente.convenio_nome}</div>
              <div style={{ marginTop: 20, opacity: 0.6 }}>{'VALOR (R$)'}</div>
              <input id="inputValorConvenio"
                autoComplete="off"
                placeholder="VALOR CONV..."
                className="input"
                type="text"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "VALOR CONV...")}
                defaultValue={localStorage.getItem('valor_convenio')}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  textAlign: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></input>
              <div style={{ opacity: 0.6, marginTop: 5 }}>{'EMISSÕES PARA O CLIENTE'}</div>
              <div
                className='button' style={{ width: 100 }}
                onClick={() => {
                  console.log('ABRIR GUIA SADT');
                  setoperadora(operadora);
                  // document.getElementById("guia-sadt").style.display = 'flex';
                  // document.getElementById("guia-sadt").style.visibility = 'visible';
                  // setviewinsereagendamento(0);
                  // setcard('guia-sadt');
                }}
              >
                GUIA SADT
              </div>
              <div className='button green'
                style={{ width: 200 }}
                onClick={() => {
                  insertExameAgendado(0, 1, null, localStorage.getItem('data_agendamento_exame'))
                  setviewinsereagendamento(0);
                }}
              >
                CONCLUIR AGENDAMENTO
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  const UpdateAgendamento = useCallback(() => {
    return (
      <div
        className="fundo"
        style={{ display: viewinsereagendamento == 2 ? "flex" : "none" }}
        onClick={() => { setviewinsereagendamento(0) }}
      >
        <div className="janela scroll cor2" style={{ height: '80vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className='button cor1'
              style={{ width: 350, minWidth: 350, maxWidth: 350, flexDirection: 'column', justifyContent: 'flex-start' }}>
              <div style={{ padding: 20, fontSize: 20 }}>PARTICULAR</div>
              <div style={{ opacity: 0.6 }}>{'VALOR (R$)'}</div>
              <input id="inputUpdateValorParticular"
                autoComplete="off"
                placeholder="VALOR PART..."
                className="input"
                type="text"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "VALOR PART...")}
                defaultValue={selecteditemagendado != null && selecteditemagendado != null ? selecteditemagendado.valor_particular : ''}

                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  textAlign: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                  pointerEvents: selecteditemagendado != null && selecteditemagendado.status > 0 ? 'none' : 'auto',
                  opacity: selecteditemagendado != null && selecteditemagendado.status > 0 ? 0.5 : 1,
                }}
              ></input>
              <div style={{ opacity: 0.6, marginTop: 20 }}>{'FORMA DE PAGAMENTO'}</div>
              <div style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap',
                pointerEvents: selecteditemagendado != null && selecteditemagendado.status > 0 ? 'none' : 'auto',
                opacity: selecteditemagendado != null && selecteditemagendado.status > 0 ? 0.5 : 1,
              }}>
                {formapagamento(2)}
              </div>
              <div style={{ opacity: 0.6, marginTop: 5 }}>{'EMISSÕES PARA O CLIENTE'}</div>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 10, marginTop: 0 }}>
                <div className='button'
                  onClick={() => {
                    localStorage.setItem('valor_total', document.getElementById('inputUpdateValorParticular').value);
                    setreciboform(1);
                  }}
                  style={{ width: 100 }}>
                  RECIBO
                </div>
                <div className='button' style={{ width: 100 }}>NFE</div>
              </div>
              <div className='button green'
                style={{ display: selecteditemagendado != null && selecteditemagendado.status > 0 ? 'none' : 'flex', width: 200 }}
                onClick={() => {
                  updateExameAgendado(selecteditemagendado, 1, 0, document.getElementById('inputUpdateValorParticular').value, null, localStorage.getItem('forma_pagamento'), 0);
                  setviewinsereagendamento(0);
                }}
              >
                ATUALIZAR AGENDAMENTO
              </div>
            </div>
            <div className='button'
              style={{ width: 350, minWidth: 350, maxWidth: 350, flexDirection: 'column', justifyContent: 'flex-start' }}>
              <div style={{ padding: 20, paddingBottom: 5, fontSize: 20 }}>CONVÊNIO</div>
              <div style={{ marginTop: 0, color: '#52be80' }}>{paciente.convenio_nome}</div>
              <div style={{ marginTop: 20, opacity: 0.6 }}>{'VALOR (R$)'}</div>
              <input id="inputUpdateValorConvenio"
                autoComplete="off"
                placeholder="VALOR CONV..."
                className="input"
                type="text"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "VALOR CONV...")}
                defaultValue={selecteditemagendado != null ? selecteditemagendado.valor_convenio : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  textAlign: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                  pointerEvents: selecteditemagendado != null && selecteditemagendado.status > 0 ? 'none' : 'auto',
                  opacity: selecteditemagendado != null && selecteditemagendado.status > 0 ? 0.5 : 1,
                }}
              ></input>
              <div style={{ opacity: 0.6, marginTop: 5 }}>{'EMISSÕES PARA O CLIENTE'}</div>
              <div className='button'
                style={{ width: 100 }}
                onClick={() => {
                  console.log('ABRIR GUIA SADT');
                  setoperadora(paciente.convenio_nome);
                  document.getElementById("guia-sadt").style.display = 'flex';
                  document.getElementById("guia-sadt").style.visibility = 'visible';
                  setcard('guia-sadt');
                }}
              >
                GUIA SADT
              </div>
              <div className='button green'
                style={{
                  width: 200,
                  pointerEvents: selecteditemagendado != null && selecteditemagendado.status > 0 ? 'none' : 'auto',
                  opacity: selecteditemagendado != null && selecteditemagendado.status > 0 ? 0.5 : 1,
                }}
                onClick={() => {
                  updateExameAgendado(selecteditemagendado, 0, 1, null, document.getElementById('inputUpdateValorConvenio').value, localStorage.getItem('forma_pagamento'), 0);
                  setviewinsereagendamento(0);
                }}
              >
                ATUALIZAR AGENDAMENTO
              </div>
            </div>
          </div>
        </div>
      </div >
    )
    // eslint-disable-next-line
  }, [selecteditemagendado, viewinsereagendamento]);

  const [reciboform, setreciboform] = useState(0);
  function ReciboNomePagador() {
    return (
      <div
        className="fundo"
        style={{ display: reciboform == 1 ? "flex" : "none" }}
        onClick={() => { setreciboform(0) }}
      >
        <div className="janela scroll cor2" onClick={(e) => e.stopPropagation()}>
          <div className='text1'>NOME DO PAGADOR</div>
          <input id="inputNomePagador"
            autoComplete="off"
            placeholder="NOME DO PAGADOR..."
            className="input"
            type="text"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "NOME DO PAGADOR...")}
            defaultValue={objpaciente.nome_paciente}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              textAlign: "center",
              width: 400,
              padding: 15,
              height: 20,
              minHeight: 20,
              maxHeight: 20,
            }}
          ></input>
          <div className='text1'>DOCUMENTO DO PAGADOR</div>
          <input id="inputDocumentoPagador"
            autoComplete="off"
            placeholder="DOCUMENTO DO PAGADOR..."
            className="input"
            type="text"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "DOCUMENTO DO PAGADOR...")}
            defaultValue={objpaciente.tipo_documento + ': ' + objpaciente.numero_documento}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              textAlign: "center",
              width: 400,
              padding: 15,
              height: 20,
              minHeight: 20,
              maxHeight: 20,
            }}
          ></input>
          <div className='button green'
            style={{ width: 200 }}
            onClick={() => {
              if (localStorage.getItem('parcelas') < 2) {
                let texto = 'RECEBEMOS DE ' + document.getElementById('inputNomePagador').value.toUpperCase() + ', ' + document.getElementById('inputDocumentoPagador').value + ', A IMPORTÂNCIA DE R$' + localStorage.getItem('valor_total') + ', REFERENTE À REALIZAÇÃO DO EXAME/PROCEDIMENTO ' + localStorage.getItem('procedimento');
                localStorage.setItem('texto_recibo', texto);
              } else {
                let texto = 'PAGAMENTO PARCELADO'
                localStorage.setItem('texto_recibo', texto); // PENDENTE
              }
              printFile();
              setreciboform(0);
            }}
          >
            IMPRIMIR RECIBO
          </div>
        </div>
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
            {'AGENDAMENTO DE EXAME PARA ' + paciente.nome_paciente + ' - DN: ' + moment(paciente.dn_paciente).format('DD/MM/YYYY - ') + mountage(moment(paciente.dn_paciente).format('DD/MM/YYYY'))}
          </div>
        </div>
        <SelecionaExame></SelecionaExame>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', justifyContent: 'center',
            alignItems: 'flex-start', textAlign: 'center', alignSelf: 'center',
            marginTop: 10, marginBottom: 10,
          }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignSelf: 'center' }}>
            <DatePicker></DatePicker>
            <ListaDeExamesAgendados></ListaDeExamesAgendados>
          </div>
        </div>
        <ViewOpcoesHorarios></ViewOpcoesHorarios>
        <GuiaConsulta></GuiaConsulta>
        <InsereAgendamento></InsereAgendamento>
        <UpdateAgendamento></UpdateAgendamento>
        <ReciboNomePagador></ReciboNomePagador>
      </div>
    </div>
  )
}

export default AgendamentoExames;