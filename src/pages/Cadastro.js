/* eslint eqeqeq: "off" */
import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
import "moment/locale/pt-br";
// router.
import { useHistory } from "react-router-dom";
// funções.
import toast from "../functions/toast";
import checkinput from "../functions/checkinput";
import maskdate from "../functions/maskdate";
import maskphone from "../functions/maskphone";
// imagens.
import salvar from "../images/salvar.svg";
import deletar from "../images/deletar.svg";
import back from "../images/back.svg";
import novo from "../images/novo.svg";
import modal from "../functions/modal";

function Cadastro() {
  // context.
  const {
    html,
    pagina,
    setpagina,
    setusuario,
    settoast,
    setdialogo,
    unidade,
    setunidade,
    hospital,
    unidades,
    pacientes,
    setpacientes,
    paciente,
    setpaciente,
    atendimentos,
    setatendimentos,
    setoperadoras, operadoras,
    setprocedimentos, procedimentos,
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

  const [atendimento, setatendimento] = useState([]);
  const [viewopcoesconvenio, setviewopcoesconvenio] = useState(0);
  const [viewtipoconsulta, setviewtipoconsulta] = useState(0);
  useEffect(() => {
    if (pagina == 2) {
      setpaciente([]);
      setatendimento([]);
      loadPacientes();
      loadOperadoras();
      loadProcedimentos();
      loadAtendimentos();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // carregando operadoras de saúde.
  const loadOperadoras = () => {
    axios.get(html + 'all_operadoras').then((response) => {
      setoperadoras(response.data.rows);

    })
  };

  const loadProcedimentos = () => {
    axios.get(html + 'all_procedimentos').then((response) => {
      setprocedimentos(response.data.rows);
      console.log(response.data.rows)
    })
  };

  const [viewoperadoraselector, setviewoperadoraselector] = useState(0);
  function FormOperadoraSelector() {
    return (
      <div className="fundo"
        style={{
          display: viewoperadoraselector == 1 ? 'flex' : 'none',
          flexDirection: 'column', justifyContent: 'center'
        }}
        onClick={() => setviewoperadoraselector(0)}
      >
        <div className="janela scroll"
          style={{ height: '90vh', width: '40vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            className="input"
            autoComplete="off"
            placeholder={
              "BUSCAR..."
            }
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) =>
              "BUSCAR..."
            }
            // onKeyUp={() => filterProcedimento()}
            type="text"
            id="filtrarProcedimento"
            // defaultValue={filterprocedimento}
            maxLength={100}
            style={{ width: 'calc(100% - 20px)', backgroundColor: 'white' }}
          ></input>
          {operadoras.map(item => (
            <div
              className="button"
              style={{ width: 'calc(100% - 20px)', padding: 10, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}
              onClick={() => {
                setviewoperadoraselector(0);
                setTimeout(() => {
                  document.getElementById("inputConvenioNome").value = item.nome_operadora;
                  document.getElementById("inputConvenioCodigo").value = item.id; // id do convênio no banco de dados Pulsar (não é o registr ANS).
                }, 1000);
              }}>
              <div>{item.nome_operadora}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // recuperando registros de pacientes cadastrados na aplicação.
  const [arraypacientes, setarraypacientes] = useState([]);
  const loadPacientes = () => {
    axios
      .get(html + "list_pacientes")
      .then((response) => {
        setpacientes(response.data.rows);
        setarraypacientes(response.data.rows);
      })
      .catch(function (error) {
        if (error.response == undefined) {
          toast(
            settoast,
            "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO: " + error,
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

  // recuperando registros de pacientes cadastrados na aplicação.
  const loadAtendimentos = () => {
    axios
      .get(html + "allatendimentos/" + hospital)
      .then((response) => {
        setatendimentos(response.data.rows);
      })
      .catch(function () {
        toast(
          settoast,
          "ERRO AO CARREGAR ATENDIMENTOS, REINICIANDO APLICAÇÃO.",
          "black",
          5000
        );
        setTimeout(() => {
          setpagina(0);
          history.push("/");
        }, 5000);
      });
  };

  // registrando um novo paciente.
  const insertPaciente = () => {
    var obj = {
      nome_paciente: document
        .getElementById("inputEditNomePaciente")
        .value.toUpperCase(),
      nome_mae_paciente: document
        .getElementById("inputEditNomeMae")
        .value.toUpperCase(),
      dn_paciente: moment(
        document.getElementById("inputEditDn").value,
        "DD/MM/YYYY"
      ),

      antecedentes_pessoais: null,
      medicacoes_previas: null,
      exames_previos: null,
      exames_atuais: null,

      tipo_documento: document
        .getElementById("inputEditTipoDocumento")
        .value.toUpperCase(),
      numero_documento: document
        .getElementById("inputEditNumeroDocumento")
        .value.toUpperCase(),
      cns: document
        .getElementById("inputEditCns")
        .value.toUpperCase(),
      endereco: document
        .getElementById("inputEditEndereco")
        .value.toUpperCase(),

      logradouro: document
        .getElementById("inputEditLogradouro")
        .value.toUpperCase(),
      bairro: document
        .getElementById("inputEditBairro")
        .value.toUpperCase(),
      localidade: document
        .getElementById("inputEditLocalidade")
        .value.toUpperCase(),
      uf: document
        .getElementById("inputEditUf")
        .value.toUpperCase(),
      cep: document
        .getElementById("inputEditCep")
        .value.toUpperCase(),

      telefone: document
        .getElementById("inputEditTelefone")
        .value.toUpperCase(),
      email: document.getElementById("inputEditEmail").value,

      nome_responsavel: document
        .getElementById("inputEditNomeResponsavel")
        .value.toUpperCase(),
      sexo: document
        .getElementById("inputEditSexo")
        .value.toUpperCase(),
      nacionalidade: document
        .getElementById("inputEditNacionalidade")
        .value.toUpperCase(),
      cor: document
        .getElementById("inputEditCor")
        .value.toUpperCase(),
      etnia: document
        .getElementById("inputEditEtnia")
        .value.toUpperCase(),

      orgao_emissor: document
        .getElementById("inputEditOrgaoEmissor")
        .value.toUpperCase(),
      endereco_numero: document
        .getElementById("inputEditEnderecoNumero")
        .value.toUpperCase(),
      endereco_complemento: document
        .getElementById("inputEditEnderecoComplemento")
        .value.toUpperCase(),

      // CONVÊNIO.
      convenio_nome: document
        .getElementById("inputConvenioNome")
        .value.toUpperCase(),
      convenio_codigo: document
        .getElementById("inputConvenioCodigo")
        .value.toUpperCase(),
      convenio_carteira: document
        .getElementById("inputConvenioCarteira")
        .value.toUpperCase(),
      validade_carteira: document
        .getElementById("inputValidadeCarteira")
        .value.toUpperCase(),
      nome_social: document
        .getElementById("inputNomeSocial")
        .value.toUpperCase(),
    };
    axios
      .post(html + "insert_paciente", obj)
      .then(() => {
        loadPacientes();
        setvieweditpaciente(0);
        toast(
          settoast,
          "PACIENTE CADASTRADO COM SUCESSO NA BASE PULSAR",
          "rgb(82, 190, 128, 1)",
          3000
        );
      })
      .catch(function () {
        toast(
          settoast,
          "ERRO AO INSERIR PACIENTE, REINICIANDO APLICAÇÃO.",
          "black",
          5000
        );
        setTimeout(() => {
          setpagina(0);
          history.push("/");
        }, 5000);
      });
  };

  // excluir um paciente.
  const deletePaciente = (paciente) => {
    axios
      .get(html + "delete_paciente/" + paciente)
      .then(() => {
        loadPacientes();
        toast(
          settoast,
          "PACIENTE EXCLUÍDO COM SUCESSO DA BASE PULSAR",
          "rgb(82, 190, 128, 1)",
          3000
        );
        // excluindo todos os registros de atendimentos relativos ao paciente excluído.
        atendimentos
          .filter((atendimento) => atendimento.id_paciente == paciente)
          .map((atendimento) => {
            deleteAtendimento(atendimento.id_atendimento);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              loadAtendimentos();
              setvieweditpaciente(0);
            }, 1000);
            return null;
          });
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

  // registrando um novo atendimento.
  const insertAtendimento = (id, nome, leito) => {
    var obj = {
      data_inicio: moment(),
      data_termino: null,
      historia_atual: null,
      id_paciente: id,
      id_unidade: unidade,
      nome_paciente: nome,
      leito: leito,
      situacao: 1, // 1 = atendimento ativo; 0 = atendimento encerrado.
      id_cliente: hospital,
      classificacao: null,
      id_profissional: null,
      convenio_id: null,
      convenio_carteira: null,
      faturamento_codigo_procedimento: null,
    };
    axios
      .post(html + "insert_atendimento", obj)
      .then(() => {
        loadAtendimentos();
        loadLeitos(unidade);
        setvieweditpaciente(0);
        setviewseletorunidades(0);
        toast(
          settoast,
          "ATENDIMENTO INICIADO COM SUCESSO",
          "rgb(82, 190, 128, 1)",
          3000
        );
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

  // atualizando um atendimento (mudando de leito).
  const updateAtendimento = (leito, atendimento) => {
    let leito_atual = null
    let id_leito_atual = null;
    let unidade_atual = null;
    axios.get(html + "allatendimentos/" + hospital).then((response) => {
      let x = response.data.rows;
      unidade_atual = x.filter(item => item.id_atendimento == atendimento.map(valor => valor.id_atendimento)).map(item => item.id_unidade).pop();
      leito_atual = x.filter(item => item.id_atendimento == atendimento.map(valor => valor.id_atendimento)).map(item => item.leito).pop();
      console.log('LEITO ATUAL DO ATENDIMENTO, A SER LIBERADO: ' + leito_atual);
      // recuperando a id do leito atual, a ter seu status alterado para livre.
      axios.get(html + "list_all_leitos").then((response) => {
        let y = response.data.rows;
        id_leito_atual = y.filter(valor => valor.leito == leito_atual && valor.id_unidade == unidade_atual).map(item => item.id_leito).pop();
        console.log('ID LEITO ATUAL A SER LIBERADO: ' + id_leito_atual);
        // liberando o leito.
        var obj = {
          id_unidade: unidade_atual,
          leito: leito_atual,
          status: 'LIVRE',
        };
        console.log(obj);
        axios.post(html + "update_leito/" + id_leito_atual, obj).then(() => {
          // atualizando o atendimento no novo leito.
          atendimento.map((item) => {
            var obj = {
              data_inicio: item.data_inicio,
              data_termino: null,
              problemas: item.problemas,
              id_paciente: item.id_paciente,
              id_unidade: unidade,
              nome_paciente: item.nome_paciente,
              leito: leito,
              situacao: 1,
              id_cliente: hospital,
              classificacao: item.classificacao,
              id_profissional: item.id_profissional,
              convenio_id: item.convenio_id,
              convenio_carteira: item.convenio_carteira,
              faturamento_codigo_procedimento: item.faturamento_codigo_procedimento,
            };
            axios
              .post(html + "update_atendimento/" + item.id_atendimento, obj)
              .then(() => {
                axios
                  .get(html + "allatendimentos/" + hospital)
                  .then((response) => {
                    setatendimentos(response.data.rows);
                    loadLeitos(unidade);
                    setvieweditpaciente(0);
                  })
              })
            return null;
          });
        });
      });
    });
  };

  // encerrando um atendimento.
  const closeAtendimento = (atendimento) => {
    atendimento.map((item) => {
      var obj = {
        data_inicio: item.data_inicio,
        data_termino: moment(),
        historia_atual: item.historia_atual,
        id_paciente: item.id_paciente,
        id_unidade: item.id_unidade,
        nome_paciente: item.nome_paciente,
        leito: item.leito,
        situacao: 0, // 1 = atendimento ativo; 0 = atendimento encerrado.
        id_cliente: hospital,
        classificacao: item.classificacao,
        id_profissional: item.id_profissional,
        convenio_id: item.convenio_id,
        convenio_carteira: item.convenio_carteira,
        faturamento_codigo_procedimento: item.faturamento_codigo_procedimento,
      };
      axios
        .post(html + "update_atendimento/" + item.id_atendimento, obj)
        .then(() => {
          // rcuperando a id do leito a ter seu status alterado para livre.
          let id_leito = statusleitos.filter((valor) => valor.leito == item.leito && valor.id_unidade == unidade).map(item => item.id_leito);
          // liberando o leito.
          var obj = {
            id_unidade: unidade,
            leito: item.leito,
            status: 'LIVRE',
          };
          axios.post(html + "update_leito/" + id_leito, obj);
          setvieweditpaciente(0);
          loadLeitos(unidade);
          loadAtendimentos();
          toast(
            settoast,
            "ATENDIMENTO ENCERRADO COM SUCESSO NA BASE PULSAR",
            "rgb(82, 190, 128, 1)",
            3000
          );
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
      return null;
    });
  };

  // excluir um atendimento.
  const deleteAtendimento = (id) => {
    axios.get(html + "delete_atendimento/" + id).catch(function () {
      toast(settoast, "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.", "black", 5000);
      setTimeout(() => {
        setpagina(0);
        history.push("/");
      }, 5000);
    });
  };

  const [viewtipodocumento, setviewtipodocumento] = useState(0);
  function ViewTipoDocumento() {
    let array = ["CPF", "RG", "CERT. NASCTO.", "OUTRO"];
    return (
      <div
        className="fundo"
        style={{ display: viewtipodocumento == 1 ? "flex" : "none" }}
        onClick={() => setviewtipodocumento(0)}
      >
        <div className="janela scroll" onClick={(e) => e.stopPropagation()}>
          {array.map((item) => (
            <div
              className="button"
              style={{ width: 100 }}
              onClick={() => {
                document.getElementById("inputEditTipoDocumento").value = item;
                setviewtipodocumento(0);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const [filterpaciente, setfilterpaciente] = useState("");
  var timeout = null;
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
        setarraypacientes(pacientes);
        document.getElementById("inputPaciente").value = "";
        setTimeout(() => {
          document.getElementById("inputPaciente").focus();
        }, 100);
      } else {
        setfilterpaciente(
          document.getElementById("inputPaciente").value.toUpperCase()
        );
        setarraypacientes(
          pacientes.filter((item) =>
            item.nome_paciente.includes(searchpaciente)
          )
        );
        document.getElementById("inputPaciente").value = searchpaciente;
        setTimeout(() => {
          document.getElementById("inputPaciente").focus();
        }, 100);
      }
    }, 1000);
  };

  // filtro de paciente por nome.
  function FilterPaciente() {
    return (
      <input
        className="input"
        autoComplete="off"
        placeholder="BUSCAR PACIENTE..."
        onFocus={(e) => (e.target.placeholder = "")}
        onBlur={(e) => (e.target.placeholder = "BUSCAR PACIENTE...")}
        onKeyUp={() => filterPaciente()}
        type="text"
        id="inputPaciente"
        defaultValue={filterpaciente}
        maxLength={100}
        style={{ margin: 0, width: window.innerWidth < 426 ? "100%" : "30vw" }}
      ></input>
    );
  }

  function ListaDePacientes() {
    return (
      <div style={{ position: 'relative' }}>
        <BuscaPaciente></BuscaPaciente>
        <div className="grid"
          style={{
            marginTop: 10,
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
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}
                onClick={() => {
                  setpaciente(item);
                  setatendimento(
                    atendimentos.filter(
                      (valor) =>
                        valor.id_cliente == hospital &&
                        valor.data_termino == null &&
                        valor.id_paciente == item.id_paciente
                    ));
                  setvieweditpaciente(1)
                }}
              >
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
                <div
                  className="button"
                  style={{
                    width: 'calc(100% - 20px)',
                    backgroundColor:
                      atendimentos.filter(
                        (valor) =>
                          valor.id_paciente == item.id_paciente &&
                          valor.data_termino == null
                      ).length > 0
                        ? "rgb(82, 190, 128, 1)"
                        : "#66b2b2"
                  }}
                >
                  {atendimentos.filter(
                    (valor) =>
                      valor.id_paciente == item.id_paciente &&
                      valor.data_termino == null
                  ).length > 0
                    ? "EM ATENDIMENTO"
                    : "INICIAR ATENDIMENTO"}
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
    );
  }

  // api para busca do endereço pelo CEP:
  const pegaEndereco = (cep) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://viacep.com.br/ws/" + cep + "/json/", true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onreadystatechange = function () {
      if ((xhr.readyState == 0 || xhr.readyState == 4) && xhr.status == 200) {
        let endereco = JSON.parse(xhr.responseText);
        if (endereco.logradouro != undefined) {
          console.log("ENDEREÇO: " + endereco.logradouro);
          document.getElementById("inputEditEndereco").value =
            endereco.logradouro +
            ", BAIRRO: " +
            endereco.bairro +
            ", " +
            endereco.localidade +
            " - " +
            endereco.uf +
            " - CEP: " +
            endereco.cep;
          document.getElementById("inputEditCep").value = endereco.cep;
          document.getElementById("inputEditLogradouro").value = endereco.logradouro.toUpperCase();
          document.getElementById("inputEditBairro").value = endereco.bairro.toUpperCase();
          document.getElementById("inputEditLocalidade").value = endereco.localidade.toUpperCase();
          document.getElementById("inputEditUf").value = endereco.uf.toUpperCase();
        } else {
          document.getElementById("inputEditEndereco").value = "";
          document.getElementById("inputEditCep").value = "CEP";
        }
      }
    };
    xhr.send(null);
  };

  const [vieweditpaciente, setvieweditpaciente] = useState(0);
  const DadosPacienteAtendimento = useCallback(() => {
    var timeout = null;
    return (
      <div
        className="fundo"
        style={{ display: (vieweditpaciente == 1 || vieweditpaciente == 2) && atendimento != null ? "flex" : "none" }}
        onClick={() => setvieweditpaciente(0)}
      >
        <div
          className="janela"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            flexDirection: "row",
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          <div id="botão para fechar tela de edição do paciente e movimentação de leito"
            className="button-yellow"
            onClick={() => setvieweditpaciente(0)}
            style={{
              display: vieweditpaciente == 1 ? "flex" : "none",
              position: 'absolute', top: 10, right: 10
            }}
          >
            <img
              alt=""
              src={back}
              style={{
                margin: 10,
                height: 30,
                width: 30,
              }}
            ></img>
          </div>
          <div id="dados do paciente"
            className="scroll"
            style={{
              flexDirection: "column",
              justifyContent: 'flex-start',
              alignItems: "center",
              height: '85vh',
              marginRight: vieweditpaciente == 1 ? 20 : '',
            }}
          >
            <div id="nome do paciente"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">NOME DO PACIENTE</div>
              <textarea
                autoComplete="off"
                placeholder="NOME DO PACIENTE"
                className="textarea"
                type="text"
                id="inputEditNomePaciente"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NOME DO PACIENTE")}
                defaultValue={vieweditpaciente == 1 ? paciente.nome_paciente : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 400,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="nome do paciente"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">NOME SOCIAL</div>
              <textarea
                autoComplete="off"
                placeholder="NOME SOCIAL"
                className="textarea"
                type="text"
                id="inputNomeSocial"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NOME SOCIAL")}
                defaultValue={vieweditpaciente == 1 ? paciente.nome_social : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 400,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="nome do responsavel"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">NOME DO RESPONSÁVEL</div>
              <textarea
                autoComplete="off"
                placeholder="NOME DO RESPONSÁVEL"
                className="textarea"
                type="text"
                id="inputEditNomeResponsavel"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NOME DO RESPONSÁVEL")}
                defaultValue={vieweditpaciente == 1 ? paciente.nome_responsavel : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 400,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="dn paciente"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">DATA DE NASCIMENTO</div>
              <textarea
                autoComplete="off"
                placeholder="DN"
                className="textarea"
                type="text"
                inputMode="numeric"
                maxLength={10}
                id="inputEditDn"
                title="FORMATO: DD/MM/YYYY"
                onClick={() => document.getElementById("inputEditDn").value = ""}
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "DN")}
                onKeyUp={() => maskdate(timeout, "inputEditDn")}
                defaultValue={vieweditpaciente == 1 ? moment(paciente.dn_paciente).format("DD/MM/YYYY") : moment().format('DD/MM/YYYY')}
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
            <div id="sexo"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">SEXO</div>
              <textarea
                autoComplete="off"
                placeholder="SEXO"
                className="textarea"
                type="text"
                id="inputEditSexo"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "SEXO")}
                defaultValue={vieweditpaciente == 1 ? paciente.sexo : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  textAlign: "center",
                  width: 100,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="nacionalidade"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">NACIONALIDADE</div>
              <textarea
                autoComplete="off"
                placeholder="NACIONALIDADE"
                className="textarea"
                type="text"
                id="inputEditNacionalidade"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NACIONALIDADE")}
                defaultValue={vieweditpaciente == 1 ? paciente.nacionalidade : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 400,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="cor"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">COR</div>
              <textarea
                autoComplete="off"
                placeholder="COR"
                className="textarea"
                type="text"
                id="inputEditCor"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "COR")}
                defaultValue={vieweditpaciente == 1 ? paciente.cor : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 400,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="etnia"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">ETNIA</div>
              <textarea
                autoComplete="off"
                placeholder="ETNIA"
                className="textarea"
                type="text"
                id="inputEditEtnia"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "ETNIA")}
                defaultValue={vieweditpaciente == 1 ? paciente.etnia : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 400,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>

            <div id="documento"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">DOCUMENTO</div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <input id="inputEditTipoDocumento"
                  autoComplete="off"
                  placeholder="TIPO DE DOC."
                  className="input destacaborda"
                  type="text"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "TIPO DE DOC.")}
                  defaultValue={vieweditpaciente == 1 ? paciente.tipo_documento : ''}
                  onClick={() => setviewtipodocumento(1)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 130,
                    alignContent: "center",
                    textAlign: "center",
                  }}
                ></input>
                <textarea id="inputEditNumeroDocumento"
                  autoComplete="off"
                  placeholder="NÚMERO DO DOCUMENTO"
                  className="textarea"
                  type="text"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "NÚMERO DO DOCUMENTO")}
                  defaultValue={vieweditpaciente == 1 ? paciente.numero_documento : ''}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    textAlign: "center",
                    width: 100,
                    padding: 15,
                    height: 20,
                    minHeight: 20,
                    maxHeight: 20,
                  }}
                ></textarea>
              </div>
            </div>
            <div id="orgao emissor"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">ÓRGÃO EMISSOR</div>
              <textarea
                autoComplete="off"
                placeholder="ÓRGÃO EMISSOR"
                className="textarea"
                type="text"
                id="inputEditOrgaoEmissor"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "ÓRGÃO EMISSOR")}
                defaultValue={vieweditpaciente == 1 ? paciente.orgao_emissor : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="cns"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">CNS</div>
              <textarea
                title="CNS = CARTÃO NACIONAL DE SAÚDE."
                autoComplete="off"
                placeholder="CNS"
                className="textarea"
                type="text"
                id="inputEditCns"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "CNS")}
                defaultValue={vieweditpaciente == 1 ? paciente.cns : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="nome da mae"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">NOME DA MÃE</div>
              <textarea
                autoComplete="off"
                placeholder="NOME DA MÃE"
                className="textarea"
                type="text"
                id="inputEditNomeMae"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NOME DA MÃE")}
                defaultValue={vieweditpaciente == 1 ? paciente.nome_mae_paciente : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 400,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="endereco completo"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">ENDEREÇO</div>
              <textarea
                autoComplete="off"
                placeholder="BUSCAR CEP..."
                className="textarea"
                type="text"
                id="inputEditCep"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "BUSCAR CEP...")}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  textAlign: 'center',
                  width: 100,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
                onKeyUp={() => {
                  clearTimeout(timeout);
                  timeout = setTimeout(() => {
                    pegaEndereco(document.getElementById("inputEditCep").value);
                  }, 2000);
                }}
              ></textarea>
              <textarea id="inputEditEndereco"
                className="textarea"
                type="text"
                defaultValue={vieweditpaciente == 1 ? paciente.endereco : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 400,
                  padding: 15,
                  height: 75,
                  minHeight: 75,
                  maxHeight: 75,
                }}
              ></textarea>

              <div id="endereco - logradouro"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="text1">LOGRADOURO</div>
                <textarea
                  className="textarea"
                  type="text"
                  id="inputEditLogradouro"
                  placeholder="LOGRADOURO"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "LOGRADOURO (RUA, PRAÇA)...")}
                  defaultValue={vieweditpaciente == 1 ? paciente.logradouro : ''}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 400,
                    padding: 15,
                    height: 20,
                    minHeight: 20,
                    maxHeight: 20,
                  }}
                ></textarea>
              </div>
              <div id="endereco - numero"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="text1">NÚMERO</div>
                <textarea
                  className="textarea"
                  type="text"
                  id="inputEditEnderecoNumero"
                  placeholder="NÚMERO"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "NUMERO...")}
                  defaultValue={vieweditpaciente == 1 ? paciente.endereco_numero : ''}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 100,
                    padding: 15,
                    height: 20,
                    minHeight: 20,
                    maxHeight: 20,
                  }}
                ></textarea>
              </div>
              <div id="endereco - complemento"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="text1">COMPLEMENTO</div>
                <textarea
                  className="textarea"
                  type="text"
                  id="inputEditEnderecoComplemento"
                  placeholder="COMPLEMENTO"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "COMPLEMENTO...")}
                  defaultValue={vieweditpaciente == 1 ? paciente.endereco_complemento : ''}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 400,
                    padding: 15,
                    height: 20,
                    minHeight: 20,
                    maxHeight: 20,
                  }}
                ></textarea>
              </div>
              <div id="endereco - bairro"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="text1">BAIRRO</div>
                <textarea
                  className="textarea"
                  type="text"
                  id="inputEditBairro"
                  placeholder="BAIRRO"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "BAIRRO...")}
                  defaultValue={vieweditpaciente == 1 ? paciente.bairro : ''}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 400,
                    padding: 15,
                    height: 20,
                    minHeight: 20,
                    maxHeight: 20,
                  }}
                ></textarea>
              </div>
              <div id="endereco - localidade"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="text1">CIDADE/LOCALIDADE</div>
                <textarea
                  className="textarea"
                  type="text"
                  id="inputEditLocalidade"
                  placeholder="LOCALIDADE"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "LOCALIDADE (CIDADE)...")}
                  defaultValue={vieweditpaciente == 1 ? paciente.localidade : ''}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 400,
                    padding: 15,
                    height: 20,
                    minHeight: 20,
                    maxHeight: 20,
                  }}
                ></textarea>
              </div>
              <div id="endereco - uf"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="text1">UF</div>
                <textarea
                  className="textarea"
                  type="text"
                  id="inputEditUf"
                  placeholder="UF"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "UF")}
                  defaultValue={vieweditpaciente == 1 ? paciente.uf : ''}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    textAlign: "center",
                    width: 100,
                    padding: 15,
                    height: 20,
                    minHeight: 20,
                    maxHeight: 20,
                  }}
                ></textarea>
              </div>
            </div>
            <div className="button"
              onClick={() => {
                if (viewoperadoraselector == 1) {
                  setviewoperadoraselector(0);
                } else {
                  setviewoperadoraselector(1);
                }
              }}
            >
              SELECIONAR OPERADORA
            </div>
            <FormOperadoraSelector></FormOperadoraSelector>
            <div id="convenio - nome"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">NOME DO CONVÊNIO</div>
              <textarea
                className="textarea"
                type="text"
                id="inputConvenioNome"
                placeholder="NOME DO CONVÊNIO"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NOME DO CONVÊNIO")}
                defaultValue={vieweditpaciente == 1 ? paciente.convenio_nome : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="convenio - codigo"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">CÓDIGO DO CONVÊNIO</div>
              <textarea
                className="textarea"
                type="text"
                id="inputConvenioCodigo"
                placeholder="CÓDIGO DO CONVÊNIO"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "CÓDIGO DO CONVÊNIO")}
                defaultValue={vieweditpaciente == 1 ? paciente.convenio_codigo : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="convenio - carteira"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">NÚMERO DA CARTEIRA DO BENEFICIÁRIO</div>
              <textarea
                className="textarea"
                type="text"
                id="inputConvenioCarteira"
                placeholder="NÚMERO DA CARTEIRA"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NÚMERO DA CARTEIRA")}
                defaultValue={vieweditpaciente == 1 ? paciente.convenio_carteira : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="convenio - validade carteira"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">VALIDADE DA CARTEIRA DO BENEFICIÁRIO</div>
              <textarea
                className="textarea"
                type="text"
                id="inputValidadeCarteira"
                placeholder="VALIDADE DA CARTEIRA"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "VALIDADE DA CARTEIRA")}
                defaultValue={vieweditpaciente == 1 ? paciente.validade_carteira : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 200,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="telefone"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">TELEFONE</div>
              <textarea
                autoComplete="off"
                placeholder="TELEFONE"
                className="textarea"
                type="text"
                id="inputEditTelefone"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "TELEFONE")}
                defaultValue={vieweditpaciente == 1 ? paciente.telefone : ''}
                onKeyUp={() =>
                  maskphone(timeout, "inputEditTelefone")
                }
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 100,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="email"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">EMAIL</div>
              <textarea
                autoComplete="off"
                placeholder="EMAIL"
                className="textarea nocaps"
                type="text"
                id="inputEditEmail"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "EMAIL")}
                defaultValue={vieweditpaciente == 1 ? paciente.email : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 400,
                  padding: 15,
                  height: 20,
                  minHeight: 20,
                  maxHeight: 20,
                }}
              ></textarea>
            </div>
            <div id="botões da tela editar paciente"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <div id="botão para fechar tela de edição do paciente e movimentação de leito"
                className="button-yellow"
                onClick={() => setvieweditpaciente(0)}
                style={{ display: vieweditpaciente == 2 ? "flex" : "none" }}
              >
                <img
                  alt=""
                  src={back}
                  style={{
                    margin: 10,
                    height: 30,
                    width: 30,
                  }}
                ></img>
              </div>
              <div id="btnUpdatePaciente"
                title={vieweditpaciente == 1 ? "ATUALIZAR DADOS DO PACIENTE" : "SALVAR REGISTRO DE PACIENTE"}
                className="button-green"
                onClick={() => {
                  if (vieweditpaciente == 1) {
                    checkinput('textarea', settoast, ["inputEditNomePaciente", "inputEditDn", "inputEditNumeroDocumento", "inputEditNomeMae", "inputEditEndereco", "inputEditTelefone", "inputEditEmail"], "btnUpdatePaciente", updatePaciente, [])
                  } else {
                    checkinput('textarea', settoast, ["inputEditNomePaciente", "inputEditDn", "inputEditNumeroDocumento", "inputEditNomeMae", "inputEditEndereco", "inputEditTelefone", "inputEditEmail"], "btnUpdatePaciente", insertPaciente, [])
                  }
                }}
                style={{ width: 50, height: 50, alignSelf: "center" }}
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
              <div id="btnDeletePaciente"
                title="EXCLUIR PACIENTE"
                className="button-yellow"
                onClick={() => {
                  modal(
                    setdialogo,
                    "TEM CERTEZA QUE DESEJA EXCLUIR O REGISTRO DESTE PACIENTE? ESTA AÇÃO É IRREVERSÍVEL.",
                    deletePaciente,
                    paciente.id_paciente
                  );
                }}
                style={{ width: 50, height: 50, alignSelf: "center" }}
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
          <SelecionaConvenioPaciente></SelecionaConvenioPaciente>
          <ViewTipoConsulta></ViewTipoConsulta>
          <div id="card status de atendimento"
            className="card cor7"
            style={{
              position: "sticky",
              top: 10,
              display: vieweditpaciente == 1 ? "flex" : "none",
              flexDirection: "column",
              justifyContent: "center",
              marginTop: 0,
              marginBottom: 20,
              width: '40vw',
            }}
          >
            <div id="paciente sem atendimento ativo"
              style={{
                display:
                  atendimentos.filter(
                    (item) =>
                      item.id_paciente == paciente.id_paciente &&
                      item.data_termino == null
                  ).length == 0
                    ? "flex"
                    : "none",
                flexDirection: "column",
                justifyContent: "center",
                width: window.innerWidth < 426 ? "70vw" : "30vw",
                alignSelf: "center",
              }}
            >
              <div className="text1" style={{ margin: 15, width: '100%' }}>
                {
                  "PACIENTE NÃO ESTÁ EM ATENDIMENTO NOS HOSPITAIS CADASTRADOS EM NOSSA BASE."
                }
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              ></div>
            </div>
            <div id="em atendimento na unidade logada"
              className="card cor5hover"
              style={{
                display:
                  atendimentos.filter(
                    (item) =>
                      item.id_paciente == paciente.id_paciente &&
                      item.data_termino == null
                  ).length > 0
                    ? "flex"
                    : "none",
                flexDirection: "column",
                justifyContent: "center",
                width: window.innerWidth < 426 ? "70vw" : "30vw",
                alignSelf: "center",
              }}
            >
              <div className="text1"
                style={{
                  width: '100%',
                  display:
                    atendimentos.filter(
                      (item) =>
                        item.id_paciente == paciente.id_paciente &&
                        item.data_termino == null && item.id_unidade != 4
                    ).length > 0
                      ? "flex"
                      : "none",
                }}>
                {"PACIENTE ATUALMENTE EM ATENDIMENTO: UNIDADE " +
                  unidades
                    .filter(
                      (value) =>
                        value.id_unidade ==
                        atendimento.map((item) => item.id_unidade)
                    )
                    .map((item) => item.nome_unidade) +
                  " - LEITO " +
                  atendimento.map((item) => item.leito)}
              </div>
              <div className="text1"
                style={{
                  width: '100%',
                  display: atendimento.map(item => item.id_unidade) == 4 ? 'flex' : 'none',
                }}>
                {atendimento.id_unidade}
                {"PACIENTE AGUARDANDO TRIAGEM PARA ATENDIMENTO"}
              </div>
              <div className="button" onClick={() => setviewseletorunidades(1)}>
                ALTERAR LEITO
              </div>
              <div
                className="button-yellow"
                title="ENCERRAR ATENDIMENTO"
                onClick={() => {
                  modal(
                    setdialogo,
                    "TEM CERTEZA DE QUE DESEJA ENCERRAR ESTE ATENDIMENTO? ESTA OPERAÇÃO É IRREVERSÍVEL.",
                    closeAtendimento,
                    atendimento
                  );
                }}
              >
                ENCERRAR ATENDIMENTO
              </div>
            </div>
            <div id="em atendimento em outro serviço"
              className="card cor6hover"
              style={{
                display:
                  atendimentos.filter(
                    (item) =>
                      item.id_paciente == paciente.id_paciente &&
                      item.id_unidade != unidade &&
                      item.id_cliente != hospital &&
                      item.data_termino == null
                  ).length > 0
                    ? "flex"
                    : "none",
                flexDirection: "column",
                justifyContent: "center",
                width: window.innerWidth < 426 ? "70vw" : "30vw",
                alignSelf: "center",
              }}
            >
              <div className="text1" style={{
                width: '100%',
              }}>
                {"PACIENTE COM ATENDIMENTO ATIVO EM OUTRO SERVIÇO"}
              </div>
              <div className="button" onClick={() => setviewseletorunidades(1)}>
                ALTERAR LEITO
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              ></div>
            </div>
            <div id="botão para agendar consulta"
              className="button"
              style={{ width: 100, height: 100, alignSelf: 'center' }}
              onClick={() => {
                // identificando o procedimento com o código TUSS para consulta médica.
                localStorage.setItem('codigo_procedimento', '10101012');
                setviewopcoesconvenio(1);
                // setpagina(20);
                // history.push("/agendamento");
              }}
            >
              AGENDAR CONSULTA
            </div>
          </div>
        </div>
      </div>
    );
    // eslint-disable-next-line
  }, [paciente, hospital, unidades, unidade, atendimento, atendimentos, vieweditpaciente, viewoperadoraselector, viewopcoesconvenio, viewtipoconsulta]);

  // janela para selecionar se o atendimento será feito por convênio do paciente ou particular.
  function SelecionaConvenioPaciente() {
    return (
      <div
        className="fundo"
        style={{ display: viewopcoesconvenio == 1 ? "flex" : "none" }}
        onClick={() => {
          setviewopcoesconvenio(0);
        }}
      >
        <div className="janela" onClick={(e) => e.stopPropagation()}>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => convenioselector('PARTICULAR')}
          >
            {'PARTICULAR'}
          </div>
          <div className="button"
            style={{
              display: procedimentos.filter(item => item.id_operadora == paciente.convenio_codigo && item.tuss_codigo == localStorage.getItem('codigo_procedimento')),
              width: 200, minWidth: 200,
            }}
            onClick={() => convenioselector('CONVENIO')}
          >
            {paciente.convenio_nome}
          </div>
        </div>
      </div>
    )
  }

  /*
  TIPO DE CONSULTA:
  1 = primeira consulta.
  2 = retorno.
  3 = pré-natal.
  4 = por encaminhamento.
  */
  function ViewTipoConsulta() {
    return (
      <div
        className="fundo"
        style={{ display: viewtipoconsulta == 1 ? "flex" : "none" }}
        onClick={() => {
          setviewtipoconsulta(0);
        }}
      >
        <div className="janela scroll"
          style={{ height: '80vh' }}
          onClick={(e) => e.stopPropagation()}>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => {
              localStorage.setItem("tipo_consulta", 1);
              setviewtipoconsulta(0);
              disparaconsulta();
            }}
          >
            PRIMEIRA CONSULTA
          </div>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => {
              localStorage.setItem("tipo_consulta", 2);
              setviewtipoconsulta(0);
              disparaconsulta();
            }}
          >
            RETORNO
          </div>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => {
              localStorage.setItem("tipo_consulta", 3);
              setviewtipoconsulta(0);
              disparaconsulta();
            }}
          >
            CONSULTA NORMAL
          </div>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => {
              localStorage.setItem("tipo_consulta", 4);
              setviewtipoconsulta(0);
              disparaconsulta();
            }}
          >
            PRÉ-NATAL
          </div>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => {
              localStorage.setItem("tipo_consulta", 5);
              setviewtipoconsulta(0);
              disparaconsulta();
            }}
          >
            POR ENCAMINHAMENTO
          </div>
        </div>
      </div>
    )
  }

  const convenioselector = (valor) => {
    localStorage.setItem("tipo_atendimento", valor);
    setviewtipoconsulta(1);
    // history.push("/agendamento");
  }

  const disparaconsulta = () => {
    setpagina(20);
    history.push("/agendamento");
  }

  // atualizando um novo paciente.
  const updatePaciente = () => {
    var obj = {
      nome_paciente: document.getElementById("inputEditNomePaciente").value.toUpperCase(),
      nome_mae_paciente: document.getElementById("inputEditNomeMae").value.toUpperCase(),
      dn_paciente: moment(document.getElementById("inputEditDn").value, "DD/MM/YYYY"),
      antecedentes_pessoais: paciente.antecedentes_pessoais,
      medicacoes_previas: paciente.medicacoes_previas,
      exames_previos: paciente.exames_previos,
      exames_atuais: paciente.exames_atuais,
      tipo_documento: document.getElementById("inputEditTipoDocumento").value.toUpperCase(),
      numero_documento: document.getElementById("inputEditNumeroDocumento").value.toUpperCase(),
      cns: document.getElementById("inputEditCns").value.toUpperCase(),
      endereco: document.getElementById("inputEditEndereco").value.toUpperCase(),

      logradouro: document.getElementById("inputEditLogradouro").value.toUpperCase(),
      bairro: document.getElementById("inputEditBairro").value.toUpperCase(),
      localidade: document.getElementById("inputEditLocalidade").value.toUpperCase(),
      uf: document.getElementById("inputEditUf").value.toUpperCase(),
      cep: document.getElementById("inputEditCep").value.toUpperCase(),

      telefone: document.getElementById("inputEditTelefone").value.toUpperCase(),
      email: document.getElementById("inputEditEmail").value,

      nome_responsavel: document.getElementById("inputEditNomeResponsavel").value.toUpperCase(),
      sexo: document.getElementById("inputEditSexo").value.toUpperCase(),
      nacionalidade: document.getElementById("inputEditNacionalidade").value.toUpperCase(),
      cor: document.getElementById("inputEditCor").value.toUpperCase(),
      etnia: document.getElementById("inputEditEtnia").value.toUpperCase(),

      orgao_emissor: document.getElementById("inputEditOrgaoEmissor").value.toUpperCase(),
      endereco_numero: document.getElementById("inputEditEnderecoNumero").value.toUpperCase(),
      endereco_complemento: document.getElementById("inputEditEnderecoComplemento").value.toUpperCase(),

      // CONVÊNIO.
      convenio_nome: document.getElementById("inputConvenioNome").value.toUpperCase(),
      convenio_codigo: document.getElementById("inputConvenioCodigo").value.toUpperCase(),
      convenio_carteira: document.getElementById("inputConvenioCarteira").value.toUpperCase(),
      validade_carteira: document.getElementById("inputValidadeCarteira").value.toUpperCase(),
      nome_social: document.getElementById("inputNomeSocial").value.toUpperCase(),

    };
    axios
      .post(html + "update_paciente/" + paciente.id_paciente, obj)
      .then(() => {
        loadPacientes();
        setvieweditpaciente(0);
        toast(
          settoast,
          "PACIENTE ATUALIZADO COM SUCESSO NA BASE PULSAR",
          "rgb(82, 190, 128, 1)",
          3000
        );
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

  const [viewseletorunidades, setviewseletorunidades] = useState(0);
  const [selectedunidade, setselectedunidade] = useState("");
  function SeletorDeUnidades() {
    return (
      <div style={{ width: '80%' }}>
        <div className="text1" style={{ marginTop: 50 }}>
          UNIDADES DE INTERNAÇÃO
        </div>
        <div
          id="scroll de unidades"
          className="grid5"
          style={{ width: '100%' }}
        >
          {unidades
            .filter((item) => item.id_cliente == hospital)
            .map((item) => (
              <div
                id={"unidade: " + item}
                className={
                  selectedunidade == item.id_unidade ? "button-selected" : "button"
                }
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 150
                }}
                onClick={() => {
                  console.log(item.id_unidade);
                  if (item.nome_unidade != 'TRIAGEM') {
                    setselectedunidade(item.id_unidade);
                    setunidade(item.id_unidade);
                    geraLeitos(item.total_leitos);
                    loadAtendimentos();
                    loadLeitos(item.id_unidade);
                  } else {
                    if (atendimentos.filter(valor => valor.id_paciente == paciente.id_paciente && valor.situacao == 1).length > 0) {
                      toast(settoast, 'PACIENTE JÁ ESTÁ EM ATENDIMENTO', 'red', 2000);
                    } else {
                      setselectedunidade(item.id_unidade);
                      setunidade(item.id_unidade);
                      var obj = {
                        data_inicio: moment(),
                        data_termino: null,
                        historia_atual: null,
                        id_paciente: paciente.id_paciente,
                        id_unidade: item.id_unidade,
                        nome_paciente: paciente.nome_paciente,
                        leito: null,
                        situacao: 1, // 1 = atendimento ativo; 0 = atendimento encerrado.
                        id_cliente: hospital,
                        classificacao: null,
                        id_profissional: item.id_profissional,
                        convenio_id: paciente.convenio_codigo,
                        convenio_carteira: paciente.convenio_carteira,
                        faturamento_codigo_procedimento: null,
                      };
                      axios
                        .post(html + "insert_atendimento", obj)
                        .then(() => {
                          loadAtendimentos();
                          loadLeitos(item.id_unidade);
                          setviewseletorunidades(0);
                          setvieweditpaciente(0);
                        });
                    }
                  }
                }}
              >
                <div>{item.nome_unidade}</div>
                <div style={{
                  display: item.nome_unidade == 'TRIAGEM' ? 'none' : 'flex'
                }}>
                  {parseInt(item.total_leitos) -
                    parseInt(
                      atendimentos.filter(
                        (check) => check.id_unidade == item.id_unidade
                      ).length +
                      " / " +
                      item.total_leitos
                    )}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  const [statusleitos, setstatusleitos] = useState([]);
  const loadLeitos = (unidade) => {
    axios
      .get(html + "list_leitos/" + unidade)
      .then((response) => {
        setstatusleitos(response.data.rows);
      })
      .catch(function (error) {
        toast(
          settoast,
          "ERRO AO CARREGAR LEITOS, REINICIANDO APLICAÇÃO. " + error,
          "black",
          5000
        );
        setTimeout(() => {
          setpagina(0);
          history.push("/");
        }, 5000);
      });
  };

  const [arrayleitos, setarrayleitos] = useState([]);
  const geraLeitos = (leitos) => {
    let arrayleitos = [];
    let count = 0;
    while (count < leitos) {
      count = count + 1;
      arrayleitos.push(count);
      console.log(count);
    }
    setarrayleitos(arrayleitos);
  };

  function SeletorDeLeitos() {
    const insertLeito = (status) => {
      var obj = {
        id_unidade: unidade,
        leito: localStorage.getItem("leito"),
        status: status,
      };
      axios
        .post(html + "inserir_leito", obj)
        .then(() => {
          loadLeitos(unidade);
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

    const updateLeito = (status) => {
      console.log(localStorage.getItem("leito"));
      var id = JSON.parse(localStorage.getItem("leito")).pop().id_leito;
      var leito = JSON.parse(localStorage.getItem("leito")).pop().leito;
      console.log(id + " - " + leito);
      var obj = {
        id_unidade: unidade,
        leito: leito,
        status: status,
      };
      console.log(obj);
      axios
        .post(html + "update_leito/" + id, obj)
        .then(() => {
          loadLeitos(unidade);
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

    const [viewstatusleito, setviewstatusleito] = useState(0);
    function ViewStatusLeito() {
      let arraystatusleitos = [
        "LIVRE",
        "LIMPEZA",
        "MANUTENÇÃO",
        "DESATIVADO",
      ];
      return (
        <div
          className="fundo"
          style={{ display: viewstatusleito == 1 ? "flex" : "none" }}
          onClick={() => {
            setviewstatusleito(0);
          }}
        >
          <div className="janela" onClick={(e) => e.stopPropagation()}>
            {arraystatusleitos.map((item) => (
              <div
                className="button"
                style={{ width: 150 }}
                onClick={() => {
                  if (localStorage.getItem("leito").length < 4) {
                    console.log("INSERINDO STATUS PARA O LEITO...");
                    insertLeito(item);
                  } else {
                    console.log("ATUALIZANDO STATUS PARA O LEITO...");
                    updateLeito(item);
                  }
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div id="scroll de leitos"
        style={{
          display: statusleitos.length > 0 ? "flex" : "none",
          flexDirection: "column",
          justifyContent: "center",
          alignSelf: "center",
          width: '100%',
        }}
      >
        <div className="text1">LEITOS</div>
        <div className="grid10">
          {arrayleitos.map((item) => (
            <div
              className="button"
              style={{
                position: "relative",
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                height: 100,
                display: "flex",
                opacity:
                  atendimentos.filter(
                    (valor) =>
                      valor.id_cliente == hospital &&
                      valor.id_unidade == selectedunidade &&
                      valor.data_termino == null &&
                      valor.leito == item
                  ).length > 0
                    ? 1
                    : 1,
              }}
              onMouseOver={() => {
                if (
                  statusleitos.filter((valor) => valor.leito == item).length > 0
                ) {
                  localStorage.setItem(
                    "leito",
                    JSON.stringify(
                      statusleitos.filter((valor) => valor.leito == item)
                    )
                  );
                  console.log(JSON.parse(localStorage.getItem("leito")));
                } else {
                  localStorage.setItem("leito", item);
                  console.log(JSON.parse(localStorage.getItem("leito")));
                }
              }}
              onClick={() => {
                if (
                  // o atendimento ativo para o leito selecionado é do paciente selecionado.
                  atendimentos.filter(
                    (valor) =>
                      valor.id_cliente == hospital &&
                      valor.id_unidade == selectedunidade &&
                      valor.id_paciente == paciente.id_paciente &&
                      valor.data_termino == null &&
                      valor.leito == item
                  ).length > 0
                ) {
                  console.log("NADA A FAZER. O PACIENTE JÁ ESTÁ NESTE LEITO");
                } else if (
                  // existe um atendimento alocado no leito selecionado, para outro paciente.
                  atendimentos.filter(
                    (valor) =>
                      valor.id_cliente == hospital &&
                      valor.id_unidade == selectedunidade &&
                      valor.id_paciente != paciente.id_paciente &&
                      valor.data_termino == null &&
                      valor.leito == item
                  ).length > 0
                ) {
                  console.log(
                    "NÃO É POSSÍVEL ALOCAR O PACIENTE NESTE LEITO, QUE JÁ ESTÁ OCUPADO POR OUTRO PACIENTE."
                  );
                  toast(settoast, "LEITO JÁ OCUPADO POR OUTRO PACIENTE.", 'red', 3000);
                } else if (
                  // não existe um atendimento alocado no leito selecionado.
                  atendimentos.filter(
                    (valor) =>
                      valor.id_cliente == hospital &&
                      valor.id_unidade == selectedunidade &&
                      valor.data_termino == null &&
                      valor.leito == item
                  ).length == 0 &&
                  // o paciente tem um atendimento ativo em outro leito.
                  atendimentos.filter(
                    (valor) =>
                      valor.id_paciente == paciente.id_paciente &&
                      valor.data_termino == null
                  ).length > 0
                ) {
                  updateAtendimento(item, atendimento);
                  // inserindo ou atualizando status do leito selecionado para ocupado.
                  if (localStorage.getItem("leito").length < 4) {
                    var obj = {
                      id_unidade: unidade,
                      leito: localStorage.getItem("leito"),
                      status: "OCUPADO",
                    };
                    axios
                      .post(html + "inserir_leito", obj)
                      .then(() => {
                        loadLeitos(unidade);
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
                  } else {
                    var id = JSON.parse(localStorage.getItem("leito")).pop()
                      .id_leito;
                    var leito = JSON.parse(localStorage.getItem("leito")).pop()
                      .leito;
                    obj = {
                      id_unidade: unidade,
                      leito: leito,
                      status: "OCUPADO",
                    };
                    console.log(obj);
                    axios
                      .post(html + "update_leito/" + id, obj)
                      .then(() => {
                        loadLeitos(unidade);
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
                  }
                } else if (
                  // não existe um atendimento alocado no leito selecionado.
                  atendimentos.filter(
                    (valor) =>
                      valor.id_cliente == hospital &&
                      valor.id_unidade == unidade &&
                      valor.data_termino == null &&
                      valor.leito == item
                  ).length == 0 &&
                  // o paciente não tem um atendimento ativo.
                  atendimentos.filter(
                    (valor) =>
                      valor.id_paciente == paciente.id_paciente &&
                      valor.data_termino == null
                  ).length == 0
                ) {
                  insertAtendimento(
                    paciente.id_paciente,
                    paciente.nome_paciente,
                    item
                  );
                  if (localStorage.getItem("leito").length < 4) {
                    obj = {
                      id_unidade: unidade,
                      leito: localStorage.getItem("leito"),
                      status: "OCUPADO",
                    };
                    axios
                      .post(html + "inserir_leito", obj)
                      .then(() => {
                        loadLeitos(unidade);
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
                  } else {
                    id = JSON.parse(localStorage.getItem("leito")).pop()
                      .id_leito;
                    leito = JSON.parse(localStorage.getItem("leito")).pop()
                      .leito;
                    obj = {
                      id_unidade: unidade,
                      leito: leito,
                      status: "OCUPADO",
                    };
                    console.log(obj);
                    axios
                      .post(html + "update_leito/" + id, obj)
                      .then(() => {
                        loadLeitos(unidade);
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
                  }
                } else {
                }
              }}
            >
              <div style={{ position: 'absolute', top: 2.5, left: 5, fontSize: 20, margin: 10 }}>{item}</div>
              <div
                style={{
                  display:
                    atendimentos.filter(
                      (valor) =>
                        valor.id_cliente == hospital &&
                        valor.id_unidade == unidade &&
                        valor.data_termino == null &&
                        valor.leito == item,
                    ).length > 0
                      ? "flex"
                      : "none",
                  fontSize: 12,
                  position: 'absolute',
                  top: 50,
                  padding: 5,
                  alignContent: 'center',
                  alignSelf: 'center',
                }}
              >
                {atendimentos
                  .filter(
                    (valor) =>
                      valor.id_cliente == hospital &&
                      valor.id_unidade == unidade &&
                      valor.data_termino == null &&
                      valor.leito == item
                  )
                  .map((valor) => valor.nome_paciente.substring(0, 20) + "...")}
              </div>
              <div
                className="button-yellow"
                style={{
                  height: 25,
                  width: 25,
                  minHeight: 25,
                  minWidth: 25,
                  borderRadius: 5,
                  position: "absolute",
                  top: 5,
                  right: 5,
                  fontSize: 12,
                  backgroundColor: statusleitos
                    .filter((valor) => valor.leito == item)
                    .map((valor) =>
                      valor.status == "LIVRE"
                        ? "rgb(82, 190, 128, 1)"
                        : valor.status == "OCUPADO"
                          ? "#E59866"
                          : valor.status == "MANUTENÇÃO"
                            ? "#CCD1D1 "
                            : valor.status == "DESATIVADO"
                              ? "#EC7063"
                              : valor.status == "LIMPEZA"
                                ? "#85C1E9 "
                                : "rgb(0, 0, 0, 0.5)"
                    ),
                }}
                onClick={(e) => {
                  console.log(statusleitos.filter((valor) => valor.leito == item && valor.id_unidade == unidade).map((valor) => valor.status).pop());
                  if (statusleitos.filter((valor) => valor.leito == item && valor.id_unidade == unidade).map((valor) => valor.status).pop() == 'OCUPADO') {
                    toast(settoast, 'NÃO É POSSÍVEL ALTERAR O STATUS DE UM LEITO OCUPADO', 'rgb(231, 76, 60, 1', 3000);
                  } else {
                    setviewstatusleito(1);
                  }
                  e.stopPropagation();
                }}
              >
                {statusleitos
                  .filter((valor) => valor.leito == item)
                  .map((valor) =>
                    valor.status == "LIVRE"
                      ? "L"
                      : valor.status == "OCUPADO"
                        ? "O"
                        : valor.status == "MANUTENÇÃO"
                          ? "M"
                          : valor.status == "LIMPEZA"
                            ? "H"
                            : valor.status == "DESATIVADO"
                              ? "D"
                              : ""
                  )}
              </div>
            </div>
          ))}
        </div>
        <ViewStatusLeito></ViewStatusLeito>
      </div>
    );
  }

  function MovimentaPaciente() {
    return (
      <div
        className="fundo"
        style={{
          display: viewseletorunidades == 1 ? "flex" : "none",
        }}
      >
        <div
          className="janela scroll"
          style={{
            position: 'relative',
            width: "90vw",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <div
            className="text3"
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              margin: 5,
              padding: 5,
            }}
          >
            {paciente.nome_paciente +
              ", " +
              moment().diff(moment(paciente.dn_paciente), "years") +
              " ANOS."}
          </div>
          <div
            className="button-yellow"
            style={{ position: "absolute", top: 10, right: 10 }}
            onClick={() => {
              setviewseletorunidades(0);
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
          <SeletorDeUnidades></SeletorDeUnidades>
          <SeletorDeLeitos></SeletorDeLeitos>
        </div>
      </div>
    );
  }

  function BuscaPaciente() {
    return (
      <div id="cadastro de pacientes e de atendimentos"
        style={{
          position: 'sticky', top: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <div id="botões e pesquisa"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignSelf: "center",
            marginTop: 10,
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
          <FilterPaciente></FilterPaciente>
          <div
            className="button-green"
            style={{ margin: 0, marginLeft: 10, width: 50, height: 50 }}
            title={"CADASTRAR PACIENTE"}
            onClick={() => setvieweditpaciente(2)}
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
      </div>
    )
  }

  return (
    <div className="main" style={{ display: pagina == 2 ? "flex" : "none" }}>
      <div
        className="chassi scroll"
        id="conteúdo do cadastro"
      >
        <ListaDePacientes></ListaDePacientes>
        <DadosPacienteAtendimento></DadosPacienteAtendimento>
        <MovimentaPaciente></MovimentaPaciente>
        <ViewTipoDocumento></ViewTipoDocumento>
      </div>
    </div>
  );
}

export default Cadastro;
