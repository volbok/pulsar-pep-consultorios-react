/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
import "moment/locale/pt-br";
// router.
import { useHistory } from "react-router-dom";
// funções.
import toast from "../functions/toast";
// import checkinput from "../functions/checkinput";
import maskdate from "../functions/maskdate";
import maskphone from "../functions/maskphone";
// imagens.
import salvar from "../images/salvar.png";
import deletar from "../images/deletar.png";
import back from "../images/back.png";
import novo from "../images/novo.png";
import modal from "../functions/modal";
import Filter from "../components/Filter";

function Cadastro() {
  // context.
  const {
    html,
    pagina,
    setpagina,
    setusuario,
    settoast,
    setdialogo,
    hospital,
    pacientes,
    setpacientes,
    paciente, setpaciente,
    setobjpaciente,
    atendimentos,
    setatendimentos,
    setoperadoras, operadoras,
    setprocedimentos,
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
  const [viewtipoconsulta, setviewtipoconsulta] = useState(0);
  useEffect(() => {
    if (pagina == 2) {
      console.log('PACIENTE: ' + paciente);
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
    })
  };

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

  // recuperando registros de pacientes cadastrados na aplicação.
  const loadAtendimentos = () => {
    axios
      .get(html + "allatendimentosfull/" + hospital)
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
          window.location.reload();
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
      nome_pai_paciente: document
        .getElementById("inputEditNomePai")
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
          window.location.reload();
        }, 5000);
      });
  };

  // excluir um paciente.
  let timeout = null;
  const deletePaciente = (paciente) => {
    axios
      .get(html + "delete_paciente/" + paciente)
      .then(() => {
        loadPacientes();
        setvieweditpaciente(0);
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
          window.location.reload();
        }, 5000);
      });
  };

  // excluir um atendimento.
  const deleteAtendimento = (id) => {
    axios.get(html + "delete_atendimento/" + id).catch(function () {
      toast(settoast, "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.", "black", 5000);
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    });
  };

  function ListaDePacientes() {
    return (
      <div style={{ position: 'relative', width: 'calc(100vw - 20px)' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div id="botão de voltar (sair do cadastro)"
            className="button-yellow"
            style={{ margin: 0, marginRight: 10, width: 50, height: 50, alignSelf: 'center' }}
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
          <div id="botão para cadastrar paciente"
            className="button-green"
            style={{ margin: 0, marginLeft: 10, width: 50, height: 50, alignSelf: 'center' }}
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
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
                onClick={() => {
                  setpaciente(item);
                  setobjpaciente(item);
                  console.log(hospital);
                  console.log(atendimentos.filter((valor) => valor.situacao == 3).length);
                  console.log(atendimentos.filter((valor) => valor.id_paciente == item.id_paciente).length);
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
                    <textarea
                      autoComplete="off"
                      placeholder="OBSERVAÇÕES"
                      className="textarea"
                      type="text"
                      id={"inputObservacoes " + item.id_paciente}
                      onFocus={(e) => (e.target.placeholder = "")}
                      onBlur={(e) => (e.target.placeholder = "OBSERVAÇÕES")}
                      defaultValue={item.obs}
                      onClick={(e) => e.stopPropagation()}
                      onKeyUp={() => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                          console.log('ATUALIZANDO OBSERVAÇÃO')
                          updatePacienteObservacao(item, document.getElementById("inputObservacoes " + item.id_paciente).value.toUpperCase())
                        }, 1000);
                      }}
                      style={{
                        flexDirection: "center",
                        justifyContent: "center",
                        alignSelf: "center",
                        width: 'calc(100% - 50px)',
                        padding: 15,
                        height: 60,
                        minHeight: 60,
                        maxHeight: 60,
                      }}
                    ></textarea>
                  </div>
                </div>
                <div
                  className="button"
                  style={{
                    width: 'calc(100% - 20px)',
                    backgroundColor:
                      atendimentos.filter(
                        (valor) =>
                          valor.id_paciente == item.id_paciente &&
                          valor.situacao == 3
                      ).length > 0
                        ? "rgb(82, 190, 128, 1)"
                        : "#66b2b2"
                  }}
                >
                  {atendimentos.filter(
                    (valor) =>
                      valor.id_paciente == item.id_paciente &&
                      valor.situacao == 3
                  ).length > 0
                    ? "CONSULTA AGENDADA"
                    : "AGENDAR CONSULTA"}
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
  function DadosPacienteAtendimento() {
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
          <div className="janela scroll cor2"
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
              type="text"
              id="filtrarProcedimento"
              maxLength={100}
              style={{ width: 'calc(100% - 20px)' }}
            ></input>
            {operadoras.map(item => (
              <div
                key={'operadora: ' + item.nome_operadora}
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
    const [viewtipodocumento, setviewtipodocumento] = useState(0);
    function ViewTipoDocumento() {
      let array = ["CPF", "RG", "CERT. NASCTO.", "OUTRO"];
      return (
        <div
          className="fundo"
          style={{ display: viewtipodocumento == 1 ? "flex" : "none" }}
          onClick={() => setviewtipodocumento(0)}
        >
          <div
            className="janela scroll"
            onClick={(e) => e.stopPropagation()}>
            {array.map((item) => (
              <div
                key={item}
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
    // janela para selecionar se o atendimento será feito por convênio do paciente ou particular.
    const [viewopcoesconvenio, setviewopcoesconvenio] = useState(0);
    function SelecionaConvenioPaciente() {
      if (paciente != null) {
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
                onClick={() => {
                  convenioselector('PARTICULAR');
                  localStorage.setItem('PARTICULAR', 'PARTICULAR');
                  console.log(localStorage.getItem('PARTICULAR'));
                }}
              >
                {'PARTICULAR'}
              </div>

              <div className="button"
                style={{
                  display: paciente.convenio_nome != null && paciente.convenio_nome != '' ? 'flex' : 'none',
                  width: 200, minWidth: 200,
                }}
                onClick={() => {
                  convenioselector('CONVENIO');
                  localStorage.setItem('PARTICULAR', 'CONVENIO');
                  console.log(localStorage.getItem('PARTICULAR'));
                }}
              >
                {
                  paciente.convenio_nome != null ? paciente.convenio_nome : ''
                }
              </div>

            </div>
          </div>
        )
      } else {
        return (null);
      }
    }
    var timeout = null;
    return (
      <div
        className="fundo"
        style={{ display: vieweditpaciente == 2 || (vieweditpaciente == 1 && atendimento != null && paciente != null) ? "flex" : "none" }}
        onClick={() => setvieweditpaciente(0)}
      >
        <div
          className="janela cor0"
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
              display: "none",
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
            className="scroll cor2"
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
                <input id="inputEditNumeroDocumento"
                  autoComplete="off"
                  placeholder="NÚMERO DO DOCUMENTO"
                  className="input"
                  type="text"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "NÚMERO DO DOCUMENTO")}
                  defaultValue={vieweditpaciente == 1 ? paciente.numero_documento : ''}
                  style={{
                    flexDirection: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    textAlign: "center",
                    width: 200,
                    padding: 15,
                    height: 20,
                    minHeight: 20,
                    maxHeight: 20,
                  }}
                ></input>
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

            <div id="nome do pai"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text1">NOME DO PAI</div>
              <textarea
                autoComplete="off"
                placeholder="NOME DO PAI"
                className="textarea"
                type="text"
                id="inputEditNomePai"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NOME DO PAI")}
                defaultValue={vieweditpaciente == 1 ? paciente.nome_pai_paciente : ''}
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
                  marginTop: 15,
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
            <div className="button" style={{ paddingLeft: 15, paddingRight: 15, marginTop: 15 }}
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
            <ViewTipoDocumento></ViewTipoDocumento>
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
                onKeyUp={() => maskdate(timeout, "inputValidadeCarteira")}
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
                  width: 200,
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
                    // checkinput('textarea', settoast, ["inputEditNomePaciente", "inputEditDn", "inputEditNumeroDocumento", "inputEditNomeMae"], "btnUpdatePaciente", updatePaciente, [])
                    updatePaciente();
                  } else {
                    // checkinput('textarea', settoast, ["inputEditNomePaciente", "inputEditDn", "inputEditNumeroDocumento", "inputEditNomeMae"], "btnUpdatePaciente", insertPaciente, [])
                    insertPaciente();
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
              <div id="botão de voltar (sair da tela de edição do paciente)"
                className="button-yellow"
                style={{ margin: 0, marginLeft: 5, width: 50, height: 50, alignSelf: 'center' }}
                title={"SAIR DA TELA DE EDIÇÃO DO PACIENTE"}
                onClick={() => {
                  setvieweditpaciente(0);
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
            </div>
          </div>
          <SelecionaConvenioPaciente></SelecionaConvenioPaciente>
          <ViewTipoConsulta></ViewTipoConsulta>
          <div id="botão para agendar consulta"
            className="button"
            style={{
              display: vieweditpaciente == 2 ? 'none' : 'flex',
              width: 100, height: 100, alignSelf: 'center'
            }}
            onClick={() => {
              // identificando o procedimento com o código TUSS para consulta médica.
              localStorage.setItem('codigo_procedimento', '10101012');
              localStorage.setItem("prevScreen", 'CADASTRO');
              setviewopcoesconvenio(1);
            }}
          >
            AGENDAR CONSULTA
          </div>
        </div>
      </div>
    );
    // eslint-disable-next-line
  };

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
              localStorage.setItem("tipo_consulta", 1);
              setviewtipoconsulta(0);
              disparaconsulta();
            }}
          >
            ROTINA
          </div>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => {
              localStorage.setItem("tipo_consulta", 1);
              setviewtipoconsulta(0);
              disparaconsulta();
            }}
          >
            PUERICULTURA
          </div>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => {
              localStorage.setItem("tipo_consulta", 1);
              setviewtipoconsulta(0);
              disparaconsulta();
            }}
          >
            CONSULTA ON-LINE
          </div>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => {
              localStorage.setItem("tipo_consulta", 3);
              setviewtipoconsulta(0);
              disparaconsulta();
            }}
          >
            PRÉ-NATAL
          </div>
          <div className="button" style={{ width: 200, minWidth: 200 }}
            onClick={() => {
              localStorage.setItem("tipo_consulta", 4);
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
    localStorage.setItem("convenio", valor);
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
      nome_pai_paciente: document.getElementById("inputEditNomePai").value.toUpperCase(),
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
      obs: paciente.obs,

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
          window.location.reload();
        }, 5000);
      });
  };

  const updatePacienteObservacao = (item, obs) => {
    var obj = {
      nome_paciente: item.nome_paciente,
      nome_mae_paciente: item.nome_mae_paciente,
      dn_paciente: item.dn_paciente,
      antecedentes_pessoais: item.antecedentes_pessoais,
      medicacoes_previas: item.medicacoes_previas,
      exames_previos: item.exames_previos,
      exames_atuais: item.exames_atuais,
      tipo_documento: item.tipo_documento,
      numero_documento: item.numero_documento,
      cns: item.cns,
      endereco: item.endereco,

      logradouro: item.logradouro,
      bairro: item.bairro,
      localidade: item.localidade,
      uf: item.uf,
      cep: item.cep,

      telefone: item.telefone,
      email: item.email,

      nome_responsavel: item.nome_responsavel,
      sexo: item.sexo,
      nacionalidade: item.nacionalidade,
      cor: item.cor,
      etnia: item.etnia,

      orgao_emissor: item.orgao_emissor,
      endereco_numero: item.endereco_numero,
      endereco_complemento: item.endereco_complemento,

      // CONVÊNIO.
      convenio_nome: item.convenio_nome,
      convenio_codigo: item.convenio_codigo,
      convenio_carteira: item.convenio_carteira,
      validade_carteira: item.validade_carteira,
      nome_social: item.nome_social,
      obs: obs,
    };

    console.log(obj);
    axios
      .post(html + "update_paciente/" + item.id_paciente, obj)
      .then(() => {
        loadPacientes();
      })
      .catch(function () {
        toast(
          settoast,
          "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.",
          "black",
          5000
        );
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      });
  };

  return (
    <div className="main" style={{ display: pagina == 2 ? "flex" : "none" }}>
      <div
        className="chassi scroll"
        id="conteúdo do cadastro"
      >
        <ListaDePacientes></ListaDePacientes>
        <DadosPacienteAtendimento></DadosPacienteAtendimento>
      </div>
    </div>
  );
}

export default Cadastro;
