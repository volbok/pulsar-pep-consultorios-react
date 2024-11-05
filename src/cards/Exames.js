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
// router.
import Filter from '../components/Filter';
// funções.

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
    setdono_documento,
  } = useContext(Context);


  useEffect(() => {
    if (card == 'exames') {
      console.log('PÁGINA EXAMES COMPLEMENTARES + GUIA SADT');
      loadTuss();
      loadListaLaboratorio();
      localStorage.setItem('random', 0);
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
  const [listalaboratorio, setlistalaboratorio] = useState([]);
  const loadListaLaboratorio = () => {
    console.log(atendimento);
    axios.get(html + 'lista_laboratorio/' + atendimento).then((response) => {
      setlistalaboratorio(response.data.rows);
    });
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
          width: '15vw', minWidth: '15vw', maxWidth: '15vw',
          height: '75vh',
          backgroundColor: 'white',
          borderColor: 'white',
          alignSelf: 'flex-start',
        }}>
        <div className='button-green'
          onClick={() => { insertListaLaboratorio() }}
        >
          <img
            alt=""
            src={novo}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
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
              <div id="botão para excluir pedido de exame laboratorial e seus respectivos itens de exames laboratoriais."
                className='button-yellow'
                style={{
                  display: item.status == 0 ? 'flex' : 'none',
                  maxWidth: 30, width: 30, minWidth: 30,
                  maxHeight: 30, height: 30, minHeight: 30
                }}
                onClick={(e) => {
                  console.log(item.random);
                  deleteListaLaboratorio(item.id);
                  deleteMassaItensLaboratorio(item.random);
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
              <div style={{ fontSize: 10 }}>
                {'DR(A) ' + item.nome_profissional}
              </div>
              <div style={{ fontSize: 10, marginBottom: 5 }}>
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
        ))
        }
      </div >
    )
    // eslint-disable-next-line
  }, [atendimento, listalaboratorio]);

  function ListaDeExames() {
    return (
      <div
        className='scroll'
        style={{
          display: 'flex',
          height: '75vh', width: '45vw',
          backgroundColor: 'white',
          borderColor: 'white',
          borderRadius: 5,
          marginRight: 10, marginLeft: 12.5,
        }}>
        {laboratorio.filter(item => item.random == localStorage.getItem('random')).map(item => (
          <div style={{
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
            <div className='button-red' style={{ flex: 1, paddingLeft: 15, paddingRight: 15 }}>{item.codigo_exame}</div>
            <div id="botão para excluir exame laboratorial"
              className='button-red'
              style={{
                display: 'flex',
                // maxWidth: 30, width: 30, minWidth: 30,
                // maxHeight: 30, height: 30, minHeight: 30
              }}
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
        <div id="botão inserir exame."
          style={{
            // display: localStorage.getItem('status') == 0 ? 'flex' : 'none',
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
    )
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
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center',
        }}>
        <ListaDeExames></ListaDeExames>
        <PackExames></PackExames>
        <FormInsertExame></FormInsertExame>
        <GuiaSadt></GuiaSadt>
      </div>
    </div>
  )
}

export default Exames;