/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
// imagens.
import back from "../images/back.png";
import refresh from "../images/refresh.png";
import lupa from '../images/lupa.png';
import call from "../images/call.png";
import deletar from '../images/deletar.png';
// funções.
import toast from "../functions/toast";
import modal from "../functions/modal";
// router.
import { useHistory } from "react-router-dom";
// componentes.
import selector from "../functions/selector";

function Triagem() {
  // context.
  const {
    html,
    hospital,
    unidade,
    unidades,
    usuario,
    setusuario,

    settoast,
    pagina,
    setpagina,

    setpacientes,
    pacientes,
    setpaciente,
    atendimentos,
    setatendimentos,
    setatendimento,
    atendimento,

    consultorio, setconsultorio,

    mobilewidth,

    setunidade,
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
        setarrayatendimentos(x);
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

  var timeout = null;
  const [objpaciente, setobjpaciente] = useState(null);
  useEffect(() => {
    if (pagina == 30) {
      console.log(usuario);
      setpaciente([]);
      setatendimento(null);
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
              src={back}
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
  let salas = ['TRIAGEM 01', 'TRIAGEM 02']
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
          geraWhatsapp();
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

  // função para permitir apenas a inserção de números no input (obedecendo a valores de referência).
  const checkNumberInput = (input, min, max) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      var valor = document.getElementById(input).value;
      if (isNaN(valor) == true || valor < min || valor > max) {
        // document.getElementById(input).style.backgroundColor = 'rgb(231, 76, 60, 0.3)';
        document.getElementById(input).value = '';
        document.getElementById(input).focus();
      } else {
        classificaAutomatico();
      }
    }, 1000);
  }

  const classificaAutomatico = () => {
    if (document.getElementById("inputPas").value != '' && (document.getElementById("inputPas").value < 80 || document.getElementById("inputPas").value > 230)) {
      classificaAtendimento(atendimento, 'VERMELHO')
    } else if (document.getElementById("inputFc").value != '' && (document.getElementById("inputFc").value < 60 || document.getElementById("inputFc").value > 220)) {
      classificaAtendimento(atendimento, 'VERMELHO')
    } else if (document.getElementById("inputFr").value != '' && (document.getElementById("inputFr").value < 10 || document.getElementById("inputFr").value > 30)) {
      classificaAtendimento(atendimento, 'VERMELHO')
    } else if (document.getElementById("inputSao2").value != '' && document.getElementById("inputSao2").value < 85) {
      classificaAtendimento(atendimento, 'VERMELHO')
    } else if (document.getElementById("inputGlicemia").value != '' && document.getElementById("inputGlicemia").value < 60) {
      classificaAtendimento(atendimento, 'VERMELHO')
    } else if (document.getElementById("inputGlasgow").value != '' && document.getElementById("inputGlasgow").value < 10) {
      classificaAtendimento(atendimento, 'VERMELHO')
    } else if (document.getElementById("inputPas").value != '' && document.getElementById("inputPas").value > 180 && document.getElementById("inputPas").value < 231) {
      classificaAtendimento(atendimento, 'LARANJA')
    } else if (document.getElementById("inputFc").value != '' && document.getElementById("inputFc").value > 150 && document.getElementById("inputFc").value < 221) {
      classificaAtendimento(atendimento, 'LARANJA')
    } else if (document.getElementById("inputFr").value != '' && document.getElementById("inputFr").value > 25) {
      classificaAtendimento(atendimento, 'LARANJA')
    } else if (document.getElementById("inputSao2").value != '' && document.getElementById("inputSao2").value < 91 && document.getElementById("inputSao2").value > 84) {
      classificaAtendimento(atendimento, 'LARANJA')
    } else if (document.getElementById("inputGlicemia").value != '' && document.getElementById("inputGlicemia").value > 350) {
      classificaAtendimento(atendimento, 'LARANJA')
    } else if (document.getElementById("inputGlasgow").value != '' && document.getElementById("inputGlasgow").value < 14 && document.getElementById("inputGlasgow").value > 9) {
      classificaAtendimento(atendimento, 'LARANJA')
    } else {
      classificaAtendimento(atendimento, null);
    }
  }

  const [classificacao, setclassificacao] = useState(null);
  const classificaAtendimento = (item, classificacao) => {
    console.log(item.id_atendimento);
    var obj = {
      data_inicio: item.data_inicio,
      data_termino: null,
      problemas: item.problemas,
      id_paciente: item.id_paciente,
      id_unidade: item.id_unidade,
      nome_paciente: item.nome_paciente,
      leito: null,
      situacao: 0,
      id_cliente: item.id_cliente,
      classificacao: classificacao
    };
    console.log(obj);
    axios.post(html + "update_atendimento/" + item.id_atendimento, obj).then(() => {
      console.log('ATENDIMENTO CLASSIFICADO COM SUCESSO');
      setclassificacao(classificacao);
    });
  }

  const arrayclassificacao = ['AZUL', 'VERDE', 'AMARELO', 'LARANJA', 'VERMELHO'];
  function BotoesClassificacao() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        backgroundColor: '#FFFFFF', borderRadius: 5,
        padding: 10, marginTop: 10,
      }}>
        <div className="text1">OU SELECIONE MANUALMENTE A CLASSIFICAÇÃO</div>
        <div id="classificação" style={{
          display: 'flex', flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap', alignSelf: 'center',
        }}>
          {arrayclassificacao.map((item) => (
            <div
              id={"clasifica " + item}
              className="button-classifica-fade"
              onClick={() => {
                classificaAtendimento(atendimento, item)
                selector("classificação", "clasifica " + item, 1000);
              }}
              style={{
                color: item == 'AMARELO' ? 'rgb(97, 99, 110, 1)' : '',
                fontSize: 12,
                width: 150,
                backgroundColor:
                  item == 'AZUL' ? '#85C1E9' :
                    item == 'VERDE' ? 'rgb(82, 190, 128, 1)' :
                      item == 'AMARELO' ? '#F9E79F' :
                        item == 'LARANJA' ? '#F8C471' :
                          item == 'VERMELHO' ? '#EC7063' : ''
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const updateAtendimento = (item, classificacao) => {
    var obj = {
      data_inicio: atendimento.data_inicio,
      data_termino: null,
      problemas: atendimento.problemas,
      id_paciente: parseInt(atendimento.id_paciente),
      id_unidade: item,
      nome_paciente: atendimento.nome_paciente,
      leito: 'F',
      situacao: 1,
      id_cliente: hospital,
      classificacao: classificacao,
    };
    console.log(obj);
    axios.post(html + "update_atendimento/" + atendimento.id_atendimento, obj).then(() => {
      toast(settoast, 'PACIENTE ENCAMINHADO COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadAtendimentos();
      limpaTela();
    });
  };

  const deleteTriagem = (item) => {
    axios.get(html + 'delete_atendimento/' + item.id_atendimento).then(() => {
      loadAtendimentos();
      limpaTela();
    })
  }

  const limpaTela = () => {
    setatendimento(null);
    setclassificacao(null);
    document.getElementById("inputPas").value = '';
    document.getElementById("inputPad").value = '';
    document.getElementById("inputFc").value = '';
    document.getElementById("inputFr").value = '';
    document.getElementById("inputSao2").value = '';
    document.getElementById("inputTax").value = '';
    document.getElementById("inputGlicemia").value = '';
    document.getElementById("inputGlasgow").value = '';
  }

  function ClassificacaoAtual() {
    return (
      <div
        style={{
          display: classificacao != null ? 'flex' : 'none',
          flexDirection: 'column', justifyContent: 'center'
        }}
      >
        <div className="text1">CLASSIFICAÇÃO INDICADA</div>
        <div className="button"
          style={{
            color: classificacao == 'AMARELO' ? 'rgb(97, 99, 110, 1)' : '',
            backgroundColor:
              classificacao == 'AZUL' ? '#85C1E9' : classificacao == 'VERDE' ? 'rgb(82, 190, 128, 1)' : classificacao == 'AMARELO' ? '#F9E79F' : classificacao == 'LARANJA' ? '#F8C471' : classificacao == 'VERMELHO' ? '#EC7063 ' : '#CCD1D1',
            padding: 10, paddingLeft: 20, paddingRight: 20, marginTop: 0,
            width: 100,
            borderColor: 'white', borderStyle: 'solid', borderWidth: 5,
            alignSelf: 'center',
          }}
        >
          {classificacao}
        </div>
        <div className="text1">SELECIONE O SETOR DE DESTINO DO PACIENTE</div>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {unidades.map(item => (
            <div
              className="button"
              style={{
                display: item.nome_unidade == 'TRIAGEM' ? 'none' : 'flex',
                paddingLeft: 20, paddingRight: 20, width: 150
              }}
              onClick={() => updateAtendimento(item.id_unidade, classificacao)}
            >
              {item.nome_unidade}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ENVIO DE MENSAGENS DE AGENDAMENTO DA CONSULTA PELO WHATSAPP.
  function geraWhatsapp() {
    const gzappy_url_envia_mensagem = "https://api.gzappy.com/v1/message/send-message/";
    const instance_id = 'L05K3GC2YX03DGWYLDKZQW5L';
    const instance_token = '2d763c00-4b6d-4842-99d7-cb32ea357a80';
    const USER_TOKEN_ID = '3a1d021d-ad34-473e-9255-b9a3e6577cf9';
    const message =
      'Olá, ' + objpaciente.nome_paciente + '!\n' +
      'Você foi chamado para acolhimento na triagem, pelo profissional ' + usuario.nome_usuario + ', ' + usuario.tipo_usuario + ',\n' +
      '.'
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
        }}
      >
        <div id="scroll atendimentos com pacientes"
          className="scroll"
          style={{
            display: arrayatendimentos.length > 0 ? "flex" : "none",
            justifyContent: "flex-start",
            height: window.innerWidth < mobilewidth ? '70vh' : '75vh',
            width: 'calc(100% - 20px)',
          }}
        >
          <div className="text3">
            {'TRIAGEM'}
          </div>
          <div className="button" style={{ margin: 10, marginTop: 5, width: '60%', alignSelf: 'center' }}
            onClick={() => setviewsalaselector(1)}
          >
            {consultorio}
          </div>
          {arrayatendimentos.filter(item => item.id_unidade == unidade)
            .sort((a, b) => (moment(a.datainicio) > moment(b.datainicio) ? 1 : -1))
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
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
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
                      setatendimento(item);
                      setpaciente(parseInt(item.id_paciente));
                      setobjpaciente(item);
                      setidprescricao(0);
                      if (pagina == 30) {
                        selector("scroll atendimentos com pacientes", "atendimento " + item.id_atendimento, 100);
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        padding: 5, width: '100%',
                      }}
                    >
                      {item.nome_paciente}
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
                    <div id="botão para excluir registro de triagem"
                      className='button-yellow'
                      style={{
                        width: 35, minWidth: 35, maxWidth: 35,
                        height: 35, minHeight: 35, maxHeight: 35,
                        marginRight: 5
                      }}
                      onClick={() => modal(setdialogo, 'TEM CERTEZA QUE DESEJA RETIRAR O PACIENTE DA TRIAGEM?', deleteTriagem, item)}
                    >
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
                    id="informações do paciente"
                    style={{
                      position: "absolute",
                      right: -5,
                      bottom: -5,
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div id="scroll atendimento vazio"
          className="scroll"
          style={{
            display: arrayatendimentos.length < 1 ? "flex" : "none",
            justifyContent: "flex-start",
            height: window.innerWidth < mobilewidth ? '70vh' : '75vh',
            width: 'calc(100% - 20px)',
          }}
        >
          <div className="text3" style={{ opacity: 0.5 }}>
            SEM PACIENTES CADASTRADOS PARA ESTA UNIDADE
          </div>
        </div>
      </div >
    );
    // eslint-disable-next-line
  }, [arrayatendimentos, consultorio]);

  // estado para alternância entre lista de pacientes e conteúdo do passômetro para versão mobile.
  const [viewlista, setviewlista] = useState(1);

  return (
    <div
      className="main"
      style={{ display: pagina == 30 ? "flex" : "none" }}
    >
      <div
        className="chassi scroll"
        id="conteúdo do prontuário"
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
      >
        <div id="usuário, botões, busca de paciente e lista de pacientes"
          style={{
            display: window.innerWidth < mobilewidth && viewlista == 0 ? "none" : "flex",
            flexDirection: 'column', justifyContent: 'space-between',
            position: 'sticky', top: 5,
            width: window.innerWidth < mobilewidth ? '90vw' : '30vw',
            minWidth: window.innerWidth < mobilewidth ? '90vw' : '30vw',
            maxWidth: window.innerWidth < mobilewidth ? '90vw' : '30vw',
            height: 'calc(100% - 10px)',
          }}
        >
          <Usuario></Usuario>
          <ListaDeAtendimentos></ListaDeAtendimentos>
        </div>
        <div id="conteúdo cheio"
          style={{
            display: atendimento != null ? 'flex' : 'none',
            flexDirection: "row",
            justifyContent: 'center',
            alignContent: 'flex-start',
            flexWrap: "wrap",
            width: '100%',
            marginLeft: 2.5,
          }}
        >
          <div style={{ width: '60vw' }}>
            <div className='text1'>INFORME OS DADOS VITAIS PARA CLASSIFICAÇÃO AUTOMÁTICA</div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1'>PAS</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="PAS"
                  inputMode='numeric'
                  onKeyUp={() => checkNumberInput("inputPas", 50, 250)}
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'PAS')}
                  style={{
                    width: window.inenrWidth < mobilewidth ? '70vw' : '10vw',
                    margin: 5,
                  }}
                  type="text"
                  id="inputPas"
                  maxLength={3}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1'>PAD</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="PAD"
                  inputMode='numeric'
                  onKeyUp={() => checkNumberInput("inputPad", 30, 230)}
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'PAD')}
                  style={{
                    width: window.inenrWidth < mobilewidth ? '70vw' : '10vw',
                    margin: 5,
                  }}
                  type="text"
                  id="inputPad"
                  maxLength={3}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1'>FC</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="FC"
                  inputMode='numeric'
                  onKeyUp={() => checkNumberInput("inputFc", 20, 350)}
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'FC')}
                  style={{
                    width: window.inenrWidth < mobilewidth ? '70vw' : '10vw',
                    margin: 5,
                  }}
                  type="text"
                  id="inputFc"
                  maxLength={3}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1'>FR</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="FR"
                  inputMode='numeric'
                  onKeyUp={() => checkNumberInput("inputFr", 8, 60)}
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'FR')}
                  style={{
                    width: window.inenrWidth < mobilewidth ? '70vw' : '10vw',
                    margin: 5,
                  }}
                  type="text"
                  id="inputFr"
                  maxLength={2}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1'>SAO2</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="SAO2"
                  inputMode='numeric'
                  onKeyUp={() => checkNumberInput("inputSao2", 30, 101)}
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'SAO2')}
                  style={{
                    width: window.inenrWidth < mobilewidth ? '70vw' : '10vw',
                    margin: 5,
                  }}
                  type="text"
                  id="inputSao2"
                  maxLength={3}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1'>TAX</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="TAX"
                  inputMode='numeric'
                  onKeyUp={(e) => {
                    if (isNaN(e.target.value) == false && Number.isInteger(e.target.value) == false) {
                      console.log('VALOR VÁLIDO');
                    } else {
                      document.getElementById('inputTax').value = '';
                      document.getElementById('inputTax').focus();
                    }
                  }}
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'TAX')}
                  style={{
                    width: window.inenrWidth < mobilewidth ? '70vw' : '10vw',
                    margin: 5,
                  }}
                  type="text"
                  id="inputTax"
                  maxLength={4}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1'>GLICEMIA</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="GLICEMIA"
                  inputMode='numeric'
                  onKeyUp={() => checkNumberInput("inputGlicemia", 0, 900)}
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'GLICEMIA')}
                  style={{
                    width: window.inenrWidth < mobilewidth ? '70vw' : '10vw',
                    margin: 5,
                  }}
                  type="text"
                  id="inputGlicemia"
                  maxLength={3}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1'>GLASGOW</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="GLASGOW"
                  inputMode='numeric'
                  onKeyUp={() => checkNumberInput("inputGlasgow", -3, 15)}
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'GLASGOW')}
                  style={{
                    width: window.inenrWidth < mobilewidth ? '70vw' : '10vw',
                    margin: 5,
                  }}
                  type="text"
                  id="inputGlasgow"
                  maxLength={2}
                ></input>
              </div>
            </div>
            <BotoesClassificacao></BotoesClassificacao>
            <ClassificacaoAtual></ClassificacaoAtual>
          </div>
        </div>
        <div id="conteúdo vazio"
          style={{
            display: atendimento == null ? 'flex' : 'none',
            flexDirection: "row",
            justifyContent: 'center',
            flexWrap: "wrap",
            width: '100%',
            marginLeft: 2.5,
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
        <SalaSelector></SalaSelector>
      </div>
    </div>
  );
}

export default Triagem;