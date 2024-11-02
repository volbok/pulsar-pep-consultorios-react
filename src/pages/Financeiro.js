/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import Context from './Context';
import axios from 'axios';
import moment from "moment";
// componentes.
import DatePicker from '../components/DatePicker';
// imagens.
import novo from '../images/novo.svg';
import salvar from '../images/salvar.svg';
import deletar from '../images/deletar.svg';
import back from '../images/back.svg';

function Financeiro() {

  // context.
  const {
    pagina, setpagina,
    html,
    setviewdatepicker,
  } = useContext(Context);

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'FINANCEIRO') {
      loadFinanceiro();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // history (router).
  let history = useHistory();

  // CRUD FINANCEIRO.
  const [listfinanceiro, setlistfinanceiro] = useState([]);
  const [arraylistfinanceiro, setarraylistfinanceiro] = useState([]);
  const loadFinanceiro = () => {
    axios.get(html + "all_financeiro").then((response) => {
      var x = response.data.rows;
      console.log(x);
      setlistfinanceiro(response.data.rows);
      setarraylistfinanceiro(response.data.rows);
    });
  }

  const insertFinanceiro = (tipo, recorrencia) => {
    var obj = {
      tipo: tipo,
      recorrencia: recorrencia,
      pessoa_fisica: document.getElementById("input_pessoa_fisica").value,
      pessoa_juridica: document.getElementById("input_pessoa_juridica").value,
      cpf: document.getElementById("input_cpf").value,
      cnpj: document.getElementById("input_cnpj").value,
      valor: document.getElementById("input_valor").value,
      status: localStorage.getItem('status'),
      telefone: document.getElementById("input_telefone").value,
      e_mail: document.getElementById("input_email").value,
      observacoes: document.getElementById("input_observacoes").value,
      imagem: null,
      data_vencimento: moment(localStorage.getItem('data1'), 'DD/MM/YYYY'),
      data_recebimento: moment(localStorage.getItem('data2'), 'DD/MM/YYYY'),
      data_pagamento: moment(localStorage.getItem('data2'), 'DD/MM/YYYY'),
    }
    console.log(obj);
    axios.post(html + 'insert_financeiro/', obj).then(() => {
      console.log('REGISTRO FINANCEIRO INSERIDO');
      setTimeout(() => {
        // loadFinanceiro();
      }, 3000);
    })
  }
  const updateFinanceiro = (item) => {
    var obj = {
      tipo: item.tipo,
      recorrencia: item.recorrencia,
      pessoa_fisica: document.getElementById("input_pessoa_fisica").value,
      pessoa_juridica: document.getElementById("input_pessoa_juridica").value,
      cpf: document.getElementById("input_cpf").value,
      cnpj: document.getElementById("input_cnpj").value,
      valor: document.getElementById("input_valor").value,
      status: localStorage.getItem('status'),
      telefone: document.getElementById("input_telefone").value,
      e_mail: document.getElementById("input_email").value,
      observacoes: document.getElementById("input_observacoes").value,
      imagem: null,
      data_vencimento: moment(localStorage.getItem('data1'), 'DD/MM/YYYY'),
      data_recebimento: moment(localStorage.getItem('data2'), 'DD/MM/YYYY'),
      data_pagamento: moment(localStorage.getItem('data2'), 'DD/MM/YYYY'),
    }
    console.log(obj);
    axios.post(html + 'update_financeiro/' + item.id, obj).then(() => {
      console.log('REGISTRO FINANCEIRO ATUALIZADO');
      loadFinanceiro();
    })
  }
  const deleteFinanceiro = (id) => {
    axios.get(html + "delete_financeiro/" + id).then(() => {
      console.log('DELETANDO REGISTRO FINANCIERO');
      loadFinanceiro();
    });
  };

  function MenuFinanceiro() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignSelf: 'center' }}>
        <div id="botão para exibir apenas receitas"
          className="button green" style={{ width: 150, alignSelf: 'center' }}
          onClick={() => {
            setarraylistfinanceiro(listfinanceiro.filter(item => item.tipo == 'RECEITA'));
          }}>
          RECEITAS
        </div>
        <div id="botão para exibir apenas despesas"
          className="button red" style={{ width: 150, alignSelf: 'center' }}
          onClick={() => {
            setarraylistfinanceiro(listfinanceiro.filter(item => item.tipo == 'DESPESA'));
          }}>
          DESPESAS
        </div>
        <div id="botão para exibir apenas receitas"
          className="button" style={{ width: 150, alignSelf: 'center' }}
          onClick={() => {
            setarraylistfinanceiro(listfinanceiro.filter(item => item.tipo != null));
          }}>
          TUDO
        </div>
        <div id="botão para sair da tela de controle financeiro"
          className="button-green" style={{ maxHeight: 50, maxWidth: 50, alignSelf: 'center' }}
          onClick={() => {
            setformfinanceiro(1);
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

  const filterbutton = (mes) => {
    return (
      <div className={arraylistfinanceiro.filter(item => moment(item.data_vencimento).format('MMM/YY') == mes).length > 0 ? 'button red' : 'button'}
        style={{ width: 150, minWidth: 150 }}
        onClick={() => setarraylistfinanceiro(listfinanceiro.filter(item => moment(item.data_vencimento).format('MMM/YY') == mes))}
      >
        {mes.toUpperCase()}
      </div>
    )
  }

  const arraymonths = [
    moment().startOf('month').subtract(6, 'months').format('MMM/YY'),
    moment().startOf('month').subtract(5, 'months').format('MMM/YY'),
    moment().startOf('month').subtract(4, 'months').format('MMM/YY'),
    moment().startOf('month').subtract(3, 'months').format('MMM/YY'),
    moment().startOf('month').subtract(2, 'months').format('MMM/YY'),
    moment().startOf('month').subtract(1, 'month').format('MMM/YY'),
    moment().startOf('month').format('MMM/YY'),
    moment().startOf('month').add(1, 'month').format('MMM/YY'),
    moment().startOf('month').add(2, 'months').format('MMM/YY'),
    moment().startOf('month').add(3, 'months').format('MMM/YY'),
    moment().startOf('month').add(4, 'months').format('MMM/YY'),
    moment().startOf('month').add(5, 'months').format('MMM/YY'),
    moment().startOf('month').add(6, 'months').format('MMM/YY'),
  ]

  function Filtros() {
    return (
      <div
        className='scroll'
        style={{
          display: 'flex', flexDirection: 'row',
          justifyContent: 'flex-start',
          alignSelf: 'center',
          height: 85, minHeight: 85, width: '89vw',
          overflowY: 'hidden', overflowX: 'scroll',
        }}>
        {arraymonths.map(item => (
          filterbutton(item)
        ))}
      </div>
    )
  }

  const campoFormFinanceiro = (titulo, input, campo, tamanho, altura) => {
    return (
      <div id={titulo}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="text1">{titulo}</div>
        <textarea
          autoComplete="off"
          placeholder={titulo}
          className="textarea"
          type="text"
          id={input}
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => (e.target.placeholder = titulo)}
          // eslint-disable-next-line
          defaultValue={formfinanceiro == 2 ? eval('selectedregistrofinanceiro.' + campo) : ''}
          style={{
            flexDirection: "center",
            justifyContent: "center",
            alignSelf: "center",
            width: tamanho,
            padding: 15,
            height: altura,
            minHeight: altura,
            maxHeight: altura,
          }}
        ></textarea>
      </div>
    )
  }

  const statusdespesa = [
    {
      status: 'A VENCER',
      cor: '#F7DC6F'
    },
    {
      status: 'VENCIDA',
      cor: '#EC7063'
    },
    {
      status: 'PAGA',
      cor: 'rgb(82, 190, 128, 1)'
    },
  ]
  const statusreceita = [
    {
      status: 'PENDENTE',
      cor: '#F7DC6F'
    },
    {
      status: 'RECEBIDA',
      cor: 'rgb(82, 190, 128, 1)'
    },
  ]

  const [tipo, settipo] = useState('DESPESA');
  const [formfinanceiro, setformfinanceiro] = useState(0);
  function FormFinanceiro() {
    <DatePicker></DatePicker>
    const [status, setstatus] = useState(localStorage.getItem('status'));
    const [menustatus, setmenustatus] = useState(0);
    function MenuStatus() {
      return (
        <div
          className="fundo"
          style={{ display: menustatus > 0 ? "flex" : "none" }}
          onClick={() => {
            setmenustatus(0);
          }}
        >
          <div className="janela scroll">
            <div id="opções para receitas"
              style={{ display: tipo == 'RECEITA' ? 'flex' : 'none', flexDirection: 'column' }}
            >
              {statusreceita.map(item => (
                <div
                  key={'opcoes_receita ' + Math.random()}
                  className='button'
                  style={{ width: 150, backgroundColor: item.cor }}
                  onClick={() => {
                    localStorage.setItem('status', item.status);
                    setstatus(item);
                    setmenustatus(0)
                  }}
                >
                  {item.status}
                </div>
              ))}
            </div>
            <div id="opções para despesas"
              style={{ display: tipo == 'DESPESA' ? 'flex' : 'none' }}
            >
              {statusdespesa.map(item => (
                <div
                  key={'opcoes_despesa ' + Math.random()}
                  className='button'
                  style={{ width: 150, backgroundColor: item.cor }}
                  onClick={() => {
                    localStorage.setItem('status', item.status);
                    setstatus(item);
                    setmenustatus(0)
                  }}
                >
                  {item.status}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className="fundo"
        style={{ display: formfinanceiro > 0 ? "flex" : "none" }}
        onClick={() => {
          setformfinanceiro(0);
        }}
      >
        <div className="janela scroll"
          onClick={(e) => e.stopPropagation()}
          style={{ height: '80vh' }}
        >
          <MenuStatus></MenuStatus>
          <div className='text1'>
            {formfinanceiro == 1 ? 'INSERIR REGISTRO FINANCEIRO' : 'ATUALIZAR REGISTRO FINANCEIRO'}</div>
          <div id="tipo de registro"
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div
              className={tipo == 'DESPESA' ? 'button-red' : 'button'}
              style={{ width: 150 }}
              onClick={() => {
                settipo('DESPESA');
                localStorage.setItem("tipo", "DESPESA");
              }}
            >
              DESPESA
            </div>
            <div
              className={tipo == 'RECEITA' ? 'button green' : 'button'}
              style={{ width: 150 }}
              onClick={() => {
                settipo('RECEITA');
                localStorage.setItem("tipo", "RECEITA");
              }}
            >
              RECEITA
            </div>
          </div>

          <div id="data de vencimento">
            <div className='text1'>DATA DE VENCIMENTO</div>
            <div className='button'
              style={{
                width: 200,
              }}
              onClick={() => setviewdatepicker(1)}
            >
              {moment(localStorage.getItem('data1'), 'DD/MM/YYYY').format('DD/MM/YYYY')}
            </div>
          </div>
          <div id="data de recebimento ou pagamento">
            <div className='text1'>{tipo == 'DESPESA' ? 'DATA DE PAGAMENTO' : 'DATA DE RECEBIMENTO'}</div>
            <div className='button'
              style={{
                width: 200,
              }}
              onClick={() => setviewdatepicker(2)}
            >
              {moment(localStorage.getItem('data2'), 'DD/MM/YYYY').format('DD/MM/YYYY')}
            </div>
          </div>

          <div id="campos do registro financeiro">
            {campoFormFinanceiro('NOME DA PESSOA FÍSICA/JURÍDICA', 'input_pessoa_fisica', 'pessoa_fisica', 400, 20)}
            {campoFormFinanceiro('DESCRIÇÃO', 'input_pessoa_juridica', 'pessoa_juridica', 400, 20)}
            {campoFormFinanceiro('CPF', 'input_cpf', 'cpf', 150, 20)}
            {campoFormFinanceiro('CNPJ', 'input_cnpj', 'cnpj', 150, 20)}
            {campoFormFinanceiro('VALOR', 'input_valor', 'valor', 150, 20)}
          </div>
          <div className='text1'>STATUS DO LANÇAMENTO</div>
          <div id="status do registro financeiro">
            <div className='button'
              style={{
                width: 200,
                backgroundColor: status != null ? status.cor : ''
              }}
              onClick={() => setmenustatus(1)}
            >
              {status != null ? status.status : 'SELECIONE'}
            </div>
          </div>
          <div id="campos do registro financeiro">
            {campoFormFinanceiro('TELEFONE', 'input_telefone', 'telefone', 150, 20)}
            {campoFormFinanceiro('E-MAIL', 'input_email', 'telefone', 300, 20)}
            {campoFormFinanceiro('OBSERVAÇÕES', 'input_observacoes', 'observacoes', 400, 100, 20)}
          </div>

          <div id="botão salvar registro financeiro"
            className="button-green"
            style={{ maxHeight: 50, maxWidth: 50, alignSelf: 'center' }}
            onClick={() => {
              if (formfinanceiro == 1) {
                insertFinanceiro(localStorage.getItem("tipo"), 'NÃO');
              } else {
                updateFinanceiro(selectedregistrofinanceiro);
              }
              setformfinanceiro(0);
            }}>
            <img
              alt=""
              src={salvar}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
        </div>
      </div>
    )
  }

  const [selectedregistrofinanceiro, setselectedregistrofinanceiro] = useState([]);
  function HeaderListaDeRegistrosFinanceiros() {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          marginBottom: 0, paddingBottom: 0,
        }}>
        <div className="button"
          style={{
            width: 70, minWidth: 70, maxWidth: 70, fontSize: 12,
            backgroundColor: 'transparent'
          }}
        >
          TIPO
        </div>
        <div className='text2' style={{
          width: '30vw', minWidth: '20vw', maxWidth: '30vw',
          fontSize: 12
        }}>
          PESSOA FÍSICA/JURÍDICA
        </div>
        <div className='text2'
          style={{ width: 70, minWidth: 70, maxWidth: 70, fontSize: 12 }}>
          VALOR
        </div>
        <div className='text2'
          style={{ width: 70, minWidth: 70, maxWidth: 70, fontSize: 12 }}>
          DATA DE PAGTO
        </div>
        <div className='text2'
          style={{ width: 70, minWidth: 70, maxWidth: 70, fontSize: 12 }}>
          DATA DE RCBTO
        </div>
        <div className='text2'
          style={{ width: 70, minWidth: 70, maxWidth: 70, fontSize: 12 }}>
          DATA DE VCTO
        </div>
        <div className='button'
          style={{
            width: 70, minWidth: 70, maxWidth: 70, fontSize: 12,
            backgroundColor: 'transparent',
          }}>
          STATUS
        </div>
        <div id="botão para sair da tela de controle financeiro"
          className="button-red" style={{
            maxHeight: 50, maxWidth: 50, alignSelf: 'center',
            backgroundColor: 'transparent'
          }}
        ></div>
      </div >
    )
  }

  // balanço financeiro total.
  function BalancoGeral() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className='button' style={{
          width: 250, height: 100,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div>TOTAL DE RECEITAS RECEBIDAS</div>
          <div>{'R$ ' + somavalores(listfinanceiro.filter(item => item.tipo == 'RECEITA' && item.status == 'RECEBIDA'))}</div>
        </div>
        <div className='button' style={{
          width: 250, height: 100,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div>TOTAL DE DESPESAS PAGAS</div>
          <div>{'R$ ' + somavalores(listfinanceiro.filter(item => item.tipo == 'DESPESA' && item.status == 'PAGA'))}</div>
        </div>
        <div className='button' style={{
          width: 250, height: 100,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div>SALDO</div>
          <div>
            {'R$ ' + (
              somavalores(listfinanceiro.filter(item => item.tipo == 'RECEITA' && item.status == 'RECEBIDA'))
              -
              somavalores(listfinanceiro.filter(item => item.tipo == 'DESPESA' && item.status == 'PAGA'))
            )}
          </div>
        </div>
      </div>
    )
  }

  // balanço financeiro filtrado para o mês selecionado.
  function CardsFinanceiros() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className='button green' style={{
          width: 100, height: 100,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div>RECEITAS RECEBIDAS</div>
          <div>{'R$ ' + somavalores(arraylistfinanceiro.filter(item => item.tipo == 'RECEITA' && item.status == 'RECEBIDA'))}</div>
        </div>
        <div className='button yellow' style={{
          width: 100, height: 100,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div>RECEITAS A RECEBER</div>
          <div>{'R$ ' + somavalores(arraylistfinanceiro.filter(item => item.tipo == 'RECEITA' && item.status == 'PENDENTE'))}</div>
        </div>
        <div className='button yellow' style={{
          width: 100, height: 100,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div>DESPESAS A VENCER</div>
          <div>{'R$ ' + somavalores(arraylistfinanceiro.filter(item => item.tipo == 'DESPESA' && item.status == 'A VENCER'))}</div>
        </div>
        <div className='button red' style={{
          width: 100, height: 100,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div>DESPESAS PAGAS</div>
          <div>{'R$ ' + somavalores(arraylistfinanceiro.filter(item => item.tipo == 'DESPESA' && item.status == 'PAGA'))}</div>
        </div>
        <div className='button grey' style={{
          width: 100, height: 100,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div>SALDO</div>
          <div>
            {'R$ ' + (
              somavalores(arraylistfinanceiro.filter(item => item.tipo == 'RECEITA' && item.status == 'RECEBIDA'))
              -
              somavalores(arraylistfinanceiro.filter(item => item.tipo == 'DESPESA' && item.status == 'PAGA'))
            )}
          </div>
        </div>
      </div>
    )
  }

  const somavalores = (array) => {
    let total = 0;
    array.map(item => total = total + parseFloat(item.valor));
    return total;
  }

  function ListaDeRegistrosFinanceiros() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        width: '90vw', alignSelf: 'center', marginBottom: 20
      }}>
        <HeaderListaDeRegistrosFinanceiros></HeaderListaDeRegistrosFinanceiros>
        <div style={{
          display: 'flex', flexDirection: 'column',
          backgroundColor: 'white', borderRadius: 5, marginTop: -10,
        }}>
          {arraylistfinanceiro.sort((a, b) => moment(a.data_vencimento) > moment(b.data_vencimento) ? -1 : 1).map(item => (
            <div
              key={'financeiro' + Math.ceil}
              onClick={() => {
                setselectedregistrofinanceiro(item);
                settipo(item.tipo);
                localStorage.setItem('status', item.status);
                localStorage.setItem('data1', moment(item.data_vencimento).format('DD/MM/YYYY'));
                localStorage.setItem('data2', moment(item.data_recebimento).format('DD/MM/YYYY'));
                console.log(item.tipo);
                setformfinanceiro(2);
              }}

              style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
              }}>

              <div className={item.tipo == 'DESPESA' ? 'button red' : 'button green'}
                style={{ width: 70, minWidth: 70, maxWidth: 70 }}
              >
                {item.tipo}
              </div>
              <div className='text1'
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '30vw', minWidth: '20vw', maxWidth: '30vw',
                  justifyContent: 'flex-start',
                }}>
                {item.pessoa_fisica}
              </div>
              <div className='text1'
                style={{ width: 70, minWidth: 70, maxWidth: 70 }}>
                {item.valor}
              </div>
              <div className='text1'
                style={{ width: 70, minWidth: 70, maxWidth: 70 }}>
                {item.tipo == 'DESPESA' ? moment(item.data_pagamento).format('DD/MM/YY') : '-x-'}
              </div>
              <div className='text1'
                style={{ width: 70, minWidth: 70, maxWidth: 70 }}>
                {item.tipo == 'RECEITA' ? moment(item.data_recebimento).format('DD/MM/YY') : '-x-'}
              </div>
              <div className='text1'
                style={{ width: 70, minWidth: 70, maxWidth: 70 }}>
                {item.data_vencimento != null ? moment(item.data_vencimento).format('DD/MM/YY') : '-x-'}
              </div>
              <div className={(item.status == 'PAGA' || item.status == 'RECEBIDA') ? 'button green' : item.status == 'A VENCER' ? 'button yellow' : 'button red'}
                style={{ width: 70, minWidth: 70, maxWidth: 70 }}>
                {item.status}
              </div>

              <div id="botão para sair da tela de controle financeiro"
                className="button-red" style={{ maxHeight: 50, maxWidth: 50, alignSelf: 'center' }}
                onClick={(e) => {
                  deleteFinanceiro(item.id);
                  e.stopPropagation();
                }}>
                <img
                  alt=""
                  src={deletar}
                  style={{ width: 30, height: 30 }}
                ></img>
              </div>
            </div>
          ))
          }
        </div>
      </div>
    )
  }

  return (
    <div id="tela de controle financeiro"
      className='main'
      style={{ display: pagina == 'FINANCEIRO' ? 'flex' : 'none' }}
    >
      <div
        className="chassi scroll"
        id="conteúdo do controle financeiro"
        style={{ width: 'calc(100vw - 20px)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div id="botão para sair da tela de controle financeiro"
            className="button-yellow" style={{ maxHeight: 50, maxWidth: 50, alignSelf: 'center' }}
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
          <div
            className='text1'
            style={{ display: 'flex', fontSize: 22 }}
          >
            FINANCEIRO
          </div>
        </div>

        <FormFinanceiro></FormFinanceiro>
        <BalancoGeral></BalancoGeral>
        <div className='text2'>{'BALANÇO DO MÊS SELECIONADO'}</div>
        <CardsFinanceiros></CardsFinanceiros>
        <MenuFinanceiro></MenuFinanceiro>
        <Filtros></Filtros>
        <ListaDeRegistrosFinanceiros></ListaDeRegistrosFinanceiros>
      </div>
    </div>
  )
}

export default Financeiro;