/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState, useCallback } from 'react';
import Context from './Context';
import axios from 'axios';
import moment from "moment";
// imagens.
import deletar from '../images/deletar.png';
import back from '../images/back.png';
import lupa from '../images/lupa.png';
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
import Pagamento from '../components/Pagamento';

function AgendamentoConsultas() {

  // context.
  const {
    pagina, setpagina,
    html,
    hospital,
    pacientes, setpacientes,
    paciente, setpaciente,
    setobjpaciente,
    setdialogo,
    setcard,
    setdono_documento,
    mobilewidth,
    usuario,
    cliente,
    agenda, setagenda,
    faturamento, setfaturamento,
    setpagamento,
    arrayatendimentos, setarrayatendimentos,
    selectdate, setselectdate,
  } = useContext(Context);

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'AGENDAMENTO DE CONSULTAS') {
      setselectdate(localStorage.getItem('selectdate'));
      loadUsuarios();
      loadPacientes();
      loadProcedimentos();
      loadAgenda();
      loadFaturamentos();
      loadAcessos();
      currentMonth();
      setTimeout(() => {
        loadModdedAtendimentos(moment().format('DD/MM/YYYY'));
      }, 2000);
    }
    // eslint-disable-next-line
  }, [pagina]);

  const [acessos_cliente, setacessos_cliente] = useState([]);
  const loadAcessos = () => {
    axios
      .get(html + "list_todos_acessos")
      .then((response) => {
        let x = response.data.rows;
        setacessos_cliente(x.filter(item => item.id_cliente == cliente.id_cliente));
      });
  }

  // history (router).
  let history = useHistory();

  var timeout = null;
  const [especialistas, setespecialistas] = useState([]);
  const [arrayespecialistas, setarrayespecialistas] = useState([]);

  const [filterespecialista, setfilterespecialista] = useState("");
  var searchespecialista = "";
  const filterEspecialista = () => {
    clearTimeout(timeout);
    document.getElementById("inputespecialista").focus();
    searchespecialista = document.getElementById("inputespecialista").value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchespecialista == "") {
        setfilterespecialista("");
        setarrayespecialistas(especialistas);
        document.getElementById("inputespecialista").value = "";
        setTimeout(() => { document.getElementById("inputespecialista").focus() }, 100);
      } else {
        setfilterespecialista(document.getElementById("inputespecialista").value.toUpperCase());
        if (especialistas.filter((item) => item.nome_usuario.includes(searchespecialista)).length > 0) {
          setarrayespecialistas(especialistas.filter((item) => item.nome_usuario.includes(searchespecialista)));
          setTimeout(() => {
            document.getElementById("inputespecialista").value = searchespecialista;
            document.getElementById("inputespecialista").focus()
          }, 100)
        } else {
          setarrayespecialistas(especialistas.filter((item) => item.tipo_usuario != null && item.tipo_usuario.includes(searchespecialista)));
          setTimeout(() => {
            document.getElementById("inputespecialista").value = searchespecialista;
            document.getElementById("inputespecialista").focus()
          }, 100)
        }
      };
    }, 1000);
  };
  // filtro de paciente por nome.
  function FilterEspecialista() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
        <input
          className="input"
          autoComplete="off"
          placeholder="BUSCAR ESPECIALISTA..."
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => (e.target.placeholder = "BUSCAR ESPECIALISTA...")}
          onKeyUp={() => filterEspecialista()}
          type="text"
          id="inputespecialista"
          defaultValue={filterespecialista}
          maxLength={100}
          style={{ width: '30%' }}
        ></input>
      </div>
    );
  }

  const loadUsuarios = () => {
    axios.get(html + "list_usuarios").then((response) => {
      setespecialistas(response.data.rows);
      setarrayespecialistas(response.data.rows);
    })
  };

  const loadPacientes = () => {
    axios
      .get(html + "list_pacientes")
      .then((response) => {
        setpacientes(response.data.rows);
      });
  }

  const carregaHorarioslivres = (array_origin, data) => {
    let array = array_origin;
    agenda.filter(item => item.id_usuario == selectedespecialista.id_usuario &&
      item.dia_semana == moment(data, 'DD/MM/YYYY').format('dddd').toUpperCase()).map(item => {
        array.push(
          {
            situacao: 'AGENDAMENTO',
            id_profissional: selectedespecialista.id_usuario,
            data_inicio: moment(data + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'),
            data_termino: moment(data + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm'),
            faturamento_codigo_procedimento: moment(data + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm').diff(moment(data + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'), 'minutes') == cliente.tempo_consulta_convenio ? 'CONVÊNIO' : 'PARTICULAR',
          }
        );
        return null;
      });
    setarrayatendimentos(array);
  }

  const loadModdedAtendimentos = (item) => {
    // carregando os atendimentos já registrados.
    setarrayatendimentos([]);
    axios
      .get(html + "list_consultas/" + 5) // 5 corresponde ao id da unidade "AMBULATÓRIO".
      .then((response) => {
        var x = response.data.rows;
        var y = x.filter(item => item.id_unidade == 5);
        if (window.innerWidth > mobilewidth) {
          carregaHorarioslivres(y, item);
        } else {
          setarrayatendimentos(y.filter(atendimento => atendimento.id_profissional == usuario.id));
        }
      });
  };

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

  // checando se há consultas já agendadas para o horário selecionado para inserir atendimento.
  const checkConsultas = (data_inicio) => {

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
      modal(setdialogo, 'JÁ EXISTE UMA CONSULTA AGENDADA PARA ESTE HORÁRIO, CONFIRMAR ESTE NOVO AGENDAMENTO?', insertAtendimento, inicio);
    } else {
      insertAtendimento(inicio);
    }
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

  const insertAtendimento = (inicio) => {
    var obj = null;
    console.log(localStorage.getItem('retorno'));
    let retorno = localStorage.getItem('retorno');
    if (retorno == 'SIM') {
      obj = {
        data_inicio: moment(inicio, 'DD/MM/YYYY - HH:mm'),
        data_termino: moment(inicio, 'DD/MM/YYYY - HH:mm').add(15, 'minutes'),
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
    } else {
      obj = {
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
    }
    axios
      .post(html + "insert_consulta", obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA INSERIDO COM SUCESSO')
        loadModdedAtendimentos(selectdate);
        // geraWhatsapp(paciente.id_paciente, inicio, selectedespecialista);
      });
  };

  const insertBloqueioAtendimento = (inicio) => {
    var obj = {
      data_inicio: moment(inicio, 'DD/MM/YYYY - HH:mm'),
      data_termino: localStorage.getItem('PARTICULAR') == 'PARTICULAR' ? moment(inicio, 'DD/MM/YYYY - HH:mm').add(cliente.tempo_consulta_particular, 'minutes') : moment(inicio, 'DD/MM/YYYY - HH:mm').add(cliente.tempo_consulta_convenio, 'minutes'),
      problemas: null,
      id_paciente: null,
      id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial.
      nome_paciente: null,
      leito: null,
      situacao: 10, // 10 = horário bloqueado para consulta.
      id_cliente: hospital,
      classificacao: null,
      id_profissional: selectedespecialista.id_usuario,
      convenio_id: null,
      convenio_carteira: null,
      faturamento_codigo_procedimento: null,
    };
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
        // geraWhatsapp(item.id_paciente, inicio, selectedespecialista);
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

  const [selectedespecialista, setselectedespecialista] = useState([]);
  function ListaDeEspecialistas() {
    return (
      <div id="scroll especiaistas"
        className='grid'
        style={{
          display: selectedespecialista.length == 0 ? 'grid' : 'none',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation(e)}
      >
        {arrayespecialistas.filter(item => item.tipo_usuario != 'ADMINISTRATIVO' && acessos_cliente.filter(acesso => acesso.id_usuario == item.id_usuario).length > 0)
          .sort((a, b) => (a.nome_usuario > b.nome_usuario ? 1 : -1))
          .map((item) => (
            <div
              key={"usuarios " + Math.random()}
              style={{
                display: arrayespecialistas.length > 0 && item.tipo_usuario != 'ADMINISTRATIVO' ? "flex" : "none",
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                height: 200,
                width: 'calc(100% - 20px)',
              }}
              className="button"
              id={"usuario " + item.id_usuario}
              onClick={() => {
                setselectedespecialista(item);
                localStorage.setItem('id_especialista', item.id_usuario);
                setviewconsultas(1);
              }}
            >
              <div
                className='button-green'
                style={{ width: 'calc(100% - 20px)', backgroundColor: '#004c4c80' }}
              >
                {item.tipo_usuario}
              </div>
              <div style={{ margin: 5, marginTop: 10, marginBottom: 0, textAlign: 'left', opacity: 0.6 }}>
                {'PROFISSIONAL:'}
              </div>
              <div style={{ margin: 5, marginTop: 0, textAlign: 'left' }}>
                {item.nome_usuario.length > 25 ? item.nome_usuario.slice(0, 25) + '...' : item.nome_usuario}
              </div>
              <div style={{ margin: 5, marginTop: 5, marginBottom: 0, textAlign: 'left', opacity: 0.6 }}>
                {'CONSELHO:'}
              </div>
              <div style={{ margin: 5, marginTop: 0, textAlign: 'left' }}>
                {item.conselho + ' - ' + item.n_conselho}
              </div>
            </div>
          ))
        }

        <div
          className="text1"
          style={{
            display: arrayespecialistas.length == 0 ? "flex" : "none",
            width: '100%',
            opacity: 0.5,
          }}
        >
          SEM USUÁRIOS CADASTRADOS NA APLICAÇÃO
        </div>
      </div >
    );
  };

  const [viewconsultas, setviewconsultas] = useState(0);
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
                  localStorage.setItem('selectdate', item);
                  carregaHorarioslivres(agenda, item);
                  loadModdedAtendimentos(item);
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
                    display: 'flex',
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

  const ListaDeAtendimentos = useCallback(() => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: "column",
          alignSelf: 'center',
        }}
      >
        <div
          id="scroll atendimentos com pacientes"
          className='scroll'
          style={{
            display: arrayatendimentos.filter(item => moment(item.data_inicio).format('DD/MM/YYYY') == selectdate && (item.situacao > 2 || item.situacao == 'AGENDAMENTO') && item.id_profissional == selectedespecialista.id_usuario).length > 0 ? "flex" : "none",
            // display: 'none',
            flexDirection: 'column',
            justifyContent: "flex-start",
            height: '80vh',
            width: '55vw',
            marginLeft: 20
          }}
        >
          {arrayatendimentos
            .filter(item => moment(item.data_inicio).format('DD/MM/YYYY') == selectdate && (item.situacao > 2 || item.situacao == 'AGENDAMENTO') && item.id_profissional == selectedespecialista.id_usuario)
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
                            backgroundColor: item.situacao == 3 ? '#f4d03f' : item.situacao == 4 ? '#52be80' : '#EC7063', width: 150, minWidth: 150, height: 30, minHeight: 30, maxHeight: 30,
                            alignSelf: 'flex-end'
                          }}
                        >
                          {item.situacao == 3 ? 'AGENDADO' : item.situacao == 4 ? 'FINALIZADA' : 'CANCELADA'}
                        </div>
                        <div id='botão para cobrar faturamento'
                          className='button red'
                          style={{
                            display: faturamento.filter(fat => fat.atendimento_id == item.id_atendimento && fat.codigo_tuss == '10101012').length > 0 ? 'none' : 'flex',
                            minHeight: 30, maxHeight: 30,
                            width: 150, alignSelf: 'flex-end'
                          }}
                          onClick={(e) => {
                            let procedimento = [];
                            procedimento = allprocedimentos.filter(proc => proc.tuss_codigo == '10101012').pop();
                            console.log('## ATENDIMENTO ##');
                            console.log(item);
                            localStorage.setItem('tipo_faturamento', 'ATENDIMENTO');
                            localStorage.setItem('obj_procedimento', JSON.stringify(procedimento)); // registro de procedimento TUSS relacionado ao procedimento/consulta agendado.
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
                        <div id='botão para cobrar faturamento'
                          className='button green'
                          style={{
                            display: faturamento.filter(fat => fat.atendimento_id == item.id_atendimento && fat.codigo_tuss == '10101012').length > 0 ? 'flex' : 'none',
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
                      <div style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center' }}>
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
                          style={{ display: item.situacao != 3 ? 'none' : 'flex', width: 50, height: 50, alignSelf: 'flex-end' }}
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
                          valor.id_profissional == selectedespecialista.id_usuario
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
                    <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center' }}>
                      <div style={{ alignSelf: 'center', textAlign: 'left' }}>
                        {'HORÁRIO VAGO: ' + moment(item.data_inicio).format('HH:mm')}
                      </div>
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
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                      <div
                        className='button-red'
                        onClick={() => insertBloqueioAtendimento(moment(item.data_inicio).format('DD/MM/YYYY - HH:mm'))}
                        style={{
                          padding: 2.5, paddingLeft: 15, paddingRight: 15,
                          maxHeight: 30, minHeight: 30,
                        }}>
                        BLOQUEAR
                      </div>
                      <div
                        className='button'
                        onClick={() => checkConsultas(moment(item.data_inicio).format('DD/MM/YYYY - HH:mm'))}
                        style={{
                          padding: 2.5, paddingLeft: 15, paddingRight: 15,
                          maxHeight: 30, minHeight: 30,
                        }}>
                        AGENDAR CONSULTA
                      </div>
                    </div>
                  </div>
                </div>
                <div id='horários bloqueados'
                  className='button'
                  style={{
                    display: item.situacao == 10 ? 'flex' : 'none',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    position: "relative",
                    backgroundColor: '#f1948ab8'
                  }}>
                  <div style={{ marginLeft: 5 }}>
                    {moment(item.data_inicio).format('HH:mm') + ': HORÁRIO BLOQUEADO PARA AGENDAMENTO'}
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
        <div id="scroll atendimento vazio"
          className='scroll'
          style={{
            display: arrayatendimentos.filter(item => moment(item.data_inicio).format('DD/MM/YYYY') == selectdate && (item.situacao > 2 || item.situacao == 'AGENDAMENTO') && item.id_profissional == selectedespecialista.id_usuario).length == 0 ? "flex" : "none",
            flexDirection: 'column',
            justifyContent: "center",
            height: '80vh',
            width: '55vw',
            marginLeft: 20
          }}
        >
          <img
            className='lupa'
            alt=""
            src={lupa}
            style={{
              margin: 10,
              height: 150,
              width: 150,
              opacity: 0.1,
              alignSelf: 'center'
            }}
          ></img>
        </div>
      </div >
    );
    // eslint-disable-next-lin
  }, [arrayatendimentos, selectedespecialista, selectdate]);

  /*
  ## SITUAÇÃO DOS ATENDIMENTOS (CONSULTAS):
  3 = ATENDIMENTO ATIVO.
  4 = ATENDIMENTO FINALIADO.
  5 = ATENDAMENTO CANCELADO.
  */

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
          <div className='text1' style={{ marginTop: 0 }}>{'DATA: ' + selectdate + ' - PROFISSIONAL: ' + selectedespecialista.nome_usuario}</div>
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

  // agenda de consultas (horários predefinidos).
  const loadAgenda = () => {
    axios.get(html + "list_agenda").then((response) => {
      let x = response.data.rows;
      setagenda(x);
      setarrayatendimentos([]);
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

  const loadFaturamentos = () => {
    axios.get(html + 'list_faturamento_clinicas/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setfaturamento(x);
      console.log('LISTA DE FATURAMENTOS CARREGADA');
    })
  }

  return (
    <div id="tela de agendamento das consultas"
      className='main cor2'
      style={{
        display: pagina == 'AGENDAMENTO DE CONSULTAS' ? 'flex' : 'none',
      }}
    >
      <div
        className="chassi scroll"
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
                history.push("/consultas");
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
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', justifyContent: 'flex-start',
            alignItems: 'flex-start', textAlign: 'left', alignSelf: 'flex-start',
            marginTop: 10, marginBottom: 10,
          }}>
          <div className='text1' style={{
            fontSize: 18, justifyContent: 'flex-start', alignSelf: 'flex-start',
            textAlign: 'left',
            margin: 0,
            marginTop: 5
          }}>
            {'AGENDAMENTO DE CONSULTA PARA ' + paciente.nome_paciente + ' - DN: ' + moment(paciente.dn_paciente).format('DD/MM/YYYY - ') + mountage(moment(paciente.dn_paciente).format('DD/MM/YYYY'))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'center' }}>
            <div className='text1' style={{ fontSize: 14, margin: 0, alignSelf: 'center' }}>
              {selectedespecialista.nome_usuario == undefined ? 'SELECIONE ABAIXO UM PROFISSIONAL PARA A CONSULTA' : selectedespecialista.tipo_usuario != null ? 'PROFISSIONAL SELECIONADO: ' + selectedespecialista.nome_usuario + ' - ' + selectedespecialista.tipo_usuario : 'PROFISSIONAL SELECIONADO: ' + selectedespecialista.nome_usuario + ' - ESPECIALIDADE NÃO REGISTRADA'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
          <FilterEspecialista></FilterEspecialista>
          <ListaDeEspecialistas></ListaDeEspecialistas>
          <div
            className="fundo"
            style={{ display: viewconsultas == 1 ? "flex" : "none" }}
            onClick={() => { setviewconsultas(0); setselectedespecialista([]) }}
          >
            <div className="janela cor2"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                width: '100%', height: '100%', borderRadius: 0,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignSelf: 'center' }}>
                  <div id="botão para sair da lista de agendamentos"
                    className="button-yellow"
                    style={{ maxHeight: 50, maxWidth: 50 }}
                    onClick={() => {
                      setviewconsultas(0);
                      setselectedespecialista([]);
                    }}>
                    <img
                      alt=""
                      src={back}
                      style={{ width: 30, height: 30 }}
                    ></img>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <div className='text1' style={{ textAlign: 'left', fontSize: 16, alignSelf: 'flex-start' }}>
                      {'AGENDAMENTO COM PROFISSIONAL: ' + selectedespecialista.nome_usuario + ' (' + selectedespecialista.tipo_usuario + ')'}
                    </div>
                    <div className='text1' style={{ textAlign: 'left', marginTop: -10, alignSelf: 'flex-start' }}>
                      {'PACIENTE: ' + paciente.nome_paciente + ' - CONSULTA: ' + localStorage.getItem('PARTICULAR')}
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'row', position: 'relative',
                  marginTop: 5,
                }}>
                <DatePicker></DatePicker>
                <ListaDeAtendimentos></ListaDeAtendimentos>
              </div>
            </div>
          </div>
        </div>
        <Pagamento></Pagamento>
        <ViewOpcoesHorarios></ViewOpcoesHorarios>
        <GuiaConsulta></GuiaConsulta>
      </div>
    </div>
  )
}

export default AgendamentoConsultas;