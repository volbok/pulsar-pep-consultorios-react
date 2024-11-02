/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
import "moment/locale/pt-br";
// router.
import { useHistory } from "react-router-dom";
// funções.
import toast from "../functions/toast";
import checkinput from "../functions/checkinput";
import masknumbers from "../functions/masknumber";
import maskoptions from "../functions/maskoptions";
import maskdate from "../functions/maskdate";
import maskphone from "../functions/maskphone";
import modal from "../functions/modal";
import selector from "../functions/selector";
// imagens.
import deletar from "../images/deletar.svg";
import back from "../images/back.svg";
import novo from "../images/novo.svg";
import salvar from "../images/salvar.svg";
import editar from "../images/editar.svg";
import lupa from '../images/lupa.svg';

function Usuarios() {
  // context.
  const {
    html,
    pagina,
    setpagina,
    setusuario,
    settoast,
    setdialogo,
    hospital,
    unidades,
    usuario,
    arrayespecialidades,
  } = useContext(Context);

  // history (router).
  let history = useHistory();

  const refreshApp = () => {
    setusuario({
      id: 0,
      nome_usuario: "LOGOFF",
      dn_usuario: null,
      cpf_usuario: null,
      contato_usuario: null,
    });
    setpagina(0);
    history.push("/");
  };
  window.addEventListener("load", refreshApp);

  useEffect(() => {
    if (pagina == 5) {
      setselectedusuario(0);
      loadUsuarios();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // ## USUÁRIOS ##
  // recuperando registros de usuários cadastrados na aplicação.
  const [usuarios, setusuarios] = useState([]);
  const [arrayusuarios, setarrayusuarios] = useState([]);
  const loadUsuarios = () => {
    axios
      .get(html + "list_usuarios")
      .then((response) => {
        setusuarios(response.data.rows);
        setarrayusuarios(response.data.rows);
      })
      .catch(function (error) {
        if (error.response == undefined) {
          toast(
            settoast,
            "ERRO AO CARREGAR USUÁRIOS, REINICIANDO APLICAÇÃO.",
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

  // inserindo um usuário.
  const insertUsuario = () => {
    var obj = {
      nome_usuario: document.getElementById("inputNome").value.toUpperCase(),
      dn_usuario: moment(document.getElementById("inputDn").value, "DD/MM/YYYY"),
      cpf_usuario: document.getElementById("inputCpf").value,
      contato_usuario: document.getElementById("inputContato").value,
      senha: document.getElementById("inputContato").value,
      login: document.getElementById("inputCpf").value,
      conselho: document.getElementById("inputConselho").value.toUpperCase(),
      n_conselho: document.getElementById("inputNumeroConselho").value,
      tipo_usuario: localStorage.getItem('especialidade'),
      paciente: 0,
      prontuario: 0,
      primeiro_acesso: 0,
      uf_conselho: document.getElementById("inputUf").value.toUpperCase(),
      codigo_cbo: document.getElementById("inputCodigoCbo").value.toUpperCase(),
    };
    axios
      .post(html + "inserir_usuario", obj)
      .then(() => {
        loadUsuarios();
        setselectedusuario(0);
        setviewnewusuario(0);
        toast(
          settoast,
          "USUÁRIO CADASTRADO COM SUCESSO NA BASE PULSAR",
          "rgb(82, 190, 128, 1)",
          1500
        );
      })
  };

  // atualizando um usuário.
  const updateUsuario = () => {
    var obj = {
      nome_usuario: document.getElementById("inputNome").value.toUpperCase(),
      dn_usuario: moment(
        document.getElementById("inputDn").value,
        "DD/MM/YYYY"
      ),
      cpf_usuario: document.getElementById("inputCpf").value,
      contato_usuario: document.getElementById("inputContato").value,
      senha: selectedusuario.senha,
      login: selectedusuario.login,
      conselho: document.getElementById("inputConselho").value.toUpperCase(),
      n_conselho: document.getElementById("inputNumeroConselho").value,
      tipo_usuario: localStorage.getItem('especialidade'),
      paciente: localStorage.getItem('paciente'),
      prontuario: localStorage.getItem('prontuario'),
      uf_conselho: document.getElementById("inputUf").value,
      codigo_cbo: document.getElementById("inputCodigoCbo").value,
    };
    console.log(obj);
    console.log(selectedusuario.id_usuario);
    axios
      .post(html + "update_usuario/" + selectedusuario.id_usuario, obj)
      .then(() => {
        loadUsuarios();
        setselectedusuario(0);
        setviewnewusuario(0);
        toast(
          settoast,
          "USUÁRIO ATUALIZADO COM SUCESSO NA BASE PULSAR",
          "rgb(82, 190, 128, 1)",
          1500
        );
      })


  };

  const updateAcessoModulos = () => {
    var obj = {
      nome_usuario: selectedusuario.nome_usuario,
      dn_usuario: localStorage.getItem('dn'),
      cpf_usuario: localStorage.getItem('cpf'),
      contato_usuario: localStorage.getItem('contato'),
      senha: selectedusuario.senha,
      login: selectedusuario.login,
      conselho: selectedusuario.conselho,
      n_conselho: selectedusuario.n_conselho,
      tipo_usuario: localStorage.getItem('especialidade'),
      paciente: localStorage.getItem('paciente'),
      prontuario: localStorage.getItem('prontuario'),
      laboratorio: localStorage.getItem('laboratorio'),
      farmacia: localStorage.getItem('farmacia'),
      faturamento: localStorage.getItem('faturamento'),
      usuarios: localStorage.getItem('usuarios'),
    };
    console.log(obj);
    console.log(selectedusuario.id_usuario);
    axios
      .post(html + "update_usuario/" + selectedusuario.id_usuario, obj)
      .then(() => {
        loadUsuarios();
        setviewnewusuario(0);
        toast(
          settoast,
          "USUÁRIO ATUALIZADO COM SUCESSO NA BASE PULSAR",
          "rgb(82, 190, 128, 1)",
          1500
        );
      })
      .catch(function () {
        toast(
          settoast,
          "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.",
          "black",
          3000
        );
        setTimeout(() => {
          setpagina(0);
          history.push("/");
        }, 5000);
      });
  };

  // excluir um usuário.
  const deleteUsuario = (usuario) => {
    // excluir somente usuários sem cadastro em outras unidades.
    if (todosacessos.filter((item) => item.id_usuario == usuario).length > 1) {
      toast(
        settoast,
        "EXCLUSÃO NEGADA, PACIENTE VINCULADO A OUTRAS UNIDADES DE ATENDIMENTO",
        "rgb(231, 76, 60, 1)",
        3000
      );
    } else {
      axios
        .get(html + "delete_usuario/" + usuario)
        .then(() => {
          loadUsuarios();
          toast(
            settoast,
            "USUÁRIO EXCLUÍDO COM SUCESSO DA BASE PULSAR",
            "rgb(82, 190, 128, 1)",
            1500
          );
          limpaCampos();
          setselectedusuario(0);
        })
        .catch(function () {
          toast(
            settoast,
            "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.",
            "black",
            5000
          );
          setTimeout(() => {
            setpagina(0);
            history.push("/");
          }, 3000);
        });
    }
  };

  // componente para inserir novo usuário.
  const [viewnewusuario, setviewnewusuario] = useState(0);
  const [selectedusuario, setselectedusuario] = useState(0);

  function InsertUsuario() {
    var timeout = null;
    const [especialidade, setespecialidade] = useState(localStorage.getItem("especialidade"));
    return (
      <div
        className="fundo"
        style={{
          display: viewnewusuario == 1 || viewnewusuario == 2 ? "flex" : "none",
          flexDirection: "column",
          justifyContent: "center",
        }}
        onClick={() => setviewnewusuario(0)}
      >
        <div
          className="janela scroll"
          style={{ padding: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            id="cadastrar usuario"
            style={{
              display: 'flex',
              flexDirection: "row",
              flexWrap: 'wrap',
              justifyContent: 'space-evenly',
              marginRight: 10,
              alignItems: "flex-start",
              alignContent: 'flex-start',
            }}
          >
            <div id='coluna1' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', flex: 1 }}>
              <div id="nome do usuário"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: 'center',
                }}
              >
                <div className="text1">NOME DO USUÁRIO</div>
                <input
                  autoComplete="off"
                  placeholder="NOME DO USUÁRIO"
                  className="input"
                  type="text"
                  id="inputNome"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "NOME DO USUÁRIO")}
                  defaultValue={localStorage.getItem('nome')}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 300,
                  }}
                ></input>
              </div>
              <div id="dn usuário"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="text1">DATA DE NASCIMENTO</div>
                <input
                  autoComplete="off"
                  placeholder="DN"
                  className="input"
                  type="text"
                  id="inputDn"
                  inputMode="numeric"
                  onClick={() => (document.getElementById("inputDn").value = "")}
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "DN")}
                  onKeyUp={() => {
                    maskdate(timeout, "inputDn");
                  }}
                  defaultValue={moment(localStorage.getItem('dn')).format('DD/MM/YYYY')}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 100,
                  }}
                ></input>
              </div>
              <div id="contato"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="text1">CONTATO</div>
                <input
                  autoComplete="off"
                  placeholder="CONTATO"
                  className="input"
                  type="text"
                  id="inputContato"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "CONTATO")}
                  defaultValue={localStorage.getItem('contato')}
                  onKeyUp={() => {
                    maskphone(timeout, "inputContato");
                  }}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 200,
                  }}
                ></input>
              </div>
              <div id="cpf do usuário"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="text1">CPF DO USUÁRIO</div>
                <input
                  autoComplete="off"
                  placeholder="CPF DO USUÁRIO"
                  className="input"
                  type="text"
                  id="inputCpf"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "CPF DO USUÁRIO")}
                  onKeyUp={() => {
                    if (usuarios.filter(item => item.cpf_usuario == document.getElementById("inputCpf").value).length > 0) {
                      toast(settoast, 'CPF JÁ CADASTRADO', '#EC7063', 1500);
                    } else {
                      masknumbers(timeout, "inputCpf", 13);
                    }
                  }}
                  defaultValue={localStorage.getItem('cpf')}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 200,
                  }}
                ></input>
              </div>
            </div>
            <div id="coluna 02" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <div className="text1">CONSELHO PROFISSIONAL</div>
              <input
                autoComplete="off"
                placeholder="CONSELHO"
                className="input"
                type="text"
                id="inputConselho"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "CONSELHO")}
                onKeyUp={() => {
                  maskoptions(timeout, "inputConselho", 10, [
                    "CRM",
                    "CRO",
                    "CRESS",
                    "CRF",
                    "CREFONO",
                    "COREN",
                    "CREFITO",
                  ]);
                }}
                defaultValue={localStorage.getItem('conselho')}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: "30vw",
                }}
              ></input>
              <div className="text1">NÚMERO DO CONSELHO PROFISSIONAL</div>
              <input
                autoComplete="off"
                placeholder="NÚMERO DO CONSELHO"
                className="input"
                type="text"
                id="inputNumeroConselho"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NÚMERO DO CONSELHO")}
                defaultValue={localStorage.getItem('n_conselho')}
                onKeyUp={() => {
                  masknumbers(timeout, "inputNumeroConselho", 8);
                }}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: "30vw",
                }}
              ></input>

              <div className="text1">UF DO CONSELHO</div>
              <input
                autoComplete="off"
                placeholder="UF DO CONSELHO"
                className="input"
                type="text"
                id="inputUf"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "UF DO CONSELHO")}
                defaultValue={localStorage.getItem('uf_conselho')}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
                }}
              ></input>

              <div className="text1">CÓDIGO CBO</div>
              <input
                autoComplete="off"
                placeholder="CÓDIGO CBO"
                className="input"
                type="text"
                id="inputCodigoCbo"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "CÓDIGO CBO")}
                defaultValue={localStorage.getItem('codigo_cbo')}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
                }}
              ></input>



            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 20 }}>
              <div className="text1">{'ESPECIALIDADE: ' + especialidade}</div>
              <div id="scroll das especialidades"
                className="scroll"
                style={{
                  width: 460, height: 250,
                  backgroundColor: 'white', borderColor: 'white',
                  marginBottom: 15,
                }}>
                <div className="grid2">
                  {arrayespecialidades.map(item => (
                    <div id={'btn-especialidade: ' + item}
                      className={localStorage.getItem('especialidade') == item ? 'button-selected' : 'button'}
                      style={{ minWidth: 200 }}
                      onClick={() => {
                        localStorage.setItem('especialidade', item);
                        setespecialidade(item);
                        selector("scroll das especialidades", 'btn-especialidade: ' + item, 100);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <div
                  className="button-yellow"
                  onClick={(e) => {
                    setviewnewusuario(0);
                    setselectedusuario(0);
                    e.stopPropagation();
                  }}
                >
                  <img
                    alt=""
                    src={back}
                    style={{
                      margin: 10,
                      height: 25,
                      width: 25,
                    }}
                  ></img>
                </div>
                <div
                  className="button-green"
                  id="btnusuario"
                  onClick={() => {
                    if (viewnewusuario == 1) {
                      checkinput(
                        "input",
                        settoast,
                        ["inputNome", "inputDn", "inputContato", "inputCpf"],
                        "btnusuario",
                        insertUsuario,
                        []
                      );
                    } else {
                      checkinput(
                        "input",
                        settoast,
                        ["inputNome", "inputDn", "inputContato", "inputCpf"],
                        "btnusuario",
                        updateUsuario,
                        []
                      );
                    }
                  }}
                >
                  <img
                    alt=""
                    src={salvar}
                    style={{
                      margin: 10,
                      height: 25,
                      width: 25,
                    }}
                  ></img>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    // eslint-disable-next-line
  };

  const [filterusuario, setfilterusuario] = useState("");
  var timeout = null;
  var searchusuario = "";
  const filterUsuario = () => {
    clearTimeout(timeout);
    document.getElementById("inputUsuario").focus();
    searchusuario = document.getElementById("inputUsuario").value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchusuario == "") {
        setfilterusuario("");
        setarrayusuarios(usuarios);
        document.getElementById("inputUsuario").value = "";
        setTimeout(() => {
          document.getElementById("inputUsuario").focus();
        }, 100);
      } else {
        setfilterusuario(
          document.getElementById("inputUsuario").value.toUpperCase()
        );
        setarrayusuarios(
          usuarios.filter((item) => item.nome_usuario.includes(searchusuario))
        );
        document.getElementById("inputUsuario").value = searchusuario;
        setTimeout(() => {
          document.getElementById("inputUsuario").focus();
        }, 100);
      }
    }, 1000);
  };

  // filtro de usuário por nome.
  function FilterUsuario() {
    return (
      <input
        className="input cor2"
        autoComplete="off"
        placeholder="BUSCAR USUÁRIO..."
        onFocus={(e) => (e.target.placeholder = "")}
        onBlur={(e) => (e.target.placeholder = "BUSCAR USUÁRIO...")}
        onKeyUp={() => filterUsuario()}
        type="text"
        id="inputUsuario"
        defaultValue={filterusuario}
        maxLength={100}
        style={{ margin: 0, width: "100%" }}
      ></input>
    );
  }

  const ListaDeUsuarios = useCallback(() => {
    return (
      <div
        className="scroll"
        id="scroll usuários"
        style={{
          width: 400,
          maxWidth: 400,
          height: "60vh",
          marginTop: 10,
        }}
      >
        {arrayusuarios
          .sort((a, b) => (a.nome_usuario > b.nome_usuario ? 1 : -1))
          .map((item) => (
            <div
              key={"usuarios " + Math.random()}
              style={{
                display: arrayusuarios.length > 0 ? "flex" : "none",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                className="button"
                id={"usuario " + item.id_usuario}
                onClick={() => {
                  localStorage.setItem("selecteduser", JSON.stringify(item));
                  setselectedusuario(item);
                  localStorage.setItem('id', item.id_usuario);
                  localStorage.setItem('nome', item.nome_usuario);
                  localStorage.setItem('dn', item.dn_usuario);
                  localStorage.setItem('cpf', item.cpf_usuario);
                  localStorage.setItem('contato', item.contato_usuario);
                  localStorage.setItem('conselho', item.conselho);
                  localStorage.setItem('n_conselho', item.n_conselho);
                  localStorage.setItem('uf_conselho', item.uf_conselho);
                  localStorage.setItem('codigo_cbo', item.codigo_cbo);
                  localStorage.setItem('especialidade', item.tipo_usuario);
                  // acessos.
                  localStorage.setItem('farmacia', item.farmacia);
                  localStorage.setItem('faturamento', item.faturamento);
                  localStorage.setItem('laboratorio', item.laboratorio);
                  localStorage.setItem('paciente', item.paciente);
                  localStorage.setItem('prontuario', item.prontuario);
                  localStorage.setItem('usuarios', item.usuarios);

                  loadTodosAcessos(item.id_usuario);
                  selector("scroll usuários", "usuario " + item.id_usuario, 300);
                }}
                style={{
                  flex: 2,
                  justifyContent: "space-between",
                  paddingLeft: 10,
                }}
              >
                {item.nome_usuario.length < 26 ? item.nome_usuario : item.nome_usuario.substring(0, 25) + '...'}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <div
                    id="btn-edit"
                    className="button-yellow"
                    style={{ width: 50, height: 50 }}
                    onClick={() => {
                      setselectedusuario(item);
                      setviewnewusuario(2);
                    }}
                  >
                    <img
                      alt=""
                      src={editar}
                      style={{
                        margin: 10,
                        height: 30,
                        width: 30,
                      }}
                    ></img>
                  </div>
                  <div
                    id="btn-delete"
                    className="button-yellow"
                    style={{
                      display: item.id_usuario == usuario.id ? "none" : "flex",
                      width: 50,
                      height: 50,
                    }}
                    onClick={() => {
                      modal(
                        setdialogo,
                        "EXCLUIR O USUÁRIO " + item.nome_usuario + "?",
                        deleteUsuario,
                        [item.id_usuario]
                      );
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
                </div>
              </div>
            </div>
          ))}
        <div
          className="text1"
          style={{
            display: arrayusuarios.length == 0 ? "flex" : "none",
            width: "90vw",
            opacity: 0.5,
          }}
        >
          SEM USUÁRIOS CADASTRADOS NA APLICAÇÃO
        </div>
      </div>
    );
    // eslint-disable-next-line
  }, [usuarios, arrayusuarios]);

  // ## ACESSOS ##
  // eslint-disable-next-line
  const [arrayacessos, setarrayacessos] = useState([]);

  // recuperando todos os acessos da base (necessário para gerenciar a exclusão segura de usuários).
  const [todosacessos, settodosacessos] = useState([]);
  const loadTodosAcessos = (id_usuario) => {
    axios
      .get(html + "list_todos_acessos")
      .then((response) => {
        let x = [0, 1];
        x = response.data.rows;
        settodosacessos(x);
        setarrayacessos(x.filter((valor) => valor.id_usuario == id_usuario));
        document.getElementById("usuario " + id_usuario).className =
          "button-selected";
      })
      .catch(function () {
        toast(
          settoast,
          "ERRO AO CARREGAR TODOS OS ACESSOS, REINICIANDO APLICAÇÃO.",
          "black",
          5000
        );
        setTimeout(() => {
          setpagina(0);
          history.push("/");
        }, 5000);
      });
  };

  // registrando um acesso.
  const insertAcesso = (unidade, id_usuario) => {
    var obj = {
      id_cliente: hospital,
      id_unidade: unidade,
      id_usuario: id_usuario,
      boss: null,
    };
    axios
      .post(html + "insert_acesso", obj)
      .then(() => {
        loadTodosAcessos(id_usuario);
        setviewnewacesso(0);
      })
      .catch(function () {
        toast(
          settoast,
          "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.",
          "black",
          5000
        );
        setTimeout(() => {
          setpagina(0);
          history.push("/");
        }, 5000);
      });
  };

  function Acessos() {
    return (
      <div style={{ display: 'flex', width: '100%' }}>
        <div
          id="acessos e módulos"
          style={{
            display: selectedusuario != 0 ? "flex" : "none",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <ListaDeModulos></ListaDeModulos>
        </div>
        <div
          id="vazio"
          style={{
            display: selectedusuario == 0 ? "flex" : "none",
            flexDirection: "column",
            justifyContent: "center",
            width: '40vw', height: 'calc(100vh - 20px)',
          }}
        >
          <img
            className="lupa"
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
    );
  }

  const mudaModulo = (acesso, setstate) => {
    if (localStorage.getItem(acesso) == 1) {
      localStorage.setItem(acesso, 0);
      setstate(0);
    } else {
      localStorage.setItem(acesso, 1);
      setstate(1);
    }
  };

  function ListaDeModulos() {
    const [prontuario, setprontuario] = useState(localStorage.getItem("prontuario"));
    const [pacientes, setpacientes] = useState(localStorage.getItem("paciente"));

    return (
      <div
        style={{
          display: selectedusuario == 0 ? "none" : "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          alignSelf: "center",
          alignItems: "center",
          width: '40vw', height: 'calc(100vh - 20px)',
        }}
      >
        <div className="text3" style={{ margin: 5, padding: 5 }}>
          MÓDULOS DO SISTEMA LIBERADOS:
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <div id="btn-prontuario"
            className={prontuario == 1 ? 'button-selected' : 'button'}
            style={{ width: 150, height: 150 }}
            onClick={() => {
              mudaModulo('prontuario', setprontuario);
            }}
          >
            PRONTUÁRIO
          </div>
          <div id="btn-faturamento"
            className={pacientes == 1 ? 'button-selected' : 'button'}
            style={{ width: 150, height: 150 }}
            onClick={() => mudaModulo('paciente', setpacientes)}
          >
            ADMINISTRATIVO
          </div>
        </div>
        <div
          className="button-green"
          style={{ margin: 5, marginTop: 10, pading: 5, width: 50, height: 50 }}
          onClick={() => { updateAcessoModulos(); setselectedusuario(0); }}
        >
          <img
            alt=""
            src={salvar}
            style={{
              margin: 0,
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
      </div>
    );
  }

  // componente para inserir novo acesso.
  const [viewnewacesso, setviewnewacesso] = useState(0);
  function InsertAcesso() {
    return (
      <div
        className="fundo"
        style={{ display: viewnewacesso == 1 ? "flex" : "none" }}
        onClick={() => {
          setviewnewacesso(0);
          console.log(localStorage.getItem('id'));
          setTimeout(() => {
            document.getElementById("usuario " + localStorage.getItem('id')).className = "button-selected"
          }, 200);
        }}
      >
        <div className="janela" onClick={(e) => e.stopPropagation()}>
          <div
            id="cadastrar acesso"
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {unidades.map((item) => (
              <div
                className="button"
                style={{
                  display: todosacessos.filter(valor => valor.id_usuario == selectedusuario.id_usuario && valor.id_unidade == item.id_unidade).length > 0 ? 'none' : 'flex',
                  width: 100, height: 100
                }}
                onClick={() => {
                  console.log(
                    JSON.parse(window.localStorage.getItem("selecteduser"))
                      .id_usuario
                  );
                  insertAcesso(
                    item.id_unidade,
                    JSON.parse(window.localStorage.getItem("selecteduser"))
                      .id_usuario
                  );
                }}
              >
                {item.nome_unidade}
              </div>
            ))}
          </div>
        </div>
      </div >
    );
  }

  const limpaCampos = () => {
    localStorage.setItem('nome', '');
    localStorage.setItem('dn', '');
    localStorage.setItem('cpf', '');
    localStorage.setItem('contato', '');
    localStorage.setItem('conselho', '');
    localStorage.setItem('n_conselho', '');
    localStorage.setItem('tipo_usuario', '');
  }

  return (
    <div className="main" style={{ display: pagina == 5 ? "flex" : "none" }}>
      <div
        className="chassi"
        id="conteúdo do prontuário"
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', position: 'relative' }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: 'sticky', top: 10,
          }}
        >
          <div id="botões e pesquisa"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignSelf: "center",
              width: "100%",
            }}
          >
            <div
              className="button-yellow"
              style={{ margin: 0, marginRight: 10, width: 50, height: 50 }}
              title={"VOLTAR PARA O LOGIN"}
              onClick={() => {
                setpagina(0);
                history.push("/");
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
            <FilterUsuario></FilterUsuario>
            <div
              className="button-green"
              style={{ margin: 0, marginLeft: 10, width: 50, height: 50 }}
              title={"CADASTRAR USUÁRIO"}
              onClick={() => {
                limpaCampos();
                setselectedusuario(0);
                setviewnewusuario(1);
              }}
            >
              <img
                alt=""
                src={novo}
                style={{
                  margin: 0,
                  height: 30,
                  width: 30,
                }}
              ></img>
            </div>
          </div>
          <ListaDeUsuarios></ListaDeUsuarios>
        </div>
        <Acessos></Acessos>
        <InsertUsuario></InsertUsuario>
        <InsertAcesso></InsertAcesso>
      </div>
    </div>
  );
}

export default Usuarios;
