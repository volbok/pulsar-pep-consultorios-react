/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
// imagens.
// import power from "../images/power.svg";
import back from "../images/back.png";
import flag from "../images/white_flag.png";
import lupa from '../images/lupa.png';
import call from "../images/call.png";
import clock from "../images/clock.png";
import xis from "../images/xis.png";
// funções.
import toast from "../functions/toast";
import modal from "../functions/modal";
// componentes.
import Filter from "../components/Filter";
// router.
import { useHistory } from "react-router-dom";
// cards.
import Alergias from "../cards/Alergias";
import Documentos from "../cards/Documentos";
import Exames from "../cards/Exames";
import selector from "../functions/selector";
import clearselector from "../functions/clearselector";
import mountage from "../functions/mountage";
import NotionField from "../cards/NotionField";

function Consultas() {
  // context.
  const {
    html,
    unidades,
    usuario,
    setusuario,

    settoast,
    pagina,
    setpagina,

    setpacientes,
    pacientes,
    setpaciente,
    setobjpaciente,
    objpaciente,
    atendimentos,
    setatendimentos,
    setatendimento,
    atendimento,
    setobjatendimento,

    // estados utilizados pela função getAllData (necessária para alimentar os card fechados).
    setalergias,
    alergias,
    setevolucoes,
    setarrayevolucoes,
    card, setcard,
    setprescricao,
    consultorio, setconsultorio,
    setlaboratorio,
    setlistalaboratorio,

    mobilewidth,

    setunidade,
    setarrayitensprescricao,
    setidprescricao,

    setdialogo,
    cliente,

  } = useContext(Context);

  // history (router).
  let history = useHistory();

  const refreshApp = () => {
    setusuario({
      id: 0,
      nome_usuario: "LOGOFF",
      dn_usuario: null,
      cpf_usuario: null,
      email_usuario: null,
    });
    setpagina(0);
    history.push("/");
  };
  window.addEventListener("load", refreshApp);

  // carregar lista de pacientes.
  const loadPacientes = () => {
    axios
      .get(html + "list_pacientes")
      .then((response) => {
        setpacientes(response.data.rows);
        loadAtendimentos();
        console.log("LISTA DE PACIENTES CARREGADA.");
      })
      .catch(function (error) {
        if (error.response == undefined) {
          toast(
            settoast,
            "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.",
            "black",
            3000
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          toast(
            settoast,
            error.response.data.message + " REINICIANDO APLICAÇÃO.",
            "black",
            3000
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      });
  };

  // carregar lista de atendimentos ativos para a unidade selecionada.
  const [arrayatendimentos, setarrayatendimentos] = useState([]);
  const loadAtendimentos = () => {
    axios
      .get(html + "all_atendimentos")
      .then((response) => {
        let x = response.data.rows;
        if (localStorage.getItem('agendados') == 1) {
          setatendimentos(x.filter(item => item.situacao == 3));
          setarrayatendimentos(x.filter(item => item.situacao == 3)); // situação 3 = consulta ambulatorial ativa. situação 4 == consulta ambulatorial encerrada.
        } else {
          setatendimentos(x);
          setarrayatendimentos(x);
        }
      })
      .catch(function (error) {
        if (error.response == undefined) {
          toast(
            settoast,
            "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.",
            "black",
            3000
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          toast(
            settoast,
            error.response.data.message + " REINICIANDO APLICAÇÃO.",
            "black",
            3000
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      });
  };

  // recuperando lista de prescrições.
  const loadItensPrescricao = (atendimento) => {
    axios.get(html + 'list_itens_prescricoes/' + atendimento).then((response) => {
      let x = response.data.rows;
      setprescricao(x);
    });
  }

  useEffect(() => {
    if (pagina == -2) {
      localStorage.setItem('agendados', 1);
      setcard('');
      setpaciente([]);
      setatendimento(null);
      setlistalaboratorio([]);
      loadPacientes();
      loadChamadas();
      if (consultorio == null) {
        setviewsalaselector(1);
      }
    }
    // eslint-disable-next-line
  }, [pagina]);

  // identificação do usuário.
  function Usuario() {
    return (
      <div id="identificação do usuário, filtro de pacientes e botões principais"
        style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          alignContent: 'center',
          alignSelf: 'center',
          flexWrap: 'wrap',
          marginBottom: 5,
          width: '25vw',
        }}>
        <div className="text3"
          style={{ alignSelf: 'center', margin: 0, marginTop: -2.5, color: 'white', fontSize: 16 }}>{'USUÁRIO: ' + usuario.nome_usuario.split(' ', 1)}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: 'center',
            alignContent: 'center',
            alignSelf: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div
            className="button-yellow"
            onClick={() => {
              setobjatendimento({});
              setpaciente([]);
              setatendimento(null);
              setlistalaboratorio([]);
              setpagina(0);
              history.push("/");
            }}
          >
            <img
              alt=""
              src={back}
              style={{
                height: 30,
                width: 30,
              }}
            ></img>
          </div>
          <div id="botão consultas agendadas / todas as consultas"
            className={localStorage.getItem('agendados') == 1 ? "button-selected" : "button"}
            title={localStorage.getItem('agendados') == 1 ? 'ATENDIMENTOS AGENDADOS' : 'ATENDIMENTOS ENCERRADOS'}
            onClick={() => {
              if (localStorage.getItem('agendados') == 1) {
                localStorage.setItem('agendados', 0);
                loadAtendimentos();
              } else {
                localStorage.setItem('agendados', 1);
                loadAtendimentos();
              }
            }}
          >
            <img
              alt=""
              src={clock}
              style={{
                height: 30,
                width: 30,
              }}
            ></img>
          </div>
          <div>
            {Filter('inputFilterConsulta', setarrayatendimentos, atendimentos, 'item.nome_paciente')}
          </div>
        </div>
      </div>
    );
  }

  // seleção de consultório para chamada de pacientes (aplicável ao PA).
  let salas = ['SALA 01', 'SALA 02']
  const [viewsalaselector, setviewsalaselector] = useState(0);
  function SalaSelector() {
    return (
      <div className="fundo"
        style={{ display: viewsalaselector == 1 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="janela">
          <div className="text1">SELECIONE A SALA PARA ATENDIMENTO DO PACIENTE</div>
          <div id="salas para chamada"
            style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {salas.map(item => (
              <div
                key={"btnsala " + item}
                id={"btnsala " + item}
                className="button"
                onClick={() => {
                  setconsultorio(item);
                  setviewsalaselector(0);
                  setatendimento(null);
                }}
                style={{ paddingLeft: 20, paddingRight: 20 }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // CHAMADA DE PACIENTES NA TELA DA RECEPÇÃO.
  // inserindo registro de chamada para triagem.
  const callPaciente = (item) => {
    if (consultorio != 'SELECIONAR SALA') {
      var obj = {
        id_unidade: cliente.id_cliente,
        id_paciente: item.id_paciente,
        nome_paciente: item.nome_paciente,
        id_atendimento: item.id_atendimento,
        id_sala: consultorio,
        data: moment()
      }
      axios.post(html + 'insert_chamada/', obj).then(() => {
        axios.get(html + 'list_chamada/' + cliente.id_cliente).then((response) => {
          let x = response.data.rows;
          let y = x.filter(valor => valor.id_atendimento == item.id_atendimento);
          setchamadas(response.data.rows);
          document.getElementById('contagem de chamadas do PA' + item.id_atendimento).innerHTML = y.length;
        });
      });
    } else {
      toast(settoast, 'SELECIONE UMA SALA PARA ATENDIMENTO PRIMEIRO', 'red', 2000);
    }
  }
  // recuperando o total de chamadas para a unidade de atendimento.
  const [chamadas, setchamadas] = useState([]);
  const loadChamadas = () => {
    axios.get(html + 'list_chamada/' + 5).then((response) => {
      setchamadas(response.data.rows);
    })
  }

  const updateConsulta = ([item, status]) => {
    var obj = {
      data_inicio: item.data_inicio,
      data_termino: moment(),
      problemas: item.problemas,
      id_paciente: item.id_paciente,
      id_unidade: item.id_unidade,
      nome_paciente: item.nome_paciente,
      leito: null,
      situacao: status, // 4 = consulta encerrada, 5 = consulta cancelada.
      id_cliente: item.id_cliente,
      classificacao: item.classificacao,
      id_profissional: item.id_profissional,
      convenio_id: item.convenio_codigo,
      convenio_carteira: item.convenio_carteira,
      faturamento_codigo_procedimento: item.faturamento_codigo_procedimento,
    };
    axios
      .post(html + "update_atendimento/" + item.id_atendimento, obj)
      .then(() => {
        console.log('CONSULTA FINALIZADA COM SUCESSO');
        loadAtendimentos();
      });
  };

  // ENVIO DE MENSAGENS DE AGENDAMENTO DA CONSULTA PELO WHATSAPP.
  // eslint-disable-next-line
  function geraWhatsapp(inicio) {

    const gzappy_url_envia_mensagem = "https://api.gzappy.com/v1/message/send-message/";
    const instance_id = 'L05K3GC2YX03DGWYLDKZQW5L';
    const instance_token = '2d763c00-4b6d-4842-99d7-cb32ea357a80';
    const USER_TOKEN_ID = '3a1d021d-ad34-473e-9255-b9a3e6577cf9';
    const message =
      'Olá, ' + objpaciente.nome_paciente + '!\n' +
      'Você tem uma consulta agendada pelo seu médico, Dr(a). ' + usuario.nome_usuario + ', ' + usuario.tipo_usuario + ',\n' +
      'para o dia ' + inicio + ', na CLÍNICA ' + cliente.razao_social + '.'

    const rawphone = pacientes.filter(valor => valor.id_paciente == objpaciente.id_paciente).map(item => item.telefone).pop();
    let cleanphone = rawphone.replace("(", "");
    cleanphone = cleanphone.replace(")", "");
    cleanphone = cleanphone.replace("-", "");
    cleanphone = cleanphone.replace(" ", "");
    cleanphone = "55" + cleanphone;

    fetch(gzappy_url_envia_mensagem, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user_token_id': USER_TOKEN_ID
      },
      body: JSON.stringify({
        instance_id: instance_id,
        instance_token: instance_token,
        message: [message],
        phone: [cleanphone]
      })
    })
  }

  // lista de atendimentos.
  let timeout = null;
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
      id_cliente: item.hospital,
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
        loadAtendimentos();
      });
  };
  const ListaDeAtendimentos = useCallback(() => {
    return (
      <div
        className="scroll"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          flexGrow: 1,
          width: 'calc(100% - 15px)',
        }}
      >
        <div id="scroll atendimentos com pacientes"
          style={{
            display: arrayatendimentos.length > 0 ? "flex" : "none",
            flexDirection: 'column',
            justifyContent: "flex-start",
          }}
        >
          <div className="text3">
            {unidades.filter((item) => item.id_unidade == 5).map((item) => 'UNIDADE: ' + item.nome_unidade)}
          </div>
          <div className="button" style={{ margin: 10, marginTop: 5, width: '60%', alignSelf: 'center' }}
            onClick={() => setviewsalaselector(1)}
          >
            {consultorio}
          </div>
          {
            arrayatendimentos
              .filter(item => item.id_profissional == usuario.id)
              .sort((a, b) => (moment(a.data_inicio) > moment(b.data_inicio) ? 1 : -1))
              .map((item) => (
                <div key={"pacientes" + item.id_atendimento} style={{ width: '100%' }}>
                  <div
                    className="row"
                    style={{
                      position: "relative",
                      margin: 2.5, padding: 0,
                    }}
                  >
                    <div
                      className="button"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        marginRight: 0,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        minHeight: 100,
                        width: 80, minWidth: 80, maxWidth: 80,
                        opacity: 0.9,
                      }}
                    >
                      <div
                        className="text2"
                        style={{ margin: 0, padding: 0, fontSize: 14 }}
                      >
                        {moment(item.data_inicio).format('DD/MM/YY')}
                      </div>
                      <div
                        className="text2"
                        style={{ margin: 0, padding: 0, fontSize: 14 }}
                      >
                        {moment(item.data_inicio).format('HH:mm')}
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row', flexWrap: 'wrap',
                        alignSelf: 'center',
                        margin: 5, marginBottom: 0
                      }}>
                        <div
                          className="button-true-red"
                          style={{
                            display: 'flex',
                            margin: 2.5, marginRight: 0,
                            minHeight: 20, maxHeight: 20, minWidth: 20, maxWidth: 20,
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                          }}
                          onClick={() => {
                            callPaciente(item);
                          }}
                        >
                          <img
                            alt=""
                            src={call}
                            style={{
                              margin: 0,
                              height: 20,
                              width: 20,
                            }}
                          ></img>
                        </div>
                        <div id={'contagem de chamadas do PA' + item.id_atendimento}
                          title="TOTAL DE CHAMADAS"
                          className="text1"
                          style={{
                            margin: 2.5, marginLeft: 0,
                            borderRadius: 5, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
                            backgroundColor: 'white', height: 20, width: 20
                          }}>
                          {chamadas.filter(valor => valor.id_paciente == item.id_paciente && valor.id_atendimento == item.id_atendimento).length}
                        </div>
                      </div>
                    </div>
                    <div
                      id={"atendimento " + item.id_atendimento}
                      className="button"
                      style={{
                        flex: 3,
                        marginLeft: 0,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        minHeight: 100,
                        // height: 100,
                        width: '100%',
                        justifyContent: 'flex-start',
                      }}
                      onClick={() => {
                        setviewlista(0);
                        setunidade(parseInt(item.id_unidade));
                        setatendimento(item.id_atendimento);
                        setpaciente(parseInt(item.id_paciente));
                        setobjpaciente(pacientes.filter(valor => valor.id_paciente == item.id_paciente).pop());
                        setobjatendimento(item);
                        getAllData(item.id_paciente, item.id_atendimento);
                        setidprescricao(0);
                        if (pagina == -2) {
                          selector("scroll atendimentos com pacientes", "atendimento " + item.id_atendimento, 100);
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          padding: 5,
                          alignItems: 'flex-start',
                          textAlign: 'left',
                          marginBottom: 5,
                          width: '100%',
                        }}
                      >
                        <div style={{
                          maxHeight: 20, height: 20, margin: 0,
                          backgroundColor: item.faturamento_codigo_procedimento == 'PARTICULAR' ? 'rgb(82, 190, 128, 1)' : item.faturamento_codigo_procedimento == 'CONVENIO' ? '#85c1e9' : '#af7ac5 ',
                          borderRadius: 5, padding: 2.5, paddingLeft: 5, paddingRight: 5,
                          marginBottom: 5,
                        }}>
                          {item.faturamento_codigo_procedimento != null ? item.faturamento_codigo_procedimento : 'INDEFINIDO'}
                        </div>
                        <div>
                          {pacientes.filter(
                            (valor) => valor.id_paciente == item.id_paciente
                          )
                            .map((valor) => valor.nome_paciente)}
                        </div>
                        <div style={{ display: 'flex' }}>
                          {mountage(pacientes.filter((valor) => valor.id_paciente == item.id_paciente).map((valor) => moment(valor.dn_paciente).format('DD/MM/YYYY')))}
                        </div>
                        <div style={{ display: 'none' }}>
                          {pacientes.filter((valor) => valor.id_paciente == item.id_paciente)
                            .map((valor) => moment(valor.dn_paciente).format('DD/MM/YYYY'))}
                        </div>

                        <div id={'btn_seletor_observacoes_consultas ' + item.id_atendimento}
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
                            let element = document.getElementById('input_atendimento_problemas_consultas ' + item.id_atendimento);
                            let button = document.getElementById('btn_seletor_observacoes_consultas ' + item.id_atendimento);
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
                        <textarea id={'input_atendimento_problemas_consultas ' + item.id_atendimento}
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
                              updateAtendimentoObservacao(item, document.getElementById('input_atendimento_problemas_consultas ' + item.id_atendimento).value.toUpperCase())
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
                            height: 60,
                            minHeight: 60,
                            maxHeight: 60,
                            marginBottom: 32,
                          }}
                        ></textarea>

                      </div>
                    </div>
                    <div
                      id="informações do paciente"
                      style={{
                        position: "absolute",
                        right: -5,
                        bottom: -5,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      <div id="botões para finalizar atendimento e reagendar consulta"
                        className="cor0"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignContent: "center",
                          // backgroundColor: "rgba(242, 242, 242)",
                          // borderColor: "rgba(242, 242, 242)",
                          borderRadius: 5,
                          borderStyle: 'solid',
                          borderWidth: 3,
                          padding: 2,
                          margin: 2,
                        }}
                      >
                        <div
                          id="botão encerrar"
                          className="button-true-green"
                          title="ENCERRAR CONSULTA"
                          onClick={() => {
                            modal(setdialogo, 'TEM CERTEZA QUE DESEJA FINALIZAR A CONSULTA?', updateConsulta, [item, 4]);
                          }}
                          style={{
                            display: "flex",
                            borderColor: "#f2f2f2",
                            // backgroundColor: "rgb(82, 190, 128, 1)",
                            width: 20,
                            minWidth: 20,
                            height: 20,
                            minHeight: 20,
                            margin: 0,
                            padding: 7.5,
                          }}
                        >
                          <img alt="" src={flag} style={{ width: 25, height: 25 }}></img>
                        </div>
                        <div
                          id="botão encerrar"
                          className="button-true-red"
                          title="CANCELAR CONSULTA"
                          onClick={() => {
                            modal(setdialogo, 'TEM CERTEZA QUE DESEJA CANCELAR A CONSULTA?', updateConsulta, [item, 5]);
                          }}
                          style={{
                            display: "flex",
                            borderColor: "#f2f2f2",
                            // backgroundColor: "#EC7063",
                            width: 20,
                            minWidth: 20,
                            height: 20,
                            minHeight: 20,
                            margin: 0, marginLeft: 5,
                            padding: 7.5,
                          }}
                        >
                          <img alt="" src={flag} style={{ width: 25, height: 25 }}></img>
                        </div>
                        <div
                          id="botão agendar nova consulta"
                          className="button-true-green"
                          title="AGENDAR NOVA CONSULTA"
                          onClick={() => {
                            setpaciente(pacientes.filter(valor => valor.id_paciente == item.id_paciente).pop());
                            setobjpaciente(pacientes.filter(valor => valor.id_paciente == item.id_paciente).pop());
                            setobjatendimento(item);
                            localStorage.setItem("prevScreen", 'CONSULTA');
                            setpagina(20);
                            history.push("/agendamento");
                          }}
                          style={{
                            display: "flex",
                            borderColor: "#f2f2f2",
                            // backgroundColor: "rgb(82, 190, 128, 1)",
                            width: 20,
                            minWidth: 20,
                            height: 20,
                            minHeight: 20,
                            margin: 0, marginLeft: 5,
                            padding: 7.5,
                          }}
                        >
                          <img alt="" src={clock} style={{ width: 30, height: 30 }}></img>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          }
        </div>
        <div id="scroll atendimento vazio"
          style={{
            display: arrayatendimentos.length < 1 ? "flex" : "none",
            justifyContent: "flex-start",
            width: 'calc(100% - 15px)',
            height: '100%',
          }}
        >
          <div className="text3" style={{ opacity: 0.5 }}>
            SEM PACIENTES CADASTRADOS PARA CONSULTAS
          </div>
        </div>
      </div >
    );
    // eslint-disable-next-line
  }, [usuario, unidades, atendimentos, arrayatendimentos, consultorio, setarrayitensprescricao]);

  // carregando todas as informações do atendimento.
  const getAllData = (paciente, atendimento) => {
    // Dados relacionados ao paciente.
    // alergias.
    axios
      .get(html + "paciente_alergias/" + paciente)
      .then((response) => {
        setalergias(response.data.rows);
      })
      .catch(function (error) {
        if (error.response == undefined) {
          toast(
            settoast,
            "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.",
            "black",
            3000
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          toast(
            settoast,
            error.response.data.message + " REINICIANDO APLICAÇÃO.",
            "black",
            3000
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      });
    // Dados relacionados ao atendimento.
    // antibióticos.
    loadItensPrescricao(atendimento);
    // evoluções.
    axios
      .get(html + "list_evolucoes/" + atendimento)
      .then((response) => {
        setevolucoes(response.data.rows);
        setarrayevolucoes(response.data.rows);
      })
      .catch(function (error) {
        console.log(error);
      });
    // laboratorio.
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      setlaboratorio(response.data.rows);
    })
  };

  // estado para alternância entre lista de pacientes e conteúdo do passômetro para versão mobile.
  const [viewlista, setviewlista] = useState(1);

  // função para renderização dos cards fechados.
  const cartao = (sinal, titulo, opcao) => {
    return (
      <div style={{ display: 'flex' }}>
        <div
          id={'seletor ' + titulo}
          className="button"
          style={{
            display: "flex",
            pointerEvents: opcao == null || atendimento == null ? 'none' : 'auto',
            borderColor: "transparent",
            margin: 5,
            paddingLeft: 20, paddingRight: 20,
            minWidth: 200,
            maxHeight: 30,
            alignSelf: 'center',
            position: 'relative',
          }}
          onClick={() => {
            setcard(opcao);
            selector('opcoes-tarefas', 'seletor ' + titulo, 200);
          }}
        >
          <div id="sinalizador de alerta."
            className="button"
            style={{
              display: sinal != null && sinal.length > 0 ? 'flex' : 'none',
              position: 'absolute', bottom: -10, right: -15,
              borderRadius: 50,
              backgroundColor: '#EC7063',
              borderStyle: 'solid',
              borderWidth: 5,
              borderColor: 'white',
              width: 15, minWidth: 15, maxWidth: 15,
              height: 15, minHeight: 15, maxHeight: 15,
            }}>!</div>
          <div style={{ margin: 0, padding: 10 }}>{titulo}</div>
        </div>
      </div>
    );
  };

  const [tarefas] = useState(
    [
      {
        sinal: alergias,
        nome: 'ALERGIAS',
        card: 'card-alergias'
      },
      {
        sinal: null,
        nome: 'EVOLUÇÃO',
        card: 'card-documento-evolucao'
      },
      {
        sinal: null,
        nome: 'RECEITA MÉDICA',
        card: 'card-documento-receita'
      },
      {
        sinal: null,
        nome: 'ATESTADO',
        card: 'card-documento-atestado'
      },
      {
        sinal: null,
        nome: 'SOLICITAR EXAMES (GUIAS SADT)',
        card: 'exames'
      },
      {
        sinal: null,
        nome: 'SOLICITAR EXAMES (LIVRE)',
        card: 'card-documento-exames'
      },
      {
        sinal: null,
        nome: 'LAUDOS',
        card: 'card-documento-laudo'
      },
      {
        sinal: null,
        nome: 'RELATÓRIOS',
        card: 'card-documento-relatorio'
      },
      {
        sinal: null,
        nome: 'RELATÓRIOS PLUS',
        card: 'NOTION'
      },
      {
        sinal: null,
        nome: 'RECIBOS',
        card: 'card-documento-recibo'
      },
    ]
  )
  const [arraytarefas, setarraytarefas] = useState(tarefas)

  const SeletorDeTarefas = useCallback(() => {
    return (
      <div id="cards (cartões) fixos"
        className="scroll cor2"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignSelf: 'center',
          overflowX: 'scroll',
          overflowY: 'hidden',
          margin: 0,
          marginBottom: 10,
          minHeight: 80,
          width: 'calc(100% - 15px)',
          opacity: atendimento == null ? 0.5 : 1,
        }}>
        <div
          onClick={() => {
            setcard('');
            clearselector("opcoes-tarefas", 200);
          }}
          style={{
            width: 200, minWidth: 200, maxWidth: 200,
            display: 'flex', flexDirection: 'row',
          }}>
          {Filter('inputSeletorTarefas', setarraytarefas, tarefas, 'item.nome')}
          <div id='botão para limpar o filtro.'
            className="button red"
            onClick={() => {
              setarraytarefas(tarefas);
              setTimeout(() => {
                setcard('');
                clearselector("opcoes-tarefas", 200);
                document.getElementById('inputSeletorTarefas').value = '';
                document.getElementById('inputSeletorTarefas').focus();
              }, 200);
            }}
            style={{
              borderRadius: 50,
              minWidth: 20,
              width: 20,
              maxWidth: 20,
              minHeight: 20,
              height: 20,
              maxHeight: 20,
              alignSelf: 'center',
              marginLeft: -20,
            }}>
            <img
              alt=""
              src={xis}
              style={{
                margin: 0,
                height: 20,
                width: 20,
                opacity: 1,
                alignSelf: 'center'
              }}
            ></img>
          </div>
        </div>
        <div id="opcoes-tarefas" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
          {arraytarefas.map(tarefas => cartao(tarefas.sinal, tarefas.nome, tarefas.card))}
        </div>
      </div>
    )
    //eslint-disable-next-line
  }, [arraytarefas, atendimento]);

  return (
    <div
      className="main"
      style={{ display: pagina == -2 ? "flex" : "none" }}
    >
      <div
        className="chassi"
        id="conteúdo do prontuário"
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          width: 'calc(100vw - 20px)',
        }}
      >
        <div id="usuário, botões, busca de paciente e lista de pacientes"
          style={{
            display: window.innerWidth < mobilewidth && viewlista == 0 ? "none" : "flex",
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'sticky', top: 0,
            margin: 0,
            marginRight: 5,
            width: window.innerWidth < 800 ? '30vw' : '25vw',
            height: 'calc(100vh - 20px)',
            alignSelf: 'center'

          }}
        >
          <Usuario></Usuario>
          <ListaDeAtendimentos></ListaDeAtendimentos>
        </div>
        <div
          style={{
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-end',
            marginLeft: 5,
            width: window.innerWidth < 800 ? '65vw' : 'calc(75vw - 30px)',
            height: 'calc(100vh - 20px)',
            alignSelf: 'center',
          }}>
          <SeletorDeTarefas></SeletorDeTarefas>
          <div id="conteúdo cheio (componentes)"
            style={{
              // display: 'flex',
              display: card == '' ? 'none' : 'flex',
              flexDirection: "column",
              justifyContent: 'center',
              flexWrap: "wrap",
              height: '100%',
              width: '100%',
            }}
          >
            <Alergias></Alergias>
            <Documentos></Documentos>
            <NotionField></NotionField>
            <Exames></Exames>
          </div>
          <div id="conteúdo vazio"
            className="lupa"
            style={{
              // display: 'none',
              display: window.innerWidth < mobilewidth ? "none" : card == '' ? "flex" : "none",
              flexDirection: "column",
              justifyContent: 'center',
              flexWrap: "wrap",
              height: '100%',
              width: '100%',
            }}
          >
            <img
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
        </div>
        <SalaSelector></SalaSelector>
      </div>
    </div>
  );
}

export default Consultas;