/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
// imagens.
import power from "../images/power.svg";
import back from "../images/back.svg";
import body from "../images/body.svg";
import refresh from "../images/refresh.svg";
import prec_padrao from "../images/prec_padrao.svg";
import prec_contato from "../images/prec_contato.svg";
import prec_respiratorio from "../images/prec_respiratorio.svg";
import lupa from '../images/lupa.svg';
import lupa_cinza from '../images/lupa_cinza.svg';
import esteto from "../images/esteto.svg";
import call from "../images/call.svg";
import dots_teal from "../images/dots_teal.svg";
// funções.
import toast from "../functions/toast";
// router.
import { useHistory } from "react-router-dom";
// componentes.
import Logo from "../components/Logo";
// cards.
import Alergias from "../cards/Alergias";
import Documentos from "../cards/Documentos";
import DocumentoEstruturado from "../cards/DocumentoEstruturado";
import Boneco from "../cards/Boneco";
import Infusoes from "../cards/Infusoes";
import Propostas from "../cards/Propostas";
import SinaisVitais from "../cards/SinaisVitais";
import Culturas from "../cards/Culturas";
import VentilacaoMecanica from "../cards/VentilacaoMecanica";
import Dieta from "../cards/Dieta";
import Precaucoes from "../cards/Precaucoes";
import Riscos from "../cards/Riscos";
import Alertas from "../cards/Alertas";
import Interconsultas from "../cards/Interconsultas";
import Exames from "../cards/Exames";
import Prescricao from "./Prescricao";
import Laboratorio from "../cards/Laboratorio";
import selector from "../functions/selector";

