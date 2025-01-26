/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Context from "./Context";
// imagens.
import salvar from '../images/salvar.png';
import novo from '../images/novo.png';
import deletar from '../images/deletar.png';
import editar from '../images/editar.png';
import back from '../images/back.png';
// import salvar from "../images/salvar.svg";
import "moment/locale/pt-br";
import modal from "../functions/modal";
import { useHistory } from "react-router-dom";
import masknumber from "../functions/masknumber";
import Filter from "../components/Filter";

function FaturamentoClinicaProcedimentos() {

  // context.
  const {
    pagina, setpagina,
    html,
    cliente,
    setdialogo,
  } = useContext(Context);

  // history (router).
  let history = useHistory();

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

  // carregando procedimentos da tabela TUSS.
  const [listatuss, setlistatuss] = useState([]);
  const [arraylistatuss, setarraylistatuss] = useState([]);
  const loadTuss = () => {
    axios.get(html + 'all_tabela_tuss').then((response) => {
      var x = response.data.rows;
      setlistatuss(response.data.rows);
      setarraylistatuss(response.data.rows);
      console.log(x.length);
    })
  };


  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'FATURAMENTO-CLINICA-PROCEDIMENTOS') {
      console.log('FATURAMENTO - PROCEDIMENTOS DISPONÍVEIS');
      loadFaturamentoClinicaProcedimentos();
      loadTuss();
    }
    // eslint-disable-next-line
  }, [pagina]);

  const [viewtussselector, setviewtussselector] = useState(0);
  const [selectedprocedimento, setselectedprocedimento] = useState([]);
  function FormTussSelector() {
    return (
      <div className="fundo"
        style={{
          display: viewtussselector == 1 ? 'flex' : 'none',
          flexDirection: 'column', justifyContent: 'center'
        }}
        onClick={() => setviewtussselector(0)}
      >
        <div className="janela scroll cor2"
          style={{ height: '80vh', width: '60vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          {Filter("inputFilterClienteProcedimento", setarraylistatuss, listatuss, 'item.terminologia')}
          {arraylistatuss.map(item => (
            <div
              className="button"
              key={Math.random()}
              style={{ width: 'calc(100% - 20px)', padding: 10, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}
              onClick={() => {
                setviewtussselector(0);
                setTimeout(() => {
                  document.getElementById("inputClinicaCodigoTuss").value = item.codigo;
                  document.getElementById("inputClinicaProcedimento").value = item.rol_ans_descricao;
                }, 1000);
              }}>
              <div className="button red" style={{ margin: 10, marginLeft: -2.5, width: 150, minWidth: 150 }}>{item.codigo}</div>
              <div style={{ textAlign: 'left' }}>{item.rol_ans_descricao}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const insertProcedimento = () => {
    let obj = {
      id_cliente: cliente.id_cliente,
      nome_cliente: cliente.razao_social,
      id_procedimento: Math.random(),
      nome_procedimento: document.getElementById("inputClinicaProcedimento").value.toUpperCase(),
      codigo_tuss: document.getElementById("inputClinicaCodigoTuss").value.toUpperCase(),
      valor_convenio: document.getElementById("inputClinicaValorConvProcedimento").value.toUpperCase(),
      valor_particular: document.getElementById("inputClinicaValorPartProcedimento").value.toUpperCase(),
    }
    axios.post(html + "insert_faturamento_clinicas_procedimentos", obj).then(() => {
      console.log('PROCEDIMENTO INSERIDO COM SUCESSO');
      setformprocedimento(0);
      loadFaturamentoClinicaProcedimentos();
    })
  };

  const updateProcedimento = () => {
    console.log(selectedprocedimento);
    let obj = {
      id_cliente: cliente.id_cliente,
      nome_cliente: cliente.razao_social,
      id_procedimento: Math.random(),
      nome_procedimento: document.getElementById("inputClinicaProcedimento").value.toUpperCase(),
      codigo_tuss: document.getElementById("inputClinicaCodigoTuss").value.toUpperCase(),
      valor_convenio: document.getElementById("inputClinicaValorConvProcedimento").value.toUpperCase(),
      valor_particular: document.getElementById("inputClinicaValorPartProcedimento").value.toUpperCase(),
    }
    axios.post(html + "update_faturamento_clinicas_procedimentos/" + selectedprocedimento.id, obj).then(() => {
      console.log('PROCEDIMENTO ATUALIZADO COM SUCESSO');
      setformprocedimento(0);
      loadFaturamentoClinicaProcedimentos();
    })
  };

  const updateValoresProcedimento = (procedimento) => {
    let obj = {
      id_cliente: cliente.id_cliente,
      nome_cliente: cliente.razao_social,
      id_procedimento: procedimento.id_procedimento,
      nome_procedimento: procedimento.nome_procedimento,
      codigo_tuss: procedimento.codigo_tuss,
      valor_convenio: document.getElementById("inputValorConvenio " + procedimento.id).value.toUpperCase(),
      valor_particular: document.getElementById("inputValorParticular " + procedimento.id).value.toUpperCase(),
    }
    axios.post(html + "update_faturamento_clinicas_procedimentos/" + procedimento.id, obj).then(() => {
      console.log('PROCEDIMENTO ATUALIZADO COM SUCESSO');
      loadFaturamentoClinicaProcedimentos();
    })
  }

  const deleteProcedimento = (id) => {
    axios.get(html + 'delete_faturamento_clinicas_procedimentos/' + id).then(() => {
      console.log('PROCEDIMENTO DELETADO COM SUCESSO');
      loadFaturamentoClinicaProcedimentos();
    })
  }

  const [formprocedimento, setformprocedimento] = useState(0);
  function FormProcedimentos() {
    return (
      <div className="fundo"
        style={{ display: formprocedimento != 0 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center' }}
        onClick={() => setformprocedimento(0)}
      >
        <div className="janela scroll cor2" style={{ width: '60vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
            <div className="text1">NOME DO PROCEDIMENTO</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="PROCEDIMENTO..."
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "PROCEDIMENTO...")}
              type="text"
              id="inputClinicaProcedimento"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.nome_procedimento : ''}
              maxLength={200}
              style={{ margin: 5, width: 'calc(100% - 20px)', alignSelf: 'center' }}
            ></input>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
              <div className='button' style={{ paddingLeft: 20, paddingRight: 20, width: 300, alignSelf: 'center' }} id="procedimento_selector" onClick={() => setviewtussselector(1)}>
                {'SELECIONE PROCEDIMENTO TUSS'}
              </div>
              <FormTussSelector></FormTussSelector>
            </div>
            <div className="text1">CÓDIGO TUSS</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="CÓDIGO TUSS"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "CÓDIGO TUSS")}
              type="text"
              id="inputClinicaCodigoTuss"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.codigo_tuss : ''}
              maxLength={200}
              style={{ margin: 5, width: 200, alignSelf: 'center' }}
            ></input>
            <div style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="text1">{'VALOR CONVÊNIO (R$)'}</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="VALOR CONV..."
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "VALOR PART...")}
                  onKeyUp={() => masknumber(1000, 'inputClinicaValorConvProcedimento', 5)}
                  type="text"
                  id="inputClinicaValorConvProcedimento"
                  defaultValue={formprocedimento == 2 ? selectedprocedimento.valor : ''}
                  maxLength={200}
                  style={{ margin: 5, width: 200, alignSelf: 'center' }}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="text1">{'VALOR PARTICULAR (R$)'}</div>
                <input
                  className="input"
                  autoComplete="off"
                  placeholder="VALOR PART..."
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "VALOR PART...")}
                  onKeyUp={() => masknumber(1000, 'inputClinicaValorPartProcedimento', 5)}
                  type="text"
                  id="inputClinicaValorPartProcedimento"
                  defaultValue={formprocedimento == 2 ? selectedprocedimento.valor : ''}
                  maxLength={200}
                  style={{ margin: 5, width: 200, alignSelf: 'center' }}
                ></input>
              </div>
            </div>
            <div style={{ display: 'none', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="text1">OBSERVAÇÕES</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="OBSERVAÇÕES"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "OBSERVAÇÕES")}
                type="text"
                id="inputObs"
                defaultValue={formprocedimento == 2 ? selectedprocedimento.obs : ''}
                maxLength={2000}
                style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
              ></input>
            </div>
          </div>
          <div className="button-green" style={{ marginTop: 20, marginBottom: 10 }}
            onClick={() => {
              if (formprocedimento == 1) {
                insertProcedimento();
              } else {
                updateProcedimento();
              }
            }}
          >
            <img
              alt=""
              src={salvar}
              style={{ width: 20, height: 20 }}
            >
            </img>
          </div>
        </div>
      </div>
    )
  }

  let timeout = null;
  function ListProcedimentos() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center', justifyContent: 'center' }}>
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
          <div className="text2" style={{ fontSize: 18, margin: 10 }}>PROCEDIMENTOS REALIZADOS NA CLÍNICA</div>
        </div>
        {procedimentos_cliente.map(procedimento => (
          <div key={'clinica_procedimento ' + procedimento.id} className='button' style={{ width: 'calc(100% - 20px)', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div className="button red" style={{ paddingLeft: 10, paddingRight: 10 }}>{procedimento.codigo_tuss}</div>
              <div className="text2" style={{ alignSelf: 'center' }}>{procedimento.nome_procedimento}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div className="text2">VALOR PARTICULAR:</div>
              <input className="input"
                autoComplete="off"
                placeholder={
                  "VALOR PART..."
                }
                defaultValue={procedimento.valor_particular}
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) =>
                  "VALOR PART..."
                }
                onKeyUp={() => {
                  clearTimeout(timeout);
                  timeout = setTimeout(() => {
                    updateValoresProcedimento(procedimento);
                  }, 1000);
                }}
                type="text"
                id={"inputValorParticular " + procedimento.id}
                maxLength={100}
              ></input>
              <div className="text2" style={{ marginLeft: 5 }}>VALOR CONVÊNIO:</div>
              <input className="input"
                autoComplete="off"
                placeholder={
                  "VALOR CONV..."
                }
                defaultValue={procedimento.valor_convenio}
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) =>
                  "VALOR CONV..."
                }
                onKeyUp={() => {
                  clearTimeout(timeout);
                  timeout = setTimeout(() => {
                    updateValoresProcedimento(procedimento);
                  }, 1000);
                }}
                type="text"
                id={"inputValorConvenio " + procedimento.id}
                maxLength={100}
              ></input>
              <div id="btnEditProcedimento"
                title="EDITAR PROCEDIMENTO"
                className="button-yellow"
                onClick={() => {
                  setselectedprocedimento(procedimento);
                  setformprocedimento(2);
                }}
                style={{ width: 50, height: 50, alignSelf: "center" }}
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
              <div id="btnDeleteProcedimento"
                title="EXCLUIR PROCEDIMENTO"
                className="button-red"
                onClick={() => {
                  modal(
                    setdialogo,
                    "TEM CERTEZA QUE DESEJA EXCLUIR O PROCEDIMENTO " + procedimento.nome_procedimento + "?",
                    deleteProcedimento,
                    procedimento.id
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
        ))}
        <div id="botão para cadastrar procedimento"
          className="button-green"
          style={{ margin: 0, width: 50, height: 50, alignSelf: 'center' }}
          title={"CADASTRAR PROCEDIMENTO"}
          onClick={() => setformprocedimento(1)}
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
    <div id="tela de faturamento"
      className='main'
      style={{
        display: pagina == 'FATURAMENTO-CLINICA-PROCEDIMENTOS' ? 'flex' : 'none',
      }}
    >
      <div className='chassi scroll'
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          width: 'calc(100vw - 20px)',
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <ListProcedimentos></ListProcedimentos>
          <FormProcedimentos></FormProcedimentos>
        </div>
      </div>
    </div>
  )
}

export default FaturamentoClinicaProcedimentos;