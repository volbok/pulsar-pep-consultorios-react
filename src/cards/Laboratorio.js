/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
// imagens.
import deletar from '../images/deletar.svg';
import salvar from '../images/salvar.svg';
import novo from '../images/novo.svg';
import back from '../images/back.svg';
import moment from "moment";
import print from '../images/imprimir.svg';
import lupa from '../images/lupa_cinza.svg';
import dots_teal from '../images/dots_teal.svg';
import alerta from '../images/alerta.svg';
// funções.
import selector from '../functions/selector';
// componentes.
import Header from '../components/Header';
import Footer from '../components/Footer';

function Laboratorio() {

  // context.
  const {
    html,
    laboratorio, setlaboratorio,
    atendimento,
    paciente,
    usuario,
    card, setcard,
    settipodocumento,
    setdono_documento,
  } = useContext(Context);

  const [tipoexame, settipoexame] = useState(0);
  const [urgente, seturgente] = useState(0);

  useEffect(() => {
    if (card == 'card-laboratorio') {
      loadOpcoesLaboratorio();
      loadListaLaboratorio();
      localStorage.setItem('random', null);
      localStorage.setItem('status', null);
      setlaboratorio([]);
    }
    // eslint-disable-next-line
  }, [card, atendimento]);

  // OPÇÕES DE ITENS DE LABORATORIO.
  // lista de opções de exames laboratoriais disponíveis para o cliente.
  const [opcoeslaboratorio, setopcoeslaboratorio] = useState([]);
  const [arrayopcoeslaboratorio, setarrayopcoeslaboratorio] = useState([]);
  var timeout = null;
  const loadOpcoesLaboratorio = () => {
    axios.get(html + 'opcoes_laboratorio').then((response) => {
      setopcoeslaboratorio(response.data.rows);
      setarrayopcoeslaboratorio(response.data.rows);
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
  const insertListaLaboratorio = (random) => {
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
      setlaboratorio([]);
      localStorage.setItem('random', random);
      loadListaLaboratorio();
    });
  }

  // atualizar pedido de exame laboratorial.
  const updateListaLaboratorio = (item, status) => {
    console.log(urgente);
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data: item.data,
      status: status, // 0 = não salva; 1 = salva (não pode excluir).
      id_profissional: usuario.id,
      nome_profissional: usuario.nome_usuario,
      registro_profissional: usuario.n_conselho,
      random: item.random,
      urgente: urgente,
    }
    axios.post(html + 'update_lista_laboratorio/' + item.id, obj).then(() => {
      assinarPedidos();
      loadListaLaboratorio();
    });
  }

  // deletar pedido de exame laboratorial.
  const deleteListaLaboratorio = (id) => {
    axios.get(html + 'delete_lista_laboratorio/' + id).then(() => {
      loadListaLaboratorio();
    });
  }

  // ITENS DE LABORATÓRIO.
  // carregar itens exames laboratoriais para o atendimento.
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
      codigo_exame: item.codigo_exame,
      nome_exame: item.nome_exame,
      material: item.material,
      resultado: null,
      status: 0,
      profissional: usuario.id,
      unidade_medida: item.unidade_medida,
      vref_min: item.vref_min,
      vref_max: item.vref_max,
      obs: item.obs,
      random: random,
      array_campos: item.array_campos,
      metodo: item.metodo,
    }
    console.log(obj);
    axios.post(html + 'insert_laboratorio', obj).then(() => {
      let random = localStorage.getItem('random');
      loadLaboratorio(random);
    });
  }

  // atualizar pedido de exame laboratorial.
  const updateLaboratorio = (item, resultado, data_resultado, status) => {
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data_pedido: item.data_pedido,
      data_resultado: data_resultado,
      codigo_exame: item.codigo_exame,
      nome_exame: item.nome_exame,
      material: item.material,
      resultado: resultado,
      status: status,
      profissional: item.profissional,
      unidade_medida: item.unidade_medida,
      vref_min: item.vref_min,
      vref_max: item.vref_max,
      obs: item.obs,
      random: item.random,
      array_campos: item.array_campos,
      metodo: item.metodo,
    }
    axios.post(html + 'update_laboratorio/' + item.id, obj);
  }

  // deletar item de exame laboratorial.
  const deleteLaboratorio = (id) => {
    axios.get(html + 'delete_laboratorio/' + id).then(() => {
      let random = localStorage.getItem('random');
      loadLaboratorio(random);
    });
  }

  // deletar itens de laboratório relacionados a um pedido de exames laboratoriais deletado.
  const deleteMassaItensLaboratorio = (random) => {
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      var x = response.data.rows;
      x.filter(item => item.random == random).map(item => axios.get(html + 'delete_laboratorio/' + item.id));
      // cigarrete
      localStorage.setItem('random', null);
      localStorage.setItem('status', null);
      loadListaLaboratorio();
      setlaboratorio([]);
    });
  }

  // ### //

  const insertPackLaboratorio = (array) => {
    let random = localStorage.getItem('random');
    // eslint-disable-next-line
    array.map(item => {
      opcoeslaboratorio.filter(valor => valor.nome_exame == item).map(item => insertLaboratorio(item, random));
      loadLaboratorio(random);
    });
  }

  const assinarPedidos = () => {
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      // converte o status dos pedidos de exames laboratoriais de 0 para 1 (solicitados >> assinados). 
      var x = response.data.rows;
      let random = localStorage.getItem("random");
      x.filter(item => item.random == random && item.status == 0).map(item => updateLaboratorio(item, null, null, 1));
      setTimeout(() => {
        localStorage.setItem('random', null);
        localStorage.setItem('status', null);
        setlaboratorio([]);
      }, 1000);
    });
  }

  // imprimir requisição de exames laboratoriais.
  function printDiv(random) {
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      var x = response.data.rows;
      if (x.filter(item => item.material != 'IMAGEM' && item.random == random).length > 0) {
        let printdocumentlaboratorio = document.getElementById("IMPRESSÃO - LABORATORIO").innerHTML;
        var a = window.open();
        a.document.write('<html>');
        a.document.write(printdocumentlaboratorio);
        a.document.write('</html>');
        a.print();
        a.close();
      }
      if (x.filter(item => item.material == 'IMAGEM' && item.random == random).length > 0) {
        let printdocumentimagem = document.getElementById("IMPRESSÃO - IMAGEM").innerHTML;
        var b = window.open();
        b.document.write('<html>');
        b.document.write(printdocumentimagem);
        b.document.write('</html>');
        b.print();
        b.close();
      }
    });
  }

  function PrintLaboratorio() {
    return (
      <div id="IMPRESSÃO - LABORATORIO"
        className="print"
      >
        <table style={{ width: '100%' }}>
          <thead style={{ width: '100%' }}>
            <tr style={{ width: '100%' }}>
              <td style={{ width: '100%' }}>
                <Header></Header>
              </td>
            </tr>
          </thead>
          <tbody style={{ width: '100%' }}>
            <tr style={{ width: '100%' }}>
              <td style={{ width: '100%' }}>
                <div id="campos"
                  style={{
                    display: 'flex', flexDirection: 'column',
                    breakInside: 'auto', alignSelf: 'center', width: '100%'
                  }}>
                  <ConteudoLaboratorio></ConteudoLaboratorio>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot style={{ width: '100%' }}>
            <tr style={{ width: '100%' }}>
              <td style={{ width: '100%' }}>
                <Footer></Footer>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  };
  function PrintImagem() {
    return (
      <div id="IMPRESSÃO - IMAGEM"
        className="print"
      >
        <table style={{ width: '100%' }}>
          <thead style={{ width: '100%' }}>
            <tr style={{ width: '100%' }}>
              <td style={{ width: '100%' }}>
                <Header></Header>
              </td>
            </tr>
          </thead>
          <tbody style={{ width: '100%' }}>
            <tr style={{ width: '100%' }}>
              <td style={{ width: '100%' }}>
                <div id="campos"
                  style={{
                    display: 'flex', flexDirection: 'column',
                    breakInside: 'auto', alignSelf: 'center', width: '100%'
                  }}>
                  <ConteudoImagem></ConteudoImagem>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot style={{ width: '100%' }}>
            <tr style={{ width: '100%' }}>
              <td style={{ width: '100%' }}>
                <Footer></Footer>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  };

  function ConteudoLaboratorio() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        fontFamily: 'Helvetica',
        breakInside: 'auto',
        whiteSpace: 'pre-wrap',
        marginTop: 20,
      }}>
        {laboratorio.filter(item => item.status == 1 && item.material != 'IMAGEM' && item.random == localStorage.getItem("random")).map(item => (
          <div>{moment(item.data_pedido).format('DD/MM/YY - HH:mm') + ' - ' + item.nome_exame}</div>
        ))}
      </div>
    )
  }
  function ConteudoImagem() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        fontFamily: 'Helvetica',
        breakInside: 'auto',
        whiteSpace: 'pre-wrap',
        marginTop: 20,
      }}>
        {laboratorio.filter(item => item.status == 1 && item.material == 'IMAGEM' && item.random == localStorage.getItem("random")).map(item => (
          <div>{moment(item.data_pedido).format('DD/MM/YY - HH:mm') + ' - ' + item.nome_exame}</div>
        ))}
      </div>
    )
  }

  // componente para adição do exame laboratorial.
  const [viewinsertlaboratorio, setviewinsertlaboratorio] = useState();
  const [filterlaboratorio, setfilterlaboratorio] = useState("");
  var searchlaboratorio = "";
  const filterLaboratorio = () => {
    clearTimeout(timeout);
    document.getElementById("inputLaboratorio").focus();
    searchlaboratorio = document
      .getElementById("inputLaboratorio")
      .value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchlaboratorio == "") {
        setfilterlaboratorio("");
        setarrayopcoeslaboratorio(opcoeslaboratorio);
        document.getElementById("inputLaboratorio").value = "";
        setTimeout(() => {
          document.getElementById("inputLaboratorio").focus();
        }, 100);
      } else {
        setfilterlaboratorio(
          document.getElementById("inputLaboratorio").value.toUpperCase()
        );
        setarrayopcoeslaboratorio(
          opcoeslaboratorio.filter((item) =>
            item.nome_exame.includes(searchlaboratorio)
          )
        );
        document.getElementById("inputLaboratorio").value = searchlaboratorio;
        setTimeout(() => {
          document.getElementById("inputLaboratorio").focus();
        }, 100);
      }
    }, 1000);
  };
  // filtro de exame laboratorial por nome.
  function FilterLaboratorio() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%',
      }}>
        <input
          className="input"
          autoComplete="off"
          placeholder={
            window.innerWidth < 426 ? "BUSCAR..." : "BUSCAR..."
          }
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) =>
            window.innerWidth < 426
              ? (e.target.placeholder = "BUSCAR EXAME...")
              : "BUSCAR..."
          }
          onKeyUp={() => filterLaboratorio()}
          type="text"
          id="inputLaboratorio"
          defaultValue={filterlaboratorio}
          maxLength={100}
          style={{ width: "100%" }}
        ></input>
      </div>
    );
  }

  // ['HEMOGRAMA COMPLETO', 'PROTEÍNA C REATIVA (PCR)', 'URÉIA', 'CREATININA', 'SÓDIO', 'POTÁSSIO']
  const mountPackLaboratorio = (titulo, array) => {
    return (
      <div className='button'
        style={{ height: 130, width: '', paddingLeft: 10, paddingRight: 10, flexGrow: 1 }}
        onClick={() => insertPackLaboratorio(array)}
      >
        {titulo}
      </div>
    )
  }

  const InsertLaboratorio = useCallback(() => {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: viewinsertlaboratorio == 1 ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'absolute', top: 0, left: 0, bottom: 0,
          margin: 0,
          justifyContent: 'center',
        }}>
        <div
          className="janela scroll"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'center',
            width: 'calc(30vw + 2.5px)',
            height: '100%',
          }}
        >
          <div className="button"
            title="CLIQUE PARA ALTERNAR ENTRE EXAMES LABORATORIAIS OU DE RX"
            style={{ width: 'calc(100% - 20px)', alignSelf: 'center' }}
            onClick={() => {
              if (tipoexame == 0) {
                settipoexame(1);
              } else {
                settipoexame(0);
              }
            }}
          >
            {tipoexame == 1 ? 'RX' : 'LABORATÓRIO'}
          </div>
          <div className={urgente == 0 ? "button" : "button red"}
            title="CLIQUE PARA ALTERNAR ENTRE PEDIDO DE URGÊNCIA OU DE ROTINA"
            style={{ width: 'calc(100% - 20px)', alignSelf: 'center' }}
            onClick={() => {
              if (urgente == 0 || urgente == null) {
                seturgente(1);
              } else {
                seturgente(0);
              }
            }}
          >
            {urgente == 1 ? 'URGENTE' : 'ROTINA'}
          </div>
          <div className='text3' style={{ marginBottom: 20 }}>{tipoexame == 0 ? 'SOLICITAÇÃO DE EXAMES LABORATORIAIS' : 'SOLICITAÇÃO DE RX'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
            <div id="filtro e lista de opções de exames laboratoriais"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}
            >
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <FilterLaboratorio></FilterLaboratorio>
                <div id="botão de retorno"
                  className="button-yellow"
                  style={{
                    display: 'flex',
                    alignSelf: 'center',
                  }}
                  onClick={() => setviewinsertlaboratorio(0)}>
                  <img
                    alt=""
                    src={back}
                    style={{ width: 30, height: 30 }}
                  ></img>
                </div>
              </div>
              <div className='scroll'
                style={{
                  height: 300,
                  width: 'calc(100% - 20px)',
                  backgroundColor: 'white', borderColor: 'white',
                  marginTop: 5,
                }}>
                {arrayopcoeslaboratorio.filter(item => item.material != 'IMAGEM').map(item => (
                  <div style={{ display: tipoexame == 0 ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'center' }}>
                    <div className='button cor1opaque'
                      style={{
                        display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                        width: '90%'
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        {item.nome_exame}
                      </div>
                      <div id="btnsalvarlaboratorio"
                        className='button-green'
                        onClick={() => {
                          let random = localStorage.getItem('random');
                          insertLaboratorio(item, random);
                        }}
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
                ))}
                {arrayopcoeslaboratorio.filter(item => item.material == 'IMAGEM').map(item => (
                  <div style={{ display: tipoexame == 1 ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'center' }}>
                    <div className='button cor1opaque'
                      style={{
                        display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                        width: '90%'
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        {item.nome_exame}
                      </div>
                      <div id="btnsalvarlaboratorio"
                        className='button-green'
                        onClick={() => {
                          let random = localStorage.getItem('random');
                          insertLaboratorio(item, random);
                        }}
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
                ))}
              </div>
            </div>
            <div style={{ display: tipoexame == 0 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>PACOTES DE EXAMES</div>
              <div id="packs para solicitação de exames"
                className='grid2'
              >
                {mountPackLaboratorio('BÁSICO', ['HEMOGRAMA COMPLETO', 'PROTEÍNA C REATIVA (PCR)', 'URÉIA', 'CREATININA', 'SÓDIO', 'POTÁSSIO'])}
                {mountPackLaboratorio('FUNÇÃO RENAL', ['URÉIA', 'CREATININA', 'SÓDIO', 'POTÁSSIO'])};
              </div>
            </div>
          </div>
        </div>
      </div>
    )
    // eslint-disable-next-line
  }, [viewinsertlaboratorio, opcoeslaboratorio, arrayopcoeslaboratorio, tipoexame, urgente]);

  function ItensLaboratorio() {
    return (
      <div id="lista de itens de exames laboratoriais"
        className='scroll'
        style={{ display: 'flex', flexDirection: 'column', width: '70vw', height: 'calc(100% - 20px)', marginRight: 5 }}>
        <div id="lista cheia"
          style={{
            display: laboratorio.length > 0 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
          {laboratorio.filter(item => item.material != 'IMAGEM').sort((a, b) => a.status < b.status ? 1 : -1 && moment(a.data_pedido) < moment(b.data_pedido) ? 1 : -1).map(item => (
            <div key={'laboratorio ' + item.id}
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}
            >
              <div className="button-grey" style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 100,
                marginRight: 0,
                borderTopRightRadius: 0, borderBottomRightRadius: 0,
              }}>
                <div>
                  {moment(item.data_pedido).format('DD/MM/YY')}
                </div>
                <div>
                  {moment(item.data_pedido).format('HH:mm')}
                </div>
              </div>
              <div
                className="button" style={{
                  width: '100%',
                  marginLeft: 0,
                  borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
                }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-start', alignContent: 'flex-start',
                  alignItems: 'flex-start', width: '100%',
                }}>
                  <div style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'flex-start',
                    width: '100%', margin: 5, textAlign: 'left'
                  }}>
                    <div>{item.nome_exame}</div>
                    <div style={{ opacity: 0.5, marginLeft: 5 }}>{'(' + item.material + ')'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div
                      style={{
                        display: item.resultado == null ? 'none' : 'flex',
                        flexDirection: 'row', justifyContent: 'center',
                        textAlign: 'left',
                        margin: 5,
                        color: item.resultado != null && (parseFloat(JSON.parse(item.resultado).map(item => item.valor)) < parseFloat(item.vref_min) || parseFloat(JSON.parse(item.resultado).map(item => item.valor)) > parseFloat(item.vref_max)) ? '#EC7063' : '',
                      }}>
                      {item.resultado != null && JSON.parse(item.resultado).length > 1 ?
                        JSON.parse(item.resultado).map(item => item.campo + ': ' + item.valor + ' ') :
                        item.resultado != null && JSON.parse(item.resultado).length == 1 ?
                          JSON.parse(item.resultado).map(item => item.valor + ' ') : 'PENDENTE'
                      }
                      {item.unidade_medida != null ? item.unidade_medida : ''}
                      {item.vref_max == null || item.vref_min == null ? '' : ' (VR: ' + item.vref_min + ' - ' + item.vref_max + ')'}
                    </div>
                    <img
                      alt=""
                      src={alerta}
                      style={{
                        display: 'none',
                        margin: 0, padding: 0,
                        height: 35,
                        width: 35,
                      }}
                    ></img>
                  </div>
                </div>
                <div className='button'
                  style={{
                    width: 200, margin: 5,
                    backgroundColor: item.status == 0 ? '#EC7063' : item.status == 1 ? '#F9E79F' : 'rgb(82, 190, 128, 0.7)',
                  }}>
                  {item.status == 0 ? 'A CONFIRMAR' : item.status == 1 ? 'SOLICITADO' : 'LIBERADO'}
                </div>
                <div className='button-red'
                  style={{
                    display: item.status == 0 ? 'flex' : 'none'
                  }}
                  onClick={(e) => {
                    deleteLaboratorio(item.id); e.stopPropagation()
                  }}>
                  <img
                    alt=""
                    src={deletar}
                    style={{
                      margin: 10,
                      height: 25,
                      width: 25,
                    }}
                  ></img>
                </div>
              </div>
            </div>
          ))}
          <img
            alt=""
            src={dots_teal}
            style={{
              display: laboratorio.filter(item => item.material == 'IMAGEM').length > 0 ? 'flex' : 'none',
              margin: 10,
              height: 30,
              opacity: 1,
              alignSelf: 'center'
            }}
          ></img>
          {laboratorio.filter(item => item.material == 'IMAGEM').sort((a, b) => a.status < b.status ? 1 : -1 && moment(a.data_pedido) < moment(b.data_pedido) ? 1 : -1).map(item => (
            <div key={'imagem ' + item.id}
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}
            >
              <div className="button-grey" style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 100,
                marginRight: 0,
                borderTopRightRadius: 0, borderBottomRightRadius: 0,
              }}>
                <div>
                  {moment(item.data_pedido).format('DD/MM/YY')}
                </div>
                <div>
                  {moment(item.data_pedido).format('HH:mm')}
                </div>
              </div>
              <div
                className="button" style={{
                  width: '100%',
                  marginLeft: 0,
                  borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
                }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-start', alignContent: 'flex-start',
                  alignItems: 'flex-start', width: '100%',
                }}>
                  <div style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'flex-start',
                    width: '100%', margin: 5, textAlign: 'left'
                  }}>
                    <div>{item.nome_exame}</div>
                    <div style={{ opacity: 0.5, marginLeft: 5 }}>{'(' + item.material + ')'}</div>
                  </div>
                  <div
                    style={{
                      display: item.resultado == null ? 'none' : 'flex',
                      flexDirection: 'column', justifyContent: 'center',
                      textAlign: 'left',
                      margin: 5, color: 'yellow'
                    }}>
                    {item.resultado != null ? item.resultado : 'PENDENTE'}
                  </div>
                </div>
                <div className='button'
                  style={{
                    width: 150, margin: 5,
                    backgroundColor: item.status == 0 ? '#EC7063' : item.status == 1 ? '#F9E79F' : 'rgb(82, 190, 128, 0.7)',
                  }}>
                  {item.status == 0 ? 'A CONFIRMAR' : item.status == 1 ? 'SOLICITADO' : 'LIBERADO'}
                </div>
                <div className='button-red'
                  style={{
                    display: item.status == 0 ? 'flex' : 'none'
                  }}
                  onClick={(e) => {
                    deleteLaboratorio(item.id); e.stopPropagation()
                  }}>
                  <img
                    alt=""
                    src={deletar}
                    style={{
                      margin: 10,
                      height: 25,
                      width: 25,
                    }}
                  ></img>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div id="lista vazia"
          className='lupa'
          style={{
            display: laboratorio.length == 0 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center',
            width: '100%', height: '100%',
          }}>
          <img
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
        <BotaoAdicionarExame></BotaoAdicionarExame>
      </div>
    )
  }

  function BotaoAdicionarExame() {
    return (
      <div id="botão para inserir exame laboratorial."
        className='button-green'
        style={{
          display: setviewinsertlaboratorio == 0 || (localStorage.getItem('random') != null && localStorage.getItem('status') == 0) ? 'flex' : 'none',
          width: 50, maxWidth: 50,
          alignSelf: 'center',
        }}
        onClick={(e) => {
          setviewinsertlaboratorio(1);
        }}>
        <img
          alt=""
          src={novo}
          style={{
            margin: 10,
            height: 25,
            width: 25,
          }}
        ></img>
      </div>
    )
  }

  function Botoes() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div id="botão para sair da tela de exames laboratoriais"
          className="button-yellow"
          style={{
            display: 'flex',
            alignSelf: 'center',
          }}
          onClick={() => setcard('')}>
          <img
            alt=""
            src={back}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
        <div id="botão para novo pedido de exame laboratorial"
          className='button-green'
          onClick={() => {
            let random = Math.random();
            localStorage.setItem("random", random);
            console.log(random);
            insertListaLaboratorio(random);
            setviewinsertlaboratorio(0);
          }}
        >
          <img
            alt=""
            src={novo}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
      </div>
    )
  }

  const ListaLaboratorio = useCallback(() => {
    if (card == 'card-laboratorio') {
      return (
        <div id="scroll lista de pedidos de exames laboratoriais"
          className='scroll'
          style={{
            position: 'sticky',
            top: 5,
            width: '12vw', minWidth: '12vw', maxWidth: '12vw',
            height: 'calc(100vh - 115px)',
            margin: 5, marginTop: 10,
            backgroundColor: 'white',
            borderColor: 'white',
            alignSelf: 'flex-start',
          }}>
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
                settipodocumento('SOLICITAÇÃO DE EXAME LABORATORIAL');
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
                <div id="botão para assinar pedido de exame laboratorial."
                  style={{
                    display: item.status == 0 ? 'flex' : 'none',
                    maxWidth: 30, width: 30, minWidth: 30,
                    maxHeight: 30, height: 30, minHeight: 30
                  }}
                  className='button-green'
                  onClick={(e) => {
                    updateListaLaboratorio(item, 1);
                    setviewinsertlaboratorio(0);
                    e.stopPropagation();
                  }}
                >
                  <img
                    alt=""
                    src={salvar}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
                <div
                  id="botão para imprimir pedido de exames laboratoriais"
                  className='button-green'
                  style={{
                    display: item.status > 0 ? 'flex' : 'none',
                    maxWidth: 30, width: 30, minWidth: 30,
                    maxHeight: 30, height: 30, minHeight: 30
                  }}
                  title={'IMPRIMIR PEDIDO DE EXAMES'}
                  onClick={(e) => {
                    printDiv(item.random);
                    e.stopPropagation();
                  }}>
                  <img
                    alt=""
                    src={print}
                    style={{
                      height: 20,
                      width: 20,
                    }}
                  ></img>
                </div>
              </div>
              <div className='red'
                style={{
                  display: item.urgente == 1 ? 'flex' : 'none',
                  alignSelf: 'center',
                  borderRadius: 5,
                  color: 'white',
                  fontWeight: 'bold',
                  padding: 5,
                }}
              >
                URGENTE
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 10 }}>
                  {item.nome_profissional}
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
    } else {
      return null;
    }
    // eslint-disable-next-line
  }, [atendimento, listalaboratorio, urgente]);

  return (
    <div id="scroll-exames"
      className='card-aberto'
      style={{
        display: card == 'card-laboratorio' ? 'flex' : 'none',
        flexDirection: 'row', justifyContent: 'space-evenly',
        height: 'calc(100% - 20px)'
      }}
    >
      <ItensLaboratorio></ItensLaboratorio>
      <div id='lista de pedidos de exames laboratoriais'
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <Botoes></Botoes>
        <ListaLaboratorio></ListaLaboratorio>
      </div>
      <InsertLaboratorio></InsertLaboratorio>
      <PrintLaboratorio></PrintLaboratorio>
      <PrintImagem></PrintImagem>
    </div>
  )
}

export default Laboratorio;