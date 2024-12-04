/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState, useCallback } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from "moment";
import GuiaSadt from './GuiaSadt';
// imagens.
import novo from '../images/novo.svg';
import deletar from '../images/deletar.svg';
import print from '../images/imprimir.svg';
import selector from '../functions/selector';
import salvar from "../images/salvar.svg";
import favorito_salvar from '../images/favorito_salvar.svg';
import favorito_usar from '../images/favorito_usar.svg';
// router.
import Filter from '../components/Filter';
// funções.
import modal from '../functions/modal';

function Exames() {

  // context.
  const {
    html,
    card, setcard,
    usuario,
    paciente,
    atendimento,
    setlaboratorio,
    laboratorio,
    listalaboratorio, setlistalaboratorio,
    setdono_documento, dono_documento,
    setdialogo,
  } = useContext(Context);


  useEffect(() => {
    if (card == 'exames') {
      console.log('PÁGINA EXAMES COMPLEMENTARES + GUIA SADT');
      loadTuss();
      // setlistalaboratorio([]);
      console.log(listalaboratorio);
      loadListaLaboratorio();
      localStorage.setItem('random', 0);
      setdono_documento(null);
      loadModelosExames();
      loadModelosExamesItens();
    }
    // eslint-disable-next-line
  }, [card, atendimento]);

  // carregar procedimentos e exames da tabela TUSS.
  const [procedimentos_tuss, setprocedimentos_tuss] = useState([]);
  const [arrayprocedimentos_tuss, setarrayprocedimentos_tuss] = useState([]);
  const loadTuss = () => {
    axios.get(html + 'all_tabela_tuss').then((response) => {
      var x = response.data.rows;
      setprocedimentos_tuss(x);
      setarrayprocedimentos_tuss(x);
      console.log('LISTA TUSS CARREGADA... ' + x.length);
    }).catch(error => {
      console.log(error);
    })
  }

  // LISTA LABORATÓRIO.
  // carregar lista de pedidos de exames laboratoriais para o atendimento.
  const loadListaLaboratorio = () => {
    console.log(atendimento);
    console.log(listalaboratorio);
    if (atendimento != null) {
      axios.get(html + 'lista_laboratorio/' + atendimento).then((response) => {
        setlistalaboratorio(response.data.rows);
      });
    }
  }

  // inserir pedido de laboratório.
  const insertListaLaboratorio = () => {
    let random = Math.random();
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data: moment(),
      status: 0, // 0 = não salva; 1 = salva (não pode excluir).
      id_profissional: usuario.id,
      nome_profissional: usuario.nome_usuario,
      registro_profissional: usuario.n_conselho,
      random: random,
      urgente: 0,
    }
    axios.post(html + 'insert_lista_laboratorio', obj).then(() => {
      console.log(obj);
      localStorage.setItem('random', random);
      loadListaLaboratorio();
    });
  }

  // atualizar pedido de exame laboratorial.
  const updateListaLaboratorio = (item, status) => {
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data: item.data,
      status: status, // 0 = não salva; 1 = salva (não pode excluir).
      id_profissional: usuario.id,
      nome_profissional: usuario.nome_usuario,
      registro_profissional: usuario.n_conselho,
      random: item.random,
      urgente: null,
    }
    axios.post(html + 'update_lista_laboratorio/' + item.id, obj).then(() => {
      loadListaLaboratorio();
    });
  }

  // deletar pedido de exame laboratorial.
  const deleteListaLaboratorio = (id) => {
    axios.get(html + 'delete_lista_laboratorio/' + id).then(() => {
      loadListaLaboratorio();
    });
  }

  // deletar itens de laboratório relacionados a um pedido de exames laboratoriais deletado.
  const deleteMassaItensLaboratorio = (random) => {
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      var x = response.data.rows;
      x.filter(item => item.random == random).map(item => axios.get(html + 'delete_laboratorio/' + item.id));
      localStorage.setItem('random', null);
      localStorage.setItem('status', null);
      loadListaLaboratorio();
    });
  }

  // ITENS DE LABORATÓRIO.
  // carregar itens de exames laboratoriais para o atendimento.
  const loadLaboratorio = (random) => {
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      var x = response.data.rows;
      setlaboratorio(x.filter(item => item.random == random));
      selector("scroll lista de pedidos de exames laboratoriais", "pedido de laboratorio " + random, 200);
    });
  }

  // inserir item de exame laboratorial.
  const insertLaboratorio = (item, random) => {
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data_pedido: moment(),
      data_resultado: null,
      codigo_exame: item.codigo,
      nome_exame: item.terminologia,
      material: null,
      resultado: null,
      status: null,
      profissional: usuario.id,
      unidade_medida: null,
      vref_min: null,
      vref_max: null,
      obs: null,
      random: random,
      array_campos: null,
      metodo: null,
    }
    console.log(obj);
    axios.post(html + 'insert_laboratorio', obj).then(() => {
      let random = localStorage.getItem('random');
      loadLaboratorio(random);
    });
  }

  // deletar item de exame laboratorial.
  const deleteLaboratorio = (id) => {
    axios.get(html + 'delete_laboratorio/' + id).then(() => {
      let random = localStorage.getItem('random');
      loadLaboratorio(random);
    });
  }

  const PackExames = useCallback(() => {
    return (
      <div id="scroll lista de pedidos de exames laboratoriais"
        className='scroll'
        style={{
          width: 'calc(25vw - 10px)',
          height: 'calc(100vh - 120px)',
          margin: 0, marginLeft: 10,
          backgroundColor: 'white',
          borderColor: 'white',
          alignSelf: 'flex-end',
        }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div className='button-green'
            onClick={() => {
              insertListaLaboratorio();
              setdono_documento(null);
            }}
          >
            <img
              alt=""
              src={novo}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
          <div className='button-green'
            onClick={() => {
              loadModelosExames();
              loadModelosExamesItens();
              setviewmodelospackexames(1);
            }}
          >
            <img
              alt=""
              src={favorito_usar}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
        </div>
        <div style={{ display: listalaboratorio.length > 0 ? 'flex' : 'none', flexDirection: 'column' }}>
          {listalaboratorio.sort((a, b) => moment(a.data) > moment(b.data) ? -1 : 1).map((item) => (
            <div id={"pedido de laboratorio " + item.random}
              className='button'
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                minHeight: 200,
              }}
              onClick={() => {
                setdono_documento({
                  id: item.id_profissional,
                  conselho: 'CRM: ' + item.registro_profissional,
                  nome: item.nome_profissional,
                })
                console.log(item.random);
                localStorage.setItem('random', item.random); // valor randômico chave para relacionar documento de laboratório aos respectivos itens de exames laboratoriais.
                localStorage.setItem('status', item.status); // status 1 == pedido assinado. status 0 == pedido aberto.
                loadLaboratorio(item.random);
              }}
            >
              <div id="conjunto de botoes do item de laboratório"
                style={{
                  display: 'flex',
                  flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
                }}>
                <div id="botão para salvar modelo de pack de exames."
                  title={'SALVAR COMO MODELO'}
                  style={{
                    display: 'flex',
                    maxWidth: 30, width: 30, minWidth: 30,
                    maxHeight: 30, height: 30, minHeight: 30
                  }}
                  className='button-green'
                  onClick={() => {
                    setviewinsertmodeloexames(1);
                  }}
                >
                  <img
                    alt=""
                    src={favorito_salvar}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
                <div id="botão para excluir pedido de exame laboratorial e seus respectivos itens de exames laboratoriais."
                  className='button-yellow'
                  style={{
                    display: 'flex',
                    maxWidth: 30, width: 30, minWidth: 30,
                    maxHeight: 30, height: 30, minHeight: 30
                  }}
                  onClick={(e) => {
                    console.log(item.random);
                    deleteListaLaboratorio(item.id);
                    deleteMassaItensLaboratorio(item.random);
                    setdono_documento(null);
                    e.stopPropagation();
                  }}
                >
                  <img
                    alt=""
                    src={deletar}
                    style={{ width: 25, height: 25 }}
                  ></img>
                </div>
                <div id="botão para imprimir guia SADT com pack de exames."
                  title={'IMPRIMIR GUIA TISS SADT'}
                  style={{
                    // display: item.status == 0 ? 'flex' : 'none',
                    display: 'flex',
                    maxWidth: 30, width: 30, minWidth: 30,
                    maxHeight: 30, height: 30, minHeight: 30
                  }}
                  className='button-green'
                  onClick={(e) => {
                    updateListaLaboratorio(item, 1);
                    localStorage.setItem('random', item.random);
                    document.getElementById("guia-sadt").style.display = 'flex';
                    document.getElementById("guia-sadt").style.visibility = 'visible';
                    setcard('guia-sadt');
                    e.stopPropagation();
                  }}
                >
                  <img
                    alt=""
                    src={print}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 12 }}>
                  {'DR(A) ' + item.nome_profissional}
                </div>
                <div style={{ fontSize: 12, marginBottom: 5 }}>
                  {item.registro_profissional}
                </div>
                <div>
                  {moment(item.data).format('DD/MM/YY')}
                </div>
                <div>
                  {moment(item.data).format('HH:mm')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div >
    )
    // eslint-disable-next-line
  }, [atendimento, listalaboratorio, setdono_documento]);

  const [viewinsertmodeloexames, setviewinsertmodeloexames] = useState(0);
  function InsertModeloExames() {
    return (
      <div className="fundo"
        onClick={() => setviewinsertmodeloexames(0)}
        style={{
          display: viewinsertmodeloexames == 1 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center'
        }}>
        <div className="janela"
          onClick={(e) => e.stopPropagation()}
        >
          <div className='text1'>NOME DO PACOTE DE PROCEDIMENTOS</div>
          <input
            className="input"
            autoComplete="off"
            placeholder={
              "NOME PARA O PACOTE..."
            }
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "NOME PARA O PACOTE...")}
            type="text"
            id="inputNomePacoteExames"
            maxLength={150}
            style={{ width: 'calc(100% - 20px)', backgroundColor: 'white' }}
          ></input>
          <div id="btnUpdatePacoteExames"
            className="button-green"
            onClick={() => {
              insertModeloExames();
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
        </div>
      </div>
    )
  }

  const [modelos_exames, setmodelos_exames] = useState([]);
  const loadModelosExames = () => {
    axios.get(html + 'list_modelos_exames').then((response) => {
      let x = response.data.rows;
      setmodelos_exames(x);
    })
  }

  const [modelos_exames_itens, setmodelos_exames_itens] = useState([]);
  const loadModelosExamesItens = () => {
    axios.get(html + 'list_modelos_exames_itens').then((response) => {
      let x = response.data.rows;
      setmodelos_exames_itens(x);
    })
  }

  const insertModeloExames = () => {
    let random = Math.random();
    var obj = {
      profissional: usuario.id,
      random: random,
      nome_modelo: document.getElementById('inputNomePacoteExames').value.toUpperCase(),
    }
    console.log(obj);
    axios.post(html + 'insert_modelo_exame', obj).then(() => {
      loadModelosExames();
      console.log('MODELO SALVO COM SUCESSO');
      setviewinsertmodeloexames(0);
    })
    // inserindo os procedimentos para o pacote.
    // eslint-disable-next-line
    laboratorio.filter(item => item.random == localStorage.getItem('random')).map(item => {
      insertModeloExamesItem(random, item);
    })
  }

  const insertModeloExamesItem = (random, item) => {
    var obj = {
      codigo_exame: item.codigo_exame,
      nome_exame: item.nome_exame,
      random: random,
    }
    axios.post(html + 'insert_modelo_exame_item', obj).then(() => {
      console.log('ITEM PARA MODELO SALVO COM SUCESSO');
    })
  }

  function ListaDeExames() {
    return (
      <div
        className='scroll'
        style={{
          display: 'flex',
          height: 'calc(100vh - 120px)',
          width: 'calc(100% - 30px)',
          backgroundColor: 'white',
          borderColor: 'white',
          margin: 0,
          borderRadius: 5,
          alignSelf: 'flex-end',
        }}>
        {laboratorio.filter(item => item.random == localStorage.getItem('random')).map(item => (
          <div className='cor3'
            style={{
              display: 'flex', flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 5,
              margin: 2.5,
            }}>
            <div className='text1'
              style={{
                flex: 4, textAlign: 'left', justifyContent: 'flex-start', alignContent: 'flex-start',
                alignItems: 'flex-start',
              }}>
              {item.nome_exame != null ? item.nome_exame.toUpperCase() : ''}
            </div>
            <div className='button' style={{ flex: 1, paddingLeft: 15, paddingRight: 15, pointerEvents: 'none' }}>{item.codigo_exame}</div>
            <div id="botão para excluir exame laboratorial"
              className='button-red'
              style={{ display: 'flex' }}
              onClick={(e) => {
                deleteLaboratorio(item.id);
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
        <div
          style={{
            display: dono_documento == null ? 'none' : 'flex',
            flexDirection: 'row', justifyContent: 'center'
          }}>
          <div className='text1'>CLIQUE AQUI PARA ADICIONAR OS EXAMES</div>
          <div id="botão inserir exame."
            style={{
              display: 'flex',
              maxWidth: 30, width: 30, minWidth: 30,
              maxHeight: 30, height: 30, minHeight: 30,
              alignSelf: 'center',
            }}
            className='button-green'
            onClick={(e) => {
              setforminsertexame(1);
              e.stopPropagation();
            }}
          >
            <img
              alt=""
              src={novo}
              style={{ width: 20, height: 20 }}
            ></img>
          </div>
        </div>
      </div>
    )
  }

  const deleteModelo = (item) => {
    console.log('RANDOM: ' + item.random);
    axios.get(html + 'delete_modelo_exame/' + item.id).then(() => {
      // deletar todos os itens de exames associados ao modelo.
      loadModelosExames();
      axios.get(html + 'list_modelos_exames_itens').then((response) => {
        let x = response.data.rows;
        x.filter(valor => valor.random == item.random).map(valor => deleteModeloExame(valor));
      });
    })
  }

  const deleteModeloExame = (exame) => {
    axios.get(html + 'delete_modelo_exame_item/' + exame.id).then(() => {
      console.log('ITEM DE MODELO DE EXAME DELETADO COM SUCESSO.')
    })
  }

  const [viewmodelospackexames, setviewmodelospackexames] = useState(0);
  function ModelosPackExames() {
    return (
      <div className="fundo"
        onClick={() => setviewmodelospackexames(0)}
        style={{
          display: viewmodelospackexames == 1 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center'
        }}>
        <div
          className="grid scroll"
          onClick={(e) => e.stopPropagation()}
          style={{
            flexDirection: 'row',
            backgroundColor: 'white',
            borderColor: 'white',
            borderRadius: 5,
            height: '60vh',
            width: '60vw',
          }}
        >
          {modelos_exames.filter(item => item.profissional == usuario.id).map(item => (
            <div
              className='button'
              style={{ width: 120, height: 120, position: 'relative' }}
              onClick={() => {
                insertListaLaboratorioFromModel(item.random);
                setviewmodelospackexames(0)
              }}
            >
              <div>
                {item.nome_modelo}
              </div>
              <div id="botão para deletar documento"
                className="button-yellow"
                style={{
                  display: item.profissional == usuario.id ? 'flex' : 'none',
                  alignSelf: 'center',
                  minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25,
                  position: 'absolute', top: 5, right: 5,
                }}
                onClick={(e) => {
                  modal(setdialogo, 'TEM CERTEZA QUE DESEJA EXCLUIR ESTE MODELO?', deleteModelo, item)
                  e.stopPropagation();
                }}>
                <img
                  alt=""
                  src={deletar}
                  style={{
                    width: 20, height: 20
                  }}
                ></img>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const insertListaLaboratorioFromModel = (random) => {
    let newrandom = Math.random();
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data: moment(),
      status: 0, // 0 = não salva; 1 = salva (não pode excluir).
      id_profissional: usuario.id,
      nome_profissional: usuario.nome_usuario,
      registro_profissional: usuario.n_conselho,
      random: newrandom,
      urgente: 0,
    }
    console.log(obj);
    axios.post(html + 'insert_lista_laboratorio', obj).then(() => {
      console.log('PACK DE EXAMES CADASTRADO COM SUCESSO.');
      localStorage.setItem('random', newrandom);
      axios.get(html + 'lista_laboratorio/' + atendimento).then((response) => {
        setlistalaboratorio(response.data.rows);
        setdono_documento(null);
      });
    });
    // inserindo os itens de exames/procedimentos.
    // eslint-disable-next-line
    modelos_exames_itens.filter(item => item.random == random).map(item => {
      var obj = {
        id_paciente: paciente,
        id_atendimento: atendimento,
        data_pedido: moment(),
        data_resultado: null,
        codigo_exame: item.codigo_exame,
        nome_exame: item.nome_exame,
        material: null,
        resultado: null,
        status: null,
        profissional: usuario.id,
        unidade_medida: null,
        vref_min: null,
        vref_max: null,
        obs: null,
        random: newrandom,
        array_campos: null,
        metodo: null,
      }
      console.log(obj);
      axios.post(html + 'insert_laboratorio', obj).then(() => {
        console.log('ITEM DE EXAME COMPLEMENTAR REGISTRADO COM SUCESSO.')
      });
    });
  }


  const [forminsertexame, setforminsertexame] = useState(0);
  function FormInsertExame() {
    return (
      <div className="fundo"
        onClick={() => setforminsertexame(0)}
        style={{
          display: forminsertexame == 1 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center'
        }}>
        <div className="janela scroll"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            width: '80vw', height: '80vh',
            backgroundColor: '#e5e7e9',
            borderColor: '#e5e7e9'
          }}>
          {Filter("inputExamesSadt", setarrayprocedimentos_tuss, procedimentos_tuss, 'item.terminologia')}
          {arrayprocedimentos_tuss.map(item => (
            <div
              className='button'
              style={{
                width: 'calc (100% - 20px)', minWidth: 'calc(100% - 20px)',
                justifyContent: 'space-between',
                padding: 10, paddingRight: 0,
              }}
              onClick={() => {
                insertLaboratorio(item, localStorage.getItem('random'));
                setforminsertexame(0);
              }}
            >
              <div className='text2' style={{ textAlign: 'left' }}>
                {item.terminologia.toUpperCase()}
              </div>
              <div className='button red'
                style={{ marign: 5, paddingLeft: 10, paddingRight: 10 }}>
                {item.codigo}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div id="tela para solicitação de exames complementares e liberação de guia TISS SADT."
      style={{
        display: card == 'exames' || card == 'guia-sadt' ? 'flex' : 'none',
        flexDirection: 'row',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <ListaDeExames></ListaDeExames>
      <PackExames></PackExames>
      <FormInsertExame></FormInsertExame>
      <GuiaSadt></GuiaSadt>
      <InsertModeloExames></InsertModeloExames>
      <ModelosPackExames></ModelosPackExames>
    </div>
  )
}

export default Exames;