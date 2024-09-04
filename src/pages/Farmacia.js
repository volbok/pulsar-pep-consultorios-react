/* eslint eqeqeq: "off" */
import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
// imagens.
import power from '../images/power.svg';
import refresh from "../images/refresh.svg";
import salvar from "../images/salvar.svg";
import "moment/locale/pt-br";
// router.
import { useHistory } from "react-router-dom";
// functions.
import modal from "../functions/modal";
import selector from "../functions/selector";
import toast from "../functions/toast";

function Farmacia() {

  // context.
  const {
    pagina, setpagina,
    html,
    atendimentos, setatendimentos,
    unidades,
    atendimento, setatendimento,
    pacientes, setpacientes,
    setpaciente,
    setdialogo,
    almoxarifado, setalmoxarifado,
    settoast,
  } = useContext(Context);

  const loadAlmoxarifado = () => {
    axios.get(html + 'almoxarifado').then((response) => {
      setalmoxarifado(response.data.rows);
    });
  }

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'FARMÁCIA') {
      loadPacientes();
      loadAlmoxarifado();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // history (router).
  let history = useHistory();

  // recuperando registros de prescrições.
  const [arraylistaprescricao, setarraylistaprescricao] = useState([]);
  const [listaprescricao, setlistaprescricao] = useState([]);
  const loadPrescricao = (atendimento) => {
    axios.get(html + 'list_prescricoes/' + atendimento).then((response) => {
      var x = response.data.rows;
      setarraylistaprescricao(response.data.rows);
      setlistaprescricao(response.data.rows);
      console.log(x.length);
    });
  }

  const [arrayatendimentos, setarrayatendimentos] = useState([]);
  const loadAtendimentos = () => {
    axios
      .get(html + "all_atendimentos")
      .then((response) => {
        setatendimentos(response.data.rows);
        setarrayatendimentos(response.data.rows);
      });
  };

  const loadPacientes = () => {
    axios.get(html + "list_pacientes").then((response) => {
      setpacientes(response.data.rows);
      loadAtendimentos();
    });
  }

  // carregando todos os itens e componentes de prescrição aprazados para dada prescrição.
  const [aprazamentos, setaprazamentos] = useState([]);
  const loadAprazamentos = (prescricao) => {
    axios.get(html + 'list_aprazamentos/' + prescricao).then((response) => {
      var x = response.data.rows;
      setaprazamentos(response.data.rows);
      console.log(x.length);
      console.log(prescricao);
    });
  };

  const updateAprazamentos = (item) => {
    let alerta = [];
    // eslint-disable-next-line
    aprazamentos.filter(valor => valor.prazo == item.prazo && (valor.id_componente_pai == item.id_componente_pai || valor.id_componente_filho == item.id_componente_pai)).map(valor => {
      console.log(valor.qtde);
      // eslint-disable-next-line
      almoxarifado.filter(x => x.codigo_item == valor.codigo_item).map(x => {
        console.log('APRAZAMENTO: ' + valor.qtde);
        console.log('ALMOXARIFADO: ' + x.qtde_item);
        if (valor.qtde != null && valor.qtde > x.qtde_item) {
          alerta.push(x)
        }
      })
    })

    console.log(alerta.length);

    if (alerta.length == 0) {
      console.log(item);
      var obj = {
        id_atendimento: atendimento,
        id_prescricao: item.id_prescricao,
        id_componente_pai: item.id_componente_pai,
        id_componente_filho: item.id_componente_filho,
        nome: item.nome,
        qtde: item.qtde,
        prazo: item.prazo,
        dispensado: true,
        codigo_item: item.codigo_item,
      }
      axios.post(html + 'update_aprazamento/' + item.id, obj).then(() => {
        loadAprazamentos(item.id_prescricao);
        debitaQtdeitemAlmoxarifado(item.id_componente_pai, item.prazo);
      });
    } else {
      toast(settoast, 'ITEM EM FALTA NO ESTOQUE, NÃO É POSSÍVEL DISPENSAR!', '#EC7063', 2000);
    }
  }

  const debitaQtdeitemAlmoxarifado = (id_componente_pai, prazo) => {
    // eslint-disable-next-line
    aprazamentos.filter(valor => valor.prazo == prazo && (valor.id_componente_pai == id_componente_pai || valor.id_componente_filho == id_componente_pai)).map(valor => {
      // eslint-disable-next-line
      almoxarifado.filter(x => x.codigo_item == valor.codigo_item).map(x => {
        let nova_qtde = parseInt(x.qtde_item) - parseInt(valor.qtde);
        console.log(valor);
        console.log('ESTOQUE: ' + parseInt(x.qtde_item));
        console.log('CONSUMO: ' + parseInt(valor.qtde));
        console.log('QTDE: ' + nova_qtde);
        let obj = {
          categoria: x.categoria,
          codigo_item: x.codigo_item,
          nome_item: x.nome_item,
          qtde_item: nova_qtde,
          obs: x.obs,
          data_entrada: x.data_entrada,
          codigo_fornecedor: x.codigo_fornecedor,
          cnpj_fornecedor: x.cnpj_fornecedor,
          codigo_compra: x.codigo_compra,
          id_setor_origem: null,
          id_setor_destino: null,
          liberado: x.liberado,
        }
        axios.post(html + 'update_almoxarifado/' + x.id, obj).then(() => {
          console.log('ITEM DE ALMOXARIFADO ATUALIZADO COM SUCESSO.');
        });
      });
    });
    loadAlmoxarifado();
  }

  const [filterpaciente, setfilterpaciente] = useState("");
  var searchpaciente = "";
  var timeout = null;
  const filterPaciente = () => {
    clearTimeout(timeout);
    document.getElementById("inputPaciente").focus();
    searchpaciente = document
      .getElementById("inputPaciente")
      .value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchpaciente == "") {
        setfilterpaciente("");
        setarrayatendimentos(atendimentos);
        document.getElementById("inputPaciente").value = "";
        setTimeout(() => {
          document.getElementById("inputPaciente").focus();
        }, 100);
      } else {
        setfilterpaciente(
          document.getElementById("inputPaciente").value.toUpperCase()
        );
        setarrayatendimentos(
          atendimentos.filter((item) =>
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
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
        <div className='button-red'
          title={'SAIR'}
          onClick={() => {
            setpagina(0);
            history.push('/');
          }}>
          <img
            alt=""
            src={power}
            style={{
              margin: 0,
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
        <input
          className="input cor2"
          autoComplete="off"
          placeholder="BUSCAR PACIENTE..."
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => (e.target.placeholder = "BUSCAR PACIENTE...")}
          onKeyUp={() => filterPaciente()}
          type="text"
          id="inputPaciente"
          defaultValue={filterpaciente}
          maxLength={100}
          style={{ width: '100%' }}
        ></input>
        <div
          id="botão para atualizar a lista de pacientes."
          className="button"
          style={{
            display: "flex",
            opacity: 1,
            alignSelf: "center",
          }}
          onClick={() => { loadPacientes(); setatendimento(null); }}
        >
          <img
            alt="" src={refresh}
            style={{ width: 30, height: 30 }}></img>
        </div>
      </div >
    );
  }

  const ListaDeAtendimentos = useCallback(() => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <FilterPaciente></FilterPaciente>
        <div id="scroll atendimentos com pacientes"
          className="scroll"
          style={{
            display: arrayatendimentos.length > 0 ? "flex" : "none",
            justifyContent: "flex-start",
            margin: 5, marginBottom: 0,
            height: 'calc(100vh - 205px)',
            width: 'calc(100% - 20px)'
          }}
        >
          {unidades.map(unidade => (
            <div>
              {
                arrayatendimentos
                  .filter(item => item.situacao == 1 && item.id_unidade == unidade.id_unidade)
                  .sort((a, b) => (a.leito > b.leito ? 1 : -1))
                  .map((item) => (
                    <div key={"pacientes" + item.id_atendimento} style={{ width: '100%' }}>
                      <div
                        className="row"
                        style={{
                          position: "relative",
                          margin: 2.5, padding: 0,
                        }}
                      >
                        <div
                          className="button"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            marginRight: 0,
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            minHeight: 100,
                            height: 100,
                            width: 60,
                            backgroundColor: '#004c4c'
                          }}
                        >
                          <div
                            className='text2'
                            style={{ margin: 5, padding: 0 }}
                          >
                            {unidades.filter(x => x.id_unidade == item.id_unidade).map(x => x.nome_unidade)}
                          </div>
                          <div
                            className='text2'
                            style={{ margin: 5, padding: 0 }}
                          >
                            {item.leito}
                          </div>
                        </div>
                        <div
                          id={"atendimento " + item.id_atendimento}
                          className="button"
                          style={{
                            flex: 3,
                            marginLeft: 0,
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            minHeight: 100,
                            height: 100,
                            width: '100%',
                          }}
                          onClick={() => {
                            setatendimento(item.id_atendimento);
                            setpaciente(item.id_paciente);
                            loadPrescricao(item.id_atendimento);
                            if (pagina == 'FARMÁCIA') {
                              selector("scroll atendimentos com pacientes", "atendimento " + item.id_atendimento, 100);
                            }
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "flex-start",
                              padding: 5
                            }}
                          >
                            {pacientes.filter(
                              (valor) => valor.id_paciente == item.id_paciente
                            )
                              .map((valor) => valor.nome_paciente)}
                            <div>
                              {moment().diff(
                                moment(
                                  pacientes
                                    .filter(
                                      (valor) => valor.id_paciente == item.id_paciente
                                    )
                                    .map((item) => item.dn_paciente)
                                ),
                                "years"
                              ) + " ANOS"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              }
            </div>
          ))}
        </div>
        <div id="scroll atendimento vazio"
          className="scroll"
          style={{
            display: arrayatendimentos.length > 0 ? "none" : "flex",
            justifyContent: "center",
            marginTop: 5,
            height: 'calc(100vh - 205px)',
          }}
        >
          <div className="text3" style={{ opacity: 0.5 }}>
            SEM PACIENTES CADASTRADOS PARA ESTA UNIDADE
          </div>
        </div>
      </div>
    );
    // eslint-disable-next-line
  }, [arrayatendimentos]);

  const FiltraUnidades = useCallback(() => {
    return (
      <div id="lista de unidades"
        className='scroll'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'flex-start',
          overflowY: 'hidden', overflowX: 'scroll',
          width: 'calc(100% - 20px)'
        }}>
        {unidades.map(item => (
          <div
            key={"unidade" + item.id_unidade}
            id={"unidade" + item.id_unidade}
            className="button"
            style={{ width: 150, minWidth: 150 }}
            onClick={() => {
              setatendimento(null);
              setpaciente(null);
              setlistaprescricao([]);
              setarraylistaprescricao([]);
              setarrayatendimentos(atendimentos.filter(valor => valor.id_unidade == item.id_unidade));
              selector("lista de unidades", "unidade" + item.id_unidade, 300);
            }}
          >
            {item.nome_unidade}
          </div>
        ))}
      </div>
    )
    // eslint-disable-next-line
  }, [arrayatendimentos]);

  const [expanditenscards, setexpanditenscards] = useState(0);
  function ScrollPrescricoes() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', width: '100%',
      }}>
        <div id="lista de prescrições"
          style={{
            display: arraylistaprescricao.filter(valor => valor.id_atendimento == atendimento).length > 0 ? 'flex' : 'none',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            width: '100%',
            alignContent: 'center', alignItems: 'center',
          }}>
          {arraylistaprescricao
            .filter(valor => moment(valor.data) > moment().subtract(1, 'days').startOf('day'))
            .sort((a, b) => moment(a.data) < moment(b.data) ? 1 : -1).filter(valor => valor.id_atendimento == atendimento).map(valor => (
              <div className="cor1" style={{ width: 'calc(100% - 40px)', borderRadius: 5, margin: 5, padding: 5 }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}
                >
                  <div id="botão indicador de data e hora da prescrição"
                    className="button-yellow"
                    style={{
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 200,
                      margin: 5,
                    }}
                    onClick={() => {
                      if (expanditenscards == 0) {
                        setexpanditenscards(1);
                        loadAprazamentos(valor.id);
                        setarraylistaprescricao(listaprescricao.filter(item => item.id == valor.id));
                      } else {
                        setexpanditenscards(0);
                        setarraylistaprescricao(listaprescricao);
                      }
                    }}
                  >
                    <div>
                      {moment(valor.data).format('DD/MM/YY')}
                    </div>
                    <div>
                      {moment(valor.data).format('HH:mm:ss')}
                    </div>
                  </div>
                  <div id="lista com itens de prescrição e seus componentes"
                    className="scroll"
                    style={{
                      display: expanditenscards == 1 && aprazamentos.filter(aprazamento => aprazamento.id_componente_pai != null && aprazamento.id_prescricao == valor.id).length > 0 ? 'flex' : 'none',
                      width: 'calc(100% - 40px)',
                      margin: 5, padding: 10,
                      flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly',
                    }}
                  >
                    {aprazamentos.filter(aprazamento => aprazamento.id_componente_pai != null && aprazamento.id_prescricao == valor.id).sort((a, b) => moment(a.prazo, 'DD/MM/YY - HH:mm') < moment(b.prazo, 'DD/MM/YY - HH:mm') ? -1 : 1).map(aprazamento => (
                      <div id="card do item de prescrição"
                        className="scroll"
                        style={{
                          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                          opacity: aprazamento.dispensado == true ? 0.7 : 1,
                          width: '27vw',
                          height: '27vw',
                          padding: 10, margin: 10,
                          backgroundColor: 'lightgray',
                          borderColor: 'lightgray',
                        }}>
                        <div
                          id="botão para dispensar as medicações."
                          className="button-green"
                          title="clique para dispensar a medicação."
                          style={{
                            display: aprazamento.dispensado == false ? 'flex' : 'none',
                            opacity: 1,
                            alignSelf: "center",
                          }}
                          onClick={() => {
                            modal(setdialogo, 'TEM CERTEZA QUE DESEJA DISPENSAR A MEDICAÇÃO ' + aprazamento.nome + '?', updateAprazamentos, aprazamento);
                          }}
                        >
                          <img
                            alt="" src={salvar}
                            style={{ width: 30, height: 30 }}></img>
                        </div>

                        <div className="button-green"
                          style={{ display: aprazamento.dispensado == true ? 'flex' : 'none' }}
                        >
                          {'MEDICAÇÕES DISPENSADAS'}
                        </div>
                        <div className="button"
                          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 }}
                        >
                          {aprazamento.prazo}
                        </div>
                        <div id="item de prescrição"
                          className="button"
                          style={{
                            padding: 5, backgroundColor: 'rgb( 0, 0, 0, 0.4)', marginTop: 0,
                            borderTopLeftRadius: 0, borderTopRightRadius: 0
                          }}
                        >
                          {aprazamento.nome + ' - QTDE: ' + aprazamento.qtde}
                        </div>
                        <div id="componentes do item">
                          {aprazamentos.filter(componente => componente.id_componente_filho == aprazamento.id_componente_pai && componente.prazo == aprazamento.prazo).map(componente => (
                            <div
                              className="button"
                              style={{
                                padding: 5, backgroundColor: 'rgb( 0, 0, 0, 0.2)',
                              }}
                            >
                              {componente.nome + ' - QTDE: ' + componente.qtde}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                    }
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div id="lista de prescrições - atendimento não selecionado"
          style={{
            display: atendimento == null ? 'flex' : 'none',
          }}>
          <div className="text1" style={{ alignSelf: 'center', alignContent: 'center' }}>
            SELECIONE UM ATENDIMENTO PARA LIBERAR OS ITENS DE PRESCRIÇÃO.
          </div>
        </div>
        <div id="lista de prescrições - sem prescrições"
          style={{
            display: atendimento != null && arraylistaprescricao.filter(valor => valor.id_atendimento == atendimento).length == 0 ? 'flex' : 'none',
          }}>
          <div className="text1" style={{ alignSelf: 'center', alignContent: 'center' }}>
            SEM PRESCRIÇÕES PARA ESTE ATENDIMENTO.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="tela da farmácia"
      className='main'
      style={{
        display: pagina == 'FARMÁCIA' ? 'flex' : 'none',
      }}
    >
      <div className='chassi'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly',
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', position: 'sticky', top: 5, width: '25vw' }}>
          <FiltraUnidades></FiltraUnidades>
          <ListaDeAtendimentos></ListaDeAtendimentos>
        </div>
        <ScrollPrescricoes></ScrollPrescricoes>
      </div>
    </div>
  )
}

export default Farmacia;