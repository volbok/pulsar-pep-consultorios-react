/* eslint eqeqeq: "off" */
import React, { useContext } from 'react';
import Context from '../pages/Context';
import moment from 'moment';
// imagens.
import back from '../images/back.svg';

function Alertas() {

  // context.
  const {
    // alerta para invasões antigas.
    // alerta para risco de pavm.
    invasoes,
    // alerta para risco de sepse.
    // alerta para redução do débito urinário.
    // alerta para ausência de evacuações.
    // alerta para interrupção da dieta se estase.
    sinaisvitais,
    // alerta para culturas pendentes.
    // alerta para solicitar cultura de controle se germe gram-positivo.
    culturas,
    // alerta para antibióticos em uso por tempo prolongado.
    antibioticos,
    // alerta para início de dieta enteral para o paciente intubado.
    dietas,
    mobilewidth,
    card, setcard,
  } = useContext(Context);

  let lastsinaisvitais = sinaisvitais.sort((a, b) => moment(a.data_sinais_vitais) > moment(b.data_sinais_vitais) ? -1 : 1).slice(-1);
  let pas = lastsinaisvitais.map(item => item.pas);
  let pad = lastsinaisvitais.map(item => item.pad);
  let pam = Math.ceil((2 * parseInt(pad) + parseInt(pas)) / 3);
  let fc = lastsinaisvitais.map(item => item.fc);
  let fr = lastsinaisvitais.map(item => item.fr);
  let sao2 = lastsinaisvitais.map(item => item.sao2);
  let tax = lastsinaisvitais.map(item => item.tax);
  let diurese = lastsinaisvitais.map(item => item.diurese);
  // Pendência: criar alerta de hipoglicemia!
  // let glicemia = lastsinaisvitais.map(item => item.glicemia);
  let balanco = lastsinaisvitais.map(item => item.balanco);
  let estase = lastsinaisvitais.map(item => item.estase);

  let arrayevacuacao = [];
  let evacuacao = [];
  sinaisvitais.sort((a, b) => moment(a.data_sinais_vitais) > moment(b.data_sinais_vitais) ? -1 : 1).slice(-3).map(item => arrayevacuacao.push(item.evacuacao));
  evacuacao = arrayevacuacao.filter(item => item.includes('+') || item.includes('PRESENTE') || item > 0);

  var height = 150;
  var heightmobile = '40vw'

  function AlertaInvasoes() {
    return (
      <div id='alerta_invasoes'
        className={window.innerWidth < mobilewidth ? 'grid2' : 'grid'}
      >
        {invasoes.filter(item => item.data_retirada == null && moment().diff(item.data_implante, 'days') > 15).map(item => (
          <div className='button red' key={'invasoes ' + item.id_invasao}
            style={{
              height: window.innerWidth < mobilewidth ? heightmobile : height,
              flexGrow: 1,
              padding: 20,
            }}>
            {'TEMPO PROLONGADO DE INVASÃO: ' + item.dispositivo + ' EM ' + item.local + ' - ' + moment().diff(item.data_implante, 'days') + ' DIAS.'}
          </div>
        ))}
      </div>
    )
  }
  function AlertaPavm() {
    return (
      <div id='alerta_pavm'>
        {invasoes.filter(item => item.data_retirada == null && (item.dispositivo == 'TOT' || item.dispositivo == 'TQT')).map(item => (
          <div className='button red'
            style={{
              height: window.innerWidth < mobilewidth ? heightmobile : height,
              flexGrow: 1,
              padding: 20,
            }}
          >
            {'RISCO DE PNEUMONIA ASSOCIADA A VENTILAÇÃO MECÂNICA: ' + item.dispositivo + '.'}
          </div>
        ))}
      </div>
    )
  }
  function AlertaSepse() {
    if (pam < 70 && (fc > 100 || fr > 22 || tax < 36 || tax > 38 || diurese < 500)) {
      return (
        <div id='alerta_sepse'
          className='button red'
          style={{
            height: window.innerWidth < mobilewidth ? heightmobile : height,
            flexGrow: 1,
            padding: 20,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div>{'CRITÉRIOS DE SEPSE!'}</div>
          <div style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center',
            flexWrap: 'wrap', marginTop: 10
          }}>
            <div style={{ display: pam < 70 ? 'flex' : 'none' }}>{'PAM: ' + pam + ' mmHg'}</div>
            <div style={{ display: fc > 100 ? 'flex' : 'none' }}>{'FC: ' + fc + ' bpm'}</div>
            <div style={{ display: fr > 22 ? 'flex' : 'none' }}>{'FR: ' + fr + ' irpm'}</div>
            <div style={{ display: tax < 36 || tax > 38 ? 'flex' : 'none' }}>{'TAX: ' + tax + 'ºC'}</div>
            <div style={{ display: diurese < 500 ? 'flex' : 'none' }}>{'DIURESE: ' + diurese + ' ml'}</div>
          </div>
        </div>
      )
    } else {
      return null;
    }
  }
  function AlertaDadosVitais() {
    return (
      <div id='alerta_dados'
        className='button yellow'
        style={{
          height: window.innerWidth < mobilewidth ? heightmobile : height,
          flexGrow: 1,
          padding: 20,
          display: sinaisvitais.length > 0 && (
            pam < 70 || pam > 100 || fc < 50 || fc > 130 || fr < 15 || fr > 24 || tax < 35 || tax > 38 || sao2 < 90) ?
            'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <div className={window.innerWidth < mobilewidth ? 'grid2' : 'grid'}>
          <div style={{ display: pam < 70 ? 'flex' : 'none' }}>{'HIPOTENSÃO: PAM ' + pam + ' mmHg'}</div>
          <div style={{ display: pam > 100 ? 'flex' : 'none' }}>{'HIPERTENSÃO: PAM ' + pam + ' mmHg'}</div>
          <div style={{ display: fc < 50 ? 'flex' : 'none' }}>{'BRADICARDIA: FC ' + fc + ' bpm'}</div>
          <div style={{ display: fc > 130 ? 'flex' : 'none' }}>{'TAQUICARDIA: FC ' + fc + ' bpm'}</div>
          <div style={{ display: fr < 15 ? 'flex' : 'none' }}>{'BRADIPNÉIA: FR ' + fr + ' irpm'}</div>
          <div style={{ display: fr > 24 ? 'flex' : 'none' }}>{'TAQUIPNÉIA: FR ' + fr + ' irpm'}</div>
          <div style={{ display: tax < 35 ? 'flex' : 'none' }}>{'HIPOTERMIA: TAX ' + tax + 'ºC'}</div>
          <div style={{ display: tax > 38 ? 'flex' : 'none' }}>{'HIPERTERMIA TAX ' + tax + 'ºC'}</div>
          <div style={{ display: sao2 < 90 ? 'flex' : 'none' }}>{'DESSATURAÇÃO SAO2 ' + sao2 + '%'}</div>
        </div>
      </div>
    )
  }
  function AlertaDiureseBalanco() {
    return (
      <div id='alerta_diurese&balanco'
        className='button yellow'
        style={{
          height: window.innerWidth < mobilewidth ? heightmobile : height,
          flexGrow: 1,
          padding: 20,
          display: sinaisvitais.length > 0 && (
            diurese < 500 || diurese > 3000 || balanco < -3000 || balanco > 2000) ?
            'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <div className={window.innerWidth < mobilewidth ? 'grid2' : 'grid'}>
          <div style={{ display: diurese < 500 ? 'flex' : 'none' }}>{'DÉBITO URINÁRIO REDUZIDO: ' + diurese + ' ml/12h'}</div>
          <div style={{ display: diurese > 1500 ? 'flex' : 'none' }}>{'DÉBITO URINÁRIO AUMENTADO: ' + diurese + ' ml/12h'}</div>
          <div style={{ display: balanco < -1500 ? 'flex' : 'none' }}>{'BALANÇO HÍDRICO MUITO NEGATIVO: ' + balanco + ' ml/12h'}</div>
          <div style={{ display: balanco > 1000 ? 'flex' : 'none' }}>{'BALANÇO HÍDRICO MUITO POSITIVO: ' + balanco + ' ml/12h'}</div>
        </div>
      </div>
    )
  }
  function AlertaEstaseEvacuacao() {
    return (
      <div id='alerta_estase&evacuacao'
        className='button-yellow'
        style={{
          height: window.innerWidth < mobilewidth ? heightmobile : height,
          flexGrow: 1,
          padding: 20,
          display: sinaisvitais.length > 0 && (
            estase > 200 || evacuacao.length == 0) ?
            'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <div
          className={window.innerWidth < mobilewidth ? 'grid2' : 'grid' }
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center',
          }}>
          <div style={{ display: estase > 200 ? 'flex' : 'none' }}>{'ESTASE GÁSTRICA: ' + estase + ' ml/12h'}</div>
          <div style={{ display: dietas.map(item => item.tipo) == 'SNE' ? 'flex' : 'none' }}>{'CONSIDERAR REDUÇÃO OU SUSPENSÃO DA DIETA ENTERAL.'}</div>
          <div style={{ display: evacuacao.length == 0 ? 'flex' : 'none' }}>{'AUSÊNCIA DE EVACUAÇÃO HÁ 3 DIAS'}</div>
        </div>
      </div>
    )
  }
  function AlertaDietaVm() {
    return (
      <div id='alerta_vm'
        className='button yellow'
        style={{
          height: window.innerWidth < mobilewidth ? heightmobile : height,
          flexGrow: 1,
          padding: 20,
          display:
            dietas.filter(item => item.tipo == 'SUSPENSA' || item.tipo == 'ORAL' || item.tipo == 'NÃO DEFINIDA').length > 0 &&
              (invasoes.filter(item => item.dispositivo == 'TOT' && item.data_retirada == null).length > 0) ?
              'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <div>{'PACIENTE EM VENTILAÇÃO MECÂNICA E SEM DIETA ENTERAL PRESCRITA'}</div>
      </div>
    )
  }
  function AlertaCulturas() {
    return (
      <div id='alerta_culturas'
        className='button yellow'
        style={{
          display: culturas.filter(item => item.data_resultado == null).length > 0 ? 'flex' : 'none',
          height: window.innerWidth < mobilewidth ? heightmobile : height,
          flexGrow: 1,
          padding: 20,
          flexDirection: 'column',
        }}
      >
        {'COBRAR CULTURAS EM ABERTO: ' + culturas.filter(item => item.data_resultado == null).length}
      </div>
    )
  }
  function AlertaAntibioticos() {
    return (
      <div id='alerta_antibioticos'
        className={window.innerWidth < mobilewidth ? 'grid2' : 'grid'}
        style={{
          display: antibioticos.filter(item => item.data_termino == null && moment().diff(moment(item.data_inicio), 'days') > 7).length > 0 ? 'flex' : 'none'
        }}>
        {antibioticos.filter(item => item.data_termino == null && moment().diff(moment(item.data_inicio), 'days') > 7)
          .map(item => (
            <div className='button yellow' key={'alertaatb ' + item.id_antibiotico}
              style={{
                display: 'flex',
                height: window.innerWidth < mobilewidth ? heightmobile : height,
                flexGrow: 1,
                padding: 20,
                flexDirection: 'column',
              }}
            >
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <div>{'ANTIBIÓTICO POR TEMPO DE USO PROLONGADO:'}</div>
                <div>{item.antibiotico}</div>
              </div>
            </div>
          ))}
      </div>
    )
  }
  function AlertaCgp() {
    return (
      <div id='alerta_cgp'
      className={window.innerWidth < mobilewidth ? 'grid2' : 'grid'}
        style={{
          display: culturas.filter(item => JSON.stringify(item.resultado).includes('CGP') || JSON.stringify(item.resultado).includes('COCOS GRAM-POSITIVOS')).length > 0 ? 'flex' : 'none',
        }}>
        {culturas.filter(item => JSON.stringify(item.resultado).includes('CGP') || JSON.stringify(item.resultado).includes('COCOS GRAM-POSITIVOS') || JSON.stringify(item.resultado).includes('STREPTO') || JSON.stringify(item.resultado).includes('STAPHYLO'))
          .map(item => (
            <div
              key={'culturas ' + item.resultado}
              className='button-yellow'
              style={{
                display: 'flex',
                flexDirection: 'column', justifyContent: 'center',
                height: window.innerWidth < mobilewidth ? heightmobile : height,
                flexGrow: 1,
                padding: 20,
              }}>
              <div>{'COCOS GRAM-POSITIVOS ISOLADOS EM:'}</div>
              <div style={{ margin: 5, marginLeft: 0, marginRight: 0 }}>
                {item.material + ' ' + moment(item.data_pedido).format('DD/MM/YY')}
              </div>
              <div>{'SOLICITAR CULTURA DE CONTROLE.'}</div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div id="scroll-alertas"
      className='card-aberto'
      style={{ display: card == 'card-alertas' ? 'flex' : 'none' }}
    >
      <div className="text3">
        ALERTAS
      </div>
      <AlertaInvasoes></AlertaInvasoes>
      <AlertaDadosVitais></AlertaDadosVitais>
      <AlertaCgp></AlertaCgp>
      <AlertaAntibioticos></AlertaAntibioticos>
      <AlertaDiureseBalanco></AlertaDiureseBalanco>
      <AlertaEstaseEvacuacao></AlertaEstaseEvacuacao>
      <div className={window.innerWidth < mobilewidth ? 'grid2' : 'grid'}
        style={{
          width: '100%',
          alignSelf: 'center',
        }}>
        <AlertaPavm></AlertaPavm>
        <AlertaSepse></AlertaSepse>
        <AlertaCulturas></AlertaCulturas>
        <AlertaDietaVm></AlertaDietaVm>
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
    </div>
  )
}

export default Alertas;
