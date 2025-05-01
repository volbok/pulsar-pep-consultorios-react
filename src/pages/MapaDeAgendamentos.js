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
// componentes.
import Pagamento from '../components/Pagamento';
import Filter from '../components/Filter';
// funções.
import maskdate from "../functions/maskdate";
// router.
import { useHistory } from "react-router-dom";
import modal from '../functions/modal';
import GuiaConsulta from '../cards/GuiaConsulta';
import mountage from '../functions/mountage';
import selector from '../functions/selector';
import toast from '../functions/toast';

function MapaDeAgendamentos() {

  // context.
  const {
    pagina, setpagina,
    html,
    hospital,
    pacientes, setpacientes,
    setobjpaciente,
    setdialogo,
    setcard,
    setdono_documento,
    mobilewidth,
    cliente,
    setpagamento,
    faturamento, setfaturamento,
    selectedespecialista,
    arrayexames, setarrayexames,
    agenda, setagenda,
    arrayatendimentos, setarrayatendimentos,
    usuarios,
    agendaexame, setagendaexame,
    settoast,
    setobjatendimento,
  } = useContext(Context);

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'MAPA DE AGENDAMENTOS') {
      localStorage.setItem('tela_agendamento', 'CONSULTAS');
      currentMonth();
      setselectdate(moment().format('DD/MM/YYYY'))
      loadUsuarios();
      loadPacientes();
      loadProcedimentos();
      loadFaturamentos();
      loadAgendaExames();
      loadAgenda();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // history (router).
  let history = useHistory();

  var timeout = null;
  const [especialistas, setespecialistas] = useState([]);

  // agenda de consultas (horários predefinidos).
  const loadAgenda = () => {
    axios.get(html + "list_agenda").then((response) => {
      let x = response.data.rows;
      let local_agenda = x.filter(item => item.id_cliente == cliente.id_cliente);
      setagenda(local_agenda);
      localStorage.setItem('selectdate', selectdate);
      setarrayatendimentos([]);
      axios
        .get(html + "list_consultas/" + 5) // 5 corresponde ao id da unidade "AMBULATÓRIO".
        .then((response) => {
          var x = response.data.rows;
          var y = x.filter(item => item.id_unidade == 5 && item.id_cliente == cliente.id_cliente);
          let array = y;
          local_agenda.filter(item => item.dia_semana == moment(selectdate, 'DD/MM/YYYY').format('dddd').toUpperCase()).map(item => {
            array.push(
              {
                situacao: 'AGENDAMENTO',
                id_profissional: item.id_usuario,
                data_inicio: moment(selectdate + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'),
                data_termino: moment(selectdate + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm'),
                faturamento_codigo_procedimento: moment(selectdate + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm').diff(moment(selectdate + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'), 'minutes') == cliente.tempo_consulta_convenio ? 'CONVÊNIO' : 'PARTICULAR',
              }
            );
            return null;
          });
          setarrayatendimentos(array);
        });
    })
  }

  const loadFaturamentos = () => {
    axios.get(html + 'list_faturamento_clinicas/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setfaturamento(x);
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
    let cleanphone = rawphone.replace("(", "");
    cleanphone = cleanphone.replace(")", "");
    cleanphone = cleanphone.replace("-", "");
    cleanphone = cleanphone.replace(" ", "");
    cleanphone = "55" + cleanphone;

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
    const gzappy_url_envia_mensagem = "https://api.gzappy.com/v1/message/send-message/";
    const instance_id = 'L05K3GC2YX03DGWYLDKZQW5L';
    const instance_token = '2d763c00-4b6d-4842-99d7-cb32ea357a80';
    const USER_TOKEN_ID = '3a1d021d-ad34-473e-9255-b9a3e6577cf9';
    const GZAPPY_API_TOKEN = 'bfd2b508d013fbbde6ae4765bbc4eaf83b5514201a7970ae46ff91ade3b2b1a032fe9c8a961a7c572a547b52d745e433f317bd825eb471d0f609c1e843e3d0a9';

    const message =
      'Olá, ' + item.nome_paciente + '!\n' +
      'Você tem o exame/procedimento ' + item.nome_exame + ', agendado na CLÍNICA ' + cliente.razao_social + ', para o dia ' + item.data_exame + ' a ser realizado pelo Dr(a). ' + item.nome_profissional_executante + '.'

    const rawphone = paciente.telefone;
    let cleanphone = rawphone.replace("(", "");
    cleanphone = cleanphone.replace(")", "");
    cleanphone = cleanphone.replace("-", "");
    cleanphone = cleanphone.replace(" ", "");
    cleanphone = "55" + cleanphone;
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

  const checkUpdateConsultas = (item, data_inicio) => {
    let inicio = moment(data_inicio, 'DD/MM/YYYY - HH:mm');
    let termino = null;
    if (localStorage.getItem('PARTICULAR') == 'PARTICULAR') {
      termino = moment(inicio).add(cliente.tempo_consulta_particular, 'minutes');
    } else {
      termino = moment(inicio).add(cliente.tempo_consulta_convenio, 'minutes');
    }
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
    if (count > 0) {
      modal(setdialogo, 'JÁ EXISTE UMA CONSULTA AGENDADA PARA ESTE HORÁRIO, CONFIRMAR ESTE NOVO AGENDAMENTO?', updateAtendimento, [item, inicio]);
    } else {
      updateAtendimento([item, inicio]);
    }
  }

  const checkUpdateTipoConsulta = (item, tipo, data_inicio) => {
    let inicio = moment(data_inicio, 'DD/MM/YYYY - HH:mm');
    let termino = null;
    if (localStorage.getItem('PARTICULAR') == 'PARTICULAR') {
      termino = moment(inicio).add(cliente.tempo_consulta_particular, 'minutes');
    } else {
      termino = moment(inicio).add(cliente.tempo_consulta_convenio, 'minutes');
    }
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

    if (faturamento.filter(fat => fat.atendimento_id == item.id_atendimento && fat.codigo_tuss == '10101012').length == 0) {
      if (count > 0) {
        modal(setdialogo, 'JÁ EXISTE UMA CONSULTA AGENDADA PARA ESTE HORÁRIO, CONFIRMAR ESTE NOVO AGENDAMENTO?', updateAtendimento, [item, inicio]);
      } else {
        updateTipoAtendimento(item, tipo);
      }
    } else {
      toast(settoast, 'CONSULTA JÁ FATURADA, TIPO DE ATENDIMENTO NÃO PODE SER ALTERADO.', '#ec7063', 3000);
    }
  }

  const insertAtendimento = (paciente, registro) => {
    var obj = null;
    console.log(localStorage.getItem('retorno'));
    let retorno = localStorage.getItem('retorno'); 
    if (retorno == 'SIM') {
      obj = {
        data_inicio: registro.data_inicio,
        data_termino: moment(registro.data_inicio).add(15, 'minutes'),
        problemas: null,
        id_paciente: paciente.id_paciente,
        id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial.
        nome_paciente: paciente.nome_paciente,
        leito: null,
        situacao: 3, // 3 = atendimento ambulatorial (consulta).
        id_cliente: cliente.id_cliente,
        classificacao: null,
        id_profissional: registro.id_profissional,
        convenio_id: paciente.convenio_codigo,
        convenio_carteira: paciente.convenio_carteira,
        faturamento_codigo_procedimento: registro.faturamento_codigo_procedimento,
      };
    } else {
      obj = {
        data_inicio: registro.data_inicio,
        data_termino: registro.faturamento_codigo_procedimento == 'PARTICULAR' ? moment(registro.data_inicio).add(cliente.tempo_consulta_particular, 'minutes') : moment(registro.data_inicio).add(cliente.tempo_consulta_convenio, 'minutes'),
        problemas: null,
        id_paciente: paciente.id_paciente,
        id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial.
        nome_paciente: paciente.nome_paciente,
        leito: null,
        situacao: 3, // 3 = atendimento ambulatorial (consulta).
        id_cliente: cliente.id_cliente,
        classificacao: null,
        id_profissional: registro.id_profissional,
        convenio_id: paciente.convenio_codigo,
        convenio_carteira: paciente.convenio_carteira,
        faturamento_codigo_procedimento: registro.faturamento_codigo_procedimento,
      };
    }
    axios
      .post(html + "insert_consulta", obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA INSERIDO COM SUCESSO')
        loadModdedAtendimentos(selectdate);
      });
  };

  const insertBloqueioAtendimento = (profissional, inicio) => {
    var obj = {
      data_inicio: moment(inicio, 'DD/MM/YYYY - HH:mm'),
      data_termino: localStorage.getItem('PARTICULAR') == 'PARTICULAR' ? moment(inicio, 'DD/MM/YYYY - HH:mm').add(cliente.tempo_consulta_particular, 'minutes') : moment(inicio, 'DD/MM/YYYY - HH:mm').add(cliente.tempo_consulta_convenio, 'minutes'),
      problemas: null,
      id_paciente: null,
      id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial.
      nome_paciente: 'HORÁRIO BLOQUEADO!',
      leito: null,
      situacao: 10, // 10 = horário bloqueado para consulta.
      id_cliente: hospital,
      classificacao: null,
      id_profissional: profissional,
      convenio_id: null,
      convenio_carteira: null,
      faturamento_codigo_procedimento: null,
    };
    console.log(obj);
    axios
      .post(html + "insert_consulta", obj)
      .then(() => {
        console.log('BLOQUEIO DE HORÁRIO DE CONSULTA INSERIDO COM SUCESSO');
        loadModdedAtendimentos(selectdate);
      });
  };

  const updateAtendimento = ([item, inicio]) => {
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
    axios
      .post(html + "update_atendimento/" + item.id_atendimento, obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA ATUALIZADO COM SUCESSO')
        loadModdedAtendimentos(selectdate);
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
    axios
      .post(html + "update_atendimento/" + item.id_atendimento, obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA ATUALIZADO COM SUCESSO')
        loadModdedAtendimentos(selectdate);
      });
  };

  const insertProcedimento = (particular, convenio, paciente) => {
    let registro = JSON.parse(localStorage.getItem('horario_procedimento'));
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
      id_profissional_executante: registro.id_profissional_executante,
      nome_profissional_executante: registro.nome_profissional_executante,
      conselho_profissional_executante: registro.conselho_profissional_executante,
      n_conselho_profissional_executante: registro.n_conselho_profissional_executante,
      status: 0, // 0 = solicitado, 1 = executado, 2 = cancelado, 3 = desistência.
      laudohtml: '',
      id_cliente: cliente.id_cliente,
      data_exame: registro.data_exame,
    }
    axios.post(html + 'insert_exames_clinicas', obj).then(() => {
      console.log('EXAME OU PROCEDIMENTO AGENDADO COM SUCESSO.');
      montaArrayAgenda(selectdate);
    })
  }

  const geraGuiaConsulta = () => {
    setcard('guia-consulta');
    document.getElementById("guia-consulta").style.display = 'flex';
    document.getElementById("guia-consulta").style.visibility = 'visible';
  }

  // excluir um atendimento.
  const deleteAtendimento = (id) => {
    axios.get(html + "delete_atendimento/" + id).then(() => {
      console.log('DELETANDO AGENDAMENTO DE CONSULTA');
      loadModdedAtendimentos(selectdate);
    });
  };

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
                  loadModdedAtendimentos(item);
                  montaArrayAgenda(item);
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

  const loadModdedAtendimentos = (item) => {
    // carregando os atendimentos já registrados.
    setarrayatendimentos([]);
    axios
      .get(html + "list_consultas/" + 5) // 5 corresponde ao id da unidade "AMBULATÓRIO".
      .then((response) => {
        var x = response.data.rows;
        var y = x.filter(item => item.id_unidade == 5 && item.id_cliente == cliente.id_cliente);
        carregaHorarioslivres(y, item);
      });
  }

  const carregaHorarioslivres = (array_origin, data) => {
    let array = array_origin;
    agenda.filter(item => item.dia_semana == moment(data, 'DD/MM/YYYY').format('dddd').toUpperCase()).map(item => {
      array.push(
        {
          situacao: 'AGENDAMENTO',
          id_profissional: item.id_usuario,
          data_inicio: moment(data + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'),
          data_termino: moment(data + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm'),
          faturamento_codigo_procedimento: moment(data + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm').diff(moment(data + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'), 'minutes') == cliente.tempo_consulta_convenio ? 'CONVÊNIO' : 'PARTICULAR',
        }
      );
      return null;
    });
    setarrayatendimentos(array);
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
        <div id="scroll atendimentos com pacientes - desktop"
          className='scroll'
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: "flex-start",
            height: '65vh',
            width: window.innerWidth < mobilewidth ? '80vw' : '55vw',
          }}
        >
          {arrayatendimentos
            .filter(item => moment(item.data_inicio).format('DD/MM/YYYY') == selectdate && (item.situacao > 2 || item.situacao == 'AGENDAMENTO'))
            .sort((a, b) => (moment(a.data_inicio) > moment(b.data_inicio) ? 1 : -1))
            .map((item) => (
              <div
                key={"pacientes" + Math.random()} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%'
                }}>
                <div id='atendimentos agendados'
                  style={{
                    display: item.situacao > 2 && item.situacao != 10 ? 'flex' : 'none',
                    flexDirection: 'row',
                    position: "relative",
                    margin: 0, padding: 0,
                  }}
                >
                  <div
                    onClick={() => {
                      console.log(item.faturamento_codigo_procedimento);
                      if (item.faturamento_codigo_procedimento == 'PARTICULAR') {
                        checkUpdateTipoConsulta(item, 'CONVÊNIO', item.data_inicio);
                      } else {
                        checkUpdateTipoConsulta(item, 'PARTICULAR', item.data_inicio);
                      }
                    }}
                    style={{
                      display: item.faturamento_codigo_procedimento == null ? 'none' : 'flex',
                      position: 'absolute',
                      top: 0, left: 0,
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
                  <div id={"btn_lista_atendimento " + item.id_atendimento}
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
                      position: 'relative',
                      opacity: 0.9,
                    }}>
                    {moment(item.data_inicio).format('HH:mm') + ' ÀS ' + moment(item.data_termino).format('HH:mm')}
                    <div
                      style={{
                        display: item.faturamento_codigo_procedimento == null ? 'none' : 'flex',
                        position: 'absolute',
                        top: -5,
                        left: -5,
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
                  </div>
                  <div
                    id={"lista_atendimento " + item.id_atendimento}
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
                          position: 'relative',
                          width: '100%',
                        }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          {pacientes.filter(
                            (valor) => valor.id_paciente == item.id_paciente
                          )
                            .map((valor) => valor.nome_paciente + ', ' + mountage(moment(valor.dn_paciente).format('DD/MM/YYYY')))}
                        </div>
                        <div style={{ textAlign: 'left' }}>
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
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div id="botão de status"
                          className='button'
                          style={{
                            display: 'flex',
                            backgroundColor: item.situacao == 3 ? '#f4d03f' : item.situacao == 4 ? '#52be80' : '#EC7063',
                            width: window.innerWidth < mobilewidth ? 100 : 150,
                            minWidth: window.innerWidth < mobilewidth ? 100 : 150,
                            height: 30, minHeight: 30, maxHeight: 30,
                            alignSelf: 'flex-end'
                          }}
                        >
                          {item.situacao == 3 ? 'AGENDADO' : item.situacao == 4 ? 'FINALIZADA' : 'CANCELADA'}
                        </div>
                        <div id='botão para cobrar faturamento'
                          className='button red'
                          style={{
                            display: window.innerWidth < mobilewidth || faturamento.filter(fat => fat.atendimento_id == item.id_atendimento && fat.codigo_tuss == '10101012').length > 0 ? 'none' : 'flex',
                            minHeight: 30, maxHeight: 30,
                            width: window.innerWidth < mobilewidth ? 50 : 150,
                            minWidth: window.innerWidth < mobilewidth ? 50 : 150,
                            alignSelf: 'flex-end'
                          }}
                          onClick={(e) => {
                            let procedimento = [];
                            let paciente = pacientes.filter(pac => pac.id_paciente == item.id_paciente);
                            setobjatendimento(item);
                            setobjpaciente(paciente.pop());
                            procedimento = allprocedimentos.filter(proc => proc.tuss_codigo == '10101012').pop();
                            console.log('## ATENDIMENTO ##');
                            localStorage.setItem('tipo_faturamento', 'ATENDIMENTO');
                            localStorage.setItem('obj_procedimento', JSON.stringify(procedimento)); // registro de procedimento TUSS relacionado ao procedimento/consulta agendado.
                            localStorage.setItem('obj_agendado', JSON.stringify(item));
                            localStorage.setItem('procedimento', 'CONSULTA MÉDICA');
                            localStorage.setItem('forma_pagamento', '');
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
                        <div id='botão para cobrar faturamento'
                          className='button green'
                          style={{
                            display: window.innerWidth > mobilewidth && faturamento.filter(fat => fat.atendimento_id == item.id_atendimento && fat.codigo_tuss == '10101012').length > 0 ? 'flex' : 'none',
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
                      <div style={{
                        display: 'flex',
                        flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
                        alignSelf: 'center'
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
                          style={{ display: item.situacao != 3 || window.innerWidth < mobilewidth ? 'none' : 'flex', width: 50, height: 50, alignSelf: 'flex-end' }}
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
                            display: faturamento.filter(fat => fat.atendimento_id == item.id_atendimento && fat.codigo_tuss == '10101012').length > 0 ? 'none' : 'flex',
                            width: 50, height: 50, alignSelf: 'flex-end'
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
                          onClick={() => {
                            geraWhatsapp(item.id_paciente, moment(item.data_inicio).format('DD/MM/YYYY - HH:mm'), selectedespecialista);
                          }}
                          style={{ display: item.situacao != 3 || window.innerWidth < mobilewidth ? 'none' : 'flex', width: 50, height: 50, alignSelf: 'flex-end' }}
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
                <div id='horários predefinidos vagos'
                  style={{
                    display:
                      moment(selectdate, 'DD/MM/YYYY') < moment().subtract(1, 'day')
                        ||
                        item.situacao != 'AGENDAMENTO'
                        ||
                        arrayatendimentos.filter(valor =>
                          (valor.situacao == 3 || valor.situacao == 10)
                          &&
                          valor.id_profissional == item.id_profissional
                          &&
                          (
                            // situação 0
                            moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') == moment(item.data_inicio).format('DD/MM/YYYY - HH:mm')
                            ||
                            moment(valor.data_termino).format('DD/MM/YYYY - HH:mm') == moment(item.data_termino).format('DD/MM/YYYY - HH:mm')
                            ||
                            // situação 1
                            (
                              moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') < moment(item.data_inicio).format('DD/MM/YYYY - HH:mm')
                              &&
                              moment(valor.data_termino).format('DD/MM/YYYY - HH:mm') > moment(item.data_inicio).format('DD/MM/YYYY - HH:mm')
                            )
                            ||
                            // situação 2
                            (
                              moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') > moment(item.data_inicio).format('DD/MM/YYYY - HH:mm')
                              &&
                              moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') < moment(item.data_termino).format('DD/MM/YYYY - HH:mm')
                            )
                            ||
                            // situação 3
                            (
                              moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') > moment(item.data_inicio).format('DD/MM/YYYY - HH:mm')
                              &&
                              moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') < moment(item.data_termino).format('DD/MM/YYYY - HH:mm')
                            )
                          )
                        ).length > 0
                        ? 'none' : 'flex',
                    margin: 0, padding: 0,
                  }}>
                  <div
                    className='button cor3'
                    style={{
                      width: 'calc(100% - 20px)',
                      display: 'flex', flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', alignSelf: 'center' }}>
                        <div style={{
                          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignContent: 'flex-start',
                          alignSelf: 'center',
                          marginLeft: 5
                        }}>
                          <div style={{ alignSelf: 'flex-start', textAlign: 'left' }}>
                            {'HORÁRIO VAGO: ' + moment(item.data_inicio).format('DD/MM/YY - HH:mm')}
                          </div>
                          <div style={{ alignSelf: 'flex-start', textAlign: 'left' }}>
                            {'PROFISSIONAL: ' + usuarios.filter(usuario => usuario.id_usuario == item.id_profissional).map(usuario => usuario.nome_usuario)}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
                        alignContent: 'flex-end'
                      }}>
                        <div
                          className='button-red'
                          style={{
                            padding: 2.5,
                            paddingLeft: 10, paddingRight: 10,
                            marginLeft: 10,
                            borderRadius: 5,
                            maxHeight: 30, minHeight: 30,
                            backgroundColor: item.faturamento_codigo_procedimento == 'PARTICULAR' ? 'rgb(82, 190, 128, 1)' : '#03aacd',
                            color: 'white',
                            fontWeight: 'bold',
                            pointerEvents: 'none',
                          }}>
                          {item.faturamento_codigo_procedimento}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                          <div
                            className='button-red'
                            onClick={() => {
                              console.log(item.id_profissional);
                              insertBloqueioAtendimento(item.id_profissional, moment(item.data_inicio).format('DD/MM/YYYY - HH:mm'));
                            }}
                            style={{
                              padding: 2.5, paddingLeft: 15, paddingRight: 15,
                              maxHeight: 30, minHeight: 30,
                            }}>
                            BLOQUEAR
                          </div>
                          <div className='button'
                            style={{
                              display: window.innerWidth < mobilewidth ? 'none' : 'flex',
                              maxHeight: 30, minHeight: 30,
                              alignSelf: 'center',
                              padding: 2.5,
                              paddingLeft: 10, paddingRight: 10,
                            }}
                            onClick={() => {
                              setviewlistapacientes(1);
                              localStorage.setItem('horario_consulta', JSON.stringify(item));
                              localStorage.setItem('retorno', 'NÃO');
                            }}
                          >
                            AGENDAR CONSULTA
                          </div>
                          <div className='button'
                            style={{
                              display: window.innerWidth < mobilewidth ? 'none' : 'flex',
                              maxHeight: 30, minHeight: 30,
                              alignSelf: 'center',
                              padding: 2.5,
                              paddingLeft: 10, paddingRight: 10,
                            }}
                            onClick={() => {
                              setviewlistapacientes(1);
                              localStorage.setItem('horario_consulta', JSON.stringify(item));
                              localStorage.setItem('retorno', 'SIM');
                            }}
                          >
                            AGENDAR RETORNO
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
                <div id='horários bloqueados'
                  className='button'
                  style={{
                    display: item.situacao == 10 ? 'flex' : 'none',
                    flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
                    justifyContent: 'space-between',
                    position: "relative",
                    backgroundColor: '#f1948ab8'
                  }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginLeft: 5 }}>
                    <div style={{ alignSelf: 'flex-start', textAlign: 'left' }}>
                      {moment(item.data_inicio).format('DD/MM/YYYY - HH:mm') + ': HORÁRIO BLOQUEADO PARA AGENDAMENTO'}
                    </div>
                    <div style={{ alignSelf: 'flex-start', textAlign: 'left' }}>
                      {'PROFISSIONAL: ' + usuarios.filter(usuario => usuario.id_usuario == item.id_profissional).map(valor => valor.nome_usuario)}
                    </div>
                  </div>
                  <div id="btn desbloquear horário de consulta"
                    title="DESBLOQUEAR HORÁRIO"
                    className="button-yellow"
                    onClick={() => deleteAtendimento(item.id_atendimento)}
                    style={{
                      display: faturamento.filter(fat => fat.atendimento_id == item.id_atendimento && fat.codigo_tuss == '10101012').length > 0 ? 'none' : 'flex',
                      minHeight: 30, height: 30, maxHeight: 30, paddingLeft: 10, paddingRight: 10, alignSelf: 'flex-end'
                    }}
                  >
                    DESBLOQUEAR
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

  // função para trocar o atendimento entre particular e convênio, direto no botão tipo de atendimento.
  const updateTipoAtendimento = (objatendimento, tipo) => {
    var obj = {
      data_inicio: objatendimento.data_inicio,
      data_termino: tipo == 'PARTICULAR' ? moment(objatendimento.data_inicio).add(cliente.tempo_consulta_particular, 'minutes') : moment(objatendimento.data_inicio).add(cliente.tempo_consulta_convenio, 'minutes'),
      problemas: objatendimento.problemas,
      id_paciente: objatendimento.id_paciente,
      id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial.
      nome_paciente: objatendimento.nome_paciente,
      leito: null,
      situacao: 3, // 3 = atendimento ambulatorial (consulta).
      id_cliente: hospital,
      classificacao: null,
      id_profissional: objatendimento.id_profissional,
      convenio_id: objatendimento.convenio_codigo,
      convenio_carteira: objatendimento.convenio_carteira,
      faturamento_codigo_procedimento: tipo,
    };
    console.log(obj);
    axios
      .post(html + "update_atendimento/" + objatendimento.id_atendimento, obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA ATUALIZADO COM SUCESSO');
        loadModdedAtendimentos(selectdate);
      });
  };

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
              checkUpdateConsultas(item, nova_data + ' - ' + nova_hora + ':' + novo_minuto);
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

  // recuperando registros de pacientes cadastrados na aplicação.
  const [arraypacientes, setarraypacientes] = useState([]);
  const [viewlistapacientes, setviewlistapacientes] = useState(0);
  function ListaDePacientes() {
    return (
      <div
        className="fundo"
        style={{ display: viewlistapacientes > 0 ? "flex" : "none" }}
      >
        <div className="main"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            width: '100vw',
            height: '100vh',
          }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div id="botão de voltar (sair do cadastro)"
              className="button-yellow"
              style={{ margin: 0, marginRight: 10, width: 50, height: 50, alignSelf: 'center' }}
              title={"VOLTAR PARA O LOGIN"}
              onClick={() => {
                setviewlistapacientes(0);
              }}
            >
              <img
                alt=""
                src={back}
                style={{
                  margin: 0,
                  height: 30,
                  width: 30,
                }}
              ></img>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '25vw' }}>
              <div className="text2">FILTRAR POR NOME DO PACIENTE</div>
              {Filter("inputFilterPacienteNome", setarraypacientes, pacientes, 'item.nome_paciente')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '25vw' }}>
              <div className="text2">FILTRAR POR NOME DA MÃE</div>
              {Filter("inputFilterMaeNome", setarraypacientes, pacientes, 'item.nome_mae_paciente')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '25vw' }}>
              <div className="text2">FILTRAR POR Nº DE PRONTUÁRIO</div>
              {Filter("inputFilterProntuario", setarraypacientes, pacientes, 'item.id_paciente.toString()')}
            </div>
          </div>
          <div className="grid"
            style={{
              marginTop: 10,
              width: '90vw',
            }}
          >
            {arraypacientes
              .sort((a, b) => (a.nome_paciente > b.nome_paciente ? 1 : -1))
              .map((item) => (
                <div
                  className="button"
                  key={"paciente " + item.id_paciente}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: 10,
                  }}
                  onClick={() => {
                    setobjpaciente(item);
                    if (viewlistapacientes == 1) {
                      insertAtendimento(item, JSON.parse(localStorage.getItem('horario_consulta')));
                    } else {
                      localStorage.setItem('obj_paciente', JSON.stringify(item));
                      setviewconvenioparticular(1);
                      // insertProcedimento(0, 0, item);
                    }
                    setviewlistapacientes(0);
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                    <div style={{ fontSize: 10, alignSelf: 'flex-end' }}>{'PRONTUÁRIO: ' + item.id_paciente}</div>
                    <div style={{
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      height: '100%',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="texto_claro">
                          {'NOME DO PACIENTE:'}
                        </div>
                        <div style={{ margin: 5, marginTop: 0, textAlign: 'left' }}>
                          {item.nome_paciente.length > 25 ? item.nome_paciente.slice(0, 25) + '...' : item.nome_paciente}
                        </div>
                        <div className="texto_claro">
                          {'DATA DE NASCIMENTO:'}
                        </div>
                        <div style={{ margin: 5, marginTop: 0, textAlign: 'left' }}>
                          {moment(item.dn_paciente).format("DD/MM/YY")}
                        </div>
                        <div className="texto_claro">
                          {'NOME DA MÃE DO PACIENTE:'}
                        </div>
                        <div style={{ margin: 5, marginTop: 0, textAlign: 'left' }}>
                          {item.nome_mae_paciente.length > 25 ? item.nome_mae_paciente.slice(0, 25) + '...' : item.nome_mae_paciente}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div
            className="text1"
            style={{
              display: arraypacientes.length == 0 ? "flex" : "none",
              width: "90vw",
              opacity: 0.5,
            }}
          >
            SEM PACIENTES CADASTRADOS NA APLICAÇÃO
          </div>
        </div>
      </div>
    );
  }

  // ## AGENDA DE EXAMES E PROCEDIMENTOS ## /
  const loadAgendaExames = () => {
    axios.get(html + 'list_agenda_exames/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setagendaexame(x);
    })
  }

  const deleteExameAgendado = (id) => {
    axios.get(html + 'delete_exames_clinicas/' + id).then(() => {
      console.log('ITEM DE EXAME AGENDADO EXCLUÍDO');
      montaArrayAgenda(selectdate);
    })
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
          {selectedprocedimento == '' ? 'EXAMES E PROCEDIMENTOS AGENDADOS ' : selectedprocedimento}
        </div>
        <div
          id="scroll de exames e procedimentos"
          className='scroll'
          style={{
            display: "flex",
            flexDirection: 'column',
            justifyContent: "flex-start",
            height: '55vh',
            width: window.innerWidth < mobilewidth ? '80vw' : '55vw',
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
                    backgroundColor: item.particular == 1 ? '#85C1E9' : '#52be80',
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
                  <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
                    justifyContent: 'space-between', width: '100%'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row'
                    }}>
                      <div id='btn status'
                        className='button'
                        style={{
                          display: 'flex',
                          backgroundColor: item.status == 0 ? '#f4d03f' : item.situacao == 1 ? '#52be80' : '#EC7063',
                          width: window.innerWidth < mobilewidth ? 100 : 150,
                          minWidth: window.innerWidth < mobilewidth ? 100 : 150,
                          height: 30, minHeight: 30, maxHeight: 30,
                          alignSelf: 'flex-end'
                        }}
                      >
                        {item.status == 0 ? 'AGENDADO' : item.situacao == 1 ? 'EXECUTADO' : item.situacao == 2 ? 'CANCELADO' : 'DESISTÊNCIA'}
                      </div>
                      <div id='botão para cobrar faturamento'
                        className='button red'
                        style={{
                          display: window.innerWidth < mobilewidth || faturamento.filter(fat => fat.procedimento_id == item.id).length > 0 ? 'none' : 'flex',
                          minHeight: 30, maxHeight: 30,
                          width: 150, alignSelf: 'flex-end'
                        }}
                        onClick={(e) => {
                          let paciente = pacientes.filter(pac => pac.id_paciente == item.id_paciente);
                          setobjpaciente(paciente.pop());
                          setobjatendimento(item);
                          console.log(paciente);
                          let convenio_paciente = pacientes.filter(pac => pac.id_paciente == item.id_paciente).map(pac => pac.convenio_nome);
                          let codigo_convenio_paciente = pacientes.filter(pac => pac.id_paciente == item.id_paciente).map(pac => pac.convenio_codigo);
                          let procedimento = [];
                          procedimento = allprocedimentos.filter(proc => proc.tuss_codigo == item.codigo_tuss).pop();

                          if (item.particular == 1 || (item.particular == 0 && allprocedimentos.filter(proc => proc.tuss_codigo == item.codigo_tuss && codigo_convenio_paciente == proc.id_operadora).length > 0)) {
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
                          } else {
                            toast(settoast, 'PROCEDIMENTO NÃO CADASTRADO PARA O CONVÊNIO ' + convenio_paciente, '#ec7063', 3000);
                          }
                        }}
                      >
                        FATURAR
                      </div>
                      <div id='botão para informar faturamento realizado'
                        className='button green'
                        style={{
                          display: window.innerWidth > mobilewidth && faturamento.filter(fat => fat.procedimento_id == item.id).length > 0 ? 'flex' : 'none',
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
                    <div style={{
                      display: window.innerWidth < mobilewidth ? 'none' : 'flex',
                      flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row'
                    }}>
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
                          geraWhatsappExame(item.id_paciente, item);
                          e.stopPropagation();
                        }}
                        style={{
                          display: item.status > 1 || window.innerWidth < mobilewidth ? 'none' : 'flex',
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
                  style={{ maxHeight: 50, alignSelf: 'flex-end', paddingLeft: 15, paddingRight: 15 }}
                  onClick={(e) => {
                    localStorage.setItem('horario_procedimento', JSON.stringify(item));
                    setviewlistapacientes(2);
                    e.stopPropagation();
                  }}
                >
                  AGENDAR PROCEDIMENTO
                </div>
              </div>
            </div>
          ))
          }
        </div >
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
            onClick={() => {
              let obj_paciente = JSON.parse(localStorage.getItem('obj_paciente'));
              if (allprocedimentos.filter(proc => proc.tuss_codigo == selectedcodigotussprocedimento && proc.nome_operadora == obj_paciente.convenio_nome).length > 0) {
                insertProcedimento(0, 1, JSON.parse(localStorage.getItem('obj_paciente')));
              } else {
                toast(settoast, 'PROCEDIMENTO NÃO CADASTRADO PARA O CONVÊNIO ' + obj_paciente.convenio_nome, '#ec7063', 3000);
              }
            }}
          >
            CONVÊNIO
          </div>
          <div className='button' style={{ width: 200 }}
            onClick={() => {
              insertProcedimento(1, 0, JSON.parse(localStorage.getItem('obj_paciente')));
            }}
          >
            PARTICULAR
          </div>
        </div>
      </div >
    )
  }

  const [selectedprocedimento, setselectedprocedimento] = useState('');
  const [selectedcodigotussprocedimento, setselectedcodigotussprocedimento] = useState('');
  const SelecionaProcedimentos = useCallback(() => {
    return (
      <div className="cor2"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          id="scroll procedimentos"
          className='scroll'
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: window.innerWidth < mobilewidth ? '80vw' : '50vw',
            alignContent: 'flex-start',
            alignSelf: 'center',
            overflowX: 'scroll',
            overflowY: 'hidden',
          }}
        >
          {allprocedimentos.filter(item => item.id_cliente == cliente.id_cliente).map(item => (
            <div
              key={'exame: ' + item.id}
              id={'btn procedimento ' + item.id}
              className={selectedprocedimento == item.tuss_rol_ans_descricao ? 'button-selected' : 'button'}
              style={{ display: 'flex', width: 150, minWidth: 150, paddingLeft: 30, paddingRight: 30 }}
              title={item.tuss_rol_ans_descricao}
              onClick={() => {
                localStorage.setItem('procedimento', item.tuss_rol_ans_descricao);
                localStorage.setItem('codigo_tuss', item.tuss_codigo);
                setselectedprocedimento(item.tuss_rol_ans_descricao);
                setselectedcodigotussprocedimento(item.tuss_codigo);
                selector("scroll procedimentos", 'btn procedimento ' + item.id, 100);
              }}
            >
              {item.tuss_rol_ans_descricao.length > 30 ? item.tuss_rol_ans_descricao.slice(0, 30) + '...' : item.tuss_rol_ans_descricao}
            </div>
          ))}
        </div>
      </div>
    )
    // eslint-disable-next-line
  }, [allprocedimentos]);

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
        <div className={agendamento == 'CONSULTAS' ? 'button-selected' : 'button'} style={{ width: 200 }}
          onClick={() => {
            setagendamento('CONSULTAS');
            localStorage.setItem('tela_agendamento', 'CONSULTAS');
          }}>
          CONSULTAS
        </div>
        <div className={agendamento == 'EXAMES' ? 'button-selected' : 'button'} style={{ width: 200 }}
          onClick={() => {
            setagendamento('EXAMES');
            localStorage.setItem('tela_agendamento', 'EXAMES');
          }}>
          PROCEDIMENTOS E EXAMES
        </div>
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
            marginTop: 5,
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
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <SelecionaProcedimentos></SelecionaProcedimentos>
              <ListaDeExamesAgendados></ListaDeExamesAgendados>
            </div>
            <SelecionaParticularConvenio></SelecionaParticularConvenio>
          </div>
        </div>
        <Pagamento></Pagamento>
        <ListaDePacientes></ListaDePacientes>
      </div>
    </div>
  )
}

export default MapaDeAgendamentos;