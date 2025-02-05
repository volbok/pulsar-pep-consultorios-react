/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState, useCallback } from 'react';
import Context from './Context';
import axios from 'axios';
// imagens.
import deletar from '../images/deletar.png';
import back from '../images/back.png';
import moment from "moment";
import imprimir from '../images/imprimir.png';
import whatsapp from '../images/whatsapp.png';
import salvar from '../images/salvar.png';
// funções.
import maskdate from "../functions/maskdate";
// router.
import { useHistory } from "react-router-dom";
import modal from '../functions/modal';
import GuiaConsulta from '../cards/GuiaConsulta';
import mountage from '../functions/mountage';

function MapaDeAgendamentos() {

  // context.
  const {
    pagina, setpagina,
    html,
    hospital,
    pacientes, setpacientes,
    paciente,
    setobjpaciente,
    setdialogo,
    setcard,
    setdono_documento,
    mobilewidth,
    cliente,
  } = useContext(Context);

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'MAPA DE AGENDAMENTOS') {
      setselectdate(moment().format('DD/MM/YYYY'))
      loadUsuarios();
      loadPacientes();
      loadAgendaConsultas();
      loadAgendaExames();
      currentMonth();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // history (router).
  let history = useHistory();

  var timeout = null;
  const [especialistas, setespecialistas] = useState([]);


  const loadUsuarios = () => {
    axios.get(html + "list_usuarios").then((response) => {
      setespecialistas(response.data.rows);
    })
  };

  const loadPacientes = () => {
    axios
      .get(html + "list_pacientes")
      .then((response) => {
        setpacientes(response.data.rows);
      });
  }

  // ENVIO DE MENSAGENS DE AGENDAMENTO DA CONSULTA PELO WHATSAPP.
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

  function geraWhatsappExame(id, item) {

    let paciente = pacientes.filter(item => item.id_paciente == id).pop();
    console.log(paciente);

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

  // checando se há consultas já agendadas para o horário selecionado para inserir atendimento.
  const checkConsultas = (data_inicio) => {

    let inicio = moment(data_inicio, 'DD/MM/YYYY - HH:mm');
    let termino = null;
    if (localStorage.getItem('PARTICULAR') == 'PARTICULAR') {
      termino = moment(inicio).add(cliente.tempo_consulta_particular, 'minutes');
    } else {
      termino = moment(inicio).add(cliente.tempo_consulta_convenio, 'minutes');
    }

    console.log('INICIO: ' + moment(inicio).format('DD/MM/YY - HH:mm'));
    console.log('TERMINO: ' + moment(termino).format('DD/MM/YY - HH:mm'));

    console.log(selectedespecialista);

    let count = arrayatendimentos.filter(valor =>
      valor.situacao == 3
      &&
      valor.id_profissional == selectedespecialista.id_usuario
      &&
      (
        (
          // situação 0
          moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') == moment(inicio).format('DD/MM/YYYY - HH:mm')
          ||
          moment(valor.data_termino).format('DD/MM/YYYY - HH:mm') == moment(termino).format('DD/MM/YYYY - HH:mm')
          ||
          // situação 1
          (
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') < moment(inicio).format('DD/MM/YYYY - HH:mm')
            &&
            moment(valor.data_termino).format('DD/MM/YYYY - HH:mm') > moment(inicio).format('DD/MM/YYYY - HH:mm')
          )
          ||
          // situação 2
          (
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') > moment(inicio).format('DD/MM/YYYY - HH:mm')
            &&
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') < moment(termino).format('DD/MM/YYYY - HH:mm')
          )
          ||
          // situação 3
          (
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') > moment(inicio).format('DD/MM/YYYY - HH:mm')
            &&
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') < moment(termino).format('DD/MM/YYYY - HH:mm')
          )
        )
      )
    ).length;

    console.log('COUNT: ' + count);

    if (count > 0) {
      modal(setdialogo, 'JÁ EXISTE UMA CONSULTA AGENDADA PARA ESTE HORÁRIO, CONFIRMAR ESTE NOVO AGENDAMENTO?', insertAtendimento, inicio);
    } else {
      insertAtendimento(inicio);
    }
  }

  const checkUpdateConsultas = (item, data_inicio) => {
    console.log(item); // obj ok.

    let inicio = moment(data_inicio, 'DD/MM/YYYY - HH:mm');
    let termino = null;
    if (localStorage.getItem('PARTICULAR') == 'PARTICULAR') {
      termino = moment(inicio).add(cliente.tempo_consulta_particular, 'minutes');
    } else {
      termino = moment(inicio).add(cliente.tempo_consulta_convenio, 'minutes');
    }

    console.log('INICIO: ' + moment(inicio).format('DD/MM/YY - HH:mm'));
    console.log('TERMINO: ' + moment(termino).format('DD/MM/YY - HH:mm'));

    let count = arrayatendimentos.filter(valor =>
      valor.situacao == 3
      &&
      valor.id_profissional == selectedespecialista.id_usuario
      &&
      (
        (
          // situação 0
          moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') == moment(inicio).format('DD/MM/YYYY - HH:mm')
          ||
          moment(valor.data_termino).format('DD/MM/YYYY - HH:mm') == moment(termino).format('DD/MM/YYYY - HH:mm')
          ||
          // situação 1
          (
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') < moment(inicio).format('DD/MM/YYYY - HH:mm')
            &&
            moment(valor.data_termino).format('DD/MM/YYYY - HH:mm') > moment(inicio).format('DD/MM/YYYY - HH:mm')
          )
          ||
          // situação 2
          (
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') > moment(inicio).format('DD/MM/YYYY - HH:mm')
            &&
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') < moment(termino).format('DD/MM/YYYY - HH:mm')
          )
          ||
          // situação 3
          (
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') > moment(inicio).format('DD/MM/YYYY - HH:mm')
            &&
            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') < moment(termino).format('DD/MM/YYYY - HH:mm')
          )
        )
      )
    ).length;

    console.log('COUNT: ' + count);

    if (count > 0) {
      modal(setdialogo, 'JÁ EXISTE UMA CONSULTA AGENDADA PARA ESTE HORÁRIO, CONFIRMAR ESTE NOVO AGENDAMENTO?', updateAtendimento, [item, inicio]);
    } else {
      updateAtendimento([item, inicio]);
    }
  }

  const insertAtendimento = (inicio) => {
    var obj = {
      data_inicio: moment(inicio, 'DD/MM/YYYY - HH:mm'),
      data_termino: localStorage.getItem('PARTICULAR') == 'PARTICULAR' ? moment(inicio, 'DD/MM/YYYY - HH:mm').add(cliente.tempo_consulta_particular, 'minutes') : moment(inicio, 'DD/MM/YYYY - HH:mm').add(cliente.tempo_consulta_convenio, 'minutes'),
      problemas: null,
      id_paciente: paciente.id_paciente,
      id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial.
      nome_paciente: paciente.nome_paciente,
      leito: null,
      situacao: 3, // 3 = atendimento ambulatorial (consulta).
      id_cliente: hospital,
      classificacao: null,
      id_profissional: selectedespecialista.id_usuario,
      convenio_id: paciente.convenio_codigo,
      convenio_carteira: paciente.convenio_carteira,
      faturamento_codigo_procedimento: localStorage.getItem('PARTICULAR'),
    };
    console.log(obj);
    axios
      .post(html + "insert_consulta", obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA INSERIDO COM SUCESSO')
        loadAgendaConsultas();
      });
  };

  const updateAtendimento = ([item, inicio]) => {
    console.log(item);
    console.log(inicio);

    var obj = {
      data_inicio: moment(inicio, 'DD/MM/YYYY - HH:mm'),
      data_termino: item.faturamento_codigo_procedimento == 'PARTICULAR' ? moment(inicio, 'DD/MM/YYYY - HH:mm').add(cliente.tempo_consulta_particular, 'minutes') : moment(inicio, 'DD/MM/YYYY - HH:mm').add(cliente.tempo_consulta_convenio, 'minutes'),
      problemas: item.problemas,
      id_paciente: item.id_paciente,
      id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial.
      nome_paciente: item.nome_paciente,
      leito: null,
      situacao: 3, // 3 = atendimento ambulatorial (consulta).
      id_cliente: hospital,
      classificacao: null,
      id_profissional: item.id_profissional,
      convenio_id: item.convenio_codigo,
      convenio_carteira: item.convenio_carteira,
      faturamento_codigo_procedimento: item.faturamento_codigo_procedimento,
    };
    console.log(obj);
    axios
      .post(html + "update_atendimento/" + item.id_atendimento, obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA ATUALIZADO COM SUCESSO')
        loadAgendaConsultas();
      });
  };

  const updateAtendimentoObservacao = (item, valor) => {
    var obj = {
      data_inicio: item.data_inicio,
      data_termino: item.data_termino,
      problemas: valor,
      id_paciente: item.id_paciente,
      id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial (consultas).
      nome_paciente: item.nome_paciente,
      leito: null,
      situacao: item.situacao, // 3 = atendimento ambulatorial (consulta).
      id_cliente: hospital,
      classificacao: null,
      id_profissional: item.id_profissional,
      convenio_id: item.convenio_codigo,
      convenio_carteira: item.convenio_carteira,
      faturamento_codigo_procedimento: item.faturamento_codigo_procedimento,
    };
    console.log(obj);
    axios
      .post(html + "update_atendimento/" + item.id_atendimento, obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA ATUALIZADO COM SUCESSO')
        loadAgendaConsultas();
      });
  };

  const geraGuiaConsulta = () => {
    setcard('guia-consulta');
    document.getElementById("guia-consulta").style.display = 'flex';
    document.getElementById("guia-consulta").style.visibility = 'visible';
  }

  // excluir um atendimento.
  const deleteAtendimento = (id) => {
    axios.get(html + "delete_atendimento/" + id).then(() => {
      console.log('DELETANDO AGENDAMENTO DE CONSULTA');
      loadAgendaConsultas();
    });
  };

  const [selectedespecialista] = useState([]);

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
          // position: 'sticky', top: 5,
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
              boxShadow: 'none',
            }}
          >
            {arraylist.map((item) => (
              <button
                key={'dia ' + item}
                className={selectdate == item ? "button-selected" : "button"}
                onClick={(e) => {
                  setselectdate(item);
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
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /*
  ## SITUAÇÃO DOS ATENDIMENTOS (CONSULTAS):
  3 = ATENDIMENTO ATIVO.
  4 = ATENDIMENTO FINALIADO.
  5 = ATENDAMENTO CANCELADO.
  */

  // agenda de consultas.
  const [arrayatendimentos, setarrayatendimentos] = useState([]);
  const loadAgendaConsultas = () => {
    axios
      .get(html + "list_consultas/" + 5) // 5 corresponde ao id da unidade "AMBULATÓRIO".
      .then((response) => {
        var x = response.data.rows;
        var y = x.filter(item => item.id_unidade == 5 && item.id_cliente == cliente.id_cliente);
        setarrayatendimentos(y);
      });
  }

  const ListaTodosAtendimentos = useCallback(() => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: "column",
          justifyContent: 'center',
          alignSelf: 'center',
        }}
      >
        <div className='text1'
          style={{
            fontSize: 16,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          {'CONSULTAS AGENDADAS'}
        </div>
        <div className='button'
          style={{
            display: window.innerWidth < mobilewidth ? 'none' : 'flex',
            width: 200,
            alignSelf: 'center',
            marginBottom: 10,
          }}
          onClick={() => {
            localStorage.setItem('selectdate', selectdate);
            setpagina(2);
            history.push("/cadastro");
          }}
        >
          AGENDAR CONSULTA
        </div>
        <div id="scroll atendimentos com pacientes - desktop"
          className='scroll'
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: "flex-start",
            height: '55vh',
            width: window.innerWidth < mobilewidth ? '80vw' : '50vw',
          }}
        >
          {arrayatendimentos
            .filter(item => item.situacao > 2 && moment(item.data_inicio).format('DD/MM/YYYY') == selectdate)
            .sort((a, b) => (moment(a.data_inicio) > moment(b.data_inicio) ? 1 : -1))
            .map((item) => (
              <div key={"pacientes" + item.id_atendimento}>
                <div
                  style={{
                    display: 'flex', flexDirection: 'row',
                    position: "relative",
                    margin: 2.5, padding: 0,
                  }}
                >
                  <div
                    style={{
                      display: item.faturamento_codigo_procedimento != null ? 'flex' : 'none',
                      position: 'absolute',
                      top: -2.5, left: -2.5,
                      padding: 2.5,
                      paddingLeft: 10, paddingRight: 10,
                      borderRadius: 5,
                      backgroundColor: item.faturamento_codigo_procedimento == 'PARTICULAR' ? 'rgb(82, 190, 128, 1)' : '#03aacd',
                      color: 'white',
                      fontWeight: 'bold',
                      zIndex: 20,
                    }}>
                    {item.faturamento_codigo_procedimento}
                  </div>
                  {ViewUpdateAtendimento(item)}
                  <div
                    id={"btn_todos_atendimentos " + item.id_atendimento}
                    className="button"
                    onClick={() => {
                      document.getElementById('viewupdateatendimento ' + item.id_atendimento).style.display = 'flex';
                      document.getElementById('viewupdateatendimento ' + item.id_atendimento).style.visibility = 'visible';
                    }}
                    style={{
                      marginRight: 0,
                      padding: 10,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      opacity: 0.9,
                    }}>
                    {moment(item.data_inicio).format('HH:mm') + ' ÀS ' + moment(item.data_termino).format('HH:mm')}
                  </div>
                  <div
                    id={"todos_atendimentos " + item.id_atendimento}
                    className="button"
                    style={{
                      flex: 3,
                      marginLeft: 0,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }}                    >
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          padding: 5,
                          alignSelf: 'center',
                          width: '100%',
                        }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          {pacientes.filter(
                            (valor) => valor.id_paciente == item.id_paciente
                          )
                            .map((valor) => valor.nome_paciente + ', ' + mountage(moment(valor.dn_paciente).format('DD/MM/YYYY')))}
                        </div>
                        <div style={{
                          display: window.innerWidth < mobilewidth ? 'none' : 'flex',
                          textAlign: 'left'
                        }}>
                          {especialistas.filter(valor => valor.id_usuario == item.id_profissional).map(item => 'DR(A). ' + item.nome_usuario + ' - ' + item.conselho + ' ' + item.n_conselho)}
                        </div>

                        <div id={'btn_seletor_observacoes ' + item.id_atendimento}
                          className='text2'
                          title="CLIQUE PARA VER OBSERVAÇÕES DO ATENDIMENTO."
                          style={{
                            textDecoration: 'underline',
                            fontSize: 12,
                            justifyContent: 'flex-start',
                            alignSelf: 'flex-start',
                            margin: 5,
                            marginLeft: 0,
                            padding: 0,
                          }}
                          onClick={() => {
                            let element = document.getElementById('input_atendimento_problemas ' + item.id_atendimento);
                            let button = document.getElementById('btn_seletor_observacoes ' + item.id_atendimento);
                            if (element.style.display == 'flex') {
                              element.style.display = 'none';
                              element.style.visibility = 'hidden';
                              button.style.opacity = 0.5;
                            } else {
                              element.style.display = 'flex';
                              element.style.visibility = 'visible';
                              button.style.opacity = 1;
                            }
                          }}
                        >
                          OBS
                        </div>
                        <textarea id={'input_atendimento_problemas ' + item.id_atendimento}
                          autoComplete="off"
                          placeholder="OBSERVAÇÕES"
                          className="textarea"
                          type="text"
                          onFocus={(e) => (e.target.placeholder = "")}
                          onBlur={(e) => (e.target.placeholder = "OBSERVAÇÕES")}
                          defaultValue={item.problemas}
                          onClick={(e) => e.stopPropagation()}
                          onKeyUp={() => {
                            clearTimeout(timeout);
                            // eslint-disable-next-line
                            timeout = setTimeout(() => {
                              console.log('ATUALIZANDO OBSERVAÇÃO')
                              updateAtendimentoObservacao(item, document.getElementById('input_atendimento_problemas ' + item.id_atendimento).value.toUpperCase())
                            }, 1000);
                          }}
                          style={{
                            display: 'none',
                            flexDirection: "center",
                            justifyContent: "center",
                            alignSelf: "center",
                            width: 'calc(100% - 20px)',
                            padding: 5,
                            marginLeft: 5,
                            marginBottom: 0,
                            height: 60,
                            minHeight: 60,
                            maxHeight: 60,
                          }}
                        ></textarea>
                      </div>
                      <div className='button'
                        style={{
                          display: window.innerWidth < mobilewidth ? 'none' : 'flex',
                          backgroundColor: item.situacao == 3 ? '#f4d03f' : item.situacao == 4 ? '#52be80' : '#EC7063', width: 150, minWidth: 150, height: 30, minHeight: 30, maxHeight: 30,
                          alignSelf: 'flex-end'
                        }}
                      >
                        {item.situacao == 3 ? 'ATIVA' : item.situacao == 4 ? 'FINALIZADA' : 'CANCELADA'}
                      </div>
                      <div style={{
                        display: window.innerWidth < mobilewidth ? 'none' : 'flex',
                        flexDirection: 'row'
                      }}>
                        <div id="btn imprimir guia tiss"
                          title="IMPRIMIR GUIA TISS"
                          className="button-yellow"
                          onClick={() => {
                            setobjpaciente(pacientes.filter(valor => valor.id_paciente == item.id_paciente).pop());
                            setdono_documento(especialistas.filter(valor => valor.id_usuario == item.id_profissional).pop());
                            setTimeout(() => {
                              geraGuiaConsulta();
                            }, 2000);
                          }}
                          style={{
                            display: item.situacao != 3 ? 'none' : 'flex',
                            width: 50, height: 50, alignSelf: 'flex-end'
                          }}
                        >
                          <img
                            alt=""
                            src={imprimir}
                            style={{
                              margin: 10,
                              height: 30,
                              width: 30,
                            }}
                          ></img>
                        </div>
                        <div id="btn deletar agendamento de consulta"
                          title="DESMARCAR CONSULTA"
                          className="button-yellow"
                          onClick={() => {
                            modal(
                              setdialogo,
                              "TEM CERTEZA QUE DESEJA DESMARCAR A CONSULTA?",
                              deleteAtendimento,
                              item.id_atendimento
                            );
                          }}
                          style={{
                            width: 50, height: 50, alignSelf: 'flex-end',
                            display: window.innerWidth < mobilewidth ? 'none' : 'flex',
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
                        <div id="btn lembrar consulta"
                          title="LEMBRAR CONSULTA PARA O CLIENTE"
                          className="button-green"
                          onClick={(e) => {
                            geraWhatsapp(item.id_paciente, moment(item.data_inicio).format('DD/MM/YYYY - HH:mm'), especialistas.filter(valor => valor.id_usuario == item.id_profissional).pop());
                            e.stopPropagation();
                          }}
                          style={{ display: item.situacao != 3 ? 'none' : 'flex', width: 50, height: 50, alignSelf: 'flex-end' }}
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
              </div>
            ))
          }
        </div>
      </div>
    );
    // eslint-disable-next-line
  }, [arrayatendimentos, selectdate, pacientes]);

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
                checkConsultas(selectdate + ' - ' + hora + ':' + min)
                setviewopcoeshorarios(0);
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
          <div className='text1' style={{ fontSize: 18, marginBottom: 0 }}>HORÁRIO DA CONSULTA</div>
          <TimeComponent></TimeComponent>
        </div>
      </div>
    )
  }

  const ViewUpdateAtendimento = (item) => {
    function TimeUpdateComponent() {
      var timeout = null;
      const fixEditHour = (valor) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (valor > 23 || valor < 0) {
            document.getElementById("inputEditHour " + item.id_atendimento).value = '';
            document.getElementById("inputEditHour " + item.id_atendimento).focus();
          } else {
            localStorage.setItem('hora', valor);
          }
        }, 100);
      };
      const fixEditMin = (valor) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (valor > 59 || valor < 0) {
            document.getElementById("inputEditMin " + item.id_atendimento).value = '';
            document.getElementById("inputEditMin " + item.id_atendimento).focus();
          } else {
            localStorage.setItem('min', valor);
          }
        }, 100);
      };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div id='dia' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <textarea
              autoComplete="off"
              placeholder="DN"
              className="textarea"
              type="text"
              inputMode="numeric"
              maxLength={10}
              id={"inputEditDataConsulta " + item.id_atendimento}
              title="FORMATO: DD/MM/YYYY"
              onClick={() => document.getElementById("inputEditDataConsulta " + item.id_atendimento).value = ""}
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "DATA")}
              onKeyUp={() => maskdate(timeout, "inputEditDataConsulta " + item.id_atendimento)}
              defaultValue={moment(item.data_inicio).format('DD/MM/YYYY')}
              style={{
                flexDirection: "center",
                justifyContent: "center",
                alignSelf: "center",
                width: 100,
                textAlign: "center",
                padding: 15,
                height: 20,
                minHeight: 20,
                maxHeight: 20,
              }}
            ></textarea>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <input
              autoComplete="off"
              className="input"
              placeholder="HH"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'HH')}
              onKeyUp={(e) => fixEditHour(e.target.value)}
              title="HORAS."
              maxLength={2}
              style={{
                width: 100,
                height: 50,
              }}
              min={0}
              max={23}
              id={"inputEditHour " + item.id_atendimento}
            ></input>
            <div className='text1'>{' : '}</div>
            <input
              autoComplete="off"
              className="input"
              placeholder="MM"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'MM')}
              onKeyUp={(e) => fixEditMin(e.target.value)}
              title="MINUTOS."
              maxLength={2}
              style={{
                width: 100,
                height: 50,
              }}
              min={0}
              max={59}
              id={"inputEditMin " + item.id_atendimento}
            ></input>
          </div>
          <div id="btnAdd"
            className="button-green"
            title="CONFIRMAR DATA E HORA."
            onClick={() => {
              let nova_data = document.getElementById("inputEditDataConsulta " + item.id_atendimento).value;
              let nova_hora = document.getElementById("inputEditHour " + item.id_atendimento).value;
              let novo_minuto = document.getElementById("inputEditMin " + item.id_atendimento).value;
              console.log(selectdate + ' - ' + nova_hora + ':' + novo_minuto);
              checkUpdateConsultas(item, nova_data + ' - ' + nova_hora + ':' + novo_minuto);
              // updateAtendimento([item, nova_data + ' - ' + nova_hora + ':' + novo_minuto]);
              document.getElementById('viewupdateatendimento ' + item.id_atendimento).style.display = 'none';
              document.getElementById('viewupdateatendimento ' + item.id_atendimento).style.visibility = 'hidden';
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
        id={'viewupdateatendimento ' + item.id_atendimento}
        className="fundo"
        style={{ display: "none" }}
        onClick={() => {
          document.getElementById('viewupdateatendimento ' + item.id_atendimento).style.display = 'none';
          document.getElementById('viewupdateatendimento ' + item.id_atendimento).style.visibility = 'hidden';
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
          <div className='text1' style={{ fontSize: 18, marginBottom: 0 }}>HORÁRIO DA CONSULTA</div>
          <TimeUpdateComponent></TimeUpdateComponent>
        </div>
      </div>
    )
  }


  // ## AGENDA DE EXAMES E PROCEDIMENTOS ## /

  const loadAgendaExames = () => {
    axios.get(html + 'list_exames_clinicas/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setarrayexames(x);
      console.log(x);
    })
  }

  const deleteExameAgendado = (id) => {
    axios.get(html + 'delete_exames_clinicas/' + id).then(() => {
      console.log('ITEM DE EXAME AGENDADO EXCLUÍDO');
      loadAgendaExames();
    })
  }

  const [arrayexames, setarrayexames] = useState([]);
  function ListaDeExamesAgendados() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className='text1'
          style={{
            fontSize: 16,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          {'EXAMES E PROCEDIMENTOS AGENDADOS'}
        </div>
        <div className='button'
          style={{
            display: window.innerWidth < mobilewidth ? 'none' : 'flex',
            width: 200,
            alignSelf: 'center',
            marginBottom: 10,
          }}
          onClick={() => {
            localStorage.setItem('selectdate', selectdate);
            setpagina(2);
            history.push("/cadastro");
          }}
        >
          AGENDAR EXAME OU PROCEDIMENTO
        </div>
        <div
          id="scroll de exames e procedimentos"
          className='scroll'
          style={{
            display: "flex",
            flexDirection: 'column',
            justifyContent: "flex-start",
            height: '55vh',
            width: window.innerWidth < mobilewidth ? '80vw' : '50vw',
          }}
        >
          {arrayexames.filter(item => moment(item.data_exame, 'DD/MM/YYYY - HH:mm').format('DD/MM/YYYY') == selectdate).sort((a, b) => (moment(a.data_exame, 'DD/MM/HHHH - HH:mm') > moment(b.data_exame, 'DD/MM/HHHH - HH:mm') ? 1 : -1)).map(item => (
            <div
              key={'item - ' + Math.random()}
            >
              <div id="horário ocupado."
                style={{
                  display: item.nome_paciente != null ? 'flex' : 'none',
                  flexDirection: 'row', justifyContent: 'flex-start', width: '100%', height: '100%',
                }}
                onClick={() => {
                  console.log('abrir tela para mudar horários? ...')
                }}
              >
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
                  <div style={{
                    display: window.innerWidth < mobilewidth ? 'none' : 'flex',
                    flexDirection: 'row', justifyContent: 'space-between', width: '100%'
                  }}>
                    <div className='button'
                      style={{
                        display: 'flex',
                        backgroundColor: item.status == 0 ? '#f4d03f' : item.situacao == 1 ? '#52be80' : '#EC7063', width: 150, minWidth: 150, height: 30, minHeight: 30, maxHeight: 30,
                        alignSelf: 'flex-end'
                      }}
                    >
                      {item.status == 0 ? 'AGENDADO' : item.situacao == 1 ? 'EXECUTADO' : item.situacao == 2 ? 'CANCELADO' : 'DESISTÊNCIA'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                      <div id="btnDeleteAgendamento"
                        title="EXCLUIR AGENDAMENTO"
                        className="button-yellow"
                        onClick={(e) => {
                          modal(
                            setdialogo,
                            "TEM CERTEZA QUE DESEJA EXCLUIR ESTE AGENDAMENTO?",
                            deleteExameAgendado, item.id
                          );
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
                      <div id="btn lembrar exame"
                        title="LEMBRAR CONSULTA PARA O CLIENTE"
                        className="button-green"
                        onClick={(e) => {
                          geraWhatsappExame(item.id_paciente, item);
                          e.stopPropagation();
                        }}
                        style={{ display: item.status > 1 ? 'none' : 'flex', width: 50, height: 50, alignSelf: 'flex-end' }}
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
            </div>
          ))
          }
        </div >
      </div>
    )
  }

  const [agendamento, setagendamento] = useState('CONSULTAS');
  return (
    <div className='main cor2'
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: window.innerWidth < mobilewidth ? 'flex-start' : 'center',
        alignContent: 'center',
        alignSelf: 'center',
        borderColor: 'white',
        backgroundColor: 'white',
      }}>
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
        justifyContent: 'flex-start',
        alignContent: 'center', flexWrap: 'wrap',
      }}>
        <div id="botão para sair da tela de agendamento"
          className="button-yellow"
          style={{
            maxHeight: 50, maxWidth: 50, alignSelf: 'center'
          }}
          onClick={() => {
            setpagina(0);
            history.push("/");
          }}>
          <img
            alt=""
            src={back}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
        <div className={agendamento == 'CONSULTAS' ? 'button-selected' : 'button'} style={{ width: 200 }} onClick={() => setagendamento('CONSULTAS')}>CONSULTAS</div>
        <div className={agendamento == 'EXAMES' ? 'button-selected' : 'button'} style={{ width: 200 }} onClick={() => setagendamento('EXAMES')}>EXAMES</div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
        justifyContent: window.innerWidth < mobilewidth ? 'flex-start' : 'center',
      }}>
        <div id="datepicker"
          className='cor2'
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
            justifyContent: window.innerWidth < mobilewidth ? 'flex-start' : 'center',
            marginTop: 20,
            alignContent: 'center',
            alignItems: 'center',
          }}
        >
          <DatePicker></DatePicker>
        </div>
        <div id='mapa de agendamentos de consultas'
          style={{ display: agendamento == 'CONSULTAS' ? 'flex' : 'none' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
              borderRadius: 5,
              marginLeft: 10,
            }}>
            <ListaTodosAtendimentos></ListaTodosAtendimentos>
            <div style={{ display: window.innerWidth < mobilewidth ? 'none' : 'flex' }}>
              <ViewOpcoesHorarios></ViewOpcoesHorarios>
              <GuiaConsulta></GuiaConsulta>
            </div>
          </div>
        </div>
        <div id='mapa de agendamentos de exames'
          style={{ display: agendamento == 'EXAMES' ? 'flex' : 'none' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
              borderRadius: 5,
              marginLeft: 10,
            }}>
            <ListaDeExamesAgendados></ListaDeExamesAgendados>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapaDeAgendamentos;