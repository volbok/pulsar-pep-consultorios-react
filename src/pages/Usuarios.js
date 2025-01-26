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
import deletar from "../images/deletar.png";
import back from "../images/back.png";
import novo from "../images/novo.png";
import salvar from "../images/salvar.png";
import editar from "../images/editar.png";
import lupa from '../images/lupa.png';

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
    agenda, setagenda,
    agendaexame, setagendaexame,
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
      loadAgendaConsultas();
      loadAgendaExames();
      loadAcessos();
      loadFaturamentoClinicaProcedimentos();
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

  const loadUsuarioAndInsertAcesso = (nome_usuario, cpf_usuario) => {
    console.log(nome_usuario);
    console.log(cpf_usuario);
    axios
      .get(html + "list_usuarios")
      .then((response) => {
        setusuarios(response.data.rows);
        setarrayusuarios(response.data.rows);
        let x = response.data.rows;
        console.log(x);
        let usuarionovo = x.filter(item => item.nome_usuario == nome_usuario && item.cpf_usuario == cpf_usuario).map(item => item.id_usuario).pop();
        console.log(usuarionovo);
        // insertAcesso(cliente.id_cliente, usuarionovo);

        var obj = {
          id_cliente: hospital,
          id_unidade: 3,
          id_usuario: usuarionovo,
          boss: null,
        };
        axios
          .post(html + "insert_acesso", obj)
          .then(() => {
            console.log('ACESSO INSERIDO COM SUCESSO');
            loadAcessos();
          })

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
    let nome = obj.nome_usuario;
    let cpf = obj.cpf_usuario;
    axios
      .post(html + "inserir_usuario", obj)
      .then(() => {
        loadUsuarioAndInsertAcesso(nome, cpf);
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
          // PENDENTE!
          // função para deletar acesso às unidades de atendimento.
          console.log(usuario);
          console.log(todosacessos.filter((valor) => valor.id_usuario == usuario));
          arrayacessos.filter((valor) => valor.id_usuario == usuario).map(item => {
            deleteAcesso(item.id_acesso);
            return null;
          });

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

  const deleteAcesso = (item) => {
    axios.get(html + 'delete_acesso/' + item).then(() => {
      console.log('ACESSO EXCLUÍDO COM SUCESSO');
    })
  }

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
          className="janela scroll cor2"
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
                    width: 200,
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
                defaultValue={localStorage.getItem('conselho') == null ? '-X-' : localStorage.getItem('conselho')}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
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
                defaultValue={localStorage.getItem('n_conselho') == null ? '-x-' : localStorage.getItem('n_conselho')}
                onKeyUp={() => {
                  masknumbers(timeout, "inputNumeroConselho", 8);
                }}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
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
                defaultValue={localStorage.getItem('uf_conselho') == null || localStorage.getItem('uf_conselho') == '' ? '-x-' : localStorage.getItem('uf_conselho')}
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
                defaultValue={localStorage.getItem('codigo_cbo') == null || localStorage.getItem('codigo_cbo') == '' ? '-x-' : localStorage.getItem('codigo_cbo')}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
                }}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 20 }}>
              <div className={especialidade == 'ADMINISTRATIVO' ? "button-selected" : "button"}
                style={{ width: 150, maxWidth: 150, alignSelf: 'center' }}
                onClick={() => {
                  localStorage.setItem('especialidade', 'ADMINISTRATIVO');
                  setespecialidade('ADMINISTRATIVO');
                }}
              >
                ADMINISTRATIVO
              </div>
              <div className="text1"
                style={{ display: especialidade != null || especialidade != '' ? 'flex' : 'none' }}>
                {'ESPECIALIDADE: ' + especialidade}
              </div>
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

  const [acessos_cliente, setacessos_cliente] = useState([]);
  const ListaDeUsuarios = useCallback(() => {
    return (
      <div
        className="scroll"
        id="scroll usuários"
        style={{
          flexGrow: 1,
          marginTop: 5,
          width: 'calc(100% - 15px)',
        }}
      >
        {acessos_cliente.map(acesso => (
          <div>
            {arrayusuarios
              .filter(item => item.id_usuario == acesso.id_usuario)
              .sort((a, b) => (a.nome_usuario > b.nome_usuario ? 1 : -1))
              .map((item) => (
                <div
                  key={"usuarios " + Math.random()}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className={selectedusuario.id_usuario == item.id_usuario ? "button-selected" : "button"}
                    id={"usuario " + item.id_usuario}
                    onClick={() => {
                      localStorage.setItem("selecteduser", JSON.stringify(item));
                      setselectedusuario(item);
                      console.log(selectedusuario.id_usuario);
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
                      justifyContent: "space-between",
                      paddingLeft: 10,
                      textAlign: 'left'
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
                            item.id_usuario
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
          </div>
        ))}
        <div
          className="text1"
          style={{
            display: arrayusuarios.length == 0 ? "flex" : "none",
            opacity: 0.5,
          }}
        >
          SEM USUÁRIOS CADASTRADOS NA APLICAÇÃO
        </div>
      </div>
    );
    // eslint-disable-next-line
  }, [usuarios, arrayusuarios, acessos_cliente, selectedusuario]);

  // ## ACESSOS ##
  // eslint-disable-next-line
  const [arrayacessos, setarrayacessos] = useState([]);
  const loadAcessos = () => {
    axios
      .get(html + "list_todos_acessos")
      .then((response) => {
        let x = response.data.rows;
        setacessos_cliente(x.filter(item => item.id_cliente == cliente.id_cliente));
        console.log(x.filter(item => item.id_cliente == cliente.id_cliente));
      });
  }

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
      <div style={{ display: 'flex', width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          id="acessos e módulos"
          style={{
            display: selectedusuario != 0 ? "flex" : "none",
            flexDirection: "column",
            justifyContent: "center",
            alignSelf: 'center',
            marginBottom: 10,
          }}
        >
          <ListaDeModulos></ListaDeModulos>
        </div>
        <div
          id="vazio"
          style={{
            display: selectedusuario == 0 ? "flex" : "none",
            // display: 'none',
            flexDirection: "column",
            justifyContent: "center",
            width: '100%', height: 'calc(100vh - 20px)',
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
          width: '100%',
        }}
      >
        <div className="text3" style={{ margin: 5 }}>
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

  // AGENDAMENTO SEMANAL DE CONSULTAS.
  const loadAgendaConsultas = () => {
    axios.get(html + "list_agenda").then((response) => {
      let x = response.data.rows;
      setagenda(x);
    })
  }

  // AGENDAMENTO SEMANAL DE EXAMES.
  const loadAgendaExames = () => {
    axios.get(html + 'list_agenda_exames/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setagendaexame(x);
    })
  }

  const insertAgenda = (obj) => {
    axios.post(html + 'insert_usuario_agenda', obj).then(() => {
      console.log('registro de agenda inserido com sucesso.');
      loadAgendaConsultas();
    })
  }

  const insertAgendaExames = (obj) => {
    axios.post(html + 'insert_agenda_exame', obj).then(() => {
      console.log('registro de agenda inserido com sucesso.');
      loadAgendaExames();
    })
  }

  const deleteAgenda = (id) => {
    axios.get(html + 'delete_usuario_agenda/' + id).then(() => {
      console.log('REGISTRO DE AGENDA EXCLUÍDO COM SUCESSO');
      loadAgendaConsultas();
    })
  }

  const deleteAgendaExames = (id) => {
    axios.get(html + 'delete_agenda_exame/' + id).then(() => {
      console.log('REGISTRO DE AGENDA EXCLUÍDO COM SUCESSO');
      loadAgendaExames();
    })
  }

  // LISTA DE AGENDAMENTOS PREDEDINIDOS.
  const horariossemana = (dia, filtro, array) => {
    let localarray = [0, 1];
    localarray = array;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', height: '100%', margin: 5 }}>
        <div className="text1" style={{ width: '100%' }}>{dia}</div>
        <div className="cor2" style={{ borderRadius: 5, width: '15vw', padding: 5 }}>
          {localarray.filter(item => item.id_usuario == localStorage.getItem('id') && item.dia_semana == filtro).sort((a, b) => moment(a.hora_inicio, 'HH:mm') > moment(b.hora_inicio, 'HH:mm') ? 1 : -1).map(item => (
            <div className='button'
              style={{
                width: 'calc(100% - 20px)',
                minWidth: 'calc(100% - 20px)',
                maxWidth: 'calc(100% - 20px)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
              <div style={{ marginTop: 10 }}>{item.hora_inicio + ' ÀS ' + item.hora_termino}</div>
              <div
                id="btn-delete-agenda"
                className="button-yellow"
                style={{
                  display: 'flex',
                  width: 20, minWidth: 20, maxWidth: 20,
                  height: 20, minHeight: 20, maxHeight: 20,
                }}
                onClick={() => {
                  modal(
                    setdialogo,
                    "EXCLUIR O HORÁRIO DE AGENDAMENTO?",
                    deleteAgenda,
                    [item.id]
                  );
                }}
              >
                <img
                  alt=""
                  src={deletar}
                  style={{
                    margin: 10,
                    height: 20,
                    width: 20,
                  }}
                ></img>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const horariossemanaexames = (dia, filtro, array) => {
    let localarray = [0, 1];
    localarray = array;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', height: '100%', margin: 5 }}>
        <div className="text1" style={{ width: '100%' }}>{dia}</div>
        <div className="cor2" style={{ borderRadius: 5, width: '15vw', padding: 5 }}>
          {localarray.filter(item => item.id_usuario == localStorage.getItem('id') && item.dia_semana == filtro).sort((a, b) => moment(a.hora_inicio, 'HH:mm') > moment(b.hora_inicio, 'HH:mm') ? 1 : -1).map(item => (
            <div className='button'
              style={{
                width: 'calc(100% - 20px)',
                minWidth: 'calc(100% - 20px)',
                maxWidth: 'calc(100% - 20px)',
                height: 150, minHeight: 150, maxHeight: 150,
                // padding: 30, >> caprichar aqui. Está indo bem!
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
              <div style={{ marginTop: 10 }}>{item.hora_inicio}</div>
              <div style={{ marginTop: 10 }}>{item.exame}</div>
              <div style={{ marginTop: 10 }}>{'DR(A). ' + item.id_nome_usuario}</div>
              <div
                id="btn-delete-agenda"
                className="button-yellow"
                style={{
                  display: 'flex',
                  width: 20, minWidth: 20, maxWidth: 20,
                  height: 20, minHeight: 20, maxHeight: 20,
                }}
                onClick={() => {
                  modal(
                    setdialogo,
                    "EXCLUIR O AGENDAMENTO DO PROCEDIMENTO / EXAME?",
                    deleteAgendaExames,
                    [item.id]
                  );
                }}
              >
                <img
                  alt=""
                  src={deletar}
                  style={{
                    margin: 10,
                    height: 20,
                    width: 20,
                  }}
                ></img>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  let arrayweek = ['SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO']
  const [insertagendaview, setinsertagendaview] = useState(0);
  function InsertAgendaView() {
    var timeout = null;
    const fixHour = (input, valor, storage) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (valor > 23 || valor < 0) {
          document.getElementById(input).value = '';
          document.getElementById(input).focus();
        } else {
          localStorage.setItem(storage, valor);
        }
      }, 100);
    };
    const fixMin = (input, valor, storage) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (valor > 59 || valor < 0) {
          document.getElementById(input).value = '';
          document.getElementById(input).focus();
        } else {
          localStorage.setItem(storage, valor);
        }
      }, 100);
    };
    return (
      <div
        className="fundo"
        style={{ display: insertagendaview == 1 ? "flex" : "none" }}
        onClick={() => {
          setinsertagendaview(0);
          console.log(localStorage.getItem('id'));
          setTimeout(() => {
            document.getElementById("usuario " + localStorage.getItem('id')).className = "button-selected"
          }, 200);
        }}
      >
        <div className="janela" onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', flexDirection: 'column', width: '50vw', height: '80vh' }}>
          <div id="weeklist" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
            {arrayweek.map(item => (
              <div id={'weekday ' + item}
                className="button" style={{ width: 150 }}
                onClick={() => {
                  localStorage.setItem('dia', item);
                  selector("weeklist", 'weekday ' + item, 200);
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 10 }}>
            <div className="text3">HORÁRIO INICIAL DA CONSULTA</div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <input id="inputAgendaHoraInicio"
                autoComplete="off"
                className="input"
                placeholder="HH"
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'HH')}
                onKeyUp={(e) => fixHour('inputAgendaHoraInicio', e.target.value, 'storageAgendaHoraInicio')}
                title="HORAS."
                maxLength={2}
                style={{
                  width: 100,
                  height: 50,
                }}
                min={0}
                max={23}
              ></input>
              <div className='text1'>{' : '}</div>
              <input id="inputAgendaMinutoInicio"
                autoComplete="off"
                className="input"
                placeholder="MM"
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'MM')}
                onKeyUp={(e) => fixMin('inputAgendaMinutoInicio', e.target.value, 'storageAgendaMinutoInicio')}
                title="MINUTOS."
                maxLength={2}
                style={{
                  width: 100,
                  height: 50,
                }}
                min={0}
                max={59}
              ></input>
            </div>
            <div className="text3">HORÁRIO FINAL DA CONSULTA</div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <input id="inputAgendaHoraFinal"
                autoComplete="off"
                className="input"
                placeholder="HH"
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'HH')}
                onKeyUp={(e) => fixHour('inputAgendaHoraFinal', e.target.value, 'storageAgendaHoraFinal')}
                title="HORAS."
                maxLength={2}
                style={{
                  width: 100,
                  height: 50,
                }}
                min={0}
                max={23}
              ></input>
              <div className='text1'>{' : '}</div>
              <input id="inputAgendaMinutoFinal"
                autoComplete="off"
                className="input"
                placeholder="MM"
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'MM')}
                onKeyUp={(e) => fixMin('inputAgendaMinutoFinal', e.target.value, 'storageAgendaMinutoFinal')}
                title="MINUTOS."
                maxLength={2}
                style={{
                  width: 100,
                  height: 50,
                }}
                min={0}
                max={59}
              ></input>
            </div>
            <div id="btnAdd"
              className="button-green"
              title="CONFIRMAR DIA DA SEMANA E HORA."
              onClick={() => {
                let horainicio = localStorage.getItem('storageAgendaHoraInicio') + ':' + localStorage.getItem('storageAgendaMinutoInicio');
                let horatermino = localStorage.getItem('storageAgendaHoraFinal') + ':' + localStorage.getItem('storageAgendaMinutoFinal');
                let obj = {
                  id_usuario: localStorage.getItem('id'),
                  nome_usuario: localStorage.getItem('nome'),
                  dia_semana: localStorage.getItem('dia'),
                  hora_inicio: horainicio,
                  hora_termino: horatermino,
                }
                insertAgenda(obj);
                setinsertagendaview(0);
              }}
              style={{ width: 50, maxWidth: 50, alignSelf: 'center', marginTop: 30 }}
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
        </div>
      </div >
    )
  }


  const [insertagendaexameview, setinsertagendaexameview] = useState(0);
  function InsertAgendaExamesView() {
    // eslint-disable-next-line
    const [selecionaexame, setselecionaexame] = useState(1);
    function SelecionaExame() {
      return (
        <div className="janela scroll" style={{ height: 200, minHeight: 200, maxHeight: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='text1' style={{ fontSize: 18, marginBottom: 5 }}>SELECIONE UM EXAME OU PROCEDIMENTO</div>
          <div className='grid'
            id="lista de procedimentos para agenda"
            style={{
              alignContent: 'flex-start',
            }}
          >
            {procedimentos_cliente.map(item => (
              <div
                key={'exame: ' + item.id}
                className='button'
                id={"btn_exame " + item.id}
                style={{ width: 200, height: 120, paddingLeft: 20, paddingRight: 20 }}
                onClick={() => {
                  localStorage.setItem('procedimento', item.nome_procedimento);
                  localStorage.setItem('codigo_tuss', item.codigo_tuss);
                  localStorage.setItem('valor_convenio', item.valor_convenio);
                  localStorage.setItem('valor_particular', item.valor_particular);
                  setselecionaexame(0);
                  selector("lista de procedimentos para agenda", "btn_exame " + item.id, 100);
                }}
              >
                {item.nome_procedimento}
              </div>
            ))}
          </div>
        </div>
      )
    }
    var timeout = null;
    const fixHour = (input, valor, storage) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (valor > 23 || valor < 0) {
          document.getElementById(input).value = '';
          document.getElementById(input).focus();
        } else {
          localStorage.setItem(storage, valor);
        }
      }, 100);
    };
    const fixMin = (input, valor, storage) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (valor > 59 || valor < 0) {
          document.getElementById(input).value = '';
          document.getElementById(input).focus();
        } else {
          localStorage.setItem(storage, valor);
        }
      }, 100);
    };
    return (
      <div
        className="fundo"
        style={{ display: insertagendaexameview == 1 ? "flex" : "none" }}
        onClick={() => {
          setinsertagendaexameview(0);
          console.log(localStorage.getItem('id'));
          setTimeout(() => {
            document.getElementById("usuario " + localStorage.getItem('id')).className = "button-selected"
          }, 200);
        }}
      >
        <div className="janela" onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', flexDirection: 'column' }}>
          <SelecionaExame></SelecionaExame>
          <div id="weeklist_exames" style={{ marginTop: 20, display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
            {arrayweek.map(item => (
              <div id={'weekday_exame ' + item}
                className="button" style={{ width: 150 }}
                onClick={() => {
                  localStorage.setItem('dia', item);
                  selector("weeklist_exames", 'weekday_exame ' + item, 200);
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 10 }}>
            <div className="text3">HORÁRIO INICIAL DO EXAME</div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <input id="inputAgendaExameHoraInicio"
                autoComplete="off"
                className="input"
                placeholder="HH"
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'HH')}
                onKeyUp={(e) => fixHour('inputAgendaExameHoraInicio', e.target.value, 'storageAgendaHoraInicio')}
                title="HORAS."
                maxLength={2}
                style={{
                  width: 100,
                  height: 50,
                }}
                min={0}
                max={23}
              ></input>
              <div className='text1'>{' : '}</div>
              <input id="inputAgendaMinutoInicio"
                autoComplete="off"
                className="input"
                placeholder="MM"
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'MM')}
                onKeyUp={(e) => fixMin('inputAgendaMinutoInicio', e.target.value, 'storageAgendaMinutoInicio')}
                title="MINUTOS."
                maxLength={2}
                style={{
                  width: 100,
                  height: 50,
                }}
                min={0}
                max={59}
              ></input>
            </div>
            <div id="btnAdd"
              className="button-green"
              title="CONFIRMAR DIA DA SEMANA E HORA."
              onClick={() => {
                let horainicio = localStorage.getItem('storageAgendaHoraInicio') + ':' + localStorage.getItem('storageAgendaMinutoInicio');
                let obj = {
                  id_cliente: cliente.id_cliente,
                  id_usuario: selectedusuario.id_usuario,
                  id_nome_usuario: selectedusuario.nome_usuario,
                  exame: localStorage.getItem('procedimento'),
                  dia_semana: localStorage.getItem('dia'),
                  hora_inicio: horainicio,
                  codigo_tuss: localStorage.getItem('codigo_tuss'),
                }
                insertAgendaExames(obj);
                setinsertagendaexameview(0);
              }}
              style={{ width: 50, maxWidth: 50, alignSelf: 'center', marginTop: 30 }}
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
        </div>
      </div >
    )
  }

  const [tipoagenda, settipoagenda] = useState('CONSULTA');
  function AgendasProfissionais() {
    function AgendaSemanalConsultas() {
      return (
        <div style={{
          display: tipoagenda != 'CONSULTAS' ? 'none' : 'flex',
          flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div className="text3" style={{ margin: 5, marginBottom: 10 }}>
            AGENDAMENTO SEMANAL DE CONSULTAS
          </div>
          <div
            className="scroll"
            style={{
              display: 'flex', flexDirection: 'row',
              height: '100%', minHeight: 300,
              marginBottom: 5,
              backgroundColor: 'white', borderColor: 'white',
              width: '55vw',
              overflowX: 'scroll',
              overflowY: 'hidden',
              paddingBottom: 10,
            }}>
            {horariossemana('SEGUNDA', 'SEGUNDA-FEIRA', agenda)}
            {horariossemana('TERÇA', 'TERÇA-FEIRA', agenda)}
            {horariossemana('QUARTA', 'QUARTA-FEIRA', agenda)}
            {horariossemana('QUINTA', 'QUINTA-FEIRA', agenda)}
            {horariossemana('SEXTA', 'SEXTA-FEIRA', agenda)}
            {horariossemana('SÁBADO', 'SÁBADO', agenda)}
          </div>
          <div
            className="button-green"
            style={{ marginTop: 10 }}
            title={"CADASTRAR AGENDA"}
            onClick={() => {
              setinsertagendaview(1);
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
      )
    }
    function AgendaSemanalExames() {
      return (
        <div style={{
          display: selectedusuario == 0 || tipoagenda != 'EXAMES' ? 'none' : 'flex',
          flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div className="text3" style={{ margin: 5, marginBottom: 10 }}>
            AGENDAMENTO SEMANAL DE EXAMES
          </div>
          <div
            className="scroll"
            style={{
              display: 'flex', flexDirection: 'row',
              height: '100%', minHeight: 300,
              marginBottom: 5,
              backgroundColor: 'white', borderColor: 'white',
              width: '55vw',
              overflowX: 'scroll',
              overflowY: 'hidden',
              paddingBottom: 10,
            }}>
            {horariossemanaexames('SEGUNDA', 'SEGUNDA-FEIRA', agendaexame)}
            {horariossemanaexames('TERÇA', 'TERÇA-FEIRA', agendaexame)}
            {horariossemanaexames('QUARTA', 'QUARTA-FEIRA', agendaexame)}
            {horariossemanaexames('QUINTA', 'QUINTA-FEIRA', agendaexame)}
            {horariossemanaexames('SEXTA', 'SEXTA-FEIRA', agendaexame)}
            {horariossemanaexames('SÁBADO', 'SÁBADO', agendaexame)}
          </div>
          <div
            className="button-green"
            style={{ marginTop: 10 }}
            title={"CADASTRAR AGENDA"}
            onClick={() => {
              setinsertagendaexameview(1);
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
      )
    }
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div className={tipoagenda == 'CONSULTAS' ? "button-selected" : "button"}
            style={{ width: 150 }}
            onClick={() => settipoagenda('CONSULTAS')}
          >
            CONSULTAS
          </div>
          <div className={tipoagenda == 'EXAMES' ? "button-selected" : "button"}
            style={{ width: 150 }}
            onClick={() => settipoagenda('EXAMES')}
          >
            EXAMES OU PROCEDIMENTOS
          </div>
        </div>
        <AgendaSemanalConsultas></AgendaSemanalConsultas>
        <AgendaSemanalExames></AgendaSemanalExames>
      </div>
    )
  }

  return (
    <div className="main"
      style={{ display: pagina == 5 ? "flex" : "none" }}>
      <div
        className="scroll"
        id="conteúdo do prontuário"
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', position: 'relative',
          width: 'calc(100% - 20px)',
          height: 'calc(100vh - 20px)',
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderStyle: 'hidden',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: '30vw',
            marginRight: 10,
            position: 'sticky',
            top: 0,
          }}
        >
          <div id="botões e pesquisa"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignSelf: "center",
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
        <div
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            alignSelf: 'center', height: '100%', width: 'calc(80vw - 20px)'
          }}>
          <Acessos></Acessos>
          <AgendasProfissionais></AgendasProfissionais>
        </div>
        <InsertUsuario></InsertUsuario>
        <InsertAcesso></InsertAcesso>
        <InsertAgendaView></InsertAgendaView>
        <InsertAgendaExamesView></InsertAgendaExamesView>
      </div>
    </div>
  );
}

export default Usuarios;
