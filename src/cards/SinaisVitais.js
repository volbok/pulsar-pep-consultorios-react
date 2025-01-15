/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from 'moment';
// funções.
import modal from '../functions/modal';
// import toast from '../functions/toast';
import checkinput from '../functions/checkinput';
// imagens.
import deletar from '../images/deletar.png';
import salvar from '../images/salvar.png';
import novo from '../images/novo.png';
import back from '../images/back.png';
// componentes.
import GravadorMulti from '../components/GravadorMulti';

function SinaisVitais() {

  // context.
  const {
    html,
    settoast,
    setdialogo,
    sinaisvitais, setsinaisvitais,
    atendimento,
    card, setcard,
    mobilewidth,
  } = useContext(Context);

  const [item_sinaisvitais, setitem_sinaisvitais] = useState();

  useEffect(() => {
    if (card == 'card-sinaisvitais') {
      setitem_sinaisvitais(null);
      loadSinaisVitais();
    }
    // eslint-disable-next-line
  }, [card]);

  // atualizar lista de sinais vitais.
  const loadSinaisVitais = () => {
    axios.get(html + 'list_sinais_vitais/' + atendimento).then((response) => {
      setsinaisvitais(response.data.rows);
    })
  }

  // deletar sinais vitais.
  const deleteSinaisVitais = (id) => {
    axios.get(html + 'delete_sinais_vitais/' + id).then(() => {
      // toast(settoast, 'DADOS VITAIS EXCLUÍDOS COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadSinaisVitais();
    })
  }

  // inserir sinais vitais.
  const insertSinaisVitais = ([pas, pad, fc, fr, sao2, tax, glicemia, diurese, balanco, evacuacao, estase]) => {
    var obj = {
      id_atendimento: atendimento,
      pas: pas,
      pad: pad,
      fc: fc,
      fr: fr,
      sao2: sao2,
      tax: tax,
      glicemia: glicemia,
      diurese: diurese,
      balanco: balanco,
      evacuacao: evacuacao,
      estase: estase,
      data_sinais_vitais: moment(),
    }
    axios.post(html + 'insert_sinais_vitais', obj).then(() => {
      // toast(settoast, 'SINAIS VITAIS ADICIONADOS COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadSinaisVitais();
      setviewinsertsinaisvitais(0);
    })
  }

  // inserir sinais vitais.
  const insertMultiSinaisVitais = (valores) => {
    var obj = {
      id_atendimento: atendimento,
      pas: valores.slice(0, 1).pop(),
      pad: valores.slice(1, 2).pop(),
      fc: valores.slice(2, 3).pop(),
      fr: valores.slice(3, 4).pop(),
      sao2: valores.slice(4, 5).pop(),
      tax: valores.slice(5, 6).pop(),
      glicemia: valores.slice(6, 7).pop(),
      diurese: valores.slice(7, 8).pop(),
      balanco: valores.slice(8, 9).pop(),
      evacuacao: valores.slice(9, 10).pop(),
      estase: valores.slice(10, 11).pop(),
      data_sinais_vitais: moment(),
    }
    axios.post(html + 'insert_sinais_vitais', obj).then(() => {
      // toast(settoast, 'SINAIS VITAIS ADICIONADOS COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadSinaisVitais();
      setviewinsertsinaisvitais(0);
    })
  }

  // atualizar sinais vitais.
  const updateSinaisVitais = ([id, data, pas, pad, fc, fr, sao2, tax, glicemia, diurese, balanco, evacuacao, estase]) => {
    var obj = {
      id_atendimento: atendimento,
      pas: pas,
      pad: pad,
      fc: fc,
      fr: fr,
      sao2: sao2,
      tax: tax,
      glicemia: glicemia,
      diurese: diurese,
      balanco: balanco,
      evacuacao: evacuacao,
      estase: estase,
      data_sinais_vitais: data,
    }
    axios.post(html + 'update_sinais_vitais/' + id, obj).then(() => {
      // toast(settoast, 'SINAIS VITAIS ADICIONADOS COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadSinaisVitais();
      setviewinsertsinaisvitais(0);
    })
  }

  // função para permitir apenas a inserção de números no input (obedecendo a valores de referência).
  var timeout = null;
  const checkNumberInput = (input, min, max) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      var valor = document.getElementById(input).value;
      if (isNaN(valor) == true || valor < min || valor > max) {
        // document.getElementById(input).style.backgroundColor = 'rgb(231, 76, 60, 0.3)';
        document.getElementById(input).value = '';
        document.getElementById(input).focus();
      } else {
        // document.getElementById(input).style.backgroundColor = '#ffffff';
      }
    }, 1000);
  }

  // função que permite apenas a entrada do cartactere +.
  const checkCaractereInput = (input) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      var valor = document.getElementById(input).value;
      var lastvalor = valor.slice(-1);
      if (lastvalor != '+') {
        lastvalor = '';
        document.getElementById(input).focus();
      }
    }, 1000);
  }

  // componente para adição ou atualização dos sinais vitais (modo 1 = inserir, modo 2 = atualizar).
  const [viewinsertsinaisvitais, setviewinsertsinaisvitais] = useState();
  function InsertSinaisVitais() {
    return (
      <div className="fundo"
        onClick={(e) => { setviewinsertsinaisvitais(0); e.stopPropagation() }}
        style={{ display: viewinsertsinaisvitais == 1 || viewinsertsinaisvitais == 2 ? 'flex' : 'none' }}>
        <div className={window.innerWidth < mobilewidth ? "janela scroll" : "janela"}
          onClick={(e) => e.stopPropagation()}
          style={{
            flexDirection: 'column',
            width: window.innerWidth < mobilewidth ? '80vw' : '60vw',
            height: window.innerWidth < mobilewidth ? 0.5 * window.innerHeight : '',
            justifyContent: window.innerWidth < mobilewidth ? 'flex-start' : 'center',
            alignContent: 'center',
          }}>
          <div
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
              flexWrap: window.innerWidth < mobilewidth ? 'nowrap' : 'wrap',
              justifyContent: window.innerWidth < mobilewidth ? 'flex-start' : 'center',
              alignContent: 'center',
            }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>PAS</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="PAS"
                inputMode='numeric'
                onKeyUp={() => checkNumberInput("inputPas", 50, 250)}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'PAS')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputPas"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.pas : ''}
                maxLength={3}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>PAD</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="PAD"
                inputMode='numeric'
                onKeyUp={() => checkNumberInput("inputPad", 30, 230)}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'PAD')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputPad"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.pad : ''}
                maxLength={3}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>FC</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="FC"
                inputMode='numeric'
                onKeyUp={() => checkNumberInput("inputFc", 20, 350)}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'FC')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputFc"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.fc : ''}
                maxLength={3}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>FR</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="FR"
                inputMode='numeric'
                onKeyUp={() => checkNumberInput("inputFr", 8, 60)}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'FR')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputFr"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.fr : ''}
                maxLength={2}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>SAO2</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="SAO2"
                inputMode='numeric'
                onKeyUp={() => checkNumberInput("inputSao2", 30, 101)}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'SAO2')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputSao2"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.sao2 : ''}
                maxLength={3}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>TAX</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="TAX"
                inputMode='numeric'
                onKeyUp={(e) => {
                  if (isNaN(e.target.value) == false && Number.isInteger(e.target.value) == false) {
                    console.log('VALOR VÁLIDO');
                  } else {
                    document.getElementById('inputTax').value = '';
                    document.getElementById('inputTax').focus();
                  }
                }}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'TAX')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputTax"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.tax : ''}
                maxLength={4}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>GLICEMIA</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="GLICEMIA"
                inputMode='numeric'
                onKeyUp={() => checkNumberInput("inputGlicemia", 0, 900)}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'GLICEMIA')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputGlicemia"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.glicemia : ''}
                maxLength={3}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>DIURESE</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="DIURESE"
                onKeyUp={() => checkNumberInput("inputDiurese", 0, 8000)}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'DIURESE')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputDiurese"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.diurese : ''}
                maxLength={4}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>BH</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="BH"
                inputMode='numeric'
                onKeyUp={() => checkNumberInput("inputBalanco", -8000, 8000)}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'BH')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputBalanco"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.balanco : ''}
                maxLength={5}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>EVACUAÇÃO</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="EVACUAÇÃO"
                onKeyUp={() => checkCaractereInput('inputEvacuacao')}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'EVACUAÇÃO')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputEvacuacao"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.evacuacao : ''}
                maxLength={3}
              ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className='text1'>ESTASE</div>
              <input
                className="input"
                autoComplete="off"
                placeholder="ESTASE"
                inputMode='numeric'
                onKeyUp={() => checkNumberInput("inputEstase", 0, 2000)}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'ESTASE')}
                style={{
                  width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
                  margin: 5,
                }}
                type="text"
                id="inputEstase"
                defaultValue={viewinsertsinaisvitais == 2 ? item_sinaisvitais.estase : ''}
                maxLength={4}
              ></input>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div id="botão de retorno"
              className="button-yellow"
              style={{
                display: 'flex',
                alignSelf: 'center',
              }}
              onClick={() => setviewinsertsinaisvitais(0)}>
              <img
                alt=""
                src={back}
                style={{ width: 30, height: 30 }}
              ></img>
            </div>
            <div id="btnsalvarsinaisvitais"
              className='button-green'
              onClick={() => {
                var pas = document.getElementById('inputPas').value;
                var pad = document.getElementById('inputPad').value;
                var fc = document.getElementById('inputFc').value;
                var fr = document.getElementById('inputFr').value;
                var sao2 = document.getElementById('inputSao2').value;
                var tax = document.getElementById('inputTax').value;
                var glicemia = document.getElementById('inputGlicemia').value;
                var diurese = document.getElementById('inputDiurese').value;
                var balanco = document.getElementById('inputBalanco').value;
                var evacuacao = document.getElementById('inputEvacuacao').value;
                var estase = document.getElementById('inputEstase').value;
                if (item_sinaisvitais == null) { // inserir.
                  checkinput('input', settoast, ['inputPas', 'inputPad', 'inputFc', 'inputFr', 'inputSao2', 'inputTax', 'inputGlicemia', 'inputDiurese', 'inputBalanco', 'inputEvacuacao', 'inputEstase'], "btnsalvarsinaisvitais", insertSinaisVitais, [pas, pad, fc, fr, sao2, tax, glicemia, diurese, balanco, evacuacao, estase]);
                } else { // atualizar.
                  checkinput('input', settoast, ['inputPas', 'inputPad', 'inputFc', 'inputFr', 'inputSao2', 'inputTax', 'inputGlicemia', 'inputDiurese', 'inputBalanco', 'inputEvacuacao', 'inputEstase'], "btnsalvarsinaisvitais", updateSinaisVitais, [item_sinaisvitais.id_sinais_vitais, item_sinaisvitais.data_sinais_vitais, pas, pad, fc, fr, sao2, tax, glicemia, diurese, balanco, evacuacao, estase]);
                }
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
      </div>
    )
  }

  // registro de sinais vitais por voz.
  function Botoes() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div id="botão de retorno"
          className="button-yellow"
          style={{ display: 'flex', alignSelf: 'center' }}
          onClick={() => setcard('')}>
          <img
            alt=""
            src={back}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
        <GravadorMulti funcao={insertMultiSinaisVitais} campos={['PAS', 'PAD', 'FC', 'FR', 'SAO2', 'TAX', 'GLICEMIA', 'DIURESE', 'BALANÇO', 'EVACUAÇÃO', 'ESTASE']}></GravadorMulti>
        <div id="btninputsinaisvitais"
          className='button-green'
          onClick={(e) => { setviewinsertsinaisvitais(1); e.stopPropagation() }}
          style={{ display: 'flex', alignSelf: 'center' }}
        >
          <img
            alt=""
            src={novo}
            style={{ width: 30, height: 30 }}
          ></img>
        </div>
      </div>
    );
  }

  // função que monta os componentes de dados vitais.
  function montaSinalVital(nome, item, unidade, min, max) {
    return (
      <div id={nome} style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignSelf: window.innerWidth < 769 ? 'flex-start' : 'center', maxWidth: 100,
      }}>
        <div className='text2' style={{ marginBottom: 0 }}>
          {nome}
        </div>
        <div className='text2'
          style={{
            marginTop: 0, paddingTop: 0,
            color: isNaN(item) == false && (item < min || item > max) ? '#F1948A' : '#ffffff',
          }}>
          {item + ' ' + unidade}
        </div>
      </div>
    )
  }

  // gráfico.
  const [selectgrafico, setselectgrafico] = useState(0);
  const setDataGrafico = () => {
    // 0 exibe todos os sinais vitais; 1 exibe apenas pam; 2 exibe apenas fc; 3 diurese, 4 tax.
    return (
      <div
        style={{
          display: sinaisvitais.length < 1 ? 'none' : 'flex',
          flexDirection: 'column', justifyContent: 'center',
          width: window.innerWidth < mobilewidth ? '90vw' : '100%', marginTop: 5,
          alignSelf: 'center',
        }}>
        <div id="gráfico" className='scroll'
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'flex-start',
            overflowX: 'scroll', overflowY: 'hidden',
            width: window.innerWidth < mobilewidth ? '70vw' : '60vw',
          }}>
          {sinaisvitais.slice(-15).map(item => (
            <div
              key={'gráfico ' + item.id_sinais_vitais}
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <div id="pack de barras"
                className='cor1'
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  alignItems: 'center',
                  borderRadius: 5,
                  padding: 10, paddingTop: 20, margin: 5,
                  height: '100%'
                }}>
                <div id="barras"
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                  }}>
                  <div id="barra + rótulo PAM"
                    style={{
                      display: selectgrafico == 0 || selectgrafico == 1 ? 'flex' : 'none',
                      flexDirection: 'column', justifyContent: 'center',
                    }}>
                    <div id="barra PAM" className='button green'
                      style={{
                        display: 'flex',
                        width: 20,
                        height: Math.ceil((2 * parseInt(item.pad) + parseInt(item.pas)) / 3),
                        minHeight: Math.ceil((2 * parseInt(item.pad) + parseInt(item.pas)) / 3),
                        position: 'relative',
                      }}>
                      <div className="graphictag">
                        {Math.ceil((2 * parseInt(item.pad) + parseInt(item.pas)) / 3)}
                      </div>
                    </div>
                    <div className='text1' style={{ fontSize: 12 }}>PAM</div>
                  </div>
                  <div id="barra + rótulo FC"
                    style={{
                      display: selectgrafico == 0 || selectgrafico == 2 ? 'flex' : 'none',
                      flexDirection: 'column', justifyContent: 'center'
                    }}>
                    <div id="barraFC" className='button red'
                      style={{
                        display: 'flex',
                        width: 20,
                        height: parseInt(item.fc),
                        minHeight: parseInt(item.fc),
                        position: 'relative'
                      }}>
                      <div className="graphictag">
                        {parseInt(item.fc)}
                      </div>
                    </div>
                    <div className='text1' style={{ fontSize: 12 }}>FC</div>
                  </div>
                  <div id="barra + rótulo DIURESE (valor inteiro)"
                    style={{
                      display: isNaN(item.diurese) == false && (selectgrafico == 0 || selectgrafico == 3) ? 'flex' : 'none',
                      flexDirection: 'column', justifyContent: 'center',
                    }}>
                    <div id="barraDIURESE (válida)" className='button yellow'
                      style={{
                        display: 'flex',
                        width: 20,
                        height: Math.ceil(parseInt(item.diurese) / 10),
                        minHeight: Math.ceil(parseInt(item.diurese) / 10),
                        backgroundImage: "linear-gradient(#F4D03F, transparent)",
                        position: 'relative',
                      }}>
                      <div className="graphictag">
                        {parseInt(item.diurese)}
                      </div>
                    </div>
                    <div className='text1' style={{ fontSize: 12 }}>DIURESE</div>
                  </div>
                  <div id="barra + rótulo DIURESE (valor texto)."
                    style={{
                      display: isNaN(item.diurese) == true && (selectgrafico == 0 || selectgrafico == 3) ? 'flex' : 'none',
                      flexDirection: 'column', justifyContent: 'center',
                    }}>
                    <div id="barraDIURESE (inválida)" className='button cor0' // muitas vezes a diurese é medida em cruzes (não quantificada).
                      style={{
                        display: 'flex',
                        width: 20,
                        height: 75,
                        minHeight: 75,
                        backgroundImage: "linear-gradient(#F4D03F, transparent)",
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                      }}>
                      {item.diurese.toString().slice(0, 8) + '...'}
                    </div>
                    <div className='text1' style={{ fontSize: 12 }}>DIURESE</div>
                  </div>
                  <div id="barra + rótulo TAX"
                    style={{
                      display: selectgrafico == 0 || selectgrafico == 4 ? 'flex' : 'none',
                      flexDirection: 'column', justifyContent: 'center',
                    }}>
                    <div id="barraTAX" className='button blue'
                      style={{
                        display: 'flex',
                        width: 20,
                        height: parseFloat(item.tax),
                        minHeight: parseFloat(item.tax),
                        position: 'relative',
                      }}>
                      <div className="graphictag">
                        {parseFloat(item.tax)}
                      </div>
                    </div>
                    <div className='text1' style={{ fontSize: 12 }}>TAX</div>
                  </div>
                </div>
                <div id='rótulo com data' className='text1'>
                  {moment(item.data_sinais_vitais).format('DD/MM - HH:mm')}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div id="legenda"
          style={{
            display: 'flex',
            flexDirection: 'row', flexWrap: 'wrap',
            justifyContent: 'center',
            width: '90%', alignSelf: 'center'
          }}>
          <div title="PRESSÃO ARTERIAL MÉDIA"
            className='button' style={{ width: 75, backgroundColor: '#5DADE2' }}
            onClick={(e) => { setselectgrafico(1); e.stopPropagation() }}>
            PAM
          </div>
          <div title="FREQUÊNCIA CARDÍACA"
            className='button' style={{ width: 75, backgroundColor: '#EC7063' }}
            onClick={(e) => { setselectgrafico(2); e.stopPropagation() }}>
            FC
          </div>
          <div title="DIURESE"
            className='button' style={{ width: 75, backgroundColor: '#F4D03F' }}
            onClick={(e) => { setselectgrafico(3); e.stopPropagation() }}>
            DIURESE
          </div>
          <div title="TEMPERATURA AXILAR"
            className='button' style={{ width: 75, backgroundColor: '#58D68D' }}
            onClick={(e) => { setselectgrafico(4); e.stopPropagation() }}>
            TAX
          </div>
          <div title="TODOS"
            className='button' style={{ width: 75 }}
            onClick={(e) => { setselectgrafico(0); e.stopPropagation() }}>
            TODOS
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="scroll-sinais vitais"
      className='card-aberto'
      style={{ display: card == 'card-sinaisvitais' ? 'flex' : 'none' }}
    >
      <div className="text3">
        SINAIS VITAIS
      </div>
      <Botoes></Botoes>
      <div className={window.innerWidth < mobilewidth ? 'grid1' : 'grid2'}>
        {sinaisvitais.sort((a, b) => moment(a.data_sinais_vitais) < moment(b.data_sinais_vitais) ? 1 : -1).slice(-4).map(item => (
          <div className='row'
            key={'sinais_vitais ' + item.id_sinais_vitais}
            onClick={(e) => { setitem_sinaisvitais(item); setviewinsertsinaisvitais(2); e.stopPropagation(); }}
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
              justifyContent: 'center',
              alignSelf: 'center',
            }}
          >
            <div id="identificador"
              className='button cor1opaque'
              style={{
                flex: 1,
                flexDirection: window.innerWidth < mobilewidth ? 'row' : 'column',
                justifyContent: 'center',
                alignSelf: 'center',
                margin: 0,
                padding: 5,
                height: window.innerWidth < mobilewidth ? '200vh' : window.innerWidth > parseInt(mobilewidth) + 1 && window.innerWidth < 769 ? '60vh' : 250,
                width: window.innerWidth < mobilewidth ? '90%' : 50,
                borderTopLeftRadius: window.innerWidth < mobilewidth ? 5 : 5,
                borderTopRightRadius: window.innerWidth < mobilewidth ? 5 : 0,
                borderBottomLeftRadius: window.innerWidth < mobilewidth ? 0 : 5,
                borderBottomRightRadius: window.innerWidth < mobilewidth ? 0 : 0,
              }}>
              <div style={{
                display: window.innerWidth < mobilewidth ? 'none' : 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div className='text2' style={{ color: '#ffffff' }}>{moment(item.data_sinais_vitais).format('DD/MM/YY')}</div>
                <div className='text2' style={{ color: '#ffffff', marginTop: 0 }}>{moment(item.data_sinais_vitais).format('HH:mm')}</div>
                <div className='button-yellow'
                  style={{ width: 25, minWidth: 25, height: 25, minHeight: 25, alignSelf: 'center' }}
                  onClick={(e) => {
                    modal(setdialogo, 'CONFIRMAR EXCLUSÃO DOS DADOS VITAIS ?', deleteSinaisVitais, item.id_sinais_vitais);
                    e.stopPropagation();
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
              <div style={{
                display: window.innerWidth < mobilewidth ? 'flex' : 'none',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}>
                <div className='text2' style={{ color: '#ffffff' }}>{moment(item.data_sinais_vitais).format('DD/MM/YY - HH:mm')}</div>
                <div className='button-yellow'
                  style={{ width: 25, minWidth: 25, height: 25, minHeight: 25 }}
                  onClick={(e) => {
                    modal(setdialogo, 'CONFIRMAR EXCLUSÃO DOS DADOS VITAIS ?', deleteSinaisVitais, item.id_sinais_vitais);
                    e.stopPropagation();
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
            <div id="sinais vitais"
              className='button cor1'
              style={{
                flex: window.innerWidth < mobilewidth ? 11 : 4,
                display: 'flex', flexDirection: 'row',
                justifyContent: 'center',
                alignSelf: 'center',
                flexWrap: 'wrap',
                width: window.innerWidth < mobilewidth ? '90%' : '27vw',
                height: window.innerWidth < mobilewidth ? '200vh' : window.innerWidth > parseInt(mobilewidth) + 1 && window.innerWidth < 769 ? '60vh' : 250,
                borderTopLeftRadius: window.innerWidth < mobilewidth ? 0 : 0,
                borderTopRightRadius: window.innerWidth < mobilewidth ? 0 : 5,
                borderBottomLeftRadius: window.innerWidth < mobilewidth ? 5 : 0,
                borderBottomRightRadius: window.innerWidth < mobilewidth ? 5 : 5,
                margin: 0,
              }}
            >
              {montaSinalVital('PAS', item.pas, 'mmHg', 70, 180)}
              {montaSinalVital('PAD', item.pad, 'mmHg', 50, 120)}
              {montaSinalVital('FC', item.fc, 'bpm', 45, 120)}
              {montaSinalVital('FR', item.fr, 'irpm', 10, 22)}
              {montaSinalVital('SAO2', item.sao2, '%', 85, 100)}
              {montaSinalVital('TAX', item.tax, '°C', 35, 37.3)}
              {montaSinalVital('GLICEMIA', item.glicemia, 'mg/dl', 70, 180)}
              {montaSinalVital('DIURESE', item.diurese, 'ml', 500, 2000)}
              {montaSinalVital('BALANÇO', item.balanco, 'ml', -2000, 2000)}
              {montaSinalVital('EVACUAÇÃO', item.evacuacao, '', '', '')}
              {montaSinalVital('ESTASE', item.estase, 'ml', 0, 200)}
            </div>
          </div>
        ))}
      </div>
      {setDataGrafico()}
      <InsertSinaisVitais></InsertSinaisVitais>
    </div >
  )
}

export default SinaisVitais;
