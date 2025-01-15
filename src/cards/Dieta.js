/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from 'moment';
// funções.
import modal from '../functions/modal';
import toast from '../functions/toast';
import checkinput from '../functions/checkinput';
// imagens.
import deletar from '../images/deletar.png';
import salvar from '../images/salvar.png';
import back from '../images/back.png';

function Dieta() {

  // context.
  const {
    html,
    settoast,
    setdialogo,
    dietas, setdietas,
    atendimento,
    card, setcard,
    mobilewidth,
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-dietas') {
      loadDietas();
    }
    // eslint-disable-next-line
  }, [card]);

  // atualizar lista de dietas.
  const loadDietas = () => {
    axios.get(html + 'list_dietas/' + atendimento).then((response) => {
      var x = response.data.rows;
      if (x.length > 0) {
        var y = x.slice(-1);
        setdietas(y);
        settipodieta(y.map(item => item.tipo));
      } else {
        var obj = {
          infusao: null,
          get: null,
          tipo: 'NÃO DEFINIDA',
          data_inicio: moment(),
          data_termino: null,
          id_atendimento: atendimento,
        }
        axios.post(html + 'insert_dieta', obj).then(() => {
          loadDietas();
        })
      }
    })
  }

  // deletar dieta.
  const deleteDieta = (id) => {
    axios.get(html + 'delete_dieta/' + id).then(() => {
      // toast(settoast, 'DIETA EXCLUÍDA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadDietas();
    })
  }

  // atualizar dieta.
  const updateDieta = () => {
    var obj = {
      infusao: tipodieta != 'ORAL' ? document.getElementById("inputInfusao").value : null,
      get: tipodieta != 'ORAL' ? document.getElementById("inputGet").value : null,
      tipo: tipodieta,
      data_inicio: moment(),
      data_termino: null,
      id_atendimento: atendimento,
    }
    axios.post(html + 'update_dieta/' + dieta.id_dieta, obj).then(() => {
      toast(settoast, 'DIETA ATUALIZADA COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      loadDietas();
      setviewupdatedieta(0);
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

  // opções para tipo de dieta:
  let arraydietas = ['SUSPENSA', 'ORAL', 'SNE', 'DUPLA'];

  const [viewopcoesdieta, setviewopcoesdieta] = useState(0);
  const [dieta, setdieta] = useState(0);
  const [tipodieta, settipodieta] = useState('ORAL');
  function OpcoesDieta() {
    return (
      <div className="fundo"
        onClick={(e) => { setviewopcoesdieta(0); e.stopPropagation() }}
        style={{ display: viewopcoesdieta == 1 ? 'flex' : 'none' }}>
        <div className="janela">
          {arraydietas.map(item => (
            <div
              key={'arraydietas ' + item}
              className='button'
              style={{ width: 100 }}
              onClick={() => {
                settipodieta(item);
                setviewopcoesdieta(0);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

    )
  }

  // componente para atualização da dieta.
  const [viewupdatedieta, setviewupdatedieta] = useState();
  const UpdateDieta = useCallback(() => {
    return (
      <div className="fundo"
        onClick={(e) => { setviewupdatedieta(0); e.stopPropagation() }}
        style={{ display: viewupdatedieta == 1 ? 'flex' : 'none' }}>
        <div className="janela"
          onClick={(e) => e.stopPropagation()}
          style={{ flexDirection: 'column' }}>
          <div className='text1'>TIPO DE DIETA</div>
          <div
            onClick={() => setviewopcoesdieta(1)}
            className="button"
            style={{
              width: window.innerWidth < mobilewidth ? '50vw' : '15vw',
              margin: 5,
            }}
            id="inputTipo"
          >
            {tipodieta}
          </div>
          <div className='text1' style={{ display: tipodieta == 'ORAL' || tipodieta == 'NÃO DEFINIDA' ? 'none' : 'flex' }}>INFUSÃO</div>
          <input
            className="input"
            autoComplete="off"
            placeholder="INFUSÃO"
            type="text"
            inputMode='numeric'
            maxLength={3}
            onKeyUp={() => checkNumberInput("inputInfusao", 10, 100)}
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'INFUSÃO')}
            defaultValue={dieta.infusao}
            style={{
              display: tipodieta == 'ORAL' || tipodieta == 'NÃO DEFINIDA' ? 'none' : 'flex',
              width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
              margin: 5,
            }}
            id="inputInfusao"
          ></input>
          <div className='text1' style={{ display: tipodieta == 'ORAL' || tipodieta == 'NÃO DEFINIDA' ? 'none' : 'flex' }}>OBJETIVO</div>
          <input
            className="input"
            autoComplete="off"
            placeholder="GET"
            type="text"
            inputMode='numeric'
            maxLength={3}
            onKeyUp={() => checkNumberInput("inputGet", 10, 100)}
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'GET')}
            defaultValue={dieta.get}
            style={{
              display: tipodieta == 'ORAL' || tipodieta == 'NÃO DEFINIDA' ? 'none' : 'flex',
              width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
              margin: 5,
            }}
            id="inputGet"
          ></input>
          <input
            autoComplete="off"
            placeholder="INÍCIO"
            className="input"
            type="text"
            maxLength={10}
            inputMode='numeric'
            id={"inputDatainicio"}
            title="FORMATO: DD/MM/YYYY"
            onClick={() => document.getElementById("inputDataInicio").value = ''}
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'INÍCIO')}
            defaultValue={moment(dieta.data_inicio).format('DD/MM/YYYY')}
            onKeyUp={() => {
              var x = document.getElementById("inputDataInicio").value;
              if (x.length == 2) {
                x = x + '/';
                document.getElementById("inputDataInicio").value = x;
              }
              if (x.length == 5) {
                x = x + '/'
                document.getElementById("inputDataInicio").value = x;
              }
              clearTimeout(timeout);
              var date = moment(document.getElementById("inputDataInicio").value, 'DD/MM/YYYY', true);
              // eslint-disable-next-line
              timeout = setTimeout(() => {
                if (date.isValid() == false) {
                  toast(settoast, 'DATA INVÁLIDA', 'rgb(231, 76, 60, 1)', 3000);
                  document.getElementById("inputDataInicio").value = '';
                } else {
                  document.getElementById("inputDataInicio").value = moment(date).format('DD/MM/YYYY');
                }
              }, 3000);
            }}
            style={{
              display: 'none',
              flexDirection: 'center', justifyContent: 'center', alignSelf: 'center',
              width: window.innerWidth < mobilewidth ? '70vw' : '10vw',
            }}
          ></input>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div id="botão de retorno"
              className="button-yellow"
              style={{
                display: 'flex',
                alignSelf: 'center',
              }}
              onClick={() => setviewupdatedieta(0)}>
              <img
                alt=""
                src={back}
                style={{ width: 30, height: 30 }}
              ></img>
            </div>
            <div id="btnsalvardieta"
              className='button-green'
              onClick={() => {
                if (tipodieta != 'ORAL') {
                  checkinput('input', settoast, ['inputInfusao', 'inputGet'], "btnsalvardieta", updateDieta, [])
                } else {
                  updateDieta();
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
    // eslint-disable-next-line
  }, [viewupdatedieta, tipodieta, dieta]);

  return (
    <div id="scroll-dietas"
      className='card-dietas'
      style={{
        display: card == 'card-dietas' ? 'flex' : 'none', flexDirection: 'column',
        width: '100%', height: '100%',
      }}
    >
      <div className="text3">
        DIETA
      </div>
      <div
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center',
          flexWrap: 'wrap', width: '100%'
        }}>
        {dietas.map(item => (
          <div className='button'
            key={'dieta ' + item.id_dieta}
            onClick={(e) => { setdieta(item); setviewupdatedieta(1); e.stopPropagation() }}
            style={{ width: 200, maxWidth: 200, height: 200, flexDirection: 'column' }}>
            <div style={{ fontSize: 16, margin: 5, width: '100%' }}>
              {item.tipo}
            </div>
            <div style={{
              display: tipodieta != 'ORAL' && tipodieta != 'NÃO DEFINIDA' && item.infusao != null ? 'flex' : 'none',
              justifyContent: 'center',
              margin: 5, width: '100%'
            }}>
              {'INFUSÃO: ' + item.infusao + ' ml/h'}
            </div>
            <div style={{
              display: tipodieta != 'ORAL' && tipodieta != 'NÃO DEFINIDA' && item.get != null ? 'flex' : 'none',
              justifyContent: 'center',
              margin: 5, width: '100%'
            }}>
              {'GET: ' + item.get + ' ml/h'}
            </div>
            <div className='button-red'
              style={{ display: 'none', width: 25, minWidth: 25, height: 25, minHeight: 25 }}
              onClick={(e) => {
                modal(setdialogo, 'CONFIRMAR EXCLUSÃO DA DIETA', deleteDieta, item.id_dieta);
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
        ))}
      </div>
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
      <UpdateDieta></UpdateDieta>
      <OpcoesDieta></OpcoesDieta>
    </div >
  )
}

export default Dieta;
