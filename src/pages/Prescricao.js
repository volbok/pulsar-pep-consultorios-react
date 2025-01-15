/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Context from './Context';
import moment from 'moment';
import 'moment/locale/pt-br';
// router.
import { useHistory } from 'react-router-dom';
// funções.
import toast from '../functions/toast';
import selector from '../functions/selector';
// imagens.
import salvar from '../images/salvar.png';
import deletar from '../images/deletar.png';
import back from '../images/back.png';
import novo from '../images/novo.png';
import favorito_usar from '../images/favorito_usar.png';
import favorito_salvar from '../images/favorito_salvar.png';
import refresh from '../images/refresh.png';
import print from '../images/imprimir.png';
import copiar from '../images/copiar.png';
import preferencias from '../images/preferencias.png';
// componentes.
import Header from '../components/Header';
import Footer from '../components/Footer';


function Prescricao() {

  /*
  RELEMBRANDO AS TABELAS:
  atendimento_lista_prescricoes: registros de prescrições (que contêm os itens e prescrição).
  atendimento_prescricoes: registros dos itens e dos componentes das prescrições.
  prescricoes: registros dos itens disponíveis na farmácia para prescrição.
  */

  // context.
  const {
    html,
    setpagina,
    settoast,
    usuario,
    prescricao, setprescricao,
    atendimentos,
    atendimento,
    objatendimento,
    unidade,
    paciente,
    card, setcard,
    idprescricao, setidprescricao,
    arrayitensprescricao, setarrayitensprescricao,
    setselecteddocumento,
    settipodocumento,
    setdono_documento,
    setalmoxarifado, almoxarifado,
  } = useContext(Context);

  // history (router).
  let history = useHistory();

  useEffect(() => {
    if (card == 'card-prescricao') {
      loadAlmoxarifado();
      loadModelosPrescricao();
      loadOpcoesPrescricao();
      loadItensPrescricao();
      loadPrescricao();
    }
    // eslint-disable-next-line
  }, [card, atendimento]);

  var timeout = null;
  const [expand, setexpand] = useState(0);

  // ALMOXARIFADO //
  const loadAlmoxarifado = () => {
    axios.get(html + 'almoxarifado').then((response) => {
      setalmoxarifado(response.data.rows);
    });
  }

  // ## OPÇÕES DE ITENS DE PRESCRIÇÃO ## //
  // recuperando opções de itens de prescrição.
  const [opcoesprescricao, setopcoesprescricao] = useState([]);
  const [arrayopcoesprescricao, setarrayopcoesprescricao] = useState([]);
  const loadOpcoesPrescricao = () => {
    axios.get(html + 'opcoes_prescricoes').then((response) => {
      setopcoesprescricao(response.data.rows);
      setarrayopcoesprescricao(response.data.rows);
    })
      .catch(function (error) {
        if (error.response == undefined) {
          toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 3000);
          setTimeout(() => {
            setpagina(0);
            history.push('/');
          }, 3000);
        } else {
          toast(settoast, error.response.data.message + ' REINICIANDO APLICAÇÃO.', 'black', 3000);
          setTimeout(() => {
            setpagina(0);
            history.push('/');
          }, 3000);
        }
      });
  }

  const insertOpcaoComponentePrescricao = (item, id_componente_pai) => {
    var obj = {
      nome_item: item.nome_item,
      categoria: item.categoria,
      qtde_item: item.qtde_item,
      via: null,
      freq: null,
      obs: null,
      id_componente_filho: id_componente_pai,
      id_componente_pai: null,
    }
    axios.post(html + 'insert_opcoes_prescricao', obj).then(() => {
      console.log(JSON.stringify(obj));
      loadOpcoesPrescricao();
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }
  // atualizando um registro de opção de item de prescrição.
  const updateOpcaoItemPrescricao = (id) => {
    var obj = {
      nome_item: nome,
      categoria: categoria,
      qtde_item: qtde,
      via: via,
      freq: freq,
      obs: obs,
      id_componente_filho: null,
      id_componente_pai: id_componente_pai,
      codigo_item: codigo_item,
    }
    axios.post(html + 'update_opcoes_prescricao/' + id, obj).then(() => {
      loadOpcoesPrescricao();
      toast(settoast, 'ITEM DE PRESCRIÇÃO ATUALIZADO COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }
  // atualizando um registro de opção de item de prescrição.
  // COCORE
  const updateOpcaoComplementoPrescricao = (item, qtde) => {
    var obj = {
      nome_item: item.nome_item,
      categoria: item.categoria,
      qtde_item: qtde,
      via: null,
      freq: null,
      obs: null,
      id_componente_filho: item.id_componente_filho,
      id_componente_pai: item.id_componente_pai,
      codigo_item: item.codigo_item,
    }
    axios.post(html + 'update_opcoes_prescricao/' + item.id, obj).then(() => {
      console.log(JSON.stringify(obj));
      loadOpcoesPrescricao();
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }
  // excluir um registro de opção de item de prescriçao.
  const deleteOpcaoItemPrescricao = (id) => {
    axios.get(html + 'delete_opcoes_prescricao/' + id).then(() => {
      loadOpcoesPrescricao();
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }

  // ## LISTA DE PRESCRIÇÕES ## //
  // recuperando lista de prescrições.
  const [arraylistaprescricao, setarraylistaprescricao] = useState([]);
  const loadPrescricao = () => {
    axios.get(html + 'list_prescricoes/' + atendimento).then((response) => {
      setarraylistaprescricao(response.data.rows);
    })
      .catch(function (error) {
        if (error.response == undefined) {
          toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 3000);
          setTimeout(() => {
            setpagina(0);
            history.push('/');
          }, 3000);
        } else {
          toast(settoast, error.response.data.message + ' REINICIANDO APLICAÇÃO.', 'black', 3000);
          setTimeout(() => {
            setpagina(0);
            history.push('/');
          }, 3000);
        }
      });
  }
  // inserir registro de prescrição.
  const insertPrescricao = () => {
    console.log(usuario);
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data: moment(),
      status: 0, // 0 = não salva; 1 = salva (não pode excluir).
      id_profissional: usuario.id,
      nome_profissional: usuario.nome_usuario,
      registro_profissional: usuario.n_conselho,
    }
    axios.post(html + 'insert_prescricao', obj).then(() => {
      console.log(JSON.stringify(obj));
      loadPrescricao();
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }
  const copiarPrescricao = (item) => {
    // registrando nova prescrição.
    let old_id_prescricao = item.id;
    let nova_id_prescricao = null;
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data: moment(),
      status: 0, // 0 = não salva; 1 = salva (não pode excluir).
      id_profissional: usuario.id,
      nome_profissional: usuario.nome_usuario,
      registro_profissional: usuario.n_conselho,
    }
    axios.post(html + 'insert_prescricao', obj).then(() => {
      axios.get(html + 'list_prescricoes/' + atendimento).then((response) => {
        var x = response.data.rows;
        nova_id_prescricao = x.sort((a, b) => moment(a.data) < moment(b.data) ? -1 : 1).slice(-1).map(item => item.id).pop();
        console.log('ID DA PRESCRIÇÃO CRIADA: ' + nova_id_prescricao);
        // até aqui tudo bem...

        let arrayobjitens = [];
        let arrayobjcomponentes = [];

        // registrando itens de prescrição.
        axios.get(html + 'list_itens_prescricoes/' + atendimento).then((response) => {
          let x = response.data.rows;
          setprescricao(response.data.rows);
          //eslint-disable-next-line
          x.filter(valor => valor.id_componente_pai != null && valor.id_componente_filho == null && valor.id_prescricao == old_id_prescricao).map(valor => {
            let random = Math.random();
            var objitem = {
              id_unidade: parseInt(unidade),
              id_paciente: parseInt(paciente),
              id_atendimento: parseInt(atendimento),
              categoria: valor.categoria,
              codigo_item: valor.codigo_item,
              nome_item: valor.nome_item,
              qtde_item: parseInt(valor.qtde_item),
              via: valor.via,
              freq: valor.freq,
              agora: valor.agora,
              acm: valor.acm,
              sn: valor.sn,
              obs: valor.obs,
              data: moment(),
              id_componente_pai: random,
              id_componente_filho: null,
              id_prescricao: parseInt(nova_id_prescricao),
              id_pai: null
            }
            arrayobjitens.push(objitem);

            // registrando os componentes relacionados ao itens de prescrição.
            // eslint-disable-next-line
            x.filter(item => item.id_componente_filho == valor.id_componente_pai && valor.id_prescricao == old_id_prescricao).map(valor => {
              var objcomponente = {
                id_unidade: parseInt(unidade),
                id_paciente: parseInt(paciente),
                id_atendimento: parseInt(atendimento),
                categoria: valor.categoria,
                codigo_item: valor.codigo_item,
                nome_item: valor.nome_item,
                qtde_item: parseInt(valor.qtde_item),
                via: valor.via,
                freq: valor.freq,
                agora: valor.agora,
                acm: valor.acm,
                sn: valor.sn,
                obs: valor.obs,
                data: moment(),
                id_componente_pai: null,
                id_componente_filho: random,
                id_prescricao: parseInt(nova_id_prescricao),
                id_pai: null
              }
              arrayobjcomponentes.push(objcomponente);
            });

          });
          //eslint-disable-next-line
          arrayobjitens.map(item => {
            axios.post(html + 'insert_item_prescricao', item);
          });
          //eslint-disable-next-line
          arrayobjcomponentes.map(item => {
            axios.post(html + 'insert_item_prescricao', item);
          });
          loadPrescricao();
          loadItensPrescricao();
          setidprescricao(0);
          localStorage.setItem("id", 0);
        });
      });
    });

  }
  // atualizando um registro de prescrição.
  const updatePrescricao = (item, status) => {
    var obj = {
      id_paciente: item.id_paciente,
      id_atendimento: item.id_atendimento,
      data: item.data,
      status: status,
      id_profissional: item.id_profissional,
      nome_profissional: item.nome_profissional,
      registro_profissional: item.registro_profissional,
    }
    axios.post(html + 'update_prescricao/' + item.id, obj).then(() => {
      loadPrescricao();
      loadItensPrescricao();
      setidprescricao(0);
      localStorage.setItem("id", 0);
      // montando aprazamentos para a tela de controle de dispensação da farmácia.
      axios.get(html + 'list_itens_prescricoes/' + atendimento).then((response) => {
        let x = response.data.rows;
        setprescricao(response.data.rows);
        montaAprazamentos(item.id, x);
      })
    });
  }
  // excluindo um registro de prescricao.
  const deletePrescricao = (id) => {
    loadPrescricao();
    loadItensPrescricao();
    axios.get(html + 'delete_prescricao/' + id).then(() => {
      // deletando itens de prescrição correlatos.
      prescricao.filter(item => item.id_prescricao == id).map(item => deleteItemPrescricao(item));
      loadPrescricao();
      loadItensPrescricao();
      setidprescricao(0);
      localStorage.setItem("id", 0);
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }

  // ## ITENS DE PRESCRIÇÃO ## //
  // recuperando registros de itens de prescrição.

  const ordenaListaItensPrescricao = (x) => {
    let arrayitens = [];
    let dieta = [];
    dieta = x.filter(item => item.categoria == '0. DIETA');
    let atb = [];
    atb = x.filter(item => item.categoria == '1. ANTIMICROBIANOS').sort((a, b) => a.nome_item > b.nome_item ? 1 : -1);
    let outros = [];
    outros = x.filter(item => item.categoria != '0. DIETA' && item.categoria != '1. ANTIMICROBIANOS').sort((a, b) => a.nome_item > b.nome_item ? 1 : -1);
    dieta.map(item => arrayitens.push(item));
    atb.map(item => arrayitens.push(item));
    outros.map(item => arrayitens.push(item));
    console.log(arrayitens);
    setarrayitensprescricao(arrayitens);
  }

  const loadItensPrescricao = () => {
    axios.get(html + 'list_itens_prescricoes/' + atendimento).then((response) => {
      let x = response.data.rows;
      setprescricao(response.data.rows);
      if (idprescricao != 0 && expand == 0) {
        ordenaListaItensPrescricao(x);
      } else {
        setarrayitensprescricao(x.filter(item => item.id == selectitemprescricao.id));
        console.log(x.filter(item => item.id == selectitemprescricao.id))
      }
    })
  }

  // registrando um novo item de prescrição.
  const insertItemPrescricao = (item) => {
    let random = Math.random();
    var obj = {
      id_unidade: unidade,
      id_paciente: paciente,
      id_atendimento: atendimento,
      categoria: item.categoria,
      codigo_item: item.codigo_item,
      nome_item: item.nome_item,
      qtde_item: item.qtde_item,
      via: item.via,
      freq: item.freq,
      agora: item.agora,
      acm: item.acm,
      sn: item.sn,
      obs: item.obs,
      data: moment(),
      id_componente_pai: random,
      id_componente_filho: null,
      id_prescricao: idprescricao,
      id_pai: null,
    }
    axios.post(html + 'insert_item_prescricao', obj).then(() => {
      // pegar a id do item recém-registrado.
      axios.get(html + 'list_itens_prescricoes/' + atendimento).then((response) => {
        let x = response.data.rows;
        setprescricao(response.data.rows);
        // setarrayitensprescricao(response.data.rows);
        ordenaListaItensPrescricao(x);
        let lastIdItemPrescricao = x.filter(item => item.id_prescricao == idprescricao).slice(-1).map(item => item.id);
        // inserir componentes predefinidos para o item prescrito.
        opcoesprescricao.filter(valor => valor.id_componente_filho == item.id_componente_pai).map(valor => insertComponentePrescricao(random, valor, lastIdItemPrescricao));
        loadItensPrescricao();
        setTimeout(() => {
          document.getElementById("item de prescrição " + idprescricao).className = "button-selected";
        }, 600);
      }, 2000);
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }
  const insertComponentePrescricao = (id_componente_pai, componente, id_item) => {
    var obj = {
      id_unidade: unidade,
      id_paciente: paciente,
      id_atendimento: atendimento,
      categoria: componente.categoria,
      codigo_item: componente.codigo_item,
      nome_item: componente.nome_item,
      qtde_item: componente.qtde_item,
      via: null,
      freq: null,
      agora: null,
      acm: null,
      sn: null,
      obs: null,
      data: moment(),
      id_componente_filho: id_componente_pai,
      id_componente_pai: null,
      id_prescricao: idprescricao,
      id_pai: parseInt(id_item),
    }
    axios.post(html + 'insert_item_prescricao', obj).then(() => {
      console.log('COMPONENTE INSERIDO:');
      console.log(obj);
      loadItensPrescricao();

      setTimeout(() => {
        if (expand == 1) {
          lockElements(1);
        }
        document.getElementById("item de prescrição " + idprescricao).className = "button-selected";
      }, 600);

    })
  }
  // atualizando um registro de prescrição.
  const updateItemPrescricao = (item, qtde, via, freq, agora, acm, sn, obs) => {
    var obj = {
      id_unidade: parseInt(unidade),
      id_paciente: parseInt(paciente),
      id_atendimento: atendimento,
      categoria: item.categoria,
      codigo_item: parseInt(item.codigo_item),
      nome_item: item.nome_item,
      qtde_item: parseInt(qtde),
      via: via,
      freq: freq,
      agora: agora,
      acm: acm,
      sn: sn,
      obs: obs,
      data: item.data,
      id_componente_pai: item.id_componente_pai,
      id_componente_filho: item.id_componente_filho,
      id_prescricao: idprescricao,
      id_pai: 0,
    }
    axios.post(html + 'update_item_prescricao/' + item.id, obj).then(() => {
      console.log('ITEM ATUALIZADO')
      console.log(item.id);
      console.log(obj);
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }
  // excluir um item de prescricao.
  const deleteItemPrescricao = (item) => {
    axios.get(html + 'delete_item_prescricao/' + item.id).then(() => {
      // deletar também todos os registros de componentes associados ao item recém-deletado.
      prescricao.filter(valor => valor.id_pai == item.id).map(valor => {
        axios.get(html + 'delete_item_prescricao/' + valor.id).then(() => {
          console.log('DELETANDO COMPONENTE.');
        });
        return null;
      })
      loadItensPrescricao();
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }
  const deleteComponentePrescricao = (id) => {
    axios.get(html + 'delete_item_prescricao/' + id).then(() => {
      console.log('DELETANDO COMPONENTE.');
      loadItensPrescricao();
      setTimeout(() => {
        lockElements(1);
        document.getElementById("item de prescrição " + idprescricao).className = "button-selected";
      }, 600);
    });
  }

  const [filterprescricao, setfilterprescricao] = useState('');
  var searchprescricao = '';
  const filterItemPrescricao = (input) => {
    clearTimeout(timeout);
    document.getElementById(input).focus();
    searchprescricao = document.getElementById(input).value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchprescricao == '') {
        setviewopcoesitensprescricao(0);
        setfilterprescricao('');
        setarrayopcoesprescricao([]);
        // setarrayitensprescricao(prescricao);
        ordenaListaItensPrescricao(prescricao)
        document.getElementById(input).value = '';
        setTimeout(() => {
          document.getElementById(input).focus();
        }, 100);
      } else {
        setviewopcoesitensprescricao(1);
        setfilterprescricao(document.getElementById(input).value.toUpperCase());
        setarrayopcoesprescricao(opcoesprescricao.filter(item => item.nome_item.includes(searchprescricao)));
        setarrayitensprescricao(prescricao.filter(item => item.nome_item.includes(searchprescricao)));
        document.getElementById(input).value = searchprescricao;
        setTimeout(() => {
          document.getElementById(input).focus();
        }, 100);
      }
    }, 1000);
  }
  // filtro de prescricao por nome.
  function FilterItemPrescricao() {
    return (
      <input
        id="inputItemPrescricao"
        className="input"
        autoComplete="off"
        placeholder="BUSCAR ITEM..."
        onFocus={(e) => (e.target.placeholder = '')}
        onBlur={(e) => (e.target.placeholder = 'BUSCAR ITEM...')}
        onKeyUp={() => filterItemPrescricao("inputItemPrescricao")}
        type="text"
        defaultValue={filterprescricao}
        maxLength={100}
        style={{ margin: 5, width: 'calc(100% - 20px)', alignSelf: 'center' }}
      ></input>
    )
  }
  const [filteropcoesprescricao, setfilteropcoesprescricao] = useState('');
  var searchopcoesprescricao = '';
  const filterOpcoesItemPrescricao = () => {
    clearTimeout(timeout);
    document.getElementById("inputopcoesprescricao").focus();
    searchopcoesprescricao = document.getElementById("inputopcoesprescricao").value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchopcoesprescricao == '') {
        setfilteropcoesprescricao([]);
        setarrayopcoesprescricao(opcoesprescricao);
        document.getElementById("inputopcoesprescricao").value = '';
        setTimeout(() => {
          document.getElementById("inputopcoesprescricao").focus();
        }, 100);
      } else {
        setfilteropcoesprescricao(document.getElementById("inputopcoesprescricao").value.toUpperCase());
        setarrayopcoesprescricao(opcoesprescricao.filter(item => item.nome_item.includes(searchopcoesprescricao)));
        document.getElementById("inputopcoesprescricao").value = searchopcoesprescricao;
        setTimeout(() => {
          document.getElementById("inputopcoesprescricao").focus();
        }, 100);
      }
    }, 1000);
  }
  // filtro de prescricao por nome.
  function FilterOpcoesItemPrescricao() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
        <div className='button-yellow'
          style={{ margin: 0, marginRight: 10, width: 50, height: 50 }}
          onClick={() => { setopcoesitensmenu(0) }}>
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
        <input
          className="input"
          autoComplete="off"
          placeholder="BUSCAR ITEM..."
          onFocus={(e) => (e.target.placeholder = '')}
          onBlur={(e) => (e.target.placeholder = 'BUSCAR ITEM...')}
          onClick={() => limpaCampos()}
          onKeyUp={() => {
            filterOpcoesItemPrescricao();
            setTimeout(() => {
              document.getElementById("inputopcoesprescricao").focus();
            }, 500);
          }}
          type="text"
          id="inputopcoesprescricao"
          defaultValue={filteropcoesprescricao}
          maxLength={100}
          style={{ margin: 0, width: '30vw' }}
        ></input>
      </div>
    )
  }

  // modificadores dos itens de prescrição.
  const [nome, setnome] = useState(null);

  // categoria do item prescrito.
  let arraycategorias = ['0. DIETA', '1. ANTIMICROBIANOS', '2. DIVERSOS', '3. CURATIVOS', '4. CUIDADOS']
  const [categoria, setcategoria] = useState('CATEGORIA');
  const [qtde, setqtde] = useState(null);

  // via de administração do item prescrito.
  const [via, setvia] = useState('VIA');
  const [freq, setfreq] = useState('FREQ');
  const [obs, setobs] = useState('');
  const [codigo_item, setcodigo_item] = useState(null);
  const [id_componente_pai, setid_componente_pai] = useState(null);
  const [id, setid] = useState(null);

  /*
  let nome = null;
  let categoria = null;
  let qtde = null;
  let via = null;
  let freq = null;
  let obs = null;
  */

  function Categoria() {
    return (
      <div id="categoriamenu"
        className="hide"
        onClick={() => document.getElementById('categoriamenu').className = "hide"}
      >
        <div
          className="fundo"
        >
          <div
            className="janela">
            {arraycategorias.map(valor => (
              < div
                key={valor}
                className="button"
                style={{ width: 200 }}
                onClick={() => {
                  setcategoria(valor);
                  document.getElementById('categoriamenu').className = "hide";
                }}
              >
                {valor}
              </div>
            ))}
          </div>
        </div>
      </div >
    )
  }
  // função para permitir apenas a inserção de números no input (obedecendo a valores de referência).
  const checkInputAndUpdateItemPrescricao = (input, min, max, item) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      var valor = document.getElementById(input).value;
      if (isNaN(valor) == true || valor < min || valor > max) {
        // setstate(null);
        document.getElementById(input).value = '';
        document.getElementById(input).focus();
      } else {
        var obj = {
          id_unidade: item.id_unidade,
          id_paciente: item.id_paciente,
          id_atendimento: item.id_atendimento,
          categoria: item.categoria,
          codigo_item: item.codigo_item,
          nome_item: item.nome_item,
          qtde_item: parseInt(document.getElementById(input).value),
          via: item.via,
          freq: item.freq,
          agora: item.agora,
          acm: item.acm,
          sn: item.sn,
          obs: item.obs,
          data: item.data,
          id_componente_pai: item.id_componente_pai,
          id_componente_filho: item.id_componente_filho,
          id_prescricao: item.id_prescricao,
          id_pai: item.id_pai,
        }
        axios.post(html + 'update_item_prescricao/' + item.id, obj).then(() => {
          if (expand == 1) {
            lockElements(1);
          }
        })
          .catch(function () {
            toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
            setTimeout(() => {
              setpagina(0);
              history.push('/');
            }, 5000);
          });
      }
    }, 200);
  }

  // LISTA LATERAL DE PRESCRIÇÕES.
  const [statusprescricao, setstatusprescricao] = useState(0);
  // MODELOS DE PRESCRIÇÃO.
  const [modelosprescricao, setmodelosprescricao] = useState([]);
  const loadModelosPrescricao = () => {
    axios.get(html + 'list_model_prescricao/' + usuario.id).then((response) => {
      var x = response.data.rows;
      setmodelosprescricao(x);
    })
  };
  const [dataprescricao, setdataprescricao] = useState();
  const ListaPrescricoes = useCallback(() => {
    return (
      <div id="scroll lista de prescrições"
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
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div id="botão para nova prescrição."
            className='button-green'
            onClick={() => {
              setidprescricao(0);
              localStorage.setItem("id", 0);
              insertPrescricao();
              setexpand(0)
            }}
          >
            <img
              alt=""
              src={novo}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
          <div id="botão para acessar modelos de prescrição."
            className='button'
            onClick={() => setviewselectmodelosprescricao(1)}
            style={{
              pointerEvents: modelosprescricao.length > 0 ? 'auto' : 'none',
              opacity: modelosprescricao.length > 0 ? 1 : 0.3
            }}
          >
            <img
              alt=""
              src={favorito_usar}
              style={{ width: 25, height: 25 }}
            ></img>
          </div>
        </div>
        {arraylistaprescricao.sort((a, b) => moment(a.data) > moment(b.data) ? -1 : 1).map((item) => (
          <div id={"item de prescrição " + item.id}
            className='button'
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              minHeight: 200,
            }}
            onClick={() => {
              setexpand(0);
              setidprescricao(item.id);
              setdataprescricao(item.data);
              setselecteddocumento(item);
              setdono_documento({
                id: item.id_profissional,
                conselho: 'CRM: ' + item.registro_profissional,
                nome: item.nome_profissional,
              })
              settipodocumento('PRESCRIÇÃO MÉDICA');
              axios.get(html + 'list_itens_prescricoes/' + atendimento).then((response) => {
                let x = response.data.rows;
                setprescricao(response.data.rows);
                ordenaListaItensPrescricao(x);
              });
              localStorage.setItem('id', item.id);
              setstatusprescricao(item.status);
              selector("scroll lista de prescrições", "item de prescrição " + item.id, 600);
            }}
          >
            <div id="conjunto de botoes do item de prescricao"
              style={{
                display: 'flex',
                flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
                pointerEvents: localStorage.getItem("id") != item.id ? 'none' : 'auto',
                opacity: localStorage.getItem("id") != item.id ? 0.5 : 1,
              }}>
              <div id="botão para excluir prescrição."
                className='button-yellow'
                style={{
                  display: item.status == 0 ? 'flex' : 'none',
                  maxWidth: 30, width: 30, minWidth: 30,
                  maxHeight: 30, height: 30, minHeight: 30
                }}
                onClick={(e) => { deletePrescricao(item.id); e.stopPropagation() }}
              >
                <img
                  alt=""
                  src={deletar}
                  style={{ width: 25, height: 25 }}
                ></img>
              </div>
              <div id="botão para salvar prescrição."
                style={{
                  display: item.status == 0 ? 'flex' : 'none',
                  maxWidth: 30, width: 30, minWidth: 30,
                  maxHeight: 30, height: 30, minHeight: 30
                }}
                className='button-green'
                onClick={(e) => {
                  updatePrescricao(item, 1);
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
                id="botão para imprimir prescrição"
                className='button-green'
                style={{
                  display: item.status > 0 ? 'flex' : 'none',
                  maxWidth: 30, width: 30, minWidth: 30,
                  maxHeight: 30, height: 30, minHeight: 30
                }}
                title={'IMPRIMIR PRESCRIÇÕES'}
                onClick={(e) => {
                  printDiv();
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
              <div
                id="botão para copiar prescrição"
                className='button-green'
                style={{
                  display: item.status > 0 ? 'flex' : 'none',
                  maxWidth: 30, width: 30, minWidth: 30,
                  maxHeight: 30, height: 30, minHeight: 30
                }}
                title={'COPIAR PRESCRIÇÃO'}
                onClick={(e) => { copiarPrescricao(item); e.stopPropagation() }}>
                <img
                  alt=""
                  src={copiar}
                  style={{
                    height: 20,
                    width: 20,
                  }}
                ></img>
              </div>
              <div
                id="botão para salvar modelo da prescrição"
                className='button'
                style={{
                  display: item.status > 0 ? 'flex' : 'none',
                  maxWidth: 30, width: 30, minWidth: 30,
                  maxHeight: 30, height: 30, minHeight: 30
                }}
                title={'SALVAR COMO MODELO'}
                onClick={() => {
                  setidprescricao(item.id_prescricao);
                  setviewnomeprescricao(1);
                }}>
                <img
                  alt=""
                  src={favorito_salvar}
                  style={{
                    height: 20,
                    width: 20,
                  }}
                ></img>
              </div>
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
    // eslint-disable-next-line
  }, [arraylistaprescricao, atendimento, modelosprescricao])

  // componente para selecionar a via de administração de um item de prescrição.
  const [viewviaitemprescricao, setviewviaitemprescricao] = useState(0);
  const vias = ['VO', 'IV', 'SC', 'IM', 'HIPODERMÓCLISE', 'SNE', 'GGT']
  function ViewItemVia() {
    return (
      <div
        className='fundo'
        onClick={() => setviewviaitemprescricao(0)}
        style={{ display: viewviaitemprescricao == 1 ? 'flex' : 'none' }}
      >
        <div className='janela'>
          <div className='scroll' style={{ height: '70vh' }}>
            {vias.map(item => (
              <div
                key={'via: ' + item}
                onClick={() => {
                  updateItemPrescricao(selectitemprescricao, document.getElementById("inputQtde " + selectitemprescricao.id).value, item, selectitemprescricao.freq, selectitemprescricao.agora, selectitemprescricao.acm, selectitemprescricao.sn, selectitemprescricao.obs);
                  document.getElementById("inputVia " + selectitemprescricao.id).innerHTML = item;
                  // document.getElementById("inputQtde " + selectitemprescricao.id).value = selectitemprescricao.qtde_item;
                }}
                className='button'
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // componente para selecionar a frequência de administração de um item de prescrição.
  const [viewfreqitemprescricao, setviewfreqitemprescricao] = useState(0);
  const arrayfreq = ['1/1H', '2/2H', '4/4H', '6/6H', '8/8H', '12/12H', '24/24H', '8H', '10H', '12H', '17H', '20H', '22H', 'AGORA']
  function ViewItemFreq() {
    return (
      <div
        className='fundo'
        onClick={() => setviewfreqitemprescricao(0)}
        style={{ display: viewfreqitemprescricao == 1 ? 'flex' : 'none' }}
      >
        <div className='janela scroll' style={{ height: '60vh', maxHeight: '60vh' }}>
          {arrayfreq.map(item => (
            <div
              key={'freq: ' + item}
              onClick={() => {
                updateItemPrescricao(selectitemprescricao, document.getElementById("inputQtde " + selectitemprescricao.id).value, selectitemprescricao.via, item, selectitemprescricao.agora, selectitemprescricao.acm, selectitemprescricao.sn, selectitemprescricao.obs);
                document.getElementById("inputFreq " + selectitemprescricao.id).innerHTML = item;
                // document.getElementById("inputQtde " + selectitemprescricao.id).value = selectitemprescricao.qtde_item;
              }}
              className='button'
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // componente para selecionar se um item de prescrição tem a condição se necessário (SN), a critério médico (ACM) ou agora.
  const [viewcondicaoitemprescricao, setviewcondicaoitemprescricao] = useState(0);
  function ViewItemCondicao() {
    return (
      <div
        className='fundo'
        onClick={() => setviewcondicaoitemprescricao(0)}
        style={{ display: viewcondicaoitemprescricao == 1 ? 'flex' : 'none' }}
      >
        <div className='janela'>
          <div
            onClick={() => {
              updateItemPrescricao(selectitemprescricao, document.getElementById("inputQtde " + selectitemprescricao.id).value, selectitemprescricao.via, selectitemprescricao.freq, true, false, false, selectitemprescricao.obs);
              document.getElementById("condição " + selectitemprescricao.id).innerHTML = 'AGORA';
              // document.getElementById("inputQtde " + selectitemprescricao.id).value = selectitemprescricao.qtde_item;
            }}
            className='button'
          >
            AGORA
          </div>
          <div
            onClick={() => {
              updateItemPrescricao(selectitemprescricao, document.getElementById("inputQtde " + selectitemprescricao.id).value, selectitemprescricao.via, selectitemprescricao.freq, false, true, false, selectitemprescricao.obs);
              document.getElementById("condição " + selectitemprescricao.id).innerHTML = 'ACM';
            }}
            className='button'
          >
            ACM
          </div>
          <div
            onClick={() => {
              updateItemPrescricao(selectitemprescricao, document.getElementById("inputQtde " + selectitemprescricao.id).value, selectitemprescricao.via, selectitemprescricao.freq, false, false, true, selectitemprescricao.obs);
              document.getElementById("condição " + selectitemprescricao.id).innerHTML = 'SN';
            }}
            className='button'
          >
            SN
          </div>
        </div>
      </div>
    )
  }

  const lockElements = (key) => {
    if (key == 0) {
      document.getElementById("trava mouse").style.pointerEvents = "auto";
      document.getElementById("trava mouse").style.opacity = 1;
      document.getElementById("conjunto de botoes do item de prescricao").style.pointerEvents = "auto";
      document.getElementById("conjunto de botoes do item de prescricao").style.opacity = 1;
      document.getElementById("botao para excluir item de prescricao").style.pointerEvents = "auto";
      document.getElementById("botao para excluir item de prescricao").style.opacity = 1;
      document.getElementById("scroll lista de prescrições").style.pointerEvents = "auto";
      document.getElementById("scroll lista de prescrições").style.opacity = 1;
      document.getElementById("inputItemPrescricao").style.pointerEvents = "auto";
      document.getElementById("inputItemPrescricao").style.opacity = 1;
    } else {
      document.getElementById("trava mouse").style.pointerEvents = "none";
      document.getElementById("trava mouse").style.opacity = 0.5;
      document.getElementById("conjunto de botoes do item de prescricao").style.pointerEvents = "none";
      document.getElementById("conjunto de botoes do item de prescricao").style.opacity = 0.5;
      document.getElementById("botao para excluir item de prescricao").style.pointerEvents = "none";
      document.getElementById("botao para excluir item de prescricao").style.opacity = 0.5;
      document.getElementById("scroll lista de prescrições").style.pointerEvents = "none";
      document.getElementById("scroll lista de prescrições").style.opacity = 0.5;
      document.getElementById("inputItemPrescricao").style.pointerEvents = "none";
      document.getElementById("inputItemPrescricao").style.opacity = 0.5;
    }
  }

  // função contadora do tempo de antibióticos.
  const tempoAtb = (lista, item) => {
    console.log(lista.length);
    // array dos itens de antibiótico selecionado para o atendimento.
    let arrayatb = lista.filter(valor => valor.categoria == '1. ANTIMICROBIANOS' && valor.nome_item == item.nome_item).sort((a, b) => moment(a.data) < moment(b.data) ? -1 : 1).map(item => moment(item.data).format('DD/MM/YY'));
    console.log(arrayatb);
    // excluindo datas repetidas da array.
    let purifiedarrayatb = []
    // eslint-disable-next-line
    arrayatb.map(valor => {
      if (purifiedarrayatb.filter(item => item == valor).length == 0) {
        purifiedarrayatb.push(valor);
      }
    })
    console.log(purifiedarrayatb);
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
        {purifiedarrayatb.map(item => (
          <div className='button' style={{ display: 'flex', margin: 5, backgroundColor: '#85C1E9', opacity: 0.8, paddingLeft: 10, paddingRight: 10 }}>{item}</div>
        ))}
      </div>
    )
  }

  const [selectitemprescricao, setselectitemprescricao] = useState([]);
  const [viewopcoesitensprescricao, setviewopcoesitensprescricao] = useState(0);
  const ListaItensPrescricoes = useCallback(() => {
    var timeout = null;
    return (
      <div style={{
        margin: 5, width: '70vw', height: ''
      }}>
        <div style={{
          pointerEvents: statusprescricao == 1 || idprescricao == 0 ? 'none' : 'auto',
          opacity: statusprescricao == 1 ? 0.5 : 1,
        }}>
          <FilterItemPrescricao></FilterItemPrescricao>
        </div>
        <div style={{
          display: viewopcoesitensprescricao == 1 && statusprescricao == 0 && idprescricao != 0 ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'flex-start',
          flexWrap: 'wrap',
          marginTop: 10, marginBottom: 0,
          borderRadius: 5,
          backgroundColor: '#ffffff50',
        }}>
          {arrayopcoesprescricao.filter(item =>
            item.id_componente_pai != null
            &&
            // listar apenas opções de itens de prescrição cadastrados no almoxarifado.
            almoxarifado.filter(valor => valor.codigo_item == item.codigo_item).length == 1
            &&
            // listar apenas opções de itens de prescrição com estoque no almoxarifado.
            almoxarifado.filter(valor => valor.codigo_item == item.codigo_item).map(valor => valor.qtde_item) > 0
            &&
            // listar apenas opções de itens de prescrição com registro no estoque assinado como liberado.
            almoxarifado.filter(valor => valor.codigo_item == item.codigo_item).map(valor => valor.liberado) == 1
          ).map(item => (
            <div
              className="button-green"
              style={{
                display: idprescricao != 0 ? 'flex' : 'none',
                flexDirection: 'row', paddingLeft: 15, paddingRight: 15,
              }}
              onClick={() => {
                insertItemPrescricao(item)
                setviewopcoesitensprescricao(0);
                setfilterprescricao('');
                setarrayopcoesprescricao([]);
                // setarrayitensprescricao(prescricao);
                ordenaListaItensPrescricao(prescricao);
                document.getElementById("inputItemPrescricao").value = '';
                setTimeout(() => {
                  document.getElementById("inputItemPrescricao").focus();
                }, 100);
              }}
            >
              {item.nome_item}
            </div>
          ))}
        </div>
        {arrayitensprescricao.filter(item => item.id_prescricao == idprescricao && item.id_componente_pai != null && item.id_componente_filho == null).map(item => (
          <div
            key={"prescricao " + item.id}
            style={{
              display: idprescricao != 0 ? 'flex' : 'none',
              flexDirection: 'column', justifyContent: 'center',
              pointerEvents: arraylistaprescricao.filter(valor => valor.id == item.id_prescricao).map(valor => parseInt(valor.status)) == 1 ? 'none' : 'auto', zIndex: 5,
            }}>
            <div className='row'
              style={{
                justifyContent: 'space-between',
                display: 'flex', flexDirection: 'column',
                margin: 0,
              }}
            >
              <div id='linha principal' style={{ display: 'flex', flexDirection: 'row', position: 'relative' }}>
                <div className='button'
                  onClick={() => {
                    if (expand == 1) {
                      setexpand(0);
                      axios.get(html + 'list_itens_prescricoes/' + atendimento).then((response) => {
                        let x = response.data.rows;
                        setprescricao(response.data.rows);
                        // setarrayitensprescricao(x.sort((a, b) => a.nome_item > b.nome_item ? -1 : 1));
                        ordenaListaItensPrescricao(x);
                        lockElements(0);
                      });
                    } else {
                      setselectitemprescricao(item);
                      setexpand(1);
                      axios.get(html + 'list_itens_prescricoes/' + atendimento).then((response) => {
                        let x = response.data.rows;
                        setprescricao(response.data.rows);
                        setarrayitensprescricao(x.filter(valor => valor.id == item.id));
                        lockElements(1);
                      });
                    }
                    setTimeout(() => {
                      document.getElementById("item de prescrição " + idprescricao).className = "button-selected";
                    }, 600);
                  }}
                  style={{
                    display: 'flex', margin: 5, paddingLeft: 20, paddingRight: 20, width: '100%',
                    backgroundColor: item.categoria == '1. ANTIMICROBIANOS' ? '#85C1E9' : '',
                    justifyContent: 'space-between', textAlign: 'left',
                  }}>
                  <div>{item.nome_item}</div>
                  <div id="contador de dias do antibiótico."
                    className='button'
                    title="DIAS DE ATB"
                    onClick={(e) => {
                      document.getElementById("lista_atb " + item.id).style.display = 'flex';
                      e.stopPropagation();
                    }}
                    style={{
                      position: 'relative',
                      display: item.categoria == '1. ANTIMICROBIANOS' ? 'flex' : 'none',
                      backgroundColor: '#5DADE2',
                      minHeight: 20, maxHeight: 20, height: 20, minWidth: 25, width: '', zIndex: 10,
                    }}
                  >
                    {prescricao.filter(valor => valor.nome_item == item.nome_item && item.categoria == '1. ANTIMICROBIANOS').sort((a, b) => moment(a.data).startOf('day') < moment(b.data).startOf('day') ? 1 : -1).slice(-1).map(item => moment(dataprescricao).startOf('day').diff(moment(item.data).startOf('day'), 'days'))}
                    <div id={"lista_atb " + item.id}
                      className='scroll'
                      onClick={(e) => {
                        document.getElementById("lista_atb " + item.id).style.display = 'none';
                        e.stopPropagation();
                      }}
                      style={{
                        display: 'none',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignContent: 'flex-start',
                        flexWrap: 'wrap',
                        textAlign: 'left',
                        width: 195, height: 180,
                        position: 'absolute',
                        backgroundColor: '#5DADE2',
                        borderColor: '#5DADE2',
                      }}
                    >
                      {tempoAtb(prescricao, item)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row' }} id="trava mouse">
                  <input id={"inputQtde " + item.id}
                    className="input"
                    autoComplete="off"
                    placeholder="QTDE"
                    inputMode='numeric'
                    onKeyUp={() => {
                      checkInputAndUpdateItemPrescricao("inputQtde " + item.id, 1, 100, item);
                    }}
                    onFocus={(e) => (e.target.placeholder = '')}
                    onBlur={(e) => (e.target.placeholder = 'QTDE')}
                    style={{
                      width: 50, minWidth: 50, maxWidth: 50,
                      margin: 5,
                    }}
                    type="text"
                    defaultValue={item.qtde_item}
                    maxLength={3}
                  ></input>
                  <div id={"inputVia " + item.id}
                    className='button'
                    onClick={() => {
                      setselectitemprescricao(item);
                      setviewviaitemprescricao(1);
                    }}
                    style={{
                      display: 'flex',
                      width: 50, minWidth: 50, maxWidth: 50,
                      margin: 5
                    }}>
                    {item.via}
                  </div>
                  <div id={"inputFreq " + item.id}
                    className="button"
                    onClick={() => {
                      setselectitemprescricao(item);
                      setviewfreqitemprescricao(1);
                    }}
                    style={{
                      width: 50, minWidth: 50, maxWidth: 50,
                      margin: 5,
                    }}
                    type="text"
                  >
                    {item.freq}
                  </div>
                  <div id={"condição " + item.id}
                    className='button'
                    onClick={() => {
                      setselectitemprescricao(item);
                      setviewcondicaoitemprescricao(1);
                    }}
                    style={{
                      display: 'flex',
                      width: 50, minWidth: 50, maxWidth: 50,
                      margin: 5
                    }}>
                    {item.agora == true ? 'AGORA' : item.acm == true ? 'ACM' : item.sn == true ? 'SN' : ''}
                  </div>
                </div>
                <div id="botao para excluir item de prescricao"
                  className={'button-yellow'}
                  title={'EXCLUIR ITEM DE PRESCRIÇÃO.'}
                  onClick={(e) => { deleteItemPrescricao(item) }}>
                  <img
                    alt=""
                    src={deletar}
                    style={{
                      margin: 0,
                      height: 30,
                      width: 30,
                    }}
                  ></img>
                </div>
              </div>
              <div id={"expansivel " + item.id}
                className={expand == 1 ? 'expand' : 'retract'}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', marginTop: 0 }}>
                <div id={"informações " + item.id}
                  className={expand == 1 ? 'show' : 'hide'}
                  style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}
                >
                  <textarea id={"inputObs " + item.id}
                    className="textarea"
                    autoComplete="off"
                    placeholder="OBSERVAÇÕES"
                    inputMode='text'
                    onKeyUp={() => {
                      clearTimeout(timeout);
                      timeout = setTimeout(() => {
                        updateItemPrescricao(item, item.qtde_item, item.via, item.freq, item.agora, item.acm, item.sn, document.getElementById("inputObs " + item.id).value.toUpperCase());
                      }, 1000);
                    }}
                    onFocus={(e) => (e.target.placeholder = '')}
                    onBlur={(e) => (e.target.placeholder = 'OBSERVAÇÕES')}
                    style={{
                      width: '15vw', minWidth: '15vw', maxWidth: '15vw',
                      height: 'calc(100% - 30px)',
                      margin: 0, marginRight: 10,
                    }}
                    type="text"
                    defaultValue={item.obs}
                    maxLength={1000}
                  ></textarea>
                  <div id="LISTA DE COMPONENTES" className='scroll'
                    style={{
                      width: 'calc(100% - 10px)',
                      height: 'calc(100% - 10px)',
                      margin: 0
                    }}>
                    {prescricao.filter(valor => valor.id_componente_filho == item.id_componente_pai).map(valor => (
                      <div style={{
                        display: 'flex', flexDirection: 'row',
                        justifyContent: 'space-between', width: '100%'
                      }}>
                        <div className='button'
                          style={{
                            display: 'flex',
                            width: '100%',
                          }}>
                          {valor.nome_item}
                        </div>
                        <input id={"inputQtdeComponent " + valor.id}
                          className="input"
                          autoComplete="off"
                          placeholder="QTDE"
                          inputMode='numeric'
                          onKeyUp={() => { checkInputAndUpdateItemPrescricao("inputQtdeComponent " + valor.id, 1, 100, valor) }}
                          onFocus={(e) => (e.target.placeholder = '')}
                          onBlur={(e) => (e.target.placeholder = 'QTDE')}
                          style={{
                            width: 50,
                            margin: 5,
                          }}
                          type="text"
                          defaultValue={valor.qtde_item}
                          maxLength={3}
                        ></input>
                        <div className={'button-yellow'}
                          style={{
                            display: 'flex',
                            marginRight: 5,
                          }}
                          title={'EXCLUIR ITEM.'}
                          onClick={(e) => { deleteComponentePrescricao(valor.id); e.stopPropagation() }}>
                          <img
                            alt=""
                            src={deletar}
                            style={{
                              margin: 0,
                              height: 30,
                              width: 30,
                            }}
                          ></img>
                        </div>
                      </div>
                    ))}
                    {ViewInsertComponentePrescricao(item)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
        }
        <div className='text1'
          style={{ display: arrayitensprescricao.length == 0 ? 'flex' : 'none', opacity: 0.5, }}>
          SEM ITENS PRESCRITOS.
        </div>
      </div >
    )
    // eslint-disable-next-line
  }, [prescricao, statusprescricao, arrayitensprescricao, atendimentos, idprescricao, dataprescricao, arraylistaprescricao]);

  const ViewInsertComponentePrescricao = (item) => {
    const [localarray, setlocalarray] = useState([]);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <input id={"inputNovoComplemento" + item.id}
          className='input' style={{ width: '90%', alignSelf: 'center' }}
          autoComplete="off"
          placeholder="COMPONENTE..."
          inputMode='text'
          onFocus={(e) => (e.target.placeholder = '')}
          onBlur={(e) => (e.target.placeholder = 'COMPONENTE...')}
          onKeyUp={() => {
            clearTimeout(timeout);
            document.getElementById("inputNovoComplemento" + item.id).focus();
            let searchprescricao = document.getElementById("inputNovoComplemento" + item.id).value.toUpperCase();

            timeout = setTimeout(() => {
              if (searchprescricao == '') {
                setlocalarray([]);
                document.getElementById("inputNovoComplemento" + item.id).value = '';
                setTimeout(() => {
                  document.getElementById("inputNovoComplemento" + item.id).focus();
                }, 100);
              } else {
                setlocalarray(opcoesprescricao.filter(item => item.id_componente_pai == null && item.id_componente_filho == null && item.nome_item.includes(searchprescricao)));
                document.getElementById("inputNovoComplemento" + item.id).value = searchprescricao;
                setTimeout(() => {
                  document.getElementById("inputNovoComplemento" + item.id).focus();
                }, 100);
              }
            }, 1000);
          }}
        >
        </input>
        {localarray.map(valor => (
          <div
            className="button-green"
            style={{ display: 'flex', flexDirection: 'row', paddingLeft: 15, paddingRight: 15 }}
            onClick={() => {
              console.log(item);
              insertComponentePrescricao(item.id_componente_pai, valor, item.id);
            }}
          >
            {valor.nome_item}
          </div>
        ))}
      </div>
    )
    // eslint-disable-next-line
  };

  function ScrollOpcoesItens() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
        <div
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>

            <div id="scroll itens"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              <div className='text1' style={{ display: id == null ? 'flex' : 'none' }}>ITENS DISPONÍVEIS PARA PRESCRIÇÃO</div>
              <div className='scroll cor0'
                style={{
                  display: id == null ? 'flex' : 'none',
                  flexDirection: 'center',
                  height: '60vh',
                  width: '60vw'
                }}>
                {arrayopcoesprescricao.filter(item => item.id_componente_pai != null).map(item => (
                  <div
                    id={"optionItem " + item.id}
                    className={'button'}
                    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                    key={item.id}
                    onClick={() => {
                      console.log(item.nome_item);
                      setid(item.id);
                      setid_componente_pai(item.id_componente_pai);
                      setTimeout(() => {
                        setnome(item.nome_item);
                        setcategoria(item.categoria);
                        setqtde(item.qtde_item);
                        setvia(item.via);
                        setfreq(item.freq);
                        setobs(item.obs);
                        setcodigo_item(item.codigo_item);
                        selector("scroll itens", "optionItem " + item.id, 100);
                      }, 200);
                    }}
                  >
                    <div style={{ marginLeft: 5 }}>
                      {item.nome_item}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <div className={'button-yellow'}
                        style={{
                          display: 'flex',
                          margin: 0, width: 40, minWidth: 40, maxWidth: 40, height: 40, minHeight: 40, maxHeight: 40
                        }}
                        title={'EXCLUIR ITEM.'}
                        onClick={(e) => { deleteOpcaoItemPrescricao(item.id); e.stopPropagation() }}>
                        <img
                          alt=""
                          src={deletar}
                          style={{
                            margin: 0,
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
            <div id="scroll componentes"
              style={{
                // display: id == null ? 'flex' : 'none',
                display: 'none',
                flexDirection: 'column', justifyContent: 'flex-start',
                marginLeft: 10
              }}>
              <div className='text1' style={{ display: 'flex' }}>COMPONENTES DISPONÍVEIS PARA PRESCRIÇÃO</div>
              <div className='scroll cor0'
                style={{
                  display: id == null ? 'flex' : 'none',
                  flexDirection: 'center',
                  height: 200, minHeight: 200,
                  width: '30vw'
                }}>
                {arrayopcoesprescricao.filter(item => item.id_componente_pai == null && item.id_componente_filho == null).map(item => (
                  <div
                    id={"optionItem " + item.id}
                    className={'button'}
                    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                    key={item.id}
                    onClick={() => {
                      console.log(item.nome_item);
                    }}
                  >
                    <div style={{ marginLeft: 5, textAlign: 'left' }}>
                      {item.nome_item}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <div className={'button-yellow'}
                        style={{
                          display: 'flex',
                          margin: 0, width: 40, minWidth: 40, maxWidth: 40, height: 40, minHeight: 40, maxHeight: 40
                        }}
                        title={'EXCLUIR ITEM.'}
                        onClick={(e) => { deleteOpcaoItemPrescricao(item.id); e.stopPropagation() }}>
                        <img
                          alt=""
                          src={deletar}
                          style={{
                            margin: 0,
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
          </div>
          <div className="button-selected"
            style={{ display: id != null ? 'flex' : 'none', width: '80%', alignSelf: 'center', margin: 20 }}
            onClick={() => limpaCampos()}
          >
            {opcoesprescricao.filter(item => item.id_componente_pai == id_componente_pai).map(item => item.nome_item)}
          </div>
          <InputsAndComponentes></InputsAndComponentes>
        </div>
      </div>
    )
  };

  function ComponentesRegistrados() {
    return (
      <div id="lista de componentes para o item pescrito">
        <div className='text1'>COMPONENTES REGISTRADOS PARA O ITEM SELECIONADO</div>
        <div
          className='scroll cor0'
          style={{
            display: 'flex',
            height: 230, width: '40vw'
          }}
        >
          {opcoesprescricao.filter(valor => id_componente_pai != null && valor.id_componente_filho == id_componente_pai).map(item => (
            <div
              className='button'
              key={item.id}
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <div style={{ marginLeft: 5 }}>
                {item.nome_item}
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <input id={"inputQtdeComplemento " + item.id}
                  className="input"
                  autoComplete="off"
                  placeholder="QTDE"
                  inputMode='numeric'
                  onKeyUp={() => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                      var valor = document.getElementById("inputQtdeComplemento " + item.id).value;
                      if (isNaN(valor) == true) {
                        document.getElementById("inputQtdeComplemento " + item.id).value = '';
                        document.getElementById("inputQtdeComplemento " + item.id).focus();
                      } else {
                        updateOpcaoComplementoPrescricao(item, valor);
                      }
                    }, 1000);
                  }}
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'QTDE')}
                  style={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    minHeight: 40,
                    margin: 0,
                    marginRight: 5
                  }}
                  type="text"
                  defaultValue={item.qtde_item}
                  maxLength={3}
                ></input>
                <div className='button-yellow'
                  style={{ margin: 0, width: 40, height: 40, minWidth: 40, minHeight: 40 }}
                  title={'EXCLUIR COMPLEMENTO.'}
                  onClick={() => { deleteOpcaoItemPrescricao(item.id) }}>
                  <img
                    alt=""
                    src={deletar}
                    style={{
                      margin: 0,
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
    )
  }

  function ComponentesDisponiveis() {
    return (
      <div>
        <div style={{ display: 'flex', marginTop: 20 }} className='text1'>COMPONENTES DISPONÍVEIS PARA O ITEM SELECIONADO</div>
        <div id="scrollOpcoesComponentes" className='scroll cor0'
          style={{
            display: 'flex',
            height: 230, width: '40vw'
          }}>
          {opcoesprescricao.filter(item => item.id_componente_pai == null && item.id_componente_filho == null).map(item => (
            <div
              id={"optionItem " + item.id}
              className={'button'}
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
              key={item.id}
            >
              <div style={{ marginLeft: 5 }}>
                {item.nome_item}
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <div className={'button-green'}
                  style={{
                    display: item.id == id ? 'none' : 'flex',
                    margin: 0, width: 40, minWidth: 40, maxWidth: 40, height: 40, minHeight: 40, maxHeight: 40,
                  }}
                  title={'INSERIR COMO COMPONENTE DO ITEM SELECIONADO.'}
                  onClick={(e) => { insertOpcaoComponentePrescricao(item, id_componente_pai); e.stopPropagation() }}>
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
            </div>
          ))}
        </div>
      </div>
    )
  }

  const [arrayselector, setarrayselector] = useState([]);
  const [inputselector, setinputselector] = useState("");
  const [opcoesitensmenu, setopcoesitensmenu] = useState(0);

  const limpaCampos = () => {
    setid(null);
    setnome(null);
    setcategoria('CATEGORIA');
    setqtde(null);
    setvia('VIA');
    setfreq('FREQ');
    setobs(null);
  }

  const InputsAndComponentes = useCallback(() => {
    var timeout = null;
    return (
      <div style={{
        display: id != null ? 'flex' : 'none',
        flexDirection: 'column', justifyContent: 'center',
        width: '100%', alignSelf: 'center',
      }}>
        <div className='text1'>{'EDITAR ITEM SELECIONADO'}</div>
        <div id="inputs para nome e categoria do item."
          style={{
            display: 'flex',
            flexDirection: 'row', justifyContent: 'center',
            width: '100%',
            alignSelf: 'center',
            alignContent: 'center',
          }}>
          <input id="inputNome"
            className="input"
            autoComplete="off"
            placeholder="NOME DO ITEM"
            inputMode='text'
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'NOME DO ITEM...')}
            style={{
              margin: 5, width: '100%'
            }}
            onKeyUp={() => {
              clearTimeout(timeout);
              timeout = setTimeout(() => {
                setnome(document.getElementById("inputNome").value.toUpperCase());
                setTimeout(() => {
                  document.getElementById("inputNome").focus();
                }, 1000);
              }, 2000);
            }}
            type="text"
            defaultValue={nome}
            maxLength={200}
          ></input>
          <input id={"inputCategoria"}
            className='button'
            onClick={() => document.getElementById('categoriamenu').className = 'show'}
            style={{ margin: 5, paddingLeft: 10, paddingRight: 10, width: 300, caretColor: 'transparent' }}
            defaultValue={categoria}
          >
          </input>
        </div>
        <div id="inputs para quantidade, via e frequência."
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className='text1'>QTDE</div>
            <input id={"inputQtde"}
              className="input"
              autoComplete="off"
              placeholder="QTDE"
              inputMode='numeric'
              onKeyUp={() => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                  setqtde(document.getElementById("inputQtde").value);
                }, 1000);
              }}
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'QTDE')}
              style={{
                width: 50, minWidth: 50, maxWidth: 50,
                margin: 5,
              }}
              type="text"
              maxLength={3}
              defaultValue={qtde}
            ></input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className='text1'>VIA</div>
            <div id="inputVia"
              className='button'
              onClick={() => {
                setviewoptionsselector(1);
                setinputselector("inputVia");
                setarrayselector(vias);
              }}
              style={{
                display: 'flex',
                width: 50, minWidth: 50, maxWidth: 50,
                margin: 5
              }}>
              {via}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className='text1'>FREQ</div>
            <div id="inputFreq"
              className="button"
              onClick={() => {
                setviewoptionsselector(1);
                setinputselector("inputFreq");
                setarrayselector(arrayfreq);
              }}
              style={{
                width: 50, minWidth: 50, maxWidth: 50,
                margin: 5,
              }}
              type="text"
            >
              {freq}
            </div>
          </div>
          <div id="input para observações."
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className='text1'>OBSERVAÇÕES</div>
            <textarea id={"inputObservacoes"}
              className="textarea"
              autoComplete="off"
              placeholder="OBSERVAÇÕES"
              inputMode='text'
              onKeyUp={() => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                  setobs(document.getElementById("inputObservacoes").value.toUpperCase());
                  setTimeout(() => {
                    document.getElementById("inputObservacoes").focus();
                    document.getElementById("inputObservacoes").selectionStart = document.getElementById("inputObservacoes").value.length;
                  }, 1000);
                }, 2000);
              }}
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'OBSERVAÇÕES...')}
              style={{
                width: 400,
                margin: 5,
                alignSelf: 'center'
              }}
              type="text"
              maxLength={2000}
              defaultValue={obs}
            ></textarea>
          </div>
        </div>
        <div id="botões para salvar ou atualizar o item de prescrição"
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center',
            alignContent: 'center', alignItems: 'center', alignSelf: 'center'
          }}>
          <div className='button-green'
            style={{
              display: 'flex',
              opacity: id != null && nome != null && qtde != null && via != 'VIA' && freq != 'FREQ' ? 1 : 0.5, flexDirection: 'row', margin: 5, width: 150, height: 50,
              pointerEvents: id != null && nome != null && qtde != null && via != 'VIA' && freq != 'FREQ' ? 'auto' : 'none'
            }}
            title={'ATUALIZAR ITEM'}
            onClick={() => {
              updateOpcaoItemPrescricao(id);
            }}>
            <img
              alt=""
              src={refresh}
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
    // eslint-disable-next-line
  }, [opcoesprescricao, arrayopcoesprescricao, id, inputselector, arrayselector, via, freq, obs, categoria, qtde, id, nome]);
  // seletor para as opções de via e frequência de administração do item de prescrição na tela de configurações.
  const [viewoptionsselector, setviewoptionsselector] = useState(0)
  function OptionsSelector() {
    return (
      <div
        className='fundo'
        onClick={() => setviewoptionsselector(0)}
        style={{ display: viewoptionsselector == 1 ? 'flex' : 'none' }}
      >
        <div className="janela scroll"
          onClick={(e) => e.stopPropagation()}
        >
          {arrayselector.map(item => (
            <div
              onClick={() => {
                console.log(inputselector);
                setviewoptionsselector(0);
                if (inputselector == "inputFreq") {
                  setfreq(item);
                }
                if (inputselector == "inputVia") {
                  setvia(item);
                }
              }}
              className='button'
              style={{ width: 200 }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }
  function ManageOpcoesItensPrescricao() {
    return (
      <div
        className='fundo'
        onClick={() => setopcoesitensmenu(0)}
        style={{ display: opcoesitensmenu == 1 ? 'flex' : 'none' }}
      >
        <div
          className="janela scroll"
          style={{
            height: '100vh', width: '100vw',
            padding: 20,
            justifyContent: 'flex-start',
          }}
          onClick={(e) => e.stopPropagation()}>
          <FilterOpcoesItemPrescricao></FilterOpcoesItemPrescricao>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <ScrollOpcoesItens></ScrollOpcoesItens>
            <div style={{
              display: id == null ? 'none' : 'flex',
              flexDirection: 'column', justifyContent: 'flex-start', marginLeft: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(0,0,0, 0.2)', padding: 10
            }}>
              <ComponentesRegistrados></ComponentesRegistrados>
              <ComponentesDisponiveis></ComponentesDisponiveis>
            </div>
          </div>
          <OptionsSelector></OptionsSelector>
        </div>
      </div>
    )
  };

  // impressão da prescrição.
  function PrintPrescricao() {
    return (
      <div id="IMPRESSÃO - PRESCRIÇÃO"
        className="print"
        style={{ width: 2480, height: 3508, backgroundColor: 'red' }}
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
                  <Conteudo></Conteudo>
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

  function MontaPrazos({ freq }) {
    let arrayprazos = [];
    let inicio = moment().startOf('day');
    if (freq == 'AGORA') {
      arrayprazos.push(moment().format('DD/MM/YYHH:mm'));
    } else if (freq == '24/24H') {
      arrayprazos.push(inicio.add(1, 'day').add(10, 'hours').format('DD/MM/YYHH:mm'));
    } else if (freq == '12/12H') {
      arrayPrazos(arrayprazos, 22, 2, 12);
    } else if (freq == '8/8H') {
      arrayPrazos(arrayprazos, 16, 3, 8);
    } else if (freq == '6/6H') {
      arrayPrazos(arrayprazos, 18, 4, 6);
    } else if (freq == '4/4H') {
      arrayPrazos(arrayprazos, 16, 6, 4);
    } else if (freq == '3/3H') {
      arrayPrazos(arrayprazos, 15, 8, 3)
    } else if (freq == '2/2H') {
      arrayPrazos(arrayprazos, 14, 12, 2);
    } else if (freq == '2/2H') {
      arrayPrazos(arrayprazos, 14, 12, 2);
    } else if (freq == '1/1H') {
      arrayPrazos(arrayprazos, 14, 24, 1);
    } else if (freq == '8H') {
      arrayprazos.push(inicio.add(1, 'day').add(8, 'hours').format('DD/MM/YYHH:mm'));
    } else if (freq == '10H') {
      arrayprazos.push(inicio.add(1, 'day').add(10, 'hours').format('DD/MM/YYHH:mm'));
    } else if (freq == '12H') {
      arrayprazos.push(inicio.add(1, 'day').add(12, 'hours').format('DD/MM/YYHH:mm'));
    } else if (freq == '17H') {
      arrayprazos.push(inicio.add(17, 'hours').format('DD/MM/YYHH:mm'));
    } else if (freq == '20H') {
      arrayprazos.push(inicio.add(20, 'hours').format('DD/MM/YYHH:mm'));
    } else if (freq == '8H') {
      arrayprazos.push(inicio.add(22, 'hours').format('DD/MM/YYHH:mm'));
    }
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        alignContent: 'flex-start',
        alignSelf: 'flex-start',
        margin: 0, width: 400,
        fontSize: 8, fontFamily: 'Helvetica',
      }}>
        <div style={{ fontWeight: 'bold', width: '100%', textAlign: 'flex-start', margin: 5, marginBottom: 0 }}>APRAZAMENTOS</div>
        <div className='text1'
          style={{
            fontSize: 10,
            display: 'flex', justifyContent: 'flex-start',
            flexDirection: 'row', flexWrap: 'wrap',
          }}>
          {arrayprazos.map(item => (
            <div style={{
              margin: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
              alignContent: 'center', alignItems: 'center'
            }}>
              <div>{item.substring(0, 8)}</div>
              <div>{item.substring(8, 13)}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const arrayPrazos = (arrayprazos, horainicial, doses, intervalo) => {
    let inicio = moment().startOf('day');
    let i = 1;
    inicio = moment().startOf('day').add(horainicial, 'hours');
    arrayprazos.push(inicio.format('DD/MM/YYHH:mm'))
    while (i < doses) {
      inicio = inicio.add(intervalo, 'hours');
      arrayprazos.push(inicio.format('DD/MM/YYHH:mm'));
      i++;
    }
  }

  function Conteudo() {
    return (
      <div style={{
        display: 'table', flexDirection: 'column', justifyContent: 'space-between',
        fontFamily: 'Helvetica',
        breakInside: 'auto',
        whiteSpace: 'pre-wrap',
      }}>
        {arrayitensprescricao.filter(item => item.id_prescricao == idprescricao && item.id_componente_pai != null && item.id_componente_filho == null).map(item =>
        (
          < div style={{
            display: 'flex', flexDirection: 'column', width: '100%',
            breakInside: 'avoid',
            whiteSpace: 'pre-wrap',
            backgroundColor: (arrayitensprescricao.filter(item => item.id_prescricao == idprescricao && item.id_componente_pai != null && item.id_componente_filho == null).sort((a, b) => a.nome_item < b.nome_item ? -1 : 1).indexOf(item) + 1) % 2 == 0 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: 5, margin: 2.5,
          }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ margin: 5, width: 20 }}>{arrayitensprescricao.filter(item => item.id_prescricao == idprescricao && item.id_componente_pai != null && item.id_componente_filho == null).indexOf(item) + 1}</div>
              <div style={{ margin: 5, width: 440 }}>{item.nome_item}</div>
              <div style={{ margin: 5, width: 60 }}>{item.qtde_item}</div>
              <div style={{ margin: 5, width: 60 }}>{item.via}</div>
              <div style={{ margin: 5, width: 60 }}>{item.freq}</div>
              <div style={{ margin: 5, width: 200 }}>{item.agora != null ? 'AGORA' : item.acm != null ? 'ACM' : item.sn != null ? 'SN' : '-'}</div>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly',
              margin: 1.5, padding: 1.5, borderStyle: 'solid', borderColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 5,
            }}>
              <div id="observações"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', width: '100%', margin: 5, fontSize: 8 }}>
                <div style={{ margin: 1.5, fontWeight: 'bold', marginLeft: 0 }}>OBSERVAÇÕES:</div>
                <div style={{ width: '100%' }}>{item.obs}</div>
              </div>
              <div id="componentes"
                style={{
                  display: prescricao.filter(valor => valor.id_componente_filho == item.id_componente_pai).length > 0 ? 'flex' : 'none',
                  flexDirection: 'column', justifyContent: 'flex-start', margin: 5, fontSize: 8,
                }}>
                <div style={{ margin: 1.5, fontWeight: 'bold' }}>COMPONENTES:</div>
                <div id="LISTA DE COMPONENTES PARA IMPRESSÃO" style={{ width: '100%', fontSize: 8 }}>
                  {prescricao.filter(valor => valor.id_componente_filho == item.id_componente_pai).map(valor => (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                      <div style={{ margin: 1.5, width: 200 }}>{valor.nome_item}</div>
                      <div style={{ margin: 1.5, width: 60 }}>{valor.qtde_item}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div id="aprazamento">
                <MontaPrazos freq={item.freq}></MontaPrazos>
              </div>
            </div>
          </div>
        )
        )}
      </div>
    )
  }

  function printDiv() {
    console.log('PREPARANDO PRESCRIÇÃO PARA IMPRESSÃO');
    let printdocument = document.getElementById("IMPRESSÃO - PRESCRIÇÃO").innerHTML;
    var a = window.open('  ', 'DOCUMENTO PARA IMPRESSÃO');
    a.document.write('<html>');
    a.document.write(printdocument);
    a.document.write('</html>');
    a.print();
    a.close();
  }

  // MODELOS DE PRESCRIÇÃO.
  const copiaModeloPrescricao = (id_modelo_prescricao, key_modelo) => {
    console.log('ID: ' + id_modelo_prescricao);
    console.log('KEY MODELO: ' + key_modelo);
    // 1. inserindo o registro de prescrição.
    let nova_id_prescricao = null;
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data: moment(),
      status: 0, // 0 = não salva; 1 = salva (não pode excluir).
      id_profissional: usuario.id,
      nome_profissional: usuario.nome_usuario,
      registro_profissional: usuario.n_conselho,
    }
    axios.post(html + 'insert_prescricao', obj).then(() => {
      axios.get(html + 'list_prescricoes/' + atendimento).then((response) => {
        var x = response.data.rows;
        nova_id_prescricao = x.sort((a, b) => moment(a.data) < moment(b.data) ? -1 : 1).slice(-1).map(item => item.id).pop();
        console.log('ID DA PRESCRIÇÃO CRIADA: ' + nova_id_prescricao);
        // 2. inserindo os itens de prescrição.
        // eslint-disable-next-line
        axios.get(html + 'list_itens_model_prescricao/' + key_modelo).then((response) => {
          var y = response.data.rows;
          console.log('MODELOS DE ITENS COMPATÍVEIS: ' + y.length);
          console.log('NOVA ID PRESCRIÇÃO REVIEW: ' + nova_id_prescricao);
          // eslint-disable-next-line
          y.map(item => {
            var obj = {
              id_unidade: unidade,
              id_paciente: paciente,
              id_atendimento: atendimento,
              categoria: item.categoria,
              codigo_item: item.codigo_item,
              nome_item: item.nome_item,
              qtde_item: item.qtde_item,
              via: item.via,
              freq: item.freq,
              agora: item.agora,
              acm: item.acm,
              sn: item.sn,
              obs: item.obs,
              data: moment(),
              id_componente_pai: item.id_componente_pai,
              id_componente_filho: item.id_componente_filho,
              id_prescricao: nova_id_prescricao,
              id_pai: null,
            }
            axios.post(html + 'insert_item_prescricao', obj);
          });
        });
        loadPrescricao();
        loadItensPrescricao();
        setviewselectmodelosprescricao(0);
      });
    });
  }
  const [viewselectmodelosprescricao, setviewselectmodelosprescricao] = useState(0);
  function ViewSelectModeloPrescricao() {
    return (
      <div
        style={{ display: viewselectmodelosprescricao == 1 ? 'flex' : 'none' }}
        className='fundo'
        onClick={() => setviewselectmodelosprescricao(0)}
      >
        <div
          className='janela scroll'
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            maxHeight: '70vh', maxWidth: 520
          }}
        >
          <div className='text1'>{'MODELOS DE PRESCRIÇÃO PERSONALIZADOS'}</div>
          <div
            style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {modelosprescricao.map(item => (
              <div className='button'
                style={{ width: 150, height: 150, position: 'relative' }}
                onClick={() => copiaModeloPrescricao(item.id_modelo_prescricao, item.key_modelo)}
              >
                <div>
                  {item.nome_prescricao}
                </div>
                <div id="botão para deletar modelo de prescrição."
                  className="button-yellow"
                  onClick={(e) => { deleteModeloPrescricao(item.id_modelo_prescricao, item.key_modelo); e.stopPropagation() }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    display: 'flex',
                    alignSelf: 'center',
                    minHeight: 30, maxHeight: 30, minWidth: 30, maxWidth: 30
                  }}>
                  <img
                    alt=""
                    src={deletar}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  const [viewnomeprescricao, setviewnomeprescricao] = useState(0);
  function ViewNomePrescricao() {
    return (
      <div
        className="fundo"
        onClick={() => setviewnomeprescricao(0)}
        style={{ display: viewnomeprescricao == 1 ? 'flex' : 'none' }}
      >
        <div
          className="janela"
          onClick={(e) => e.stopPropagation()}>
          <input id={"inputNomeModeloPrescricao"}
            className="input"
            autoComplete="off"
            placeholder="NOME DO MODELO DE PRESCRIÇÃO..."
            inputMode='text'
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'QTDE')}
            style={{
              margin: 5,
              width: '40vw', maxWidth: '40vw'
            }}
            type="text"
            maxLength={50}
          ></input>
          <div id="botão para salvar modelo de prescrição."
            className='button-green'
            onClick={(e) => {
              if (document.getElementById("inputNomeModeloPrescricao").value != '') {
                createModeloPrescricao(idprescricao, document.getElementById("inputNomeModeloPrescricao").value);
                setviewnomeprescricao(0);
                loadModelosPrescricao();
              }
              e.stopPropagation();
            }}
          >
            <img
              alt=""
              src={salvar}
              style={{ width: 20, height: 20 }}
            ></img>
          </div>
        </div>
      </div >
    )
  }
  const createModeloPrescricao = (id_prescricao, titulo) => {
    // criando chave para o modelo de prescrição, que será repassado para os itens de prescrição a ele relacionados.
    let objetos = [];
    let arrayobjitens = [];
    let arrayobjcomponentes = [];
    let randommodel = Math.random();
    // criando registro de identificação do modelo de prescrição.
    var objmodelo = {
      id_usuario: usuario.id,
      nome_prescricao: titulo.toUpperCase(),
      key_modelo: randommodel
    }
    axios.post(html + 'insert_model_prescricao', objmodelo);
    // copiando os itens da prescrição selecionada que vão popular o modelo de prescrição.
    // eslint-disable-next-line
    arrayitensprescricao.filter(valor => valor.id_componente_pai != null && valor.id_prescricao == id_prescricao).map(valor => {
      let random = Math.random();
      var objitem = {
        id_modelo_prescricao: randommodel,
        id_unidade: parseInt(unidade),
        id_paciente: parseInt(paciente),
        id_atendimento: parseInt(atendimento),
        categoria: valor.categoria,
        codigo_item: valor.codigo_item,
        nome_item: valor.nome_item,
        qtde_item: parseInt(valor.qtde_item),
        via: valor.via,
        freq: valor.freq,
        agora: valor.agora,
        acm: valor.acm,
        sn: valor.sn,
        obs: valor.obs,
        data: moment(),
        id_componente_pai: random,
        id_componente_filho: null,
        id_prescricao: null,
        id_pai: null
      }
      arrayobjitens.push(objitem);
      // registrando os componentes relacionados aos itens de prescrição.
      // eslint-disable-next-line
      arrayitensprescricao.filter(item => item.id_componente_filho == valor.id_componente_pai && item.id_prescricao == id_prescricao).map(valor => {
        var objcomponente = {
          id_modelo_prescricao: randommodel,
          id_unidade: parseInt(unidade),
          id_paciente: parseInt(paciente),
          id_atendimento: parseInt(atendimento),
          categoria: valor.categoria,
          codigo_item: valor.codigo_item,
          nome_item: valor.nome_item,
          qtde_item: parseInt(valor.qtde_item),
          via: valor.via,
          freq: valor.freq,
          agora: valor.agora,
          acm: valor.acm,
          sn: valor.sn,
          obs: valor.obs,
          data: moment(),
          id_componente_pai: null,
          id_componente_filho: random,
          id_prescricao: null,
          id_pai: parseInt(valor.id_pai)
        }
        arrayobjcomponentes.push(objcomponente);
      });
    })
    objetos = arrayobjitens.concat(arrayobjcomponentes);
    console.log(objetos);
    //eslint-disable-next-line
    objetos.map(item => {
      console.log('PACK OBJETOS')
      axios.post(html + 'insert_item_model_prescricao', item);
    });
    loadModelosPrescricao();
    setidprescricao(0);
    localStorage.setItem("id", 0);
  }
  const deleteItemModeloPrescricao = (id) => {
    axios.get(html + 'delete_item_model_prescricao/' + id);
  }
  const deleteModeloPrescricao = (id_modelo_prescricao, key_modelo) => {
    console.log('ID_MODELO_PRESCRIÇÃO: ' + id_modelo_prescricao);
    console.log('KEY-MODELO: ' + key_modelo);

    axios.get(html + 'delete_model_prescricao/' + id_modelo_prescricao);
    axios.get(html + 'list_itens_model_prescricao/' + key_modelo).then((response) => {
      var x = response.data.rows;
      console.log(x);
      x.map(item => deleteItemModeloPrescricao(item.id));
      setviewselectmodelosprescricao(0);
      loadModelosPrescricao();
    });
  }

  // ### APRAZAMENTOS DE ITENS DA PRESCRIÇÃO PARA FARMÁCIA (DISPENSAÇÃO DAS MEDICAÇÕES) ### //
  const montaAprazamentos = (id, array) => {
    console.log('DISPARA APRAZAMENTOS PARA A FARMÁCIA');
    console.log(id);

    // eslint-disable-next-line
    array.filter(item => item.freq == 'AGORA' && item.id_prescricao == id).map(item => {
      let id_componente_pai = item.id_componente_pai;
      // montando aprazamento para o item de prescrição mapeado.
      montaHorarios(item, 1, moment());
      // montando aprazamento para os componentes do item de prescrição mapeado. 
      // eslint-disable-next-line
      array.filter(valor => valor.id_componente_filho == id_componente_pai && item.id_prescricao == id).map(valor => {
        montaHorarios(valor, 1, moment());
      });
    });

    // eslint-disable-next-line
    array.filter(item => item.freq == '1/1H' && item.id_prescricao == id).map(item => {
      let id_componente_pai = item.id_componente_pai;
      // montando aprazamento para o item de prescrição mapeado.
      montaHorarios(item, 24, moment().startOf('day').add(14, 'hours'));
      // montando aprazamento para os componentes do item de prescrição mapeado. 
      // eslint-disable-next-line
      array.filter(valor => valor.id_componente_filho == id_componente_pai && item.id_prescricao == id).map(valor => {
        montaHorarios(valor, 24, moment().startOf('day').add(14, 'hours'));
      });
    });

    // eslint-disable-next-line
    array.filter(item => item.freq == '2/2H' && item.id_prescricao == id).map(item => {
      let id_componente_pai = item.id_componente_pai;
      // montando aprazamento para o item de prescrição mapeado.
      montaHorarios(item, 12, moment().startOf('day').add(14, 'hours'));
      // montando aprazamento para os componentes do item de prescrição mapeado. 
      // eslint-disable-next-line
      array.filter(valor => valor.id_componente_filho == id_componente_pai && item.id_prescricao == id).map(valor => {
        montaHorarios(valor, 12, moment().startOf('day').add(14, 'hours'));
      });
    });

    // eslint-disable-next-line
    array.filter(item => item.freq == '4/4H' && item.id_prescricao == id).map(item => {
      let id_componente_pai = item.id_componente_pai;
      // montando aprazamento para o item de prescrição mapeado.
      montaHorarios(item, 6, moment().startOf('day').add(16, 'hours'));
      // montando aprazamento para os componentes do item de prescrição mapeado. 
      // eslint-disable-next-line
      array.filter(valor => valor.id_componente_filho == id_componente_pai && item.id_prescricao == id).map(valor => {
        montaHorarios(valor, 6, moment().startOf('day').add(16, 'hours'));
      });
    });

    // eslint-disable-next-line
    array.filter(item => item.freq == '6/6H' && item.id_prescricao == id).map(item => {
      let id_componente_pai = item.id_componente_pai;
      // montando aprazamento para o item de prescrição mapeado.
      montaHorarios(item, 4, moment().startOf('day').add(18, 'hours'));
      // montando aprazamento para os componentes do item de prescrição mapeado. 
      // eslint-disable-next-line
      array.filter(valor => valor.id_componente_filho == id_componente_pai && item.id_prescricao == id).map(valor => {
        montaHorarios(valor, 4, moment().startOf('day').add(18, 'hours'));
      });
    });

    // eslint-disable-next-line
    array.filter(item => item.freq == '8/8H' && item.id_prescricao == id).map(item => {
      let id_componente_pai = item.id_componente_pai;
      // montando aprazamento para o item de prescrição mapeado.
      montaHorarios(item, 3, moment().startOf('day').add(16, 'hours'));
      // montando aprazamento para os componentes do item de prescrição mapeado. 
      // eslint-disable-next-line
      array.filter(valor => valor.id_componente_filho == id_componente_pai && item.id_prescricao == id).map(valor => {
        montaHorarios(valor, 3, moment().startOf('day').add(16, 'hours'));
      });
    });

    // eslint-disable-next-line
    array.filter(item => item.freq == '12/12H' && item.id_prescricao == id).map(item => {
      let id_componente_pai = item.id_componente_pai;
      // montando aprazamento para o item de prescrição mapeado.
      montaHorarios(item, 2, moment().startOf('day').add(22, 'hours'));
      // montando aprazamento para os componentes do item de prescrição mapeado. 
      // eslint-disable-next-line
      array.filter(valor => valor.id_componente_filho == id_componente_pai && item.id_prescricao == id).map(valor => {
        montaHorarios(valor, 2, moment().startOf('day').add(22, 'hours'));
      });
    });

    // eslint-disable-next-line
    array.filter(item => item.freq == '24/24H' && item.id_prescricao == id).map(item => {
      let id_componente_pai = item.id_componente_pai;
      // montando aprazamento para o item de prescrição mapeado.
      montaHorarios(item, 1, moment().startOf('day').add(1, 'day').add(10, 'hours'));
      // montando aprazamento para os componentes do item de prescrição mapeado. 
      // eslint-disable-next-line
      array.filter(valor => valor.id_componente_filho == id_componente_pai && item.id_prescricao == id).map(valor => {
        montaHorarios(valor, 1, moment().startOf('day').add(1, 'day').add(10, 'hours'));
      });
    });
  }

  // definindo os horários de incício dos aprazamentos, baseado do horário padrão de 13h.
  const montaHorarios = (item, qtde, horainicio) => {
    let arrayprazos = [moment(horainicio).format('DD/MM/YY - HH:mm')];
    let intervalo = parseInt(24 / qtde);
    for (var i = 0; i < qtde; i++) {
      horainicio = horainicio.add(intervalo, 'hours');
      arrayprazos.push(horainicio.format('DD/MM/YY - HH:mm'));
    }
    arrayprazos.map(valor => {
      var obj = {
        id_atendimento: atendimento,
        id_prescricao: item.id_prescricao,
        id_componente_pai: item.id_componente_pai,
        id_componente_filho: item.id_componente_filho,
        nome: item.nome_item,
        qtde: item.qtde_item,
        prazo: valor,
        dispensado: false,
        codigo_item: item.codigo_item,
      }
      axios.post(html + 'insert_aprazamento', obj);
      return null;
    })
  }

  return (
    <div className='card-aberto'
      style={{
        display: card == 'card-prescricao' ? 'flex' : 'none',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        margin: 0, padding: 0,
      }}>
      <div id="cadastro de prescrições e de atendimentos"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          margin: 0, padding: 0,
          width: 'calc(100% - 5px'
        }}>
        <div id="botões e pesquisa"
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center',
            alignSelf: 'center', width: 'calc(100% - 20px)', margin: 5, marginBottom: 0, marginRight: 0
          }}>
          <div className='button-yellow'
            style={{ margin: 0, width: 50, height: 50 }}
            title={'VOLTAR PARA O PASSÔMETRO'}
            onClick={() => setcard('')}>
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
          <div className='button-green'
            style={{ margin: 0, marginLeft: 5, width: 50, height: 50 }}
            title={'GERENCIADOR DE ITENS DE PRESCRIÇÃO'}
            onClick={() => { setopcoesitensmenu(1); limpaCampos() }}>
            <img
              alt=""
              src={preferencias}
              style={{
                margin: 0,
                height: 30,
                width: 30,
              }}
            ></img>
          </div>
          <div className='button-grey'
            style={{
              margin: 0, marginLeft: 5, marginRight: 0,
              width: 150, height: 50,
              borderTopRightRadius: 0, borderBottomRightRadius: 0,
            }}>
            {'LEITO ' + objatendimento.leito}
          </div>
          <div className='button'
            style={{
              margin: 0, marginLeft: 0, marginRight: 0, width: '100%', height: 50,
              borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
            }}>
            {objatendimento.nome_paciente}
          </div>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center',
        }}>
          <ListaItensPrescricoes></ListaItensPrescricoes>
          <ListaPrescricoes></ListaPrescricoes>
        </div>
        <ViewItemVia></ViewItemVia>
        <ViewItemFreq></ViewItemFreq>
        <ViewItemCondicao></ViewItemCondicao>
        <ManageOpcoesItensPrescricao></ManageOpcoesItensPrescricao>
        <Categoria></Categoria>
        <ViewSelectModeloPrescricao></ViewSelectModeloPrescricao>
        <PrintPrescricao></PrintPrescricao>
        <ViewNomePrescricao></ViewNomePrescricao>
      </div>
    </div>
  );
}

export default Prescricao;