/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
// imagens.
import salvar from '../images/salvar.png';
import novo from '../images/novo.png';
import deletar from '../images/deletar.png';
import editar from '../images/editar.png';
import back from '../images/back.png';
import lupa from '../images/lupa.png'
// import salvar from "../images/salvar.svg";
import "moment/locale/pt-br";
import modal from "../functions/modal";
import { useHistory } from "react-router-dom";
import Filter from "../components/Filter";
import { PieChart, Pie, Tooltip } from 'recharts';
import pdfMake from "pdfmake/build/pdfmake";

function Faturamento() {

  // context.
  const {
    pagina, setpagina,
    html,
    operadoras, setoperadoras,
    setselectedoperadora, selectedoperadora,
    procedimentos, setprocedimentos,
    selectedprocedimento, setselectedprocedimento,
    setdialogo,
    cliente,
    usuarios,
    setobjatendimento,
  } = useContext(Context);

  // history (router).
  let history = useHistory();

  const [localfaturamento, setlocalfaturamento] = useState([]);
  const builddonutfaturamentodata = (arrayfaturamento, status) => {
    let total = 0;
    arrayfaturamento.filter(item => item.status_pagamento == status).map(item => {
      total = parseFloat(total) + parseFloat(item.valor_pagamento);
      return null;
    });
    console.log(status + ': ' + total.toFixed(2));
    return total.toFixed(2);
  }

  const buildtotalvalorfaturamento = (arrayfaturamento) => {
    let total = 0;
    arrayfaturamento.map(item => {
      total = parseFloat(total) + parseFloat(item.valor_pagamento);
      return null;
    });
    return total.toFixed(2);
  }

  const donutfaturamentodata = () => {
    console.log(dadosdonutaberto);
    return (
      [
        { name: 'PAGAMENTOS EM ABERTO', value: parseFloat(dadosdonutaberto), fill: '#f5d142' },
        { name: 'PAGAMENTOS VENCIDOS', value: parseFloat(dadosdonutvencido), fill: '#EC7063' },
        { name: 'PAGAMENTOS RECEBIDOS', value: parseFloat(dadosdonutpago), fill: '#52be80' },
      ]
    )
  }

  const [dadosdonutaberto, setdadosdonutaberto] = useState();
  const [dadosdonutvencido, setdadosdonutvencido] = useState();
  const [dadosdonutpago, setdadosdonutpago] = useState();
  const loadfaturamentosmes = (data) => {
    axios.get(html + 'list_faturamento_geral_mes/' + cliente.id_cliente + '/' + data).then((response) => {
      let x = response.data.rows;
      setlocalfaturamento(x);
      console.log(x);
      buildtotalvalorfaturamento(x);
      setdadosdonutaberto(builddonutfaturamentodata(x, 'ABERTO'));
      setdadosdonutvencido(builddonutfaturamentodata(x, 'VENCIDO'));
      setdadosdonutpago(builddonutfaturamentodata(x, 'PAGO'));
    });
  }

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'FATURAMENTO') {
      console.log('PÁGINA DE FATURAMENTO');
      loadOperadoras();
      loadProcedimentos();
      loadTuss();
      filtraregistrosconsultas(moment().format('MM-YYYY'));
      filtraregistrosprocedimentos(moment().format('MM-YYYY'));
      loadfaturamentosmes(moment().format('MM-YYYY'));
    }
    // eslint-disable-next-line
  }, [pagina]);

  // FATURAMENTO - OPERADORAS DE SAÚDE //
  // carregando procedimentos da tabela TUSS.
  const [listatuss, setlistatuss] = useState([]);
  const [arraylistatuss, setarraylistatuss] = useState([]);
  const loadTuss = () => {
    axios.get(html + 'all_tabela_tuss').then((response) => {
      var x = response.data.rows;
      setarraylistatuss(response.data.rows);
      setlistatuss(response.data.rows);
      console.log(x.length);
    })
  };

  // cadastro de operadoras de saúde.
  const loadOperadoras = () => {
    axios.get(html + 'all_operadoras').then((response) => {
      setoperadoras(response.data.rows);
    })
  };

  const insertOperadora = () => {
    let obj = {
      nome_operadora: document.getElementById("inputNomeOperadora").value.toUpperCase(),
      registro_ans: document.getElementById("inputRegistroAns").value,
      telefone: document.getElementById("inputTelefone").value.toUpperCase(),
      email: document.getElementById("inputEmail").value,
      codigo_prestador: document.getElementById("inputCodigoPrestador").value,
      logo_operadora: null,
    }
    axios.post(html + 'insert_operadora', obj).then(() => {
      console.log('OPERADORA REGISTRADA COM SUCESSO.');
      loadOperadoras();
      loadProcedimentos();
      setformoperadora(0);
    })
  }

  const updateOperadora = (item, imagem) => {
    let obj = {
      nome_operadora: document.getElementById("inputNomeOperadora").value.toUpperCase(),
      registro_ans: document.getElementById("inputRegistroAns").value.toUpperCase(),
      telefone: document.getElementById("inputTelefone").value.toUpperCase(),
      email: document.getElementById("inputEmail").value.toUpperCase(),
      codigo_prestador: document.getElementById("inputCodigoPrestador").value.toUpperCase(),
      logo_operadora: imagem,
    }
    axios.post(html + 'update_operadora/' + item.id, obj).then(() => {
      console.log('OPERADORA ATUALIZADA COM SUCESSO.');
      setTimeout(() => {
        loadOperadoras();
      }, 2000);
      setformoperadora(0);
    })
  }

  const deleteOperadora = (item) => {
    axios.get(html + 'delete_operadora/' + item.id).then(() => {
      console.log('OPERADORA EXCLUÍDA COM SUCESSO');
      loadOperadoras();
      setformoperadora(0);
    })
  }

  function ListOperadoras() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '30vh', overflowX: 'hidden' }}>
        <div
          className="button"
          id='cabecalho lista de operadoras'
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: -20,
            backgroundColor: 'transparent',
          }}>
          <div className="button" style={{ width: '20vw', backgroundColor: 'transparent' }}>{'NOME DA OPERADORA'}</div>
          <div className="button" style={{ width: '10vw', backgroundColor: 'transparent' }}>{'REGISTRO ANS'}</div>
          <div className="button" style={{ width: '10vw', backgroundColor: 'transparent' }}>{'TELEFONE'}</div>
          <div className="button" style={{ width: '10vw', backgroundColor: 'transparent' }}>{'E-MAIL'}</div>
          <div className="button" style={{ width: '10vw', backgroundColor: 'transparent' }}>{'CÓDIGO DO PRESTADOR'}</div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="button" style={{ width: 50, backgroundColor: 'transparent' }}>{''}</div>
            <div className="button" style={{ width: 50, backgroundColor: 'transparent' }}>{''}</div>
          </div>
        </div>
        {operadoras.map(item => (
          <div
            key={Math.random()}
            className={selectedoperadora == item ? 'button-selected' : 'button'}
            style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
              borderRadius: 5,
            }}
            onClick={() => {
              setselectedoperadora(item);
              console.log(selectedoperadora);
            }}
          >
            <div className="button"
              style={{
                width: '20vw',
                backgroundColor: '#006666',
              }}>
              {item.nome_operadora}
            </div>
            <div className="button" style={{ width: '10vw', backgroundColor: 'transparent' }}>{item.registro_ans}</div>
            <div className="button" style={{ width: '10vw', backgroundColor: 'transparent' }}>{item.telefone}</div>
            <div className="button" style={{ width: '10vw', backgroundColor: 'transparent' }}>{item.email}</div>
            <div className="button" style={{ width: '10vw', backgroundColor: 'transparent' }}>{item.codigo_prestador}</div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div className="button green" style={{ width: 50 }}
                onClick={() => {
                  setselectedoperadora(item);
                  setformoperadora(2);
                  setTimeout(() => {
                    const img = new Image();
                    img.src = item.logo_operadora;
                    img.onload = function () {
                      console.log('image uploaded');
                      console.log(img.height);
                      let canvas = document.getElementById('canvas');
                      canvas.style.backgroundColor = 'white';
                      canvas.height = img.height;
                      canvas.width = img.width;
                      setTimeout(() => {
                        canvas.getContext('2d').drawImage(img, 0, 0);
                      }, 2000);
                    }
                  }, 1000);
                }}
              >
                <img
                  alt=""
                  src={editar}
                  style={{ width: 25, height: 25 }}
                ></img>
              </div>
              <div className="button red" style={{ width: 50 }}
                onClick={(e) => {
                  modal(setdialogo, 'TEM CERTEZA QUE DESEJA EXCLUIR A OPERADORA ' + item.nome_operadora + '?', deleteOperadora, item);
                  e.stopPropagation();
                }}
              >
                <img
                  alt=""
                  src={deletar}
                  style={{ width: 25, height: 25 }}
                ></img>
              </div>
            </div>
          </div>
        ))}
        <div className="button green"
          style={{ width: 50, alignSelf: 'center' }}
          onClick={() => setformoperadora(1)}
        >
          <img
            alt=""
            src={novo}
            style={{ width: 20, height: 20 }}
          ></img>
        </div>
      </div>
    )
  }

  function ViewOperadoras() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center' }}>
          <div className="text2" style={{ fontSize: 22 }}>LISTA DE OPERADORAS CADASTRADAS</div>
        </div>
        <ListOperadoras></ListOperadoras>
        <FormOperadoras></FormOperadoras>
        <div id='btnviewprocedimentos'
          className={viewprocedimentos == 0 ? "button" : "button-selected"}
          style={{
            display: selectedoperadora.nome_operadora != undefined ? 'flex' : 'none',
            width: '30vw', alignSelf: 'center', padding: 20
          }}
          onClick={() => {
            if (viewprocedimentos == 0) {
              setviewprocedimentos(1)
            } else {
              setviewprocedimentos(0);
            }
          }}>
          {viewprocedimentos == 0 ?
            'VER PROCEDIMENTOS CADASTRADOS PARA A OPERADORA ' + selectedoperadora.nome_operadora :
            'OCULTAR PROCEDIMENTOS CADASTRADOS PARA A OPERADORA ' + selectedoperadora.nome_operadora}
        </div>
        <ViewProcedimentos></ViewProcedimentos>
      </div>
    )
  }

  const [formoperadora, setformoperadora] = useState(0); // 1 = inserir operadora. 2 = atualizar operadora.
  function FormOperadoras() {
    return (
      <div className="fundo"
        style={{ display: formoperadora != 0 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center' }}
        onClick={() => setformoperadora(0)}
      >
        <div className="janela scroll cor2"
          style={{ height: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="text1">NOME DA OPERADORA</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="NOME DA OPERADORA"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "NOME DA OPERADORA")}
              type="text"
              id="inputNomeOperadora"
              defaultValue={formoperadora == 2 ? selectedoperadora.nome_operadora : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw" }}
            ></input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="text1">REGISTRO ANS</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="REGISTRO ANS"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "REGISTRO ANS")}
              type="text"
              id="inputRegistroAns"
              defaultValue={formoperadora == 2 ? selectedoperadora.registro_ans : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw" }}
            ></input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="text1">TELEFONE DA OPERADORA</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="TELEFONE DA OPERADORA"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "TELEFONE DA OPERADORA")}
              type="text"
              id="inputTelefone"
              defaultValue={formoperadora == 2 ? selectedoperadora.telefone : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw" }}
            ></input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="text1">EMAIL DA OPERADORA</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="E-MAIL"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "E-MAIL")}
              type="text"
              id="inputEmail"
              defaultValue={formoperadora == 2 ? selectedoperadora.email : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", textTransform: 'none' }}
            ></input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="text1">CÓDIGO DO PRESTADOR NA OPERADORA</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="CÓDIGO DO PRESTADOR NA OPERADORA"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "CÓDIGO DO PRESTADOR NA OPERADORA")}
              type="text"
              id="inputCodigoPrestador"
              defaultValue={formoperadora == 2 ? selectedoperadora.codigo_prestador : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw" }}
            ></input>
          </div>
          <input className='button' id="uploader" type="file"
            style={{ display: 'none' }}
            onChange={() => {
              document.getElementById('canvas').getContext('2d').clearRect(0, 0, 300, 150);
              localStorage.setItem("imagem", document.getElementById("uploader").files[0]);
              const myFile = document.getElementById("uploader").files[0];
              const img = new Image();
              img.src = URL.createObjectURL(myFile);
              img.onload = () => {
                console.log('image uploaded');
                console.log(img.height + ' - ' + img.width);
                document.getElementById('canvas').style.backgroundColor = 'white';
                document.getElementById('canvas').width = img.width;
                document.getElementById('canvas').height = img.height;
                document.getElementById('canvas').getContext('2d').drawImage(img, 0, 0, img.width, img.height);
              }
            }}
          >
          </input>
          <div className="button" for="uploader" style={{ paddingLeft: 20, paddingRight: 20 }}
            onClick={() => document.getElementById('uploader').click()}
          >
            SELECIONE A LOGO
          </div>
          <canvas id="canvas"
            style={{ backgroundColor: 'white', borderRadius: 5, margin: 10, marginTop: 5, alignSelf: 'center' }}>
          </canvas>
          <div className="button green"
            onClick={() => {
              if (formoperadora == 1) {
                insertOperadora();
              } else {
                let imagem = document.getElementById('canvas').toDataURL('image/jpeg');
                updateOperadora(selectedoperadora, imagem);
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

  // FATURAMENTO - OPERADORAS DE SAÚDE //
  // cadastro de operadoras de saúde.
  const loadProcedimentos = () => {
    axios.get(html + 'all_procedimentos').then((response) => {
      setprocedimentos(response.data.rows);
      console.log(response.data.rows);
    })
  };

  const insertProcedimento = () => {
    let obj = {
      id_operadora: selectedoperadora.id,
      nome_operadora: selectedoperadora.nome_operadora,
      tuss_codigo: document.getElementById("inputCodigoTuss").value,
      tuss_terminologia: document.getElementById("inputTerminologia").value,
      tuss_rol_ans: document.getElementById("inputRolAns").value,
      tuss_rol_ans_descricao: document.getElementById("inputRolAnsDescricao").value,
      valor: document.getElementById("inputValor").value,
      fator_aumento: document.getElementById("inputFatorAumento").value,
      fator_reducao: document.getElementById("inputFatorReducao").value,
      valor_absoluto_aumento: document.getElementById("inputValorAbsolutoAumento").value,
      valor_absoluto_reducao: document.getElementById("inputValorAbsolutoReducao").value,
      obs: document.getElementById("inputObs").value.toUpperCase(),
      id_cliente: cliente.id_cliente,
      valor_part: document.getElementById("inputValorPart").value,
    }
    axios.post(html + 'insert_procedimento', obj).then(() => {
      console.log('PROCEDIMENTO REGISTRADO COM SUCESSO.');
      loadProcedimentos();
      setformprocedimento(0);
    })
  }

  const updateProcedimento = (item) => {
    let obj = {
      id_operadora: selectedoperadora.id,
      nome_operadora: selectedoperadora.nome_operadora,
      tuss_codigo: document.getElementById("inputCodigoTuss").value,
      tuss_terminologia: document.getElementById("inputTerminologia").value,
      tuss_rol_ans: document.getElementById("inputRolAns").value,
      tuss_rol_ans_descricao: document.getElementById("inputRolAnsDescricao").value,
      valor: document.getElementById("inputValor").value,
      fator_aumento: document.getElementById("inputFatorAumento").value,
      fator_reducao: document.getElementById("inputFatorReducao").value,
      valor_absoluto_aumento: document.getElementById("inputValorAbsolutoAumento").value,
      valor_absoluto_reducao: document.getElementById("inputValorAbsolutoReducao").value,
      obs: document.getElementById("inputObs").value.toUpperCase(),
      id_cliente: cliente.id_cliente,
      valor_part: document.getElementById("inputValorPart").value,
    }
    axios.post(html + 'update_procedimento/' + item.id, obj).then(() => {
      console.log('PROCEDIMENTO ATUALIZADO COM SUCESSO.');
      loadProcedimentos();
      setformprocedimento(0);
    })
  }

  const deleteProcedimento = (item) => {
    axios.get(html + 'delete_procedimento/' + item.id).then(() => {
      console.log('PROCEDIMENTO EXCLUÍDO COM SUCESSO');
      loadProcedimentos();
      setformprocedimento(0);
    })
  }

  function ListProcedimentos() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '30vh', overflowX: 'hidden' }}>
        <div id='cabecalho lista de procedimentos'
          className="button"
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: -5,
            backgroundColor: 'transparent'
          }}>
          <div className='text2' style={{ width: '10vw' }}>{'NOME DA OPERADORA'}</div>
          <div className='text2' style={{ width: '10vw' }}>{'CÓDIGO TUSS'}</div>
          <div className='text2' style={{ width: '25vw' }}>{'TERMINOLOGIA'}</div>
          <div className='text2' style={{ width: '25vw' }}>{'DESCRIÇÃO'}</div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className='text2' style={{ width: 50 }}>{''}</div>
            <div className='text2' style={{ width: 50 }}>{''}</div>
          </div>

        </div>
        {procedimentos.filter(item => item.id_operadora == selectedoperadora.id).map(item => (
          <div
            className="button"
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
            onClick={() => {
              setselectedprocedimento(item);
              setformprocedimento(2);
            }}
          >
            <div className="button" style={{ width: '10vw', backgroundColor: '#006666' }}>{item.nome_operadora}</div>
            <div className='text2' style={{ width: '10vw' }}>{item.tuss_codigo}</div>
            <div className='text2' style={{ width: '25vw' }}>{item.tuss_terminologia.toUpperCase()}</div>
            <div className='text2' style={{ width: '25vw' }}>{item.rol_ans_descricao}</div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div className="button green" style={{ width: 50 }}
                onClick={(e) => {
                  setselectedprocedimento(item);
                  setformprocedimento(2);
                  e.stopPropagation();
                }}
              >
                <img
                  alt=""
                  src={editar}
                  style={{ width: 25, height: 25 }}
                ></img>
              </div>
              <div className="button red" style={{ width: 50 }}
                onClick={(e) => {
                  modal(setdialogo, 'TEM CERTEZA QUE DESEJA EXCLUIR O PROCEDIMENTO ' + item.rol_ans_descricao + '?', deleteProcedimento, item);
                  e.stopPropagation();
                }}
              >
                <img
                  alt=""
                  src={deletar}
                  style={{ width: 25, height: 25 }}
                ></img>
              </div>
            </div>
          </div>
        ))}
        <div className="button green"
          style={{ width: 50, alignSelf: 'center' }}
          onClick={() => setformprocedimento(1)}
        >
          <img
            alt=""
            src={novo}
            style={{ width: 20, height: 20 }}
          ></img>
        </div>
      </div>
    )
  }

  const [viewprocedimentos, setviewprocedimentos] = useState(0);
  function ViewProcedimentos() {
    return (
      <div style={{ display: viewprocedimentos == 1 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="text2">{'PROCEDIMENTOS PARA A OPERADORA ' + selectedoperadora.nome_operadora}</div>
        <ListProcedimentos></ListProcedimentos>
        <FormProcedimentos></FormProcedimentos>
      </div>
    )
  }

  const [viewtussselector, setviewtussselector] = useState(0);
  const [tussselected, settussselected] = useState([]);
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
          style={{ height: '90vh', width: '80vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          {Filter("filtrarProcedimento", setarraylistatuss, listatuss, 'item.rol_ans_descricao')}
          {arraylistatuss.map(item => (
            <div
              className="button"
              key={Math.random()}
              style={{ width: 'calc(100% - 20px)', padding: 10, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}
              onClick={() => {
                settussselected(item);
                setviewtussselector(0);
                setTimeout(() => {
                  document.getElementById("inputCodigoTuss").value = item.codigo;
                  document.getElementById("inputTerminologia").value = item.terminologia;
                  document.getElementById("inputRolAns").value = item.rol_ans;
                  document.getElementById("inputRolAnsDescricao").value = item.rol_ans_descricao;
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

  const [formprocedimento, setformprocedimento] = useState(0); // 1 = inserir operadora. 2 = atualizar operadora.
  function FormProcedimentos() {
    return (
      <div className="fundo"
        style={{ display: formprocedimento != 0 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center' }}
        onClick={() => setformprocedimento(0)}
      >
        <div className="janela scroll cor2"
          style={{ height: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className='button' style={{ width: '100%' }} id="procedimento_selector" onClick={() => setviewtussselector(1)}>
              {tussselected.codigo != undefined ? tussselected.codigo + ' - ' + tussselected.rol_ans_descricao : 'SELECIONE'}
            </div>
            <FormTussSelector></FormTussSelector>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="text1">CÓDIGO TUSS</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="CÓDIGO TUSS"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "CÓDIGO TUSS")}
              type="text"
              id="inputCodigoTuss"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.tuss_codigo : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
            ></input>
            <div className="text1">TERMINOLOGIA</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="TERMINOLOGIA"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "TERMINOLOGIA")}
              type="text"
              id="inputTerminologia"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.tuss_terminologia : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
            ></input>
            <div className="text1">ROL ANS</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="ROL ANS"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "ROL ANS")}
              type="text"
              id="inputRolAns"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.tuss_rol_ans : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
            ></input>
            <div className="text1">ROL ANS DESCRIÇÃO</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="ROL ANS"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "ROL ANS")}
              type="text"
              id="inputRolAnsDescricao"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.tuss_rol_ans_descricao : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
            ></input>
            <div className="text1">VALOR PELO CONVÊNIO</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="VALOR"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "VALOR (R$)")}
              type="text"
              id="inputValor"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.valor : ''}
              maxLength={200}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
            ></input>
            <div className="text1">FATOR DE AUMENTO</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="FATOR DE AUMENTO"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "FFATOR DE AUMENTO")}
              type="text"
              id="inputFatorAumento"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.fator_aumento : ''}
              maxLength={2}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
            ></input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="text1">FATOR DE REDUÇÃO</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="FATOR DE REDUÇÃO"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "FATOR DE REDUÇÃO")}
              type="text"
              id="inputFatorReducao"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.fator_reducao : ''}
              maxLength={2}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
            ></input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="text1">VALOR ABSOLUTO DE AUMENTO</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="VALOR ABSOLUTO DE AUMENTO"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "VALOR ABSOLUTO DE AUMENTO")}
              type="text"
              id="inputValorAbsolutoAumento"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.valor_absoluto_aumento : ''}
              maxLength={2}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
            ></input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="text1">VALOR ABSOLUTO DE REDUÇÃO</div>
            <input
              className="input"
              autoComplete="off"
              placeholder="VALOR ABSOLUTO DE REDUÇÃO"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "VALOR ABSOLUTO DE REDUÇÃO")}
              type="text"
              id="inputValorAbsolutoReducao"
              defaultValue={formprocedimento == 2 ? selectedprocedimento.valor_absoluto_reducao : ''}
              maxLength={2}
              style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
            ></input>
          </div>
          <div className="text1">VALOR PARTICULAR</div>
          <input
            className="input"
            autoComplete="off"
            placeholder="VALOR"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "VALOR (R$)")}
            type="text"
            id="inputValorPart"
            defaultValue={formprocedimento == 2 ? selectedprocedimento.valor_part : ''}
            maxLength={200}
            style={{ margin: 5, width: window.innerWidth < 426 ? "100%" : "30vw", alignSelf: 'center' }}
          ></input>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
          <div className="button green"
            onClick={() => {
              if (formprocedimento == 1) {
                insertProcedimento();
              } else {
                updateProcedimento(selectedprocedimento);
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

  const [menufaturamento, setmenufaturamento] = useState('REGISTROS DE FATURAMENTO');
  let opcoesmenufaturamento = [
    'REGISTROS DE FATURAMENTO',
    'CADASTRO DE OPERADORAS',
  ]
  function MenuFaturamento() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: 5 }}>
        <div id="botão para sair da tela de faturamento"
          className="button-yellow"
          style={{ maxHeight: 50, maxWidth: 50, alignSelf: 'center' }}
          onClick={() => {
            setpagina(0);
            history.push("/");
          }}>
          <img
            alt=""
            src={back}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
        {opcoesmenufaturamento.map((item) => (
          <div className={menufaturamento == item ? "button-selected" : "button"}
            onClick={() => setmenufaturamento(item)}
            style={{ width: 250 }}
          >
            {item}
          </div>
        ))}
      </div>
    )
  }

  let calendariomensal = [
    moment().subtract(3, 'months').format('MM-YYYY'),
    moment().subtract(2, 'months').format('MM-YYYY'),
    moment().subtract(1, 'month').format('MM-YYYY'),
    moment().format('MM-YYYY'),
    moment().add(1, 'month').format('MM-YYYY'),
    moment().add(2, 'months').format('MM-YYYY'),
    moment().add(3, 'months').format('MM-YYYY'),
  ]

  const [atendimentos_mes, setatendimentos_mes] = useState([]);
  const filtraregistrosconsultas = (data) => {
    axios.get(html + "list_faturamento_clinicas_mes/" + cliente.id_cliente + "/" + data).then((response) => {
      let x = response.data.rows;
      setatendimentos_mes(x);
      console.log(x.length);
    });
  }

  const [procedimentos_mes, setprocedimentos_mes] = useState([]);
  const filtraregistrosprocedimentos = (data) => {
    console.log(data);
    axios.get(html + "list_faturamento_procedimentos_mes/" + cliente.id_cliente + "/" + data).then((response) => {
      let x = response.data.rows;
      setprocedimentos_mes(x);
      console.log('PORRA');
      console.log(x.length);
    });
  }

  const [objfaturamento, setobjfaturamento] = useState(null);
  const [selecteddate, setselecteddate] = useState(moment().format('MM-YYYY'));
  const [tipoatendimento, settipoatendimento] = useState('CONSULTAS');
  function ListaDeFaturamentos() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div id="seletores de meses">
          <div id="scroll de meses"
            className="scroll cor2"
            style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'flex-start',
              overflowY: 'hidden', overflowX: 'scroll',
              width: '80vw', alignSelf: 'center',
            }}>
            <textarea
              autoComplete="off"
              placeholder="MÊS/ANO"
              className="textarea"
              type="text"
              inputMode="numeric"
              maxLength={10}
              id="inputMesFaturamento"
              title="FORMATO: MM-YYYY"
              onClick={() => document.getElementById("inputMesFaturamento").value = ""}
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "MÊS-ANO")}
              style={{
                flexDirection: "center",
                justifyContent: "center",
                alignSelf: "center",
                width: 150,
                textAlign: "center",
                padding: 5,
                height: 20,
                minHeight: 20,
                maxHeight: 20,
              }}
            ></textarea>
            <div id='botão para limpar o filtro.'
              className="button red"
              onClick={() => {
                filtraregistrosconsultas(document.getElementById("inputMesFaturamento").value);
                filtraregistrosprocedimentos(document.getElementById("inputMesFaturamento").value);
                loadfaturamentosmes(document.getElementById("inputMesFaturamento").value);
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
                src={lupa}
                style={{
                  margin: 0,
                  height: 20,
                  width: 20,
                  opacity: 1,
                  alignSelf: 'center'
                }}
              ></img>
            </div>
            {calendariomensal.map(item => (
              <div
                id={'btn_datas_faturamento ' + item}
                className={selecteddate == item ? "button-selected" : "button"}
                style={{ width: 200, minHeight: 30, height: 30, maxHeight: 30 }}
                onClick={() => {
                  setselecteddate(item);
                  filtraregistrosconsultas(item);
                  filtraregistrosprocedimentos(item);
                  loadfaturamentosmes(item);
                  document.getElementById("inputMesFaturamento").value = selecteddate;
                }}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <TotaisFaturamento></TotaisFaturamento>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div
            className={tipoatendimento == 'CONSULTAS' ? "button-selected" : "button"}
            style={{ width: 150 }}
            onClick={() => settipoatendimento('CONSULTAS')}
          >
            CONSULTAS
          </div>
          <div
            className={tipoatendimento == 'PROCEDIMENTOS' ? "button-selected" : "button"}
            style={{ width: 150 }}
            onClick={() => settipoatendimento('PROCEDIMENTOS')}
          >
            PROCEDIMENTOS
          </div>
        </div>
        <div style={{ display: tipoatendimento == 'CONSULTAS' ? 'flex' : 'none', flexDirection: 'column' }}>
          {
            atendimentos_mes.filter(item => item.nome_paciente != 'HORÁRIO BLOQUEADO!').map(item => (
              <div className="button" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignSelf: 'flex-start' }}>
                  <div className="button red" style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 200, minWidth: 200,
                    marginRight: 10, alignSelf: 'center',
                  }}>
                    <div>{moment(item.data_inicio).format('DD/MM/YYYY - HH:mm')}</div>
                    <div>{'CONSULTA'}</div>
                    <div>{item.faturamento_codigo_procedimento}</div>
                  </div>
                  <div style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', textAlign: 'left',
                    alignSelf: 'center',
                  }}>
                    <div style={{ fontSize: 10, opacity: 0.5 }}>
                      {'ID ATENDIMENTO: ' + item.id_atendimento}
                    </div>
                    <div>
                      {'CLIENTE: ' + item.nome_paciente}
                    </div>
                    <div>
                      {'PROFISSIONAL: ' + usuarios.filter(usuario => usuario.id_usuario == item.id_profissional).map(usuario => usuario.nome_usuario)}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'flex-start',
                  width: '40vw'
                }}>
                  {localfaturamento.filter(valor => valor.atendimento_id == item.id_atendimento).sort((a, b) => a.parcela < b.parcela ? -1 : 1).map(valor => (
                    <div className={valor.status_pagamento == 'ABERTO' ? 'button yellow' : valor.status_pagamento == 'VENCIDO' ? 'button red' : 'button green'}
                      onClick={() => {
                        setobjatendimento(item);
                        setobjfaturamento(valor);
                        console.log(valor);
                        setvieweditfaturamento(1);
                      }}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignContent: 'flex-start',
                        alignItems: 'flex-start',
                        paddingLeft: 10,
                      }}>
                      <div>{valor.forma_pagamento}</div>
                      <div>{'PARCELA: ' + valor.parcela}</div>
                      <div>{'STATUS: ' + valor.status_pagamento}</div>
                      <div>{valor.data_pagamento == null ? 'DATA DO PAGAMENTO: PENDENTE' : 'DATA DO PAGAMENTO: ' + valor.data_pagamento}</div>
                      <div>{'DATA DO VENCIMENTO: ' + valor.data_vencimento}</div>
                      <div>{'R$ ' + parseFloat(valor.valor_pagamento).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
        <div style={{ display: tipoatendimento == 'PROCEDIMENTOS' ? 'flex' : 'none', flexDirection: 'column' }}>
          {
            procedimentos_mes.map(item => (
              <div className="button" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignSelf: 'flex-start' }}>
                  <div className="button red" style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 200, minWidth: 200,
                    marginRight: 10, alignSelf: 'center',
                  }}>
                    <div>{item.data_exame}</div>
                    <div>{item.nome_exame}</div>
                  </div>
                  <div style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', textAlign: 'left',
                    alignSelf: 'center',
                  }}>
                    <div style={{ fontSize: 10, opacity: 0.5 }}>
                      {'ID PROCEDIMENTO: ' + item.id}
                    </div>
                    <div>
                      {'CLIENTE: ' + item.nome_paciente}
                    </div>
                    <div>
                      {'PROFISSIONAL: ' + usuarios.filter(usuario => usuario.id_usuario == item.id_profissional_executante).map(usuario => usuario.nome_usuario)}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'flex-start',
                  width: '40vw'
                }}>
                  {localfaturamento.filter(valor => valor.procedimento_id == item.id).sort((a, b) => a.parcela < b.parcela ? -1 : 1).map(valor => (
                    <div className={valor.status_pagamento == 'ABERTO' ? 'button yellow' : valor.status_pagamento == 'VENCIDO' ? 'button red' : 'button green'}
                      onClick={() => {
                        setobjfaturamento(valor);
                        console.log(valor);
                        setvieweditfaturamento(1);
                      }}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignContent: 'flex-start',
                        alignItems: 'flex-start',
                        paddingLeft: 10,
                      }}>
                      <div>{valor.forma_pagamento}</div>
                      <div>{'PARCELA: ' + valor.parcela}</div>
                      <div>{'STATUS: ' + valor.status_pagamento}</div>
                      <div>{valor.data_pagamento == null ? 'DATA DO PAGAMENTO: PENDENTE' : 'DATA DO PAGAMENTO: ' + valor.data_pagamento}</div>
                      <div>{'DATA DO VENCIMENTO: ' + valor.data_vencimento}</div>
                      <div>{'R$ ' + parseFloat(valor.valor_pagamento).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      </div >
    )
  }

  const totaisfaturamento = (arrayfaturamento, status) => {
    let total = 0;
    arrayfaturamento.filter(item => item.status_pagamento == status).map(item => {
      total = parseFloat(total) + parseFloat(item.valor_pagamento);
      return null;
    });
    return (
      <div
        className={status == 'ABERTO' ? "button yellow" : status == 'VENCIDO' ? "button red" : "button green"}
        style={{ width: 150, display: 'flex', flexDirection: 'column' }}
      >
        <div>{status}</div>
        <div>
          {'R$ ' + total.toFixed(2)}
        </div>
      </div>
    );
  }

  const donutchart = (data, tamanho, fontsize, total) => {
    // tooltip
    const CustomTooltip = ({ payload, label }) => {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          backgroundColor: 'black', borderRadius: 5, padding: 10, color: 'white',
          fontSize: fontsize, fontWeight: 'bold',
        }}>
          <div>{label}</div>
          {payload.map(item => (
            <div>
              <div>{item.name + ':'}</div>
              <div>{'R$: ' + item.value}</div>
              <div>{Math.ceil(item.value * 100 / total) + '%'}</div>
            </div>
          ))}
        </div>
      )
    }

    // labels.
    const RADIAN = Math.PI / 180;
    let renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {

      const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      if (Math.ceil(100 * value / localfaturamento.length) > 0) {
        return (
          <div style={{ backgroundColor: 'black' }} x={x} y={y} fill={'white'} fontWeight={'bold'} fontSize={fontsize} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {Math.ceil(100 * value / localfaturamento.length) + '%'}
          </div>
        );
      } else {
        return null;
      }
    }

    return (
      <div style={{ display: 'flex', borderRadius: 5, margin: 5 }}>
        <PieChart width={tamanho + 10} height={tamanho + 10} style={{ alignSelf: 'center' }}>
          {localfaturamento.length}
          BOBO
          <Tooltip content={<CustomTooltip payload={[]} />} />
          <Pie
            data={data} dataKey="value" nameKey={"name"} labelLine={false} label={renderLabel} cx={0.5 * tamanho} cy={0.5 * tamanho} outerRadius={0.5 * tamanho} innerRadius={0.2 * tamanho}
            stroke={''} strokeWidth={5}
          >
          </Pie>
        </PieChart>
      </div>
    )
  }


  function TotaisFaturamento() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          {donutchart(donutfaturamentodata(), 200, 16, buildtotalvalorfaturamento(localfaturamento))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 5 }}>
          {totaisfaturamento(localfaturamento, 'ABERTO')}
          {totaisfaturamento(localfaturamento, 'VENCIDO')}
          {totaisfaturamento(localfaturamento, 'PAGO')}
        </div>
      </div>
    )
  }

  const [vieweditfaturamento, setvieweditfaturamento] = useState(0);
  function EditFaturamento() {
    const [statusfatura, setstatusfatura] = useState(null);
    return (
      <div className="fundo"
        style={{ display: vieweditfaturamento == 1 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center' }}
        onClick={() => setvieweditfaturamento(0)}
      >
        <div
          className="janela scroll cor2"
          onClick={(e) => e.stopPropagation()}>
          <div className="text1" style={{ fontSize: 20 }}>RESUMO DA FATURA</div>
          <div className="text1">VALOR DO PAGAMENTO</div>
          <input
            className="input"
            autoComplete="off"
            placeholder="VALOR DO PAGAMENTO"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "VALOR DO PAGAMENTO (R$)")}
            type="text"
            id="inputValorDoPagamento"
            defaultValue={objfaturamento != null ? parseFloat(objfaturamento.valor_pagamento).toFixed(2) : ''}
            maxLength={200}
            style={{ margin: 5, width: window.innerWidth < 426 ? 200 : 200 }}
          >
          </input>
          <div
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div className={statusfatura == 'PAGO' ? "button-selected" : "button-green"}
              style={{ display: 'flex', minWidth: 150, width: 150, maxWidth: 150 }}
              onClick={() => setstatusfatura('PAGO')}
            >
              {'PAGO'}
            </div>
            <div className={statusfatura == 'ABERTO' ? "button-selected" : "button-yellow"}
              style={{ display: 'flex', minWidth: 150, width: 150, maxWidth: 150 }}
              onClick={() => setstatusfatura('ABERTO')}
            >
              {'ABERTO'}
            </div>
            <div className={statusfatura == 'VENCIDO' ? "button-selected" : "button-red"}
              style={{ display: 'flex', minWidth: 150, width: 150, maxWidth: 150 }}
              onClick={() => setstatusfatura('VENCIDO')}
            >
              {'VENCIDO'}
            </div>
          </div>
          <div
            className="button" style={{ paddingLeft: 15, paddingRight: 15 }}
            onClick={() => updateRegistroProcedimento(objfaturamento, statusfatura, document.getElementById('inputValorDoPagamento').value)}
          >
            ATUALIZAR INFORMAÇÕES
          </div>
          <div className="button green"
            onClick={
              () => {
                setreciboform(1);
                localStorage.setItem('pagador', atendimentos_mes.filter(atend => atend.id_atendimento == objfaturamento.atendimento_id).map(atend => atend.nome_paciente));
                localStorage.setItem('procedimento', 'CONSULTA MÉDICA');
              }
            }
            style={{ paddingLeft: 15, paddingRight: 15 }}>
            GERAR RECIBO
          </div>
        </div>
      </div >
    )
  }

  const updateRegistroProcedimento = (item, status, valor) => {
    let obj = {
      cliente_id: cliente.id_cliente,
      cliente_nome: cliente.razao_social,
      atendimento_id: item.atendimento_id,
      procedimento_id: item.procedimento_id,
      data_pagamento: item.data_pagamento,
      data_vencimento: item.data_vencimento,
      parcela: item.parcela,
      forma_pagamento: item.forma_pagamento,
      status_pagamento: status,
      valor_pagamento: valor,
      id_operadora: item.id_operadora,
      codigo_operadora: item.codigo_operadora,
      codigo_tuss: item.codigo_tuss,
      nome_tuss: item.nome_tuss,
      data_registro: item.data_registro,
    }
    axios.post(html + 'update_faturamento_clinicas/' + item.id, obj).then(() => {
      console.log('REGISTRO DE FATURAMENTO REALIZADO COM SUCESSO');
      loadfaturamentosmes(document.getElementById("inputMesFaturamento").value);
      setvieweditfaturamento(0);
    })
  }

  // ## CRIAÇÃO DE RECIBOS EM PDFMAKE ## //
  // impressão de recibo de pagamento (consulta ou procedimento particular).
  const printFile = () => {
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 200, 40, 120],
      header: {
        stack: [
          {
            columns: [
              {
                image: cliente.logo,
                width: 75,
                alignment: 'center',
              },
              {
                stack: [
                  { text: cliente.razao_social, alignment: 'left', fontSize: 10, width: 300 },
                  { text: 'ENDEREÇO: ' + cliente.endereco, alignment: 'left', fontSize: 6, width: 300 },
                  { text: 'TELEFONE: ' + cliente.telefone, alignment: 'left', fontSize: 6, width: 300 },
                  { text: 'EMAIL: ' + cliente.email, alignment: 'left', fontSize: 6, width: 300 },
                ],
                width: '*'
              },
              { qr: cliente.qrcode, width: '40%', fit: 75, alignment: 'right', margin: [0, 0, 10, 0] },
            ],
            columnGap: 10,
          },
          {
            "canvas": [{
              "lineColor": "gray",
              "type": "line",
              "x1": 0,
              "y1": 0,
              "x2": 524,
              "y2": 0,
              "lineWidth": 1
            }], margin: [0, 10, 0, 0], alignment: 'center',
          },

        ],
        margin: [40, 40, 40, 40],
      },
      footer: function (currentPage, pageCount) {
        return {
          stack: [
            {
              "canvas": [{
                "lineColor": "gray",
                "type": "line",
                "x1": 0,
                "y1": 0,
                "x2": 524,
                "y2": 0,
                "lineWidth": 1
              }], margin: [0, 10, 0, 0], alignment: 'center',
            },
            {
              columns: [
                {
                  stack: [
                    { text: '________________________________', alignment: 'center', width: 400 },
                    { text: 'DEPARTAMENTO FINANCEIRO', width: '*', alignment: 'center', fontSize: 8 },
                  ], with: '30%',
                },
                { text: 'PÁGINA ' + currentPage.toString() + ' DE ' + pageCount, fontSize: 8 },
                { text: '', width: '*' },
              ],
              margin: [40, 40, 40, 40], alignment: 'center',
            },
          ],
        }
      },
      content: [
        { text: 'RECIBO DE PAGAMENTO', alignment: 'center', fontSize: 14, bold: true, margin: 10 },
        { text: localStorage.getItem('texto_recibo'), fontSize: 10, bold: false },
        { text: '---x---', fontSize: 10, bold: true, color: '#ffffff' },
        { text: 'INFORMAÇÕES DO RECEBEDOR:', fontSize: 10, bold: true },
        { text: 'CNPJ: ' + cliente.cnpj, fontSize: 10, bold: false },
        { text: 'RAZÃO SOCIAL: ' + cliente.razao_social, fontSize: 10, bold: false },
        { text: 'ENDEREÇO: ' + cliente.endereco, fontSize: 10, bold: false },
      ],
    }
    // utilizando a lib pdfmake para gerar o pdf e converter em base64.
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.open();
  }
  const [reciboform, setreciboform] = useState(0);
  function ReciboNomePagador() {
    return (
      <div
        className="fundo"
        style={{ display: reciboform == 1 ? "flex" : "none" }}
        onClick={() => { setreciboform(0) }}
      >
        <div className="janela scroll cor2" onClick={(e) => e.stopPropagation()}>
          <div className='text1'>NOME DO PAGADOR</div>
          <input id="inputNomePagador"
            autoComplete="off"
            placeholder="NOME DO PAGADOR..."
            className="input"
            type="text"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "NOME DO PAGADOR...")}
            defaultValue={localStorage.getItem('pagador')}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              textAlign: "center",
              width: 400,
              padding: 15,
              height: 20,
              minHeight: 20,
              maxHeight: 20,
            }}
          ></input>
          <div className='text1'>DOCUMENTO DO PAGADOR</div>
          <input id="inputDocumentoPagador"
            autoComplete="off"
            placeholder="DOCUMENTO DO PAGADOR..."
            className="input"
            type="text"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "DOCUMENTO DO PAGADOR...")}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              textAlign: "center",
              width: 400,
              padding: 15,
              height: 20,
              minHeight: 20,
              maxHeight: 20,
            }}
          ></input>
          <div className='button green'
            style={{ width: 200 }}
            onClick={() => {
              let total_parcelas = localfaturamento.filter(fat => fat.atendimento_id == objfaturamento.atendimento_id).length;
              if (total_parcelas < 2) {
                let texto = 'RECEBEMOS DE ' + document.getElementById('inputNomePagador').value.toUpperCase() + ', ' + document.getElementById('inputDocumentoPagador').value + ', A IMPORTÂNCIA DE R$ ' + objfaturamento.valor_pagamento + ', REFERENTE À REALIZAÇÃO DO EXAME/PROCEDIMENTO ' + localStorage.getItem('procedimento');
                localStorage.setItem('texto_recibo', texto);
              } else {
                let texto = 'RECEBEMOS DE ' + document.getElementById('inputNomePagador').value.toUpperCase() + ', ' + document.getElementById('inputDocumentoPagador').value + ', A IMPORTÂNCIA DE R$ ' + objfaturamento.valor_pagamento + ', PARCELA ' + objfaturamento.parcela + ' DE ' + total_parcelas + ', REFERENTE À REALIZAÇÃO DO EXAME/PROCEDIMENTO:' + localStorage.getItem('procedimento');
                localStorage.setItem('texto_recibo', texto);
              }
              printFile();
              setreciboform(0);
            }}
          >
            IMPRIMIR RECIBO
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="tela de faturamento"
      className='main'
      style={{
        display: pagina == 'FATURAMENTO' ? 'flex' : 'none',
      }}
    >
      <div className='chassi scroll'
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          width: 'calc(100vw - 20px)',
        }}>
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center',
        }}>
          <MenuFaturamento></MenuFaturamento>
          <div style={{
            display: menufaturamento == 'CADASTRO DE OPERADORAS' ? 'flex' : 'none',
            flexDirection: 'column', justifyContent: 'center'
          }}>
            <ViewOperadoras></ViewOperadoras>
          </div>
          <div style={{
            display: menufaturamento == 'REGISTROS DE FATURAMENTO' ? 'flex' : 'none',
            flexDirection: 'column', justifyContent: 'center'
          }}>
            <ListaDeFaturamentos></ListaDeFaturamentos>
            <EditFaturamento></EditFaturamento>
            <ReciboNomePagador></ReciboNomePagador>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Faturamento;