function Prontuario() {
  // context.
  const {
    html,
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

    // estados utilizados pela função getAllData (necessária para alimentar os card fechados).
    setalergias,
    alergias,
    setinvasoes,
    setlesoes,
    setprecaucoes,
    precaucoes,
    setriscos,
    riscos,
    setculturas,
    culturas,
    setdietas,
    dietas,
    setevolucoes,
    setarrayevolucoes,
    setinfusoes,
    infusoes,
    setpropostas,
    propostas,
    setsinaisvitais,
    sinaisvitais,
    setvm,
    vm,
    setinterconsultas,
    interconsultas,
    card, setcard,
    prescricao, setprescricao,
    consultorio, setconsultorio,

    mobilewidth,

    setunidade,
    setarrayitensprescricao,
    setidprescricao,

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
    /*
    // Mecanismo para resgatar o token da localStorage e lançá-lo no header da requisição protegida.
    var token = localStorage.getItem("token");
    console.log(token);
    axios.defaults.headers.common["Authorization"] = token;
    */

    axios
      .get(html + "all_atendimentos")
      .then((response) => {
        let x = response.data.rows;
        setatendimentos(x.filter(item => item.situacao == 1));
        setarrayatendimentos(x.filter(item => item.situacao == 1));
        loadAllInterconsultas();
        loadAllPrecaucoes();
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

  // registros para exibição em destaque na lista de pacientes).
  const [allinterconsultas, setallinterconsultas] = useState([]);
  const loadAllInterconsultas = () => {
    axios.get(html + "all_interconsultas").then((response) => {
      setallinterconsultas(response.data.rows);
    });
  };

  const [allprecaucoes, setallprecaucoes] = useState([]);
  const loadAllPrecaucoes = () => {
    axios.get(html + "paciente_all_precaucoes").then((response) => {
      setallprecaucoes(response.data.rows);
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
    if (pagina == 1) {
      setcard('');
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
            className="button-red"
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
        style={{ display: unidade == 3 && viewsalaselector == 1 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center' }}>
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
    axios.get(html + 'list_chamada/' + unidade).then((response) => {
      setchamadas(response.data.rows);
    })
  }

  const [arrayclassificacao, setarrayclassificacao] = useState(['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL', null]);
  // lista de atendimentos.
  const ListaDeAtendimentos = useCallback(() => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: '100%',
        }}
      >
        <div id="filtro para classificações de risco (cor)"
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div
            className="button"
            title="FILTRAR PACIENTES CLASSIFICADOS COMO VERMELHO OU LARANJA."
            style={{ width: 30, height: 10, minHeight: 10, backgroundColor: '#F1948A' }}
            onClick={() => setarrayclassificacao(['VERMELHO', 'LARANJA'])}
          >
          </div>
          <div
            className="button"
            title="FILTRAR PACIENTES CLASSIFICADOS COMO AMARELO."
            style={{ width: 30, height: 10, minHeight: 10, backgroundColor: '#F9E79F' }}
            onClick={() => setarrayclassificacao(['AMARELO'])}
          >
          </div>
          <div
            className="button"
            title="FILTRAR PACIENTES CLASSIFICADOS COMO VERDE OU AZUL."
            style={{ width: 30, height: 10, minHeight: 10, backgroundColor: '#76D7C4' }}
            onClick={() => setarrayclassificacao(['VERDE', 'AZUL'])}
          >
          </div>
          <div
            className="button"
            title="EXIBIR TODAS AS CLASSIFICAÇÕES."
            style={{ width: 30, height: 10, minHeight: 10, backgroundColor: 'rgb(133, 146, 158)' }}
            onClick={() => setarrayclassificacao(['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL', null])}
          >
          </div>

        </div>
        <div id="scroll atendimentos com pacientes"
          className="scroll"
          style={{
            display: arrayatendimentos.length > 0 ? "flex" : "none",
            justifyContent: "flex-start",
            height: window.innerWidth < mobilewidth ? '72vh' : '100%',
            width: 'calc(100% - 20px)',
          }}
        >
          <div className="text3">
            {unidades.filter((item) => item.id_unidade == unidade).map((item) => 'UNIDADE: ' + item.nome_unidade)}
          </div>
          <div className="button"
            style={{
              display: unidade == 3 ? 'flex' : 'none', // unidade 3 == PRONTO SOCORRO.
              margin: 10, marginTop: 5, width: '60%', alignSelf: 'center'
            }}
            onClick={() => setviewsalaselector(1)}
          >
            {consultorio}
          </div>
          {arrayclassificacao.map(x => (
            <div>
              {arrayatendimentos
                .filter(item => item.id_unidade == unidade && item.leito != 'F' && item.classificacao == x)
                .sort((a, b) => (a.leito > b.leito ? 1 : -1))
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
                          backgroundColor:
                            item.classificacao == 'AZUL' ? '#85C1E9 ' :
                              item.classificacao == 'VERDE' ? '#76D7C4' :
                                item.classificacao == 'AMARELO' ? '#F9E79F' :
                                  item.classificacao == 'LARANJA' ? '#FAD7A0' :
                                    item.classificacao == 'VERMELHO' ? '#F1948A' : '#006666'
                        }}
                      >
                        <div
                          className={item.classificacao == 'AMARELO' ? 'text1' : 'text2'}
                          style={{ margin: 5, padding: 0, fontSize: 16 }}
                        >
                          {unidades.filter(valor => valor.id_unidade == item.id_unidade).map(valor => valor.nome_unidade) + ' - ' + item.leito}
                        </div>
                        <div style={{
                          display: unidade == 3 ? 'flex' : 'none', // unidade 3 = PA.
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
                          getAllData(item.id_paciente, item.id_atendimento);
                          setidprescricao(0);
                          if (pagina == 1) {
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
                        {tagsDosPacientes(
                          "INTERCONSULTAS",
                          item,
                          allinterconsultas,
                          esteto
                        )}
                        {tagsDosPacientes(
                          "PRECAUÇÕES",
                          item,
                          allprecaucoes,
                          prec_padrao
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
              {
                arrayatendimentos
                  .filter(item => item.id_unidade == unidade && item.leito == 'F' && item.classificacao == x)
                  .sort((a, b) => (a.nome_paciente > b.nome_paciente ? 1 : -1))
                  .map((item) => (
                    <div key={"pacientes" + item.id_atendimento}>
                      <div
                        className="row"
                        style={{
                          padding: 0,
                          flex: 4,
                          position: "relative",
                          margin: 2.5
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
                            backgroundColor:
                              item.classificacao == 'AZUL' ? '#85C1E9 ' :
                                item.classificacao == 'VERDE' ? '#76D7C4' :
                                  item.classificacao == 'AMARELO' ? '#F9E79F' :
                                    item.classificacao == 'LARANJA' ? '#FAD7A0' :
                                      item.classificacao == 'VERMELHO' ? '#F1948A' : '#006666'
                          }}
                        >
                          <div
                            className={item.classificacao == 'AMARELO' ? 'text1' : 'text2'}
                            style={{ margin: 5, padding: 0, fontSize: 16 }}
                          >
                            {unidades.filter(valor => valor.id_unidade == item.id_unidade).map(valor => valor.nome_unidade) + ' - ' + item.leito}
                          </div>
                          <div style={{
                            display: unidade == 3 ? 'flex' : 'none', // unidade 3 = PA.
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
                          }}
                          onClick={() => {
                            setviewlista(0);
                            setunidade(parseInt(item.id_unidade));
                            setatendimento(item.id_atendimento);
                            setpaciente(parseInt(item.id_paciente));
                            getAllData(item.id_paciente, item.id_atendimento);
                            setidprescricao(0);
                            if (pagina == 1) {
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
                            {pacientes
                              .filter(
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
                          {tagsDosPacientes(
                            "INTERCONSULTAS",
                            item,
                            allinterconsultas,
                            esteto
                          )}
                          {tagsDosPacientes(
                            "PRECAUÇÕES",
                            item,
                            allprecaucoes,
                            prec_padrao
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              }
              <div style={{
                display: arrayatendimentos.filter(valor => valor.classificacao == x && x != null).length > 0 ? 'flex' : 'none',
                flexDirection: 'column', alignContent: 'center'
              }}>
                <img alt="" src={dots_teal} style={{ height: 30 }}></img>
              </div>
            </div>
          ))}
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
            SEM PACIENTES CADASTRADOS PARA ESTA UNIDADE
          </div>
        </div>
      </div >
    );
    // eslint-disable-next-line
  }, [arrayclassificacao, arrayatendimentos, allinterconsultas, allprecaucoes, consultorio, setarrayitensprescricao]);

  const tagsDosPacientes = (titulo, item, lista, imagem) => {
    return (
      <div
        style={{
          position: "relative",
          display:
            lista.filter((valor) => valor.id_paciente == item.id_paciente)
              .length > 0
              ? "flex"
              : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
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
            id={"botão" + titulo + item.id_paciente}
            className="button"
            style={{
              display: "flex",
              borderColor: "#f2f2f2",
              width: 20,
              minWidth: 20,
              height: 20,
              minHeight: 20,
              margin: 0,
              padding: 7.5,
              backgroundColor: '#EC7063',
            }}
          >
            <img alt="" src={imagem} style={{ width: 30, height: 30 }}></img>
          </div>
        </div>
        <div
          id={"lista" + titulo + item.id_paciente}
          className="pop_tag_atendimento"
          style={{
            display: "flex",
            position: "absolute",
            zIndex: 20,
            borderRadius: 5,
            flexDirection: "column",
            justifyContent: "center",
            borderColor: "white",
            borderStyle: "dashed",
            borderWidth: 1,
            backgroundColor: "#006666",
            textAlign: "center",
            color: "white",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          {lista
            .filter((valor) => valor.id_paciente == item.id_paciente)
            .map((item) => {
              if (titulo == "INTERCONSULTAS") {
                return <div>{item.especialidade}</div>;
              } else if (titulo == "PRECAUÇÕES") {
                return <div>{item.precaucao}</div>;
              }
              return null;
            })}
        </div>
      </div>
    );
  };

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

  // estado para retorno do balanço hídrico acumulado.
  const [balancoacumulado, setbalancoacumulado] = useState(0);
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
    // lesões.
    axios
      .get(html + "paciente_lesoes/" + paciente)
      .then((response) => {
        setlesoes(response.data.rows);
      })
      .catch(function (error) {
        console.log(error);
      });
    // precauções.
    axios
      .get(html + "paciente_precaucoes/" + paciente)
      .then((response) => {
        setprecaucoes(response.data.rows);
      })
      .catch(function (error) {
        console.log(error);
      });

    // riscos.
    setbusyriscos(1);
    axios
      .get(html + "paciente_riscos/" + paciente)
      .then((response) => {
        setriscos(response.data.rows);
        setbusyriscos(0);
      })
      .catch(function (error) {
        console.log(error);
      });
    // Dados relacionados ao atendimento.
    // antibióticos.
    loadItensPrescricao(atendimento);
    // culturas.
    setbusyculturas(1);
    axios
      .get(html + "list_culturas/" + atendimento)
      .then((response) => {
        setculturas(response.data.rows);
        setbusyculturas(0);
      })
      .catch(function (error) {
        console.log(error);
      });
    // dietas.
    setbusydieta(1);
    axios
      .get(html + "list_dietas/" + atendimento)
      .then((response) => {
        setdietas(response.data.rows);
        setbusydieta(0);
      })
      .catch(function (error) {
        console.log(error);
      });
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
    // infusões.
    setbusyinfusoes(1);
    axios
      .get(html + "list_infusoes/" + atendimento)
      .then((response) => {
        setinfusoes(response.data.rows);
        setbusyinfusoes(0);
      })
      .catch(function (error) {
        console.log(error);
      });
    // invasões.
    axios
      .get(html + "list_invasoes/" + atendimento)
      .then((response) => {
        setinvasoes(response.data.rows);
      })
      .catch(function (error) {
        console.log(error);
      });
    // propostas.
    setbusypropostas(1);
    axios
      .get(html + "list_propostas/" + atendimento)
      .then((response) => {
        setpropostas(response.data.rows);
        setbusypropostas(0);
      })
      .catch(function (error) {
        console.log(error);
      });
    // sinais vitais.
    setbusysinaisvitais(0);
    axios
      .get(html + "list_sinais_vitais/" + atendimento)
      .then((response) => {
        var x = response.data.rows;
        var arraybalancos = [];
        setbusysinaisvitais(0);
        setsinaisvitais(response.data.rows);
        // cálculo do balanço acumulado.
        x.map((item) => {
          if (isNaN(parseFloat(item.balanco.replace(" ", ""))) == true) {
            console.log(
              "VALOR INVÁLIDO PARA CÁLCULO DO BALANÇO ACUMULADO: " +
              item.balanco
            );
          } else {
            arraybalancos.push(parseFloat(item.balanco.replace(" ", "")));
          }
          return null;
        });
        function soma(total, num) {
          return total + num;
        }
        setbalancoacumulado(arraybalancos.reduce(soma, 0));
      })
      .catch(function (error) {
        console.log(error);
      });
    // vm.
    setbusyvm(1);
    axios.get(html + "list_vm/" + atendimento).then((response) => {
      setbusyvm(0);
      setvm(response.data.rows);
    })
    // interconsultas.
    setbusyinterconsultas(1);
    axios.get(html + "list_interconsultas/" + atendimento).then((response) => {
      setinterconsultas(response.data.rows);
      setbusyinterconsultas(0);
    })
    // laboratorio.
    /*
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      setlaboratorio(response.data.rows);
    })
    */
  };

  // estado para alternância entre lista de pacientes e conteúdo do passômetro para versão mobile.
  const [viewlista, setviewlista] = useState(1);

  // função busy.
  const [busyalergias, setbusyalergias] = useState(0);
  const [busypropostas, setbusypropostas] = useState(0);
  const [busyriscos, setbusyriscos] = useState(0);
  const [busysinaisvitais, setbusysinaisvitais] = useState(0);
  const [busyvm, setbusyvm] = useState(0);
  const [busyinfusoes, setbusyinfusoes] = useState(0);
  const [busydieta, setbusydieta] = useState(0);
  const [busyculturas, setbusyculturas] = useState(0);
  const [busyinterconsultas, setbusyinterconsultas] = useState(0);

  const loading = () => {
    return (
      <div
        className="destaque"
        style={{ marginTop: 20 }}
      >
        <Logo height={20} width={20}></Logo>
      </div>
    );
  };

  // função para renderização dos cards fechados.
  let yellow = "#F9E79F";
  const cartao = (sinal, titulo, opcao, busy, oculto) => {
    return (
      <div style={{ display: window.innerWidth < mobilewidth && oculto == 1 ? 'none' : 'flex' }}>
        <div
          className="card-fechado cor3"
          style={{
            display:
              titulo.includes(filtercartoes) == true &&
                card == "" &&
                atendimento != null
                ? "flex"
                : "none",
            pointerEvents: opcao == null ? 'none' : 'auto',
            backgroundColor: sinal != null && sinal.length > 0 ? yellow : "",
            borderColor: "transparent",
            margin: 5,
            height: window.innerWidth < mobilewidth ? '35vw' : '15vw',
            minHeight: window.innerWidth < mobilewidth ? '32vw' : '15vw',
            minWidth: window.innerWidth < mobilewidth ? '32vw' : cartoes.length == arraycartoes.length ? '' : '15vw',
            maxWidth: window.innerWidth < mobilewidth ? '' : '15vw',
            alignSelf: 'center',
          }}
          onClick={() => {
            if (card == opcao) {
              setcard("");
            } else {
              setcard(opcao);
            }
          }}
        >
          <div className="text3">{titulo}</div>
          <div
            style={{
              display: busy == 1 ? "none" : "flex",
              flexDirection: "row",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div id="RESUMO PRECAUÇÕES"
              style={{ display: opcao == "card-precaucoes" ? "flex" : "none" }}
            >
              <img
                alt=""
                src={prec_padrao}
                style={{
                  display:
                    precaucoes.filter((item) => item.precaucao == "PADRÃO")
                      .length > 0
                      ? "flex"
                      : "none",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: window.innerWidth < mobilewidth ? 20 : 40,
                  width: window.innerWidth < mobilewidth ? 20 : 40,
                  padding: 5,
                }}
              ></img>
              <img
                alt=""
                src={prec_contato}
                style={{
                  display:
                    precaucoes.filter((item) => item.precaucao == "CONTATO")
                      .length > 0
                      ? "flex"
                      : "none",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: window.innerWidth < mobilewidth ? 30 : 50,
                  width: window.innerWidth < mobilewidth ? 30 : 50,
                }}
              ></img>
              <img
                alt=""
                src={prec_respiratorio}
                style={{
                  display:
                    precaucoes.filter(
                      (item) =>
                        item.precaucao == "AEROSSOL" ||
                        item.precaucao == "GOTÍCULA"
                    ).length > 0
                      ? "flex"
                      : "none",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: window.innerWidth < mobilewidth ? 30 : 50,
                  width: window.innerWidth < mobilewidth ? 30 : 50,
                }}
              ></img>
            </div>
            <div id="RESUMO DIETA"
              style={{
                display: opcao == "card-dietas" ? "flex" : "none",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="textcard" style={{ margin: 0, padding: 0 }}>
                {dietas.map((item) => item.tipo)}
              </div>
              <div
                className="textcard"
                style={{
                  display:
                    dietas.filter(
                      (item) => item.tipo != "ORAL" && item.tipo != "NÃO DEFINIDA"
                    ).length > 0
                      ? "flex"
                      : "none",
                  margin: 0,
                  padding: 0,
                }}
              >
                {dietas.map((item) => item.infusao + " ml/h")}
              </div>
            </div>
            <div id="RESUMO VM"
              style={{
                display: opcao == "card-vm" && vm.length > 0 ? "flex" : "none",
                flexDirection: "column",
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <div
                id="na vm"
                style={{
                  display:
                    vm
                      .sort((a, b) =>
                        moment(a.data_vm) < moment(b.data_vm) ? -1 : 1
                      )
                      .slice(-1)
                      .map((item) => item.modo) == "OFF"
                      ? "none"
                      : "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="textcard" style={{ margin: 0, padding: 0 }}>
                  {vm
                    .sort((a, b) =>
                      moment(a.data_vm) < moment(b.data_vm) ? -1 : 1
                    )
                    .slice(-1)
                    .map((item) => item.modo)}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignSelf: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      margin: 5,
                    }}
                  >
                    <div
                      className="textcard"
                      style={{ margin: 0, padding: 0, opacity: 0.5 }}
                    >
                      {"PI"}
                    </div>
                    <div className="textcard" style={{ margin: 0, padding: 0 }}>
                      {vm
                        .sort((a, b) =>
                          moment(a.data_vm) < moment(b.data_vm) ? -1 : 1
                        )
                        .slice(-1)
                        .map((item) => item.pressao)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: window.innerWidth < mobilewidth ? "none" : "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      margin: 5,
                    }}
                  >
                    <div
                      className="textcard"
                      style={{ margin: 0, padding: 0, opacity: 0.5 }}
                    >
                      {"VC"}
                    </div>
                    <div className="textcard" style={{ margin: 0, padding: 0 }}>
                      {vm
                        .sort((a, b) =>
                          moment(a.data_vm) < moment(b.data_vm) ? -1 : 1
                        )
                        .slice(-1)
                        .map((item) => item.volume)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      margin: 5,
                    }}
                  >
                    <div
                      className="textcard"
                      style={{ margin: 0, padding: 0, opacity: 0.5 }}
                    >
                      {"PEEP"}
                    </div>
                    <div className="textcard" style={{ margin: 0, padding: 0 }}>
                      {vm
                        .sort((a, b) =>
                          moment(a.data_vm) < moment(b.data_vm) ? -1 : 1
                        )
                        .slice(-1)
                        .map((item) => item.peep)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      margin: 5,
                    }}
                  >
                    <div
                      className="textcard"
                      style={{ margin: 0, padding: 0, opacity: 0.5 }}
                    >
                      {"FI"}
                    </div>
                    <div className="textcard" style={{ margin: 0, padding: 0 }}>
                      {vm
                        .sort((a, b) =>
                          moment(a.data_vm) < moment(b.data_vm) ? -1 : 1
                        )
                        .slice(-1)
                        .map((item) => item.fio2)}
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="fora da vm"
                className="textcard"
                style={{
                  display:
                    vm
                      .sort((a, b) =>
                        moment(a.data_vm) < moment(b.data_vm) ? -1 : 1
                      )
                      .slice(-1)
                      .map((item) => item.modo) != "OFF"
                      ? "none"
                      : "flex",
                }}
              >
                {"PACIENTE FORA DA VM"}
              </div>
            </div>
            <div id="RESUMO ANTIBIÓTICOS"
              style={{
                display: titulo == "ANTIBIÓTICOS" ? 'flex' : 'none',
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {prescricao
                  .filter((item) => item.categoria == '1. ANTIMICROBIANOS')
                  .slice(-2)
                  .sort((a, b) => moment(a.data) < moment(b.data) ? 1 : -1)
                  .map((item) => (
                    <div
                      key={"atb resumo " + item.id}
                      className="textcard"
                      style={{ margin: 0, padding: 0 }}
                    >
                      <div>
                        {item.nome_item}
                      </div>
                      <div>
                        {moment(item.data).format('DD/MM/YY')}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div id="RESUMO CULTURAS"
              style={{
                display: opcao == "card-culturas" ? "flex" : "none",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="textcard" style={{ margin: 0, padding: 0 }}>
                {"PENDENTES: " +
                  culturas.filter((item) => item.data_resultado == null).length}
              </div>
            </div>
            <div id="RESUMO INFUSÕES"
              style={{
                display: opcao == "card-infusoes" ? "flex" : "none",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {infusoes
                  .filter((item) => item.data_termino == null)
                  .slice(-2)
                  .map((item) => (
                    <div
                      key={"infusão " + item.id_infusao}
                      className="textcard"
                      style={{ margin: 0, padding: 0 }}
                    >
                      {item.droga + " - " + item.velocidade + "ml/h"}
                    </div>
                  ))}
                <div
                  style={{
                    display:
                      infusoes.filter((item) => item.data_termino == null)
                        .length > 2
                        ? "flex"
                        : "none",
                    alignSelf: "center",
                  }}
                >
                  ...
                </div>
              </div>
            </div>
            <div id="RESUMO PROPOSTAS"
              style={{
                display: opcao == "card-propostas" ? "flex" : "none",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                className="textcard"
                style={{ display: "flex", margin: 0, padding: 0 }}
              >
                {"PENDENTES: " +
                  propostas.filter((item) => item.data_conclusao == null).length}
              </div>
            </div>
            <div id="RESUMO SINAIS VITAIS"
              style={{
                display:
                  opcao == "card-sinaisvitais" && sinaisvitais.length > 0
                    ? "flex"
                    : "none",
                flexDirection: "column",
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignSelf: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    margin: 5,
                  }}
                >
                  <div
                    className="textcard"
                    style={{ margin: 0, padding: 0, opacity: 0.5 }}
                  >
                    {"PAM"}
                  </div>
                  <div className="textcard" style={{ margin: 0, padding: 0 }}>
                    {sinaisvitais.length > 0
                      ? Math.ceil(
                        (2 *
                          parseInt(
                            sinaisvitais.slice(-1).map((item) => item.pad)
                          ) +
                          parseInt(
                            sinaisvitais.slice(-1).map((item) => item.pas)
                          )) /
                        3
                      )
                      : null}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    margin: 5,
                  }}
                >
                  <div
                    className="textcard"
                    style={{ margin: 0, padding: 0, opacity: 0.5 }}
                  >
                    {"FC"}
                  </div>
                  <div className="textcard" style={{ margin: 0, padding: 0 }}>
                    {sinaisvitais.slice(-1).map((item) => item.fc)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    margin: 5,
                  }}
                >
                  <div
                    className="textcard"
                    style={{ margin: 0, padding: 0, opacity: 0.5 }}
                  >
                    {"TAX"}
                  </div>
                  <div className="textcard" style={{ margin: 0, padding: 0 }}>
                    {sinaisvitais.slice(-1).map((item) => item.tax)}
                  </div>
                </div>
                <div
                  style={{
                    display: window.innerWidth < mobilewidth ? "none" : "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    margin: 5,
                  }}
                >
                  <div
                    className="textcard"
                    style={{ margin: 0, padding: 0, opacity: 0.5 }}
                  >
                    {"DIURESE"}
                  </div>
                  <div className="textcard" style={{ margin: 0, padding: 0 }}>
                    {sinaisvitais.slice(-1).map((item) => item.diurese)}
                  </div>
                </div>
                <div
                  style={{
                    display: window.innerWidth < mobilewidth ? "none" : "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    margin: 5,
                  }}
                >
                  <div
                    className="textcard"
                    style={{ margin: 0, padding: 0, opacity: 0.5 }}
                  >
                    {"BALANÇO ACUMULADO"}
                  </div>
                  <div className="textcard" style={{ margin: 0, padding: 0 }}>
                    {balancoacumulado}
                  </div>
                </div>
              </div>
            </div>
            <div id="RESUMO ALERGIA"
              style={{
                display: opcao == "card-alergias" ? "flex" : "none",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                className="textcard"
                style={{
                  display: "flex",
                  flexDirection: 'column',
                  margin: 0,
                  padding: 0,
                  fontSize: 16,
                }}
              >
                {alergias.slice(-3).map(item => (<div className="textcard" style={{ margin: 0, padding: 0 }}>{item.alergia}</div>))}
              </div>
            </div>
            <div id="RESUMO RISCOS"
              style={{ display: opcao == "card-riscos" ? "flex" : "none" }}
            >
              <div>
                {riscos.slice(-3).map((item) => (
                  <div
                    key={"atb " + item.id_risco}
                    className="textcard"
                    style={{ margin: 0, padding: 0 }}
                  >
                    {item.risco}
                  </div>
                ))}
              </div>
            </div>
            <div id="RESUMO INTERCONSULTAS"
              style={{
                display: opcao == "card-interconsultas" ? "flex" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {interconsultas.map((item) => (
                  <div
                    key={"interconsultas " + item.id_interconsulta}
                    className="textcard"
                    style={{ margin: 0, padding: 0 }}
                  >
                    {item.especialidade}
                  </div>
                ))}
                <div
                  className="textcard"
                  style={{
                    display: interconsultas.length > 3 ? "flex" : "none",
                    alignSelf: "center",
                  }}
                >
                  ...
                </div>
              </div>
            </div>
            <div id="RESUMO BONECO"
              style={{
                display: opcao == "card-boneco" ? "flex" : "none",
              }}
            >
              <img
                id="corpo"
                alt=""
                src={body}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: window.innerWidth < mobilewidth ? "20vw" : "8vw",
                }}
              ></img>
            </div>
          </div>
          <div
            style={{
              display: busy == 1 ? "flex" : "none",
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            {loading()}
          </div>
        </div>
      </div>
    );
  };

  const [cartoes] = useState([
    "DIAS DE INTERNAÇÃO",
    "ALERGIAS",
    "PRECAUÇÕES",
    "ADMISSÃO",
    "EVOLUÇÃO",
    "RECEITA",
    "ATESTADO MÉDICO",
    "RISCOS",
    "PROPOSTAS",
    "SINAIS VITAIS",
    "VENTILAÇÃO MECÂNICA",
    "INFUSÕES",
    "DIETA",
    "CULTURAS",
    "ANTIBIÓTICOS",
    "INTERCONSULTAS",
    "LABORATÓRIO E RX",
    "EXAMES DE IMAGEM",
    "PRESCRIÇÃO",
    "INVASÕES",
    "LESÕES",
    "BONECO",
  ]);
  const [arraycartoes, setarraycartoes] = useState([
    "DIAS DE INTERNAÇÃO",
    "ALERGIAS",
    "PRECAUÇÕES",
    "ADMISSÃO",
    "EVOLUÇÃO",
    "RECEITA",
    "ATESTADO MÉDICO",
    "RISCOS",
    "PROPOSTAS",
    "SINAIS VITAIS",
    "VENTILAÇÃO MECÂNICA",
    "INFUSÕES",
    "DIETA",
    "CULTURAS",
    "ANTIBIÓTICOS",
    "INTERCONSULTAS",
    "LABORATÓRIO E RX",
    "EXAMES DE IMAGEM",
    "PRESCRIÇÃO",
    "INVASÕES",
    "LESÕES",
    "BONECO",
  ]);

  const [filtercartoes, setfiltercartoes] = useState("");
  var searchcartoes = "";
  const filterCartoes = () => {
    clearTimeout(timeout);
    document.getElementById("inputCartao").focus();
    searchcartoes = document.getElementById("inputCartao").value.toUpperCase();
    console.log(searchcartoes);

    timeout = setTimeout(() => {
      if (searchcartoes == "") {
        setfiltercartoes("");
        setarraycartoes(cartoes);
        document.getElementById("inputCartao").value = "";
        setTimeout(() => {
          document.getElementById("inputCartao").focus();
        }, 100);
        console.log(cartoes);
        console.log(arraycartoes);
      } else {
        setfiltercartoes(
          document.getElementById("inputCartao").value.toUpperCase()
        );
        setarraycartoes(cartoes.filter((item) => item.includes(searchcartoes)));
        console.log(arraycartoes);
        document.getElementById("inputCartao").value = searchcartoes;
        setTimeout(() => {
          document.getElementById("inputCartao").focus();
          console.log(arraycartoes.pop());
        }, 100);
      }
    }, 1000);
  };
  // filtro de paciente por nome.
  function FilterCartoes() {
    return (
      <input
        className="input"
        autoComplete="off"
        placeholder={window.innerWidth < mobilewidth ? "BUSCAR ATIVIDADE..." : "BUSCAR..."}
        onFocus={(e) => (e.target.placeholder = "")}
        onBlur={(e) =>
          window.innerWidth < mobilewidth
            ? (e.target.placeholder = "BUSCAR TAREFA...")
            : "BUSCAR..."
        }
        onKeyUp={() => filterCartoes()}
        type="text"
        id="inputCartao"
        defaultValue={filtercartoes}
        maxLength={100}
        style={{
          width: window.innerWidth < mobilewidth ? '70vw' : 500,
          margin: 10, display: card == '' ? 'flex' : 'none',
          alignSelf: 'center'
        }}
      ></input>
    );
  }

  const [viewinterconsultas, setviewinterconsultas] = useState(0);
  function TelaInterconsultas() {
    return (
      <div className="fundo"
        onClick={() => setviewinterconsultas(0)}
        style={{
          display: viewinterconsultas == 1 ? 'flex' : 'none',
          flexDirection: 'column', justifyContent: 'center'
        }}>
        <div
          className="janela scroll"
          style={{
            display: allinterconsultas.filter(item => item.especialidade == usuario.tipo_usuario).length > 0 ? 'flex' : 'none',
            height: '60vh',
          }}>
          {allinterconsultas.filter(item => item.especialidade == usuario.tipo_usuario).map(item => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row', justifyContent: 'center', width: 'calc(100% - 5px)'
              }}>
              {atendimentos.filter(valor => valor.id_atendimento == item.id_atendimento && valor.situacao == 1).map(valor => (
                <div
                  id={'interconsulta' + item.id_atendimento}
                  style={{
                    display: 'flex', flexDirection: 'row', justifyItems: 'center',
                    width: '40vw'
                  }}
                  onClick={() => {
                    setviewlista(0);
                    setatendimento(valor.id_atendimento);
                    setpaciente(valor.id_paciente);
                    getAllData(valor.id_paciente, valor.id_atendimento);
                    setidprescricao(0);
                    if (pagina == 1) {
                      selector("scroll atendimentos com pacientes", "atendimento " + item.id_atendimento, 100);
                    }
                  }}
                >
                  <div className='button-grey'
                    style={{
                      width: 100,
                      marginLeft: 2.5, marginRight: 0,
                      paddingLeft: 10, paddingRight: 10,
                      borderTopRightRadius: 0, borderBottomRightRadius: 0,
                    }}>
                    {unidades.filter(item => item.id_unidade == valor.id_unidade).map(item => item.nome_unidade + ' - LEITO ' + valor.leito)}
                  </div>
                  <div className='button-yellow'
                    onClick={() => setcard('card-interconsultas')}
                    style={{ width: '100%', marginLeft: 0, marginRight: 2.5, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                    {valor.nome_paciente}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="janela scroll"
          style={{
            display: allinterconsultas.filter(item => item.especialidade == usuario.tipo_usuario).length == 0 ? 'flex' : 'none',
            height: '60vh',
          }}>
          <img
            alt=""
            src={lupa_cinza}
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
    )
  }

  return (
    <div
      className="main"
      style={{ display: pagina == 1 ? "flex" : "none" }}
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
          <div id='botão de interconsultas'
            style={{
              display: allinterconsultas.filter(item => item.especialidade == usuario.tipo_usuario).length == 0 || window.innerWidth < mobilewidth ? 'none' : 'flex',
              position: 'absolute', top: 80, right: 80,
              borderRadius: 50,
              width: 50, height: 50,
              backgroundColor: '#EC7063',
              borderColor: '#66b2b2',
              borderWidth: 5,
              borderStyle: 'solid',
              justifyContent: 'center',
            }}
            onClick={() => setviewinterconsultas(1)}
            title={'INTERCONSULTAS PARA ' + usuario.tipo_usuario + '.'}
          >
            <div className="text2" style={{ margin: 0, padding: 0, marginBottom: 2.5 }}>{allinterconsultas.filter(item => item.especialidade == usuario.tipo_usuario).length}</div>
          </div>
          <Usuario></Usuario>
          <ListaDeAtendimentos></ListaDeAtendimentos>
        </div>
        <div id="conteúdo cheio (cards)"
          style={{
            display: atendimento != null && card == 0 && viewlista == 0 ? 'flex' : 'none',
            flexDirection: "row",
            justifyContent: 'center',
            alignContent: 'flex-start',
            flexWrap: "wrap",
            width: window.innerWidth < mobilewidth ? '90vw' : '65vw',
          }}
        >
          <CabecalhoPacienteMobile></CabecalhoPacienteMobile>
          <FilterCartoes></FilterCartoes>
          <div id="cards (cartões) visão desktop"
            className={arraycartoes.length == cartoes.length ? "grid" : "grid1"}
            style={{
              display: window.innerWidth < mobilewidth ? 'none' : '',
              width: '100%', alignSelf: 'center',
            }}>
            {cartao(null, "DIAS DE INTERNAÇÃO: " +
              atendimentos
                .filter((item) => item.id_atendimento == atendimento)
                .map((item) => moment().diff(item.data_inicio, "days")),
              null,
              0, 0
            )}
            {cartao(alergias, "ALERGIAS", "card-alergias", busyalergias, 0)}
            {cartao(null, "ADMISSÃO", "card-documento-admissao", null, 1)}
            {cartao(null, "EVOLUÇÃO", "card-documento-evolucao", null, 1)}
            {cartao(null, "RECEITA MÉDICA", "card-documento-receita", null, 1)}
            {cartao(null, "ATESTADO", "card-documento-atestado", null, 1)}
            {cartao(null, "SUMÁRIO DE ALTA", "card-documento-alta", null, 1)}
            {cartao(null, "AIH", "card-doc-estruturado-aih", null, 1)}
            {cartao(propostas.filter((item) => item.status == 0), "PROPOSTAS", "card-propostas", busypropostas, 0)}
            {cartao(precaucoes, "PRECAUÇÕES", "card-precaucoes", null, 0)}
            {cartao(riscos, "RISCOS", "card-riscos", busyriscos, 0)}
            {cartao(null, "ALERTAS", "card-alertas", null, 0)}
            {cartao(null, "SINAIS VITAIS", "card-sinaisvitais", busysinaisvitais, 0)}
            {cartao(null, 'INVASÕES E LESÕES', "card-boneco", null, 0)}
            {cartao(null, "VENTILAÇÃO MECÂNICA", "card-vm", busyvm, 0)}
            {cartao(null, "INFUSÕES", "card-infusoes", busyinfusoes, 0)}
            {cartao(null, "DIETA", "card-dietas", busydieta, 0)}
            {cartao(
              culturas.filter((item) => item.data_resultado == null),
              "CULTURAS",
              "card-culturas",
              busyculturas
            )}
            {cartao(prescricao.filter(item => item.categoria == '1. ANTIMICROBIANOS'), "ANTIBIÓTICOS", null, null, 0)}
            {cartao(interconsultas, "INTERCONSULTAS", "card-interconsultas", busyinterconsultas, 0)}
            {cartao(null, 'PRESCRIÇÃO', "card-prescricao", null, 1)}
            {cartao(null, 'EXAMES DE IMAGEM', 'card-exames', null, 1)}
            {cartao(null, 'LABORATÓRIO E RX', 'card-laboratorio', null, 1)}
          </div>
          <div id="cards (cartões) visão mobile"
            className={arraycartoes.length == cartoes.length ? "grid2" : "grid1"}
            style={{
              display: window.innerWidth < mobilewidth ? 'grid' : 'none',
              width: '100%',
            }}>
            {cartao(null, "DIAS DE INTERNAÇÃO: " +
              atendimentos
                .filter((item) => item.id_atendimento == atendimento)
                .map((item) => moment().diff(item.data_inicio, "days")),
              null,
              0, 0
            )}
            {cartao(alergias, "ALERGIAS", "card-alergias", busyalergias, 0)}
            {cartao(null, "ADMISSÃO", "card-documento-admissao", null, 1)}
            {cartao(null, "EVOLUÇÃO", "card-documento-evolucao", null, 1)}
            {cartao(null, "RECEITA MÉDICA", "card-documento-receita", null, 1)}
            {cartao(null, "ATESTADO", "card-documento-atestado", null, 1)}
            {cartao(null, "SUMÁRIO DE ALTA", "card-documento-alta", null, 1)}
            {cartao(null, "AIH", "card-doc-estruturado-aih", null, 1)}
            {cartao(propostas.filter((item) => item.status == 0), "PROPOSTAS", "card-propostas", busypropostas, 0)}
            {cartao(precaucoes, "PRECAUÇÕES", "card-precaucoes", null, 0)}
            {cartao(riscos, "RISCOS", "card-riscos", busyriscos, 0)}
            {cartao(null, "ALERTAS", "card-alertas", null, 0)}
            {cartao(null, "SINAIS VITAIS", "card-sinaisvitais", busysinaisvitais, 0)}
            {cartao(null, 'INVASÕES E LESÕES', "card-boneco", null, 0)}
            {cartao(null, "VENTILAÇÃO MECÂNICA", "card-vm", busyvm, 0)}
            {cartao(null, "INFUSÕES", "card-infusoes", busyinfusoes, 0)}
            {cartao(null, "DIETA", "card-dietas", busydieta, 0)}
            {cartao(
              culturas.filter((item) => item.data_resultado == null),
              "CULTURAS",
              "card-culturas",
              busyculturas
            )}
            {cartao(prescricao.filter(item => item.categoria == '1. ANTIMICROBIANOS'), "ANTIBIÓTICOS", null, null, 0)}
            {cartao(interconsultas, "INTERCONSULTAS", "card-interconsultas", busyinterconsultas, 0)}
            {cartao(null, 'PRESCRIÇÃO', "card-prescricao", null, 1)}
            {cartao(null, 'EXAMES DE IMAGEM', 'card-exames', null, 1)}
            {cartao(null, 'LABORATÓRIO E RX', 'card-laboratorio', null, 1)}
          </div>
        </div>
        <div id="conteúdo cheio (componentes)"
          style={{
            display: atendimento != null && viewlista == 0 && card != 0 ? 'flex' : 'none',
            flexDirection: "row",
            justifyContent: 'center',
            alignContent: 'center',
            flexWrap: "wrap",
            width: window.innerWidth < mobilewidth ? '90vw' : '65vw',
          }}
        >
          <Alergias></Alergias>
          <Documentos></Documentos>
          <DocumentoEstruturado></DocumentoEstruturado>
          <Boneco></Boneco>
          <Propostas></Propostas>
          <SinaisVitais></SinaisVitais>
          <Infusoes></Infusoes>
          <Culturas></Culturas>
          <VentilacaoMecanica></VentilacaoMecanica>
          <Dieta></Dieta>
          <Precaucoes></Precaucoes>
          <Riscos></Riscos>
          <Alertas></Alertas>
          <Interconsultas></Interconsultas>
          <Exames></Exames>
          <Prescricao></Prescricao>
          <Laboratorio></Laboratorio>
        </div>
        <div id="conteúdo vazio"
          style={{
            display: window.innerWidth < mobilewidth ? "none" : atendimento == null ? "flex" : "none",
            flexDirection: "row",
            justifyContent: 'center',
            flexWrap: "wrap",
            width: '65vw',
          }}
        >
          <img className="lupa"
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
        <TelaInterconsultas></TelaInterconsultas>
      </div>
    </div>
  );
}

export default Prontuario;