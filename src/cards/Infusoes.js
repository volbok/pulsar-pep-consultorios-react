/* eslint eqeqeq: "off" */
import React, { useCallback, useContext, useState, useEffect } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from 'moment';
// funções.
import toast from '../functions/toast';
// componentes.
import Bic from '../components/Bic';
import Gravador from '../components/Gravador';
// import toast from '../functions/toast';
import checkinput from '../functions/checkinput';
// imagens.
import salvar from '../images/salvar.svg';
import novo from '../images/novo.svg';
import power from '../images/power.svg';
import back from '../images/back.svg';

function Infusoes() {

  // context.
  const {
    html,
    settoast,
    atendimento,
    infusoes, setinfusoes,
    card, setcard,
    mobilewidth,
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-infusoes') {
      setselectedinputdroga(null);
      setselectedinputvazao(null);
      loadInfusoes();
    }
    // eslint-disable-next-line
  }, [card]);

  // carregando as evoluções do atendimento.
  const loadInfusoes = () => {
    axios.get(html + 'list_infusoes/' + atendimento).then((response) => {
      setinfusoes(response.data.rows);
    });
  }

  // atualizando uma infusão.
  /*
  Para que possamos acompanhar o histórico de cada droga, com suas variações de velocidade de infusão,
  precisamos atualizar a infusão selecionada como finalizada (definindo a data de término), e criar
  um novo registro com a nova velocidade de infusão.
  Isto continua válido caso o usuário altere também o nome da droga.
  */
  const [infusao, setinfusao] = useState(0);
  const updateInfusao = (item, data_inicio) => {
    // encerrando a infusão selecionada para atualização.
    var obj = {
      id_atendimento: atendimento,
      droga: item.droga,
      velocidade: item.velocidade,
      data_inicio: data_inicio,
      data_termino: moment(),
    }
    axios.post(html + 'update_infusao/' + item.id_infusao, obj).then(() => {
      var obj = {
        id_atendimento: atendimento,
        droga: document.getElementById(selectedinputdroga).value.toUpperCase(),
        velocidade: document.getElementById(selectedinputvazao).value,
        data_inicio: moment(),
        data_termino: null,
      }
      axios.post(html + 'insert_infusao', obj).then(() => {
        loadInfusoes();
        // toast(settoast, 'INFUSÃO ATUALIZADA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      });
    });
  }

  // inserindo uma infusão.
  const insertInfusao = () => {
    var obj = {
      id_atendimento: atendimento,
      droga: document.getElementById("inputDroga").value.toUpperCase(),
      velocidade: document.getElementById("inputVelocidade").value,
      data_inicio: moment(),
      data_termino: null,
    }
    axios.post(html + 'insert_infusao', obj).then(() => {
      loadInfusoes();
      setviewinsertinfusao(0);
      toast(settoast, 'INFUSÃO REGISTRADA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    })
  }

  // inserindo uma infusão.
  const insertVoiceInfusao = ([infusao]) => {
    var obj = {
      id_atendimento: atendimento,
      droga: infusao,
      velocidade: 10,
      data_inicio: moment(),
      data_termino: null,
    }
    axios.post(html + 'insert_infusao', obj).then(() => {
      loadInfusoes();
      setviewinsertinfusao(0);
      toast(settoast, 'INFUSÃO REGISTRADA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    })
  }


  // excluir uma infusão.
  /*
  const deleteInfusao = (infusao) => {
    axios.get(html + 'delete_infusao/' + infusao.id_infusao).then(() => {
      loadInfusoes();
      toast(settoast, 'INFUSÃO EXCLUÍDA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    })
  }
  */

  // registro de textarea por voz.
  const [selectedinputdroga, setselectedinputdroga] = useState(null);
  const [selectedinputvazao, setselectedinputvazao] = useState(null);
  function Botoes() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div id="botão de retorno"
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
        <Gravador funcao={insertVoiceInfusao} continuo={false}></Gravador>
        <div id="btnsalvarinfusão"
          className='button-green'
          style={{
            display: 'flex',
            alignSelf: 'center',
          }}
          onClick={(e) => {
            setviewinsertinfusao(1);
            e.stopPropagation();
          }}
        >
          <img
            alt=""
            src={novo}
            style={{
              margin: 10,
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
      </div>
    );
  }

  const [viewinsertinfusao, setviewinsertinfusao] = useState(0);
  const InsertInfusao = useCallback(() => {
    return (
      <div className="fundo" style={{ display: viewinsertinfusao == 1 ? 'flex' : 'none' }}
        onClick={(e) => { setviewinsertinfusao(0); e.stopPropagation() }}>
        <div className="janela" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className='text1'>DROGA, SOLUÇÃO OU ESQUEMA</div>
          <input
            className="input"
            autoComplete="off"
            placeholder='DROGA, SOLUÇÃO OU ESQUEMA...'
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'DROGA, SOLUÇÃO OU ESQUEMA...')}
            defaultValue={infusao.droga}
            style={{
              display: 'flex',
              flexDirection: 'center', justifyContent: 'center', alignSelf: 'center',
              whiteSpace: 'pre-wrap',
              width: window.innerWidth < mobilewidth ? '70vw' : '50vw',
            }}
            id="inputDroga"
            title="INSERIR AQUI O NOME DO FÁRMACO, SOLUÇÃO OU ESQUEMA PARA INFUSÃO CONTÍNUA."
          >
          </input>
          <div className='text1'>VELOCIDADE DE INFUSÃO</div>
          <input
            autoComplete="off"
            placeholder="VAZÃO..."
            className="input"
            type="text"
            inputMode='numeric'
            maxLength={4}
            id="inputVelocidade"
            title='VELOCIDADE DE INFUSÃO (ML/H).'
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'VAZÃO...')}
            onKeyUp={(e) => {
              if (isNaN(e.target.value) == true || e.target.value == '') {
                document.getElementById("inputVelocidade").value = '';
                document.getElementById("inputVelocidade").focus();
                e.stopPropagation();
              }
            }}
            style={{
              width: 75,
              height: 50,
            }}
          ></input>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div id="botão de retorno"
              className="button-yellow"
              style={{
                display: 'flex',
                alignSelf: 'center',
              }}
              onClick={() => setviewinsertinfusao(0)}>
              <img
                alt=""
                src={back}
                style={{ width: 30, height: 30 }}
              ></img>
            </div>
            <div id='btnsalvarinfusao' className='button-green'
              onClick={() => checkinput('input', settoast, ['inputDroga', "inputVelocidade"], "btnsalvarinfusao", insertInfusao, [])}
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
      </div>
    )
    // eslint-disable-next-line
  }, [viewinsertinfusao]);

  // gráfico com histórico de infusões.
  const graficoInfusoes = useCallback(() => {
    let datas = [];
    var inicio = moment().startOf('day').subtract(7, 'days');
    var termino = moment().startOf('day');
    while (termino.diff(inicio, 'days') > 0) {
      inicio = inicio.add(1, 'day');
      datas.push(inicio.format('DD/MM/YYYY'));
    }

    /*
    // retirando repetições da lista de infusões.
    var uniqueinfusoes = infusoes.sort((a, b) => moment(a.data_inicio) < moment(b.data_inicio) ? 1 : -1).filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.droga === value.droga
      ))
    )
   
    alternativa para uso de cores randômicas (fica feio, mas pode ser trabalhado com melhorias no futuro...).
    function giveRandomColors() {
      let randomColors = "#" + Math.floor(Math.random() * 16777215).toString(16);
      return randomColors;
    }
    */

    return (
      <div className='scroll'
        style={{
          display: 'flex',
          overflowX: 'scroll', overflowY: 'hidden', justifyContent: 'flex-start', flexDirection: 'row',
          width: window.innerWidth < mobilewidth ? '70vw' : '60vw',
          height: 285, minHeight: 285,
          marginTop: 5,
          alignSelf: 'center',
        }}>
        {datas.sort((a, b) => moment(a).milliseconds > moment(b).milliseconds ? 1 : -1).map(valor => (
          <div key={'datas ' + valor}>
            <div id={"drogas maepadas " + valor}
              className="scroll cor0"
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                borderColor: 'transparent',
                borderRadius: 5, margin: 5,
                height: 220, width: 200, minWidth: 200,
              }}>
              {infusoes.filter(item => moment(item.data_inicio).startOf('day') <= moment(valor, 'DD/MM/YYYY') && (moment(valor, 'DD/MM/YYYY') <= moment(item.data_termino).startOf('day') || item.data_termino == null))
                .sort((a, b) => moment(a.data_inicio) < moment(b.data_inicio) ? 1 : -1)
                .filter((value, index, self) => index === self.findIndex((t) => (t.droga === value.droga)))
                .map(item => (
                  <div key={'infusoes ' + item.id_infusao} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className={'button'}
                      style={{
                        flexDirection: 'column', justifyContent: 'center',
                        alignSelf: 'center',
                        width: 170,
                        borderRadius: 5,
                      }}>
                      <div>{item.droga}</div>
                      <div>{item.velocidade + ' ml/h'}</div>
                    </div>
                  </div>
                ))}
            </div>
            <div className='text1'>{moment(valor, 'DD/MM/YYYY').format('DD/MM')}</div>
          </div>
        ))}
      </div>
    )
    // eslint-disable-next-line
  }, [infusoes]);

  var timeout = null;
  return (
    <div id="scroll-infusao" className='card-aberto'
      style={{
        display: card == 'card-infusoes' ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'flex-start',
        alignContent: 'center', alignItems: 'center',
      }}
    >
      <div className="text3">INFUSÕES</div>
      <Botoes></Botoes>
      <div className='grid3'>
        {infusoes.filter(item => item.data_termino == null).sort((a, b) => moment(a.data_inicio) < moment(b.data_inicio) ? 1 : -1).map((item) => (
          <div className='pallete4'
            key={'infusão ' + item.id_infusao}
            style={{
              margin: 5,
              flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
              height: window.innerWidth < mobilewidth ? 230 : '',
              maxHeight: window.innerWidth < mobilewidth ? 230 : '',
              width: 220,
              borderRadius: 5,
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center', alignContent: 'center', alignSelf: 'center',
            }}>
              <div id="bic"
                style={{
                  position: 'relative', width: 160,
                  alignContent: 'center', alignItems: 'center',
                  marginRight: 45,
                }}>
                <Bic></Bic>
                <div id="botões da bic"
                  style={{
                    position: 'absolute', top: 102.5, right: 37,
                    display: 'flex', flexDirection: 'row', justifyContent: 'center',
                  }}>
                  <div id={"botão para encerrar infusão " + item.id_infusao} // o registro fica guardado no banco de dados.
                    className='button-red'
                    style={{ width: 25, minWidth: 25, height: 25, minHeight: 25 }}
                    onClick={(e) => {
                      // encerrando a infusão selecionada para atualização.
                      var obj = {
                        id_atendimento: atendimento,
                        droga: item.droga,
                        velocidade: item.velocidade,
                        data_inicio: item.data_inicio,
                        data_termino: moment(),
                      }
                      axios.post(html + 'update_infusao/' + item.id_infusao, obj).then(() => {
                        loadInfusoes();
                      })
                      e.stopPropagation();
                    }}>
                    <img
                      alt=""
                      src={power}
                      style={{
                        margin: 10,
                        height: 20,
                        width: 20,
                      }}
                    ></img>
                  </div>
                </div>
                <input id={"inputVelocidade " + item.id_infusao}
                  autoComplete="off"
                  placeholder="VAZÃO..."
                  className="input cor2"
                  type="text"
                  inputMode='numeric'
                  title='VELOCIDADE DE INFUSÃO (ML/H).'
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'VAZÃO...')}
                  defaultValue={item.velocidade}
                  onClick={(e) => {
                    setinfusao(item);
                    setselectedinputdroga("inputDroga " + item.id_infusao);
                    setselectedinputvazao("inputVelocidade " + item.id_infusao);
                    e.stopPropagation();
                  }}
                  onKeyUp={(e) => {
                    if (isNaN(e.target.value) == true || e.target.value == '') {
                      document.getElementById("inputVelocidade " + item.id_infusao).value = '';
                      document.getElementById("inputVelocidade " + item.id_infusao).focus();
                      e.stopPropagation();
                    } else {
                      clearTimeout(timeout);
                      timeout = setTimeout(() => {
                        document.getElementById("inputVelocidade " + item.id_infusao).blur();
                        setTimeout(() => {
                          updateInfusao(item, item.data_inicio, item.data_termino);
                          // toast(settoast, 'INFUSÃO ATUALIZADA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
                          e.stopPropagation();
                        }, 500);
                      }, 2000);
                    }
                  }}
                  maxLength={4}
                  style={{
                    position: 'absolute',
                    top: 50, right: 25,
                    width: 50,
                    height: 35, minHeight: 35, maxHeight: 35,
                    alignSelf: 'center',
                  }}
                ></input>
              </div>
              <input id={"inputDroga " + item.id_infusao}
                className="input"
                autoComplete="off"
                placeholder='DROGA...'
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'DROGA...')}
                defaultValue={item.droga}
                onClick={(e) => {
                  setinfusao(item);
                  setselectedinputdroga("inputDroga " + item.id_infusao);
                  setselectedinputvazao("inputVelocidade " + item.id_infusao);
                  e.stopPropagation();
                }}
                onKeyUp={(e) => {
                  clearTimeout(timeout);
                  timeout = setTimeout(() => {
                    document.getElementById("inputDroga " + item.id_infusao).blur();
                    setTimeout(() => {
                      if (document.getElementById("inputDroga " + item.id_infusao).value != '') {
                        var obj = {
                          id_atendimento: atendimento,
                          droga: document.getElementById("inputDroga " + item.id_infusao).value.toUpperCase(),
                          velocidade: item.velocidade,
                          data_inicio: item.data_inicio,
                          data_termino: item.data_termino,
                        }
                        axios.post(html + 'update_infusao/' + item.id_infusao, obj).then(() => {
                          loadInfusoes();
                        })
                        e.stopPropagation();
                      }
                    }, 500);
                  }, 2000);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'center', justifyContent: 'center', alignSelf: 'center',
                  whiteSpace: 'pre-wrap',
                  margin: 5,
                  padding: 5,
                  height: 50, minHeight: 50, maxHeight: 50,
                  width: 200
                }}
                title="DROGA, SOLUÇÃO OU ESQUEMA PARA INFUSÃO CONTÍNUA."
              >
              </input>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        display: infusoes.length > 0 ? 'flex' : 'none',
        flexDirection: 'column', justifyContent: 'center',
        alignSelf: 'center', alignContent: 'center',
        width: window.innerWidth < mobilewidth ? '80vw' : '95%'
      }}>
        {graficoInfusoes()}
      </div>
      <InsertInfusao></InsertInfusao>
    </div>
  )
}

export default Infusoes;