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

function Faturamento() {

  // context.
  const {
    pagina, setpagina,
    html,
    setatendimentos,
    setpacientes,
    setaih,
    operadoras, setoperadoras,
    setselectedoperadora, selectedoperadora,
    procedimentos, setprocedimentos,
    selectedprocedimento, setselectedprocedimento,
    setdialogo,
  } = useContext(Context);

  // history (router).
  let history = useHistory();

  const loadAtendimentos = () => {
    axios
      .get(html + "all_atendimentos")
      .then((response) => {
        setatendimentos(response.data.rows);
      });
  };
  const loadPacientes = () => {
    axios.get(html + "list_pacientes").then((response) => {
      setpacientes(response.data.rows);
      loadAtendimentos();
    });
  }
  const loadAih = () => {
    axios.get(html + 'load_aih').then((response) => {
      setaih(response.data.rows);
    });
  }

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'FATURAMENTO') {
      console.log('PÁGINA DE FATURAMENTO');
      loadAtendimentos();
      loadPacientes();
      loadAih();
      loadOperadoras();
      loadProcedimentos();
      loadTuss();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // FATURAMENTO - OPERADORAS DE SAÚDE //
  // carregando procedimentos da tabela TUSS.
  const [arraylistatuss, setarraylistatuss] = useState([]);
  const loadTuss = () => {
    axios.get(html + 'all_tabela_tuss').then((response) => {
      var x = response.data.rows;
      setarraylistatuss(response.data.rows);
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
      // loadOperadoras();
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
          <div className="button" style={{ width: 50, backgroundColor: 'transparent' }}>{''}</div>
          <div className="button" style={{ width: 50, backgroundColor: 'transparent' }}>{''}</div>
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
        <div className="janela scroll"
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
          <div className='text2' style={{ width: 50 }}>{''}</div>
          <div className='text2' style={{ width: 50 }}>{''}</div>
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
        <div className="janela scroll"
          style={{ height: '90vh', width: '80vw' }}
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
        <div className="janela scroll"
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
            <div className="text1">VALOR</div>
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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <ViewOperadoras></ViewOperadoras>
        </div>
      </div>
    </div>
  )
}

export default Faturamento;