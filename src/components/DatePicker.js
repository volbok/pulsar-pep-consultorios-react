/* eslint eqeqeq: "off" */
import React, { useState, useContext } from 'react';
import { useEffect } from 'react';
import moment from 'moment';
import Context from '../pages/Context';
// imagens.
import salvar from '../images/salvar.svg';
import back from '../images/back.svg';

function DatePicker() {

  // recuperando estados globais (Context.API).
  const {
    viewdatepicker, setviewdatepicker,
    setpickdate1,
    pickdate1,
    setpickdate2,
    pickdate2
  } = useContext(Context);

  useEffect(() => {
    currentMonth();
    moment().format('DD/MM')
    sethour(moment().format('HH'));
    if (viewdatepicker != 0) {
      sethour(moment().format('HH'));
      setmin(moment().format('mm'));
    }
    // eslint-disable-next-line
  }, [viewdatepicker])

  // preparando a array com as datas.
  var arraydate = [];
  const [arraylist, setarraylist] = useState([]);
  // preparando o primeiro dia do mês.
  var month = moment().format('MM');
  var year = moment().format('YYYY');
  const [startdate] = useState(moment('01/' + month + '/' + year, 'DD/MM/YYYY'));
  // descobrindo o primeiro dia do calendário (último domingo do mês anteior).
  const firstSunday = (x, y) => {
    while (x.weekday() > 0) {
      x.subtract(1, 'day');
      y.subtract(1, 'day');
    }
    // se o primeiro domingo da array ainda cair no mês atual:
    if (x.month() == startdate.month()) {
      x.subtract(7, 'days');
      y.subtract(7, 'days');
    }
  }
  // criando array com 42 dias a partir da startdate.
  const setArrayDate = (x, y) => {
    arraydate = [x.format('DD/MM/YYYY')];
    while (y.diff(x, 'days') > 1) {
      x.add(1, 'day');
      arraydate.push(x.format('DD/MM/YYYY').toString());
    }
  }
  // criando a array de datas baseada no mês atual.
  const currentMonth = () => {
    var month = moment(startdate).format('MM');
    var year = moment(startdate).format('YYYY');
    var x = moment('01/' + month + '/' + year, 'DD/MM/YYYY');
    var y = moment('01/' + month + '/' + year, 'DD/MM/YYYY').add(42, 'days');
    firstSunday(x, y);
    setArrayDate(x, y);
    setarraylist(arraydate);
  }
  // percorrendo datas do mês anterior.
  const previousMonth = () => {
    startdate.subtract(1, 'month');
    var month = moment(startdate).format('MM');
    var year = moment(startdate).format('YYYY');
    var x = moment('01/' + month + '/' + year, 'DD/MM/YYYY');
    var y = moment('01/' + month + '/' + year, 'DD/MM/YYYY').add(42, 'days');
    firstSunday(x, y);
    setArrayDate(x, y);
    setarraylist(arraydate);
  }
  // percorrendo datas do mês seguinte.
  const nextMonth = () => {
    startdate.add(1, 'month');
    var month = moment(startdate).format('MM');
    var year = moment(startdate).format('YYYY');
    var x = moment('01/' + month + '/' + year, 'DD/MM/YYYY');
    var y = moment('01/' + month + '/' + year, 'DD/MM/YYYY').add(42, 'days');
    firstSunday(x, y);
    setArrayDate(x, y);
    setarraylist(arraydate);
  }

  // selecionando uma data no datepicker.
  const selectDate = (value) => {
    if (viewdatepicker == 1) {
      setpickdate1(value);
    } else if (viewdatepicker == 2) {
      setpickdate2(value);
    } else {
      setviewdatepicker(0);
    }
  }

  const [hour, sethour] = useState('');
  const [min, setmin] = useState('');
  function TimeComponent() {
    var timeout = null;
    const fixHour = (valor) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (valor > 23 || valor < 0) {
          sethour('!');
        } else {
          sethour(valor);
        }
      }, 1000);
    };

    const fixMin = (valor) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (valor > 59 || valor < 0) {
          setmin('!');
        } else {
          setmin(valor);
        }
      }, 1000);
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className='text1'>HORA</div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <input
            autoComplete="off"
            className="input"
            placeholder="HH"
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'HH')}
            onKeyUp={(e) => fixHour(e.target.value)}
            defaultValue={hour}
            title="HORAS."
            maxLength={2}
            style={{
              width: 100,
              height: 50,
            }}
            min={0}
            max={23}
            id="inputHour"
          ></input>
          <div className='text1'>{' : '}</div>
          <input
            autoComplete="off"
            className="input"
            placeholder="MM"
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'MM')}
            onKeyUp={(e) => fixMin(e.target.value)}
            defaultValue={min}
            title="MINUTOS."
            maxLength={2}
            style={{
              width: 100,
              height: 50,
            }}
            min={0}
            max={59}
            id="inputMin"
          ></input>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div id="btnCancel"
            className="button-yellow"
            title="FECHAR O DATEPICKER"
            onClick={() => { setviewdatepicker(0) }}
            style={{ width: 50, height: 50, alignSelf: 'center' }}
          >
            <img
              alt=""
              src={back}
              style={{
                margin: 10,
                height: 30,
                width: 30,
              }}
            ></img>
          </div>
          <div id="btnAdd"
            className="button-green"
            title="CONFIRMAR DATA E HORA."
            onClick={
              viewdatepicker == 1 ? () => { setpickdate1(pickdate1 + ' - ' + hour + ':' + min); setviewdatepicker(0) } :
                (e) => { setpickdate2(pickdate2 + ' - ' + hour + ':' + min); setviewdatepicker(0); e.stopPropagation(); }
            }
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

  // renderização do datepicker.
  if (viewdatepicker != 0) {
    return (
      <div className="fundo"
        onClick={(e) => { setviewdatepicker(0); e.stopPropagation() }}
        style={{
          zIndex: 900, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
        }}>
        <div
          onClick={(e) => e.stopPropagation()}
          className={"janela scroll"}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignSelf: 'center',
            margin: 0,
            padding: 0, paddingRight: 5,
            width: window.innerWidth < 426 ? 'calc(100vw - 20px)' : 400,
            // height: window.innerWidth < 426 ? '100vh' : '85vh',
            borderRadius: window.innerWidth < 426 ? 0 : 5,
          }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 5,
            }}>
              <button
                className="button"
                onClick={(e) => { previousMonth(); e.stopPropagation(); }}
                id="previous"
                style={{
                  width: 50,
                  height: 50,
                  margin: 2.5,
                  color: '#ffffff',
                }}
                title={'MÊS ANTERIOR'}
              >
                {'◄'}
              </button>
              <p
                className="text1"
                style={{
                  flex: 1,
                  fontSize: 16,
                  margin: 2.5
                }}>
                {startdate.format('MMMM').toUpperCase() + ' ' + startdate.year()}
              </p>
              <button
                className="button"
                onClick={(e) => { nextMonth(); e.stopPropagation(); }}
                id="next"
                style={{
                  width: 50,
                  height: 50,
                  margin: 2.5,
                  color: '#ffffff',
                }}
                title={'PRÓXIMO MÊS'}
              >
                {'►'}
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              width: window.innerWidth < 426 ? '85vw' : 400,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              padding: 0, margin: 0,
            }}>
              <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>DOM</p>
              <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>SEG</p>
              <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>TER</p>
              <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>QUA</p>
              <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>QUI</p>
              <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>SEX</p>
              <p className="text1" style={{ width: window.innerWidth < 426 ? 33 : 50, fontSize: 10, margin: 2.5, padding: 0 }}>SAB</p>
            </div>
            <div
              id="LISTA DE DATAS"
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                margin: 0,
                padding: 0,
                height: window.innerWidth < 426 ? 340 : '',
                width: window.innerWidth < 426 ? 300 : 400,
                boxShadow: 'none'
              }}
            >
              {arraylist.map((item) => (
                <button
                  key={'dia ' + item}
                  className={viewdatepicker == 1 && item == pickdate1 ? "button-selected" : viewdatepicker == 2 && item == pickdate2 ? "button-selected" : "button"}
                  onClick={(e) => { selectDate(item); e.stopPropagation() }}
                  style={{
                    height: 50,
                    margin: 2.5,
                    color: '#ffffff',
                    width: window.innerWidth < 426 ? 33 : 50,
                    minWidth: window.innerWidth < 426 ? 33 : 50,
                    opacity: item.substring(3, 5) === moment(startdate).format('MM') ? 1 : 0.5,
                  }}
                  title={item}
                >
                  {item.substring(0, 2)}
                </button>
              ))}
            </div>
          </div>
          <TimeComponent></TimeComponent>
        </div>
      </div>
    );
  } else {
    return null;
  }
}
export default DatePicker;