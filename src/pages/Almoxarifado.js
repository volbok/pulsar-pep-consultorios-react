/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from "moment";
// funções.
import maskdate from "../functions/maskdate";
// imagens.
import back from '../images/back.svg';
import novo from "../images/novo.svg";
import salvar from "../images/salvar.svg";

// router.
import { useHistory } from "react-router-dom";

function Almoxarifado() {

  // context.
  const {
    pagina, setpagina,
    html,
    almoxarifado, setalmoxarifado,
  } = useContext(Context);

  const loadAlmoxarifado = () => {
    axios.get(html + 'almoxarifado').then((response) => {
      setalmoxarifado(response.data.rows);
      setarrayalmoxarifado(response.data.rows);
    });
  }

  var timeout = null;
  const [arrayalmoxarifado, setarrayalmoxarifado] = useState([]);
  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'ALMOXARIFADO') {
      console.log('PÁGINA ALMOXARIFADO');
      loadAlmoxarifado();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // history (router).
  let history = useHistory();

  const [filteritem, setfilteritem] = useState("");
  var searchitem = "";
  const filterItem = () => {
    clearTimeout(timeout);
    document.getElementById("inputFilterNomeItem").focus();
    searchitem = document
      .getElementById("inputFilterNomeItem")
      .value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchitem == "") {
        setfilteritem("");
        setarrayalmoxarifado(almoxarifado);
        document.getElementById("inputFilterNomeItem").value = "";
        setTimeout(() => {
          document.getElementById("inputFilterNomeItem").focus();
        }, 100);
      } else {
        setfilteritem(document.getElementById("inputFilterNomeItem").value.toUpperCase());
        if (almoxarifado.filter((item) => item.nome_item.includes(searchitem)).length > 0) {
          setarrayalmoxarifado(almoxarifado.filter((item) => item.nome_item.includes(searchitem)));
          setTimeout(() => {
            document.getElementById("inputFilterNomeItem").value = searchitem;
            document.getElementById("inputFilterNomeItem").focus()
          }, 100)
        } else {
          setarrayalmoxarifado(almoxarifado.filter((item) => item.nome_item.includes(searchitem)));
          setTimeout(() => {
            document.getElementById("inputFilterNomeItem").value = searchitem;
            document.getElementById("inputFilterNomeItem").focus()
          }, 100)
        }
      }
    }, 1000);
  };
  // filtro de item por nome.
  function FilterItem() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '30vw', alignSelf: 'center' }}>
        <input
          className="input cor2"
          autoComplete="off"
          placeholder={
            "BUSCAR..."
          }
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) =>
            e.target.placeholder = "BUSCAR..."
          }
          onKeyUp={() => filterItem()}
          type="text"
          id="inputFilterNomeItem"
          defaultValue={filteritem}
          maxLength={100}
          style={{ width: '100%' }}
        ></input>
      </div>
    );
  }

  // atualizar item de almoxarifado.
  const updateItemAlmoxarifado = (item, liberado) => {
    let obj = {
      categoria: item.categoria,
      codigo_item: item.codigo_item,
      nome_item: item.nome_item,
      qtde_item: item.qtde_item,
      obs: item.obs,
      data_entrada: item.data_entrada,
      codigo_fornecedor: item.codigo_fornecedor,
      cnpj_fornecedor: item.cnpj_fornecedor,
      codigo_compra: item.codigo_compra,
      id_setor_origem: null,
      id_setor_destino: null,
      liberado: liberado,
    }
    axios.post(html + 'update_almoxarifado/' + item.id, obj).then(() => {
      console.log('ITEM DE ALMOXARIFADO ATUALIZADO COM SUCESSO.');
      loadAlmoxarifado();
    });
  }

  // lista de almoxarifado para filtragem das prescrições de exames laboratoriais.
  function ListaAlmoxarifado() {
    return (
      <div id="scroll lista de almoxarifado"
        className='grid'>
        {arrayalmoxarifado.sort((a, b) => a.nome_item > b.nome_item ? 1 : -1).map((item) => (
          <div className='button cor1opaque'
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 20,
            }}
            onClick={() => {
              localStorage.setItem("selected_item", JSON.stringify(item));
              console.log(JSON.parse(localStorage.getItem("selected_item")));
              setviewitem(2);
              setcategoria(item.categoria);
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
              <div id="identificador"
                className='button green'
                style={{
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-start', textAlign: 'left',
                  alignItems: 'flex-start', padding: 10,
                  width: '100%',
                  height: 75,
                }}
              >
                <div>
                  {item.nome_item}
                </div>
                <div style={{ margin: 2.5, marginLeft: 0 }}>
                  {'CÓD. ITEM: ' + item.codigo_item}
                </div>
              </div>
              <div className='button'
                style={{ position: 'relative', borderRadius: 5, backgroundColor: 'white', color: 'black' }}>
                {item.qtde_item}
                <div id="bloqueio de item"
                  className={item.liberado == 1 ? 'green' : 'red'}
                  style={{
                    width: 30, height: 30,
                    position: 'absolute', top: -20,
                    borderRadius: 50,
                    borderStyle: 'solid', borderWidth: 8,
                    borderColor: 'rgb(31, 122, 140, 1)',
                  }}
                  onClick={(e) => {
                    if (item.liberado == 1) {
                      updateItemAlmoxarifado(item, 0);
                    } else {
                      updateItemAlmoxarifado(item, 1);
                    }
                    e.stopPropagation();
                  }}
                >
                </div>
              </div>
            </div>

            <div
              id={"almoxarifado " + item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignContent: 'flex-start',
                alignItems: 'flex-start',
                marginLeft: 0,
                padding: 10,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            >
              <div>
                {'CÓD. COMPRA: ' + item.codigo_compra}
              </div>
              <div>
                {'CÓD. FORN: ' + item.codigo_fornecedor}
              </div>
              <div>
                {'CNPJ FORN: ' + item.cnpj_fornecedor}
              </div>
              <div>
                {'DATA DE ENTRADA: ' + moment(item.data_entrada).format('DD/MM/YY')}
              </div>
            </div>
          </div>
        ))
        }
      </div>
    )
    // eslint-disable-next-line
  };

  function Botoes() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'row', justifyContent: 'center',
        alignSelf: 'center', alignItems: 'center',
      }}>
        <div id="botão para sair da tela de laboratório"
          className="button-red" style={{ maxHeight: 50 }}
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
        <div id="botão para inserir item de almoxarifado."
          className="button-green" style={{ maxHeight: 50 }}
          onClick={() => {
            setviewitem(1);
          }}>
          <img
            alt=""
            src={novo}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
      </div>
    )
  }

  const checknumberinput = (valor, input) => {
    if (isNaN(valor) == true) {
      document.getElementById(input).value = '';
      document.getElementById(input).focus();
    }
  }

  // CATEGORIAS DE ITENS.
  let arraycategorias = ['0. DIETA', '1. ANTIMICROBIANOS', '2. DIVERSOS', '3. CURATIVOS', '4. CUIDADOS']
  const [categoria, setcategoria] = useState('CATEGORIA');

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

  const [viewitem, setviewitem] = useState(0);
  function ModalItemAlmoxarifado() {
    return (
      <div
        className="fundo"
        style={{ display: viewitem != 0 ? "flex" : "none" }}
        onClick={() => setviewitem(0)}
      >
        <div className="janela scroll"
          style={{ width: '90vw' }}
          onClick={(e) => e.stopPropagation()}>
          <div className='text3' style={{ margin: 10, padding: 0 }}>{viewitem == 1 ? 'INSERIR ITEM' : 'ATUALIZAR ITEM'}</div>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>CATEGORIA</div>
              <div id='categoria' className='button'
                style={{ width: 150 }}
                onClick={() => document.getElementById('categoriamenu').className = "show"}
              >
                {categoria}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>CÓDIGO DO ITEM</div>
              <input id="inputCodigoItem"
                className="input"
                autoComplete="off"
                placeholder="CÓDIGO DO ITEM"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "CÓDIGO DO ITEM")}
                type="text"
                defaultValue={viewitem == 2 ? JSON.parse(localStorage.getItem("selected_item")).codigo_item : ''}
                maxLength={10}
                style={{ width: 150 }}
                onKeyUp={() => {
                  clearTimeout(timeout);
                  timeout = setTimeout(() => {

                  }, 2000);
                }}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
              <div className='text1'>NOME DO ITEM</div>
              <input id="inputNomeItem"
                className="input"
                autoComplete="off"
                placeholder="NOME DO ITEM"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "NOME DO ITEM")}
                type="text"
                defaultValue={viewitem == 2 ? JSON.parse(localStorage.getItem("selected_item")).nome_item : ''}
                maxLength={200}
                style={{ minWidth: 300 }}
              >
              </input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>DATA DE ENTRADA</div>
              <input
                autoComplete="off"
                placeholder="DATA"
                className="input"
                type="text"
                inputMode="numeric"
                maxLength={10}
                id="inputDataEntrada"
                title="FORMATO: DD/MM/YYYY"
                onClick={() => document.getElementById("inputDataEntrada").value = ""}
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "ENTRADA")}
                onKeyUp={() => maskdate(2000, "inputDataEntrada")}
                defaultValue={viewitem == 2 ? moment(JSON.parse(localStorage.getItem("selected_item")).data_entrada).format('DD/MM/YYYY') : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  width: 150,
                  textAlign: "center",
                }}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>{'QUANTIDADE (UN.)'}</div>
              <input id="inputQtdeItem"
                className="input"
                autoComplete="off"
                placeholder="QUANTIDADE"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "QUANTIDADE")}
                onKeyUp={(e) => checknumberinput(e.target.value, "inputQtdeItem")}
                type="text"
                defaultValue={viewitem == 2 ? JSON.parse(localStorage.getItem("selected_item")).qtde_item : ''}
                maxLength={200}
                style={{ width: 150 }}
              >
              </input>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%', borderRadius: 5 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 5, width: 300 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div className='text1'>CÓDIGO DO FORNECEDOR</div>
                <input id="inputCodigoFornecedor"
                  className="input"
                  autoComplete="off"
                  placeholder="CÓD. FORNEC."
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "CÓD. FORNEC.")}
                  type="text"
                  defaultValue={viewitem == 2 ? JSON.parse(localStorage.getItem("selected_item")).codigo_fornecedor : ''}
                  maxLength={10}
                  style={{ width: 'calc(100% - 20px)' }}
                  onKeyUp={() => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {

                    }, 2000);
                  }}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div className='text1'>CNPJ DO FORNECEDOR</div>
                <input id="inputCnpjFornecedor"
                  className="input"
                  autoComplete="off"
                  placeholder="CNPJ FORNEC."
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "CNPJ FORNEC.")}
                  type="text"
                  defaultValue={viewitem == 2 ? JSON.parse(localStorage.getItem("selected_item")).cnpj_fornecedor : ''}
                  maxLength={10}
                  style={{ width: 'calc(100% - 20px)' }}
                  onKeyUp={() => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {

                    }, 2000);
                  }}
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div className='text1'>CÓDIGO DA COMPRA</div>
                <input id="inputCodigoCompra"
                  className="input"
                  autoComplete="off"
                  placeholder="CÓD. COMPRA"
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "CÓD. COMPRA")}
                  type="text"
                  defaultValue={viewitem == 2 ? JSON.parse(localStorage.getItem("selected_item")).codigo_compra : ''}
                  maxLength={10}
                  style={{ width: 'calc(100% - 20px)' }}
                  onKeyUp={() => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {

                    }, 2000);
                  }}
                ></input>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              <div className='text1'>OBSERVAÇÕES</div>
              <textarea
                autoComplete="off"
                placeholder="OBSERVAÇÕES"
                className="textarea"
                type="text"
                id="inputObsItem"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "OBSERVAÇÕES")}
                defaultValue={viewitem == 2 ? JSON.parse(localStorage.getItem("selected_item")).obs : ''}
                style={{
                  flexDirection: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  padding: 15,
                  width: 'calc(100% - 50px)',
                  height: '100%',
                }}
              ></textarea>
            </div>
          </div>
          <div style={{ display: 'none', flexDirection: 'row', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>SETOR DE ENTRADA</div>
              <div className='button' style={{ width: 200 }}>
                ORIGEM
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>FARMÁCIA DE DESTINO</div>
              <div className='button' style={{ width: 200 }}>
                DESTINO
              </div>
            </div>
          </div>
          <div id="btnUpdatePaciente"
            title={viewitem == 2 ? "ATUALIZAR DADOS DO ITEM" : "SALVAR REGISTRO DE ITEM"}
            className="button-green"
            onClick={() => {
              let obj = {
                categoria: categoria,
                codigo_item: document.getElementById("inputCodigoItem").value,
                nome_item: document.getElementById("inputNomeItem").value,
                qtde_item: document.getElementById("inputQtdeItem").value,
                obs: document.getElementById("inputObsItem").value,
                data_entrada: moment(document.getElementById("inputDataEntrada").value, 'DD/MM/YYYY'),
                codigo_fornecedor: document.getElementById("inputCodigoFornecedor").value,
                cnpj_fornecedor: document.getElementById("inputCnpjFornecedor").value,
                codigo_compra: document.getElementById("inputCodigoCompra").value,
                id_setor_origem: null,
                id_setor_destino: null,
                liberado: 1,
              }
              if (viewitem == 1) {
                // inserindo registro de almoxarifado.
                axios.post(html + 'insert_almoxarifado', obj).then(() => {
                  console.log('ITEM DE ALMOXARIFADO REGISTRADO COM SUCESSO.');
                  let localrandom = Math.random();
                  let obj = {}
                  obj = {
                    nome_item: document.getElementById("inputNomeItem").value,
                    categoria: categoria,
                    qtde_item: null,
                    via: null,
                    freq: null,
                    obs: null,
                    id_componente_filho: null,
                    id_componente_pai: localrandom,
                    codigo_item: document.getElementById("inputCodigoItem").value,
                  }
                  // inserindo item de prescrição.
                  axios.post(html + 'insert_opcoes_prescricao', obj).then(() => {
                    console.log('ITEM DE PRESCRIÇÃO REGISTRADO COM SUCESSO');
                  });
                  // inserindo o mesmo registro de almoxarifado, como componente de item de prescrição.
                  obj = {
                    nome_item: document.getElementById("inputNomeItem").value,
                    categoria: 'COMPONENTE',
                    qtde_item: null,
                    via: null,
                    freq: null,
                    obs: null,
                    id_componente_filho: null,
                    id_componente_pai: null,
                    codigo_item: document.getElementById("inputCodigoItem").value,
                  }
                  axios.post(html + 'insert_opcoes_prescricao', obj).then(() => {
                    console.log('ITEM DE PRESCRIÇÃO REGISTRADO COM SUCESSO');
                    loadAlmoxarifado();
                    setviewitem(0);
                  });
                });
              } else {
                // atualizando registro de almoxarifado.
                let id = JSON.parse(localStorage.getItem("selected_item")).id;
                axios.post(html + 'update_almoxarifado/' + id, obj).then(() => {
                  console.log('ITEM DE ALMOXARIFADO ATUALIZADO COM SUCESSO.');
                  loadAlmoxarifado();
                  setviewitem(0);
                });
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
        </div>
      </div >
    )
  }

  return (
    <div id="tela do almoxarifado"
      className='main'
      style={{
        display: pagina == 'ALMOXARIFADO' ? 'flex' : 'none'
      }}
    >
      <div className='chassi'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly',
        }}>
        <div
          style={{
            position: 'sticky', top: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            height: 'calc(100vh - 20px)',
          }}>
          <Botoes></Botoes>
          <FilterItem></FilterItem>
          <ListaAlmoxarifado></ListaAlmoxarifado>
          <ModalItemAlmoxarifado></ModalItemAlmoxarifado>
          <Categoria></Categoria>
        </div>
      </div>
    </div>
  )
}

export default Almoxarifado;