/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
// imagens.
import power from "../images/power.svg";
import back from "../images/back.svg";
import refresh from "../images/refresh.svg";
import flag from "../images/white_flag.svg";
import deletar from "../images/deletar.svg";
import lupa from '../images/lupa.svg';
import call from "../images/call.svg";
import clock from "../images/clock.svg";
// funções.
import toast from "../functions/toast";
import modal from "../functions/modal";
// router.
import { useHistory } from "react-router-dom";
// cards.
import Alergias from "../cards/Alergias";
import Documentos from "../cards/Documentos";
import Exames from "../cards/Exames";
import Laboratorio from "../cards/Laboratorio";
import selector from "../functions/selector";

function Consultas() {
  // context.
  const {
    html,
    unidade,
    unidades,
    usuario,
    setusuario,

    hospital,

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

    mobilewidth,

    setunidade,
    setarrayitensprescricao,
    setidprescricao,

    setdialogo,

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
            setpagina(0);
            history.push("/");
          }, 3000);
        } else {
          toast(
            settoast,
            error.response.data.message + " REINICIANDO APLICAÇÃO.",
            "black",
            3000
          );
          setTimeout(() => {
            setpagina(0);
            history.push("/");
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
        setatendimentos(x.filter(item => item.situacao == 1));
        setarrayatendimentos(x.filter(item => item.situacao == 3)); // situação 3 = consulta ambulatorial ativa. situação 4 == consulta ambulatorial encerrada.
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
            setpagina(0);
            history.push("/");
          }, 3000);
        } else {
          toast(
            settoast,
            error.response.data.message + " REINICIANDO APLICAÇÃO.",
            "black",
            3000
          );
          setTimeout(() => {
            setpagina(0);
            history.push("/");
          }, 3000);
        }
      });
  };

  // recuperando lista de prescrições.
  const loadItensPrescricao = (atendimento) => {
    axios.get(html + 'list_itens_prescricoes/' + atendimento).then((response) => {
      let x = response.data.rows;
      setprescricao(x);
      console.log(x.filter(item => item.categoria == '1. ANTIMICROBIANOS'))
    });
  }

  var timeout = null;
  useEffect(() => {
    if (pagina == -2) {
      console.log(usuario);
      setpaciente([]);
      setatendimento(null);
      loadPacientes();
      loadChamadas();
      currentMonth();
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
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignContent: 'center', width: 'calc(100% - 10px)', alignSelf: 'center',
        }}>
        <div className="text1" style={{ alignSelf: 'flex-start', margin: 0 }}>{'USUÁRIO: ' + usuario.nome_usuario.split(' ', 1)}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginBottom: 10,
          }}
        >
          <div
            className="button-yellow"
            onClick={() => {
              setpagina(0);
              history.push("/");
            }}
          >
            <img
              alt=""
              src={power}
              style={{
                height: 30,
                width: 30,
              }}
            ></img>
          </div>
          <FilterPaciente></FilterPaciente>
        </div>
      </div>
    );
  }

  const [filterpaciente, setfilterpaciente] = useState("");
  var searchpaciente = "";
  const filterPaciente = () => {
    clearTimeout(timeout);
    document.getElementById("inputPaciente").focus();
    searchpaciente = document
      .getElementById("inputPaciente")
      .value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchpaciente == "") {
        setfilterpaciente("");
        setarrayatendimentos(atendimentos);
        document.getElementById("inputPaciente").value = "";
        setTimeout(() => {
          document.getElementById("inputPaciente").focus();
        }, 100);
      } else {
        setfilterpaciente(document.getElementById("inputPaciente").value.toUpperCase());
        if (atendimentos.filter((item) => item.nome_paciente.includes(searchpaciente)).length > 0) {
          setarrayatendimentos(atendimentos.filter((item) => item.nome_paciente.includes(searchpaciente)));
          setTimeout(() => {
            document.getElementById("inputPaciente").value = searchpaciente;
            document.getElementById("inputPaciente").focus()
          }, 100)
        } else {
          setarrayatendimentos(atendimentos.filter((item) => item.leito.includes(searchpaciente)));
          setTimeout(() => {
            document.getElementById("inputPaciente").value = searchpaciente;
            document.getElementById("inputPaciente").focus()
          }, 100)
        }
      }
    }, 1000);
  };
  // filtro de paciente por nome.
  function FilterPaciente() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
        <input
          className="input cor2"
          autoComplete="off"
          placeholder={
            window.innerWidth < mobilewidth ? "BUSCAR PACIENTE..." : "BUSCAR..."
          }
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) =>
            window.innerWidth < mobilewidth
              ? (e.target.placeholder = "BUSCAR PACIENTE...")
              : "BUSCAR..."
          }
          onKeyUp={() => filterPaciente()}
          type="text"
          id="inputPaciente"
          defaultValue={filterpaciente}
          maxLength={100}
          style={{ width: '100%' }}
        ></input>
        <div
          id="botão para atualizar a lista de pacientes."
          className="button"
          style={{
            display: "flex",
            opacity: 1,
            alignSelf: "center",
          }}
          onClick={() => { loadPacientes(); setatendimento(null); }}
        >
          <img
            alt="" src={refresh}
            style={{ width: 30, height: 30 }}></img>
        </div>
      </div>
    );
  }

  // seleção de consultório para chamada de pacientes (aplicável ao PA).
  let salas = ['SALA 01', 'SALA 02', 'SALA 03', 'SALA 04', 'SALA 05']
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
    console.log(localStorage.getItem("sala"));
    if (consultorio != 'SELECIONAR SALA') {
      var obj = {
        id_unidade: unidade,
        id_paciente: item.id_paciente,
        nome_paciente: item.nome_paciente,
        id_atendimento: item.id_atendimento,
        id_sala: consultorio,
        data: moment()
      }
      console.log(obj);
      axios.post(html + 'insert_chamada/', obj).then(() => {
        axios.get(html + 'list_chamada/' + unidade).then((response) => {
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
    console.log(item);
    console.log(status);
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
    };
    axios
      .post(html + "update_atendimento/" + item.id_atendimento, obj)
      .then(() => {
        console.log('CONSULTA FINALIZADA COM SUCESSO');
        loadAtendimentos();
      });
  };

  // excluir um agendamento de consulta.
  const deleteAtendimento = (id) => {
    console.log(parseInt(id));
    axios.get(html + "delete_atendimento/" + id).then(() => {
      console.log('DELETANDO AGENDAMENTO DE CONSULTA');
      loadAtendimentos();
    });
  };

  // inserir um agendamento de consulta.
  const insertAtendimento = (inicio) => {
    var obj = {
      data_inicio: moment(inicio, 'DD/MM/YYYY - HH:mm'),
      data_termino: moment(inicio, 'DD/MM/YYYY - HH:mm').add(30, 'minutes'),
      historia_atual: null,
      id_paciente: objpaciente.id_paciente,
      id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial.
      nome_paciente: objpaciente.nome_paciente,
      leito: null,
      situacao: 3, // 3 = atendimento ambulatorial (consulta).
      id_cliente: hospital,
      classificacao: null,
      id_profissional: usuario.id,
    };
    console.log(obj);
    axios
      .post(html + "insert_consulta", obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA INSERIDO COM SUCESSO')
        loadAtendimentos();
        geraWhatsapp(inicio);
      });
  };

  // ENVIO DE MENSAGENS DE AGENDAMENTO DA CONSULTA PELO WHATSAPP.
  function geraWhatsapp(inicio) {

    const gzappy_url_envia_mensagem = "https://api.gzappy.com/v1/message/send-message/";
    const instance_id = 'L05K3GC2YX03DGWYLDKZQW5L';
    const instance_token = '2d763c00-4b6d-4842-99d7-cb32ea357a80';
    const USER_TOKEN_ID = '3a1d021d-ad34-473e-9255-b9a3e6577cf9';
    const message =
      'Olá, ' + objpaciente.nome_paciente + '!\n' +
      'Você tem uma consulta agendada pelo seu médico, Dr(a). ' + usuario.nome_usuario + ', ' + usuario.tipo_usuario + ',\n' +
      'para o dia ' + inicio + ', na CLÍNICA POMERODE.'

    const rawphone = pacientes.filter(valor => valor.id_paciente == objpaciente.id_paciente).map(item => item.telefone).pop();
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
  const ListaDeAtendimentos = useCallback(() => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: '75vh',
        }}
      >
        <div id="scroll atendimentos com pacientes"
          className="scroll"
          style={{
            display: arrayatendimentos.length > 0 ? "flex" : "none",
            justifyContent: "flex-start",
            height: window.innerWidth < mobilewidth ? '72vh' : '100%',
            width: 'calc(100% - 20px)', marginTop: 5,
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
                      className="button-yellow"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        marginRight: 0,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        minHeight: 100,
                        height: 100,
                        width: 80, minWidth: 80, maxWidth: 80,
                        backgroundColor: '#006666'
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
                          className="button-opaque"
                          style={{
                            display: 'flex',
                            margin: 2.5, marginRight: 0,
                            minHeight: 20, maxHeight: 20, minWidth: 20, maxWidth: 20,
                            backgroundColor: 'rgba(231, 76, 60, 0.8)',
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
                        height: 100,
                        width: '100%',
                      }}
                      onClick={() => {
                        setviewlista(0);
                        setunidade(parseInt(item.id_unidade));
                        setatendimento(item.id_atendimento);
                        setpaciente(parseInt(item.id_paciente));
                        setobjpaciente(pacientes.filter(valor => valor.id_paciente == item.id_paciente).pop());
                        console.log(pacientes.filter(valor => valor.id_paciente == item.id_paciente));
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
                          padding: 5
                        }}
                      >
                        {pacientes.filter(
                          (valor) => valor.id_paciente == item.id_paciente
                        )
                          .map((valor) => valor.nome_paciente)}
                        <div>
                          {moment().diff(
                            moment(
                              pacientes
                                .filter(
                                  (valor) => valor.id_paciente == item.id_paciente
                                )
                                .map((item) => item.dn_paciente)
                            ),
                            "years"
                          ) + " ANOS"}
                        </div>
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
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignContent: "center",
                          backgroundColor: "rgba(242, 242, 242)",
                          borderColor: "rgba(242, 242, 242)",
                          borderRadius: 5,
                          borderStyle: 'solid',
                          borderWidth: 3,
                          padding: 2,
                          margin: 2,
                        }}
                      >
                        <div
                          id="botão encerrar"
                          className="button"
                          title="ENCERRAR CONSULTA"
                          onClick={() => {
                            modal(setdialogo, 'TEM CERTEZA QUE DESEJA FINALIZAR A CONSULTA?', updateConsulta, [item, 4]);
                          }}
                          style={{
                            display: "flex",
                            borderColor: "#f2f2f2",
                            backgroundColor: "rgb(82, 190, 128, 1)",
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
                          className="button"
                          title="CANCELAR CONSULTA"
                          onClick={() => {
                            modal(setdialogo, 'TEM CERTEZA QUE DESEJA CANCELAR A CONSULTA?', updateConsulta, [item, 5]);
                          }}
                          style={{
                            display: "flex",
                            borderColor: "#f2f2f2",
                            backgroundColor: "#EC7063",
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
                          className="button"
                          title="AGENDAR NOVA CONSULTA"
                          onClick={() => setviewagendamento(1)}
                          style={{
                            display: "flex",
                            borderColor: "#f2f2f2",
                            backgroundColor: "rgb(82, 190, 128, 1)",
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
          className="scroll"
          style={{
            display: arrayatendimentos.length < 1 ? "flex" : "none",
            justifyContent: "flex-start",
            height: window.innerWidth < mobilewidth ? '72vh' : '100%',
            width: 'calc(100% - 20px)',
          }}
        >
          <div className="text3" style={{ opacity: 0.5 }}>
            SEM PACIENTES CADASTRADOS PARA CONSULTAS
          </div>
        </div>
      </div >
    );
    // eslint-disable-next-line
  }, [arrayatendimentos, consultorio, setarrayitensprescricao]);

  // identificação do paciente na versão mobile, na view dos cards.
  function CabecalhoPacienteMobile() {
    return (
      <div
        id="mobile_pacientes"
        style={{
          position: "sticky",
          marginTop: 0,
          top: 0,
          left: 0,
          right: 0,
          display: window.innerWidth < mobilewidth ? "flex" : "none",
          flexDirection: "row",
          justifyContent: "center",
          flex: 1,
          backgroundColor: "#f2f2f2",
          borderColor: "#f2f2f2",
          borderRadius: 5,
          zIndex: 30,
          minWidth: "calc(90vw - 10px)",
          width: "calc(90vw - 10px)",
        }}
      >
        <div
          id="botão de retorno"
          className="button-red"
          style={{
            display: window.innerWidth < mobilewidth ? "flex" : "none",
            opacity: 1,
            backgroundColor: "#ec7063",
            alignSelf: "center",
          }}
          onClick={card == "" ? () => setviewlista(1) : () => setcard(0)}
        >
          <img alt="" src={back} style={{ width: 30, height: 30 }}></img>
        </div>
        {arrayatendimentos
          .filter((item) => item.id_atendimento == atendimento)
          .map((item) => (
            <div
              className="row"
              key={"paciente selecionado " + item.id_atendimento}
              style={{
                margin: 0,
                padding: 0,
                flex: 1,
                justifyContent: "space-around",
                width: "100%",
                backgroundColor: "transparent",
              }}
            >
              <div
                className="button-grey"
                style={{
                  margin: 5,
                  marginRight: 0,
                  marginLeft: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                {item.leito}
              </div>
              <div
                className="button"
                style={{
                  flex: 1,
                  marginLeft: 0,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
              >
                <div style={{ width: "100%" }}>
                  {pacientes.filter(
                    (valor) => valor.id_paciente == item.id_paciente
                  )
                    .map((valor) => valor.nome_paciente)}
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  // carregando todas as informações do atendimento.
  const getAllData = (paciente, atendimento) => {
    // Dados relacionados ao paciente.
    // alergias.
    setbusyalergias(1);
    axios
      .get(html + "paciente_alergias/" + paciente)
      .then((response) => {
        setalergias(response.data.rows);
        setbusyalergias(0);
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
            setpagina(0);
            history.push("/");
          }, 3000);
        } else {
          toast(
            settoast,
            error.response.data.message + " REINICIANDO APLICAÇÃO.",
            "black",
            3000
          );
          setTimeout(() => {
            setpagina(0);
            history.push("/");
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

  // função busy.
  const [busyalergias, setbusyalergias] = useState(0);

  // função para renderização dos cards fechados.
  const cartao = (sinal, titulo, opcao) => {
    return (
      <div style={{ display: 'flex' }}>
        <div
          className={card == opcao ? "button red" : "button"}
          style={{
            display: "flex",
            pointerEvents: opcao == null || atendimento == null ? 'none' : 'auto',
            borderColor: "transparent",
            margin: 5,
            width: 150,
            alignSelf: 'center',
            position: 'relative',
          }}
          onClick={() => {
            setcard(opcao);
            console.log(opcao);
          }}
        >
          <div id="sinalizador de alerta."
            className="button"
            style={{
              display: sinal != null && sinal.length > 0 ? 'flex' : 'none',
              position: 'absolute', bottom: -15, right: -15,
              borderRadius: 50,
              backgroundColor: '#EC7063',
              borderStyle: 'solid',
              borderWidth: 5,
              borderColor: 'white',
              width: 20, minWidth: 20, maxWidth: 20,
              height: 20, minHeight: 20, maxHeight: 20,
            }}>!</div>
          <div style={{ margin: 0, padding: 10 }}>{titulo}</div>
        </div>
      </div>
    );
  };

  // AGENDAMENTO DE CONSULTA PELO PROFISSIONAL.
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
    console.log(arraydate);
  }
  // percorrendo datas do mês anterior.
  const previousMonth = () => {
    startdate.subtract(1, 'month');
    var x = moment(startdate);
    var y = moment(startdate).add(42, 'days');
    console.log(y);
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
    console.log(y);
    firstSunday(x, y);
    setArrayDate(x, y);
    setarraylist(arraydate);
    console.log(arraydate);
  }
  const [selectdate, setselectdate] = useState(null);
  function DatePicker() {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className={"janela scroll"}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignSelf: 'center',
          margin: 5,
          padding: 0, paddingRight: 5,
          width: window.innerWidth < 426 ? 'calc(100vw - 20px)' : 400,
          borderRadius: window.innerWidth < 426 ? 0 : 5,
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
                  mountHorarios(item);
                  e.stopPropagation()
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
                    backgroundColor: 'rgb(82, 190, 128, 1)',
                    borderWidth: 3,
                    borderStyle: 'solid',
                    borderColor: 'rgba(242, 242, 242)',
                    width: 20, height: 20,
                    position: 'absolute',
                    bottom: -5, right: -5,
                    alignContent: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                  onClick={() => setviewopcoeshorarios(1)}
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
  const ListaDeConsultas = useCallback(() => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: "column",
          alignSelf: "center",
        }}
      >
        <div id="scroll atendimentos com pacientes"
          className="scroll"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            height: "calc(100vh - 200px)",
            width: '60vw',
            margin: 5,
          }}
        >
          {arrayatendimentos
            .filter(item => item.situacao == 3 && moment(item.data_inicio).format('DD/MM/YYYY') == selectdate && item.id_profissional == usuario.id)
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
                    id={"atendimento " + item.id_atendimento}
                    className="button-grey"
                    style={{
                      flex: 1,
                      marginRight: 0,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}>
                    {moment(item.data_inicio).format('HH:mm') + ' ÀS ' + moment(item.data_termino).format('HH:mm')}
                  </div>
                  <div
                    id={"atendimento " + item.id_atendimento}
                    className="button"
                    style={{
                      flex: 3,
                      marginLeft: 0,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }}                    >
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          padding: 5,
                          alignSelf: 'center',
                          marginLeft: 10,
                        }}
                      >
                        <div style={{ marginRight: 5 }}>
                          {pacientes.filter(
                            (valor) => valor.id_paciente == item.id_paciente
                          )
                            .map((valor) => valor.nome_paciente + ', ')}
                        </div>
                        <div>
                          {moment().diff(
                            moment(
                              pacientes
                                .filter(
                                  (valor) => valor.id_paciente == item.id_paciente
                                )
                                .map((item) => item.dn_paciente)
                            ),
                            "years"
                          ) + " ANOS"}
                        </div>
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
                        style={{ width: 50, height: 50, alignSelf: 'flex-end' }}
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
                  </div>
                </div>
              </div>
            ))
          }
        </div>
        <div id="scroll atendimento vazio"
          className="scroll"
          style={{
            display: arrayatendimentos.length > 0 ? "none" : "flex",
            justifyContent: "flex-start",
            height: "calc(100vh - 200px)",
            width: '60vw',
            margin: 5,
          }}
        >
          <div className="text3" style={{ opacity: 0.5 }}>
            SELECIONE UMA DATA
          </div>
        </div>
      </div >
    );
    // eslint-disable-next-line
  }, [arrayatendimentos, selectdate]);
  const [arrayhorarios, setarrayhorarios] = useState([]);
  const mountHorarios = (selectdate) => {
    let array = [];
    let inicio = moment(selectdate, 'DD/MM/YYYY').startOf('day').add(7, 'hours');
    array.push(inicio.format('DD/MM/YYYY - HH:mm'))
    for (var i = 0; i < 24; i++) {
      array.push(inicio.add(30, 'minutes').format('DD/MM/YYYY - HH:mm'));
    }
    console.log(array);
    setarrayhorarios(array);
  }
  const [viewopcoeshorarios, setviewopcoeshorarios] = useState(0);
  const ViewOpcoesHorarios = () => {
    return (
      <div
        className="fundo"
        style={{ display: viewopcoeshorarios == 1 ? "flex" : "none" }}
        onClick={() => {
          setviewopcoeshorarios(0);
        }}
      >
        <div className="janela scroll"
          style={{
            display: 'flex', flexDirection: 'column', justifyItems: 'flex-start',
            justifyContent: 'center',
            width: 730, height: '85vh',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}>
          <div id="botão para sair da tela de seleção dos horários"
            className="button-yellow" style={{
              maxHeight: 50, maxWidth: 50,
              position: 'sticky', top: 10, right: 10, alignSelf: 'flex-end'
            }}
            onClick={() => {
              setviewopcoeshorarios(0);
            }}>
            <img
              alt=""
              src={back}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
          <div className='text1' style={{ fontSize: 18, marginBottom: 0 }}>HORÁRIOS DISPONÍVEIS</div>
          <div className='text1' style={{ marginTop: 0 }}>{'DATA: ' + selectdate + ' - PROFISSIONAL: ' + usuario.nome_usuario}</div>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {arrayhorarios.map(item => (
              <div className='button'
                style={{
                  opacity: arrayatendimentos.filter(valor => moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') == item && valor.id_profissional == usuario.id).length > 0 ? 0.3 : 1,
                  pointerEvents: arrayatendimentos.filter(valor => moment(valor.data_inicio).format('DD/MM/YYYY - HH:mm') == item).length > 0 ? 'none' : 'auto',
                  width: 100, height: 100,
                }}
                onClick={() => { insertAtendimento(item); setviewopcoeshorarios(0) }}
              >
                {moment(item, 'DD/MM/YYYY - HH:mm').format('HH:mm')}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // janela para que o médico possa agendar suas consultas.
  const [viewagendamento, setviewagendamento] = useState(0);
  function MinhasConsultas() {
    return (
      <div className="fundo"
        onClick={() => setviewagendamento(0)}
        style={{ display: objpaciente != null && viewagendamento == 1 ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'center' }}>
        <div className="janela" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div className="text1" style={{ fontSize: 16 }}>{objpaciente != null ? 'AGENDAR CONSULTA PARA ' + objpaciente.nome_paciente + '.' : ''}</div>
            <div
              id="botão de retorno"
              className="button-yellow"
              style={{
                display: "flex",
                opacity: 1,
                alignSelf: "center",
              }}
              onClick={() => setviewagendamento(0)}
            >
              <img alt="" src={back} style={{ width: 30, height: 30 }}></img>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <DatePicker></DatePicker>
            <ListaDeConsultas></ListaDeConsultas>
            <ViewOpcoesHorarios></ViewOpcoesHorarios>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="main"
      style={{ display: pagina == -2 ? "flex" : "none" }}
    >
      <div
        className="chassi"
        id="conteúdo do prontuário"
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}
      >
        <div id="usuário, botões, busca de paciente e lista de pacientes"
          style={{
            display: window.innerWidth < mobilewidth && viewlista == 0 ? "none" : "flex",
            flexDirection: 'column', justifyContent: 'space-between',
            position: 'sticky', top: 5,
            width: window.innerWidth < mobilewidth ? '90vw' : '30vw',
            height: '95%',
            alignSelf: 'center',
          }}
        >
          <Usuario></Usuario>
          <ListaDeAtendimentos></ListaDeAtendimentos>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div id="cards (cartões) fixos"
            className="scroll"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              width: '60vw', alignSelf: 'center',
              overflowX: 'scroll',
              overflowY: 'hidden',
              margin: 10,
              minHeight: 80,
              opacity: atendimento == null ? 0.5 : 1,
            }}>
            {cartao(alergias, "ALERGIAS", "card-alergias", busyalergias, 0)}
            {cartao(null, "EVOLUÇÃO", "card-documento-evolucao", null, 1)}
            {cartao(null, "RECEITA MÉDICA", "card-documento-receita", null, 1)}
            {cartao(null, "ATESTADO", "card-documento-atestado", null, 1)}
            {
              // cartao(null, 'EXAMES', 'card-documento-exame', null, 1)
            }
            {cartao(null, 'EXAMES', 'exames')}
          </div>
          <div id="conteúdo cheio (cards)"
            style={{
              display: atendimento != null && card != 0 && viewlista == 0 ? 'flex' : 'none',
              flexDirection: "row",
              justifyContent: 'center',
              alignContent: 'flex-start',
              flexWrap: "wrap",
              width: window.innerWidth < mobilewidth ? '90vw' : '65vw',
            }}
          >
            <CabecalhoPacienteMobile></CabecalhoPacienteMobile>
          </div>
          <div id="conteúdo cheio (componentes)"
            style={{
              display: 'flex',
              flexDirection: "row",
              justifyContent: 'center',
              alignContent: 'center',
              flexWrap: "wrap",
              width: window.innerWidth < mobilewidth ? '90vw' : '65vw',
            }}
          >
            <Alergias></Alergias>
            <Documentos></Documentos>
            <Exames></Exames>
            <Laboratorio></Laboratorio>
          </div>
          <div id="conteúdo vazio"
            className="lupa"
            style={{
              display: window.innerWidth < mobilewidth ? "none" : atendimento == null ? "flex" : "none",
              flexDirection: "row",
              justifyContent: 'center',
              alignSelf: 'center',
              flexWrap: "wrap",
              width: '65vw',
              height: '80vh',
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
        <MinhasConsultas></MinhasConsultas>
      </div>
    </div>
  );
}

export default Consultas;