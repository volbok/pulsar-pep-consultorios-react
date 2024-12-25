/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect } from 'react';
import Context from '../pages/Context';
import moment from "moment";
// imagens.
import back from '../images/back.svg';
import imprimir from '../images/imprimir.svg';
import html2pdf from 'html2pdf.js'

function GuiaConsulta() {

  // context.
  const {
    card,
    cliente,
    objpaciente,
    operadoras,
    dono_documento,
  } = useContext(Context);

  let operadora = [];
  useEffect(() => {
    if (card == 'guia-consulta') {
      if (localStorage.getItem('PARTICULAR') != 'PARTICULAR') {
        setn_carteira(objpaciente.convenio_carteira);
        setvalidade_carteira(objpaciente.validade_carteira);
        setnome(objpaciente.nome_paciente);
        setcns(objpaciente.cns != undefined ? objpaciente.cns : '');
      } else {
        setn_carteira('');
        setvalidade_carteira('');
        setnome(objpaciente.nome_paciente);
        setcns('');
      }

      // eslint-disable-next-line
      operadora = operadoras.filter(valor => valor.id == objpaciente.convenio_codigo).pop();

      if (localStorage.getItem('PARTICULAR') != 'PARTICULAR') {
        setlogo(operadora.logo_operadora);
        setregistro_ans(operadora.registro_ans);
        setcodigo_prestador(operadora.codigo_prestador);

        setnome_contratado(cliente.nome_cliente);
        setnome_solicitante(dono_documento.nome_usuario);
        setconselho_solicitante(dono_documento.conselho);
        setn_conselho_solicitante(dono_documento.n_conselho);
        setuf_solicitante('MG');
        setcodigo_cbo(dono_documento.codigo_cbo);
      } else {
        setlogo('');
        setregistro_ans('');
        setcodigo_prestador('');

        setnome_contratado('');
        setnome_solicitante(dono_documento.nome_usuario);
        setconselho_solicitante(dono_documento.conselho);
        setn_conselho_solicitante(dono_documento.n_conselho);
        setuf_solicitante('MG');
        setcodigo_cbo('');
      }

      settipoconsulta(localStorage.getItem('tipo_consulta'));
    }
    // eslint-disable-next-line
  }, [card, objpaciente, operadora, dono_documento]);

  const [logo, setlogo] = useState();

  // campos da guia TISS-CONSULTA.
  const [guia_prestador, setguia_prestador] = useState('');
  const [registro_ans, setregistro_ans] = useState('');

  const [n_carteira, setn_carteira] = useState('');
  const [validade_carteira, setvalidade_carteira] = useState('');
  const [rn, setrn] = useState('NÃO');
  const [nome, setnome] = useState('');
  const [cns, setcns] = useState('');

  const [codigo_prestador, setcodigo_prestador] = useState('');
  const [nome_contratado, setnome_contratado] = useState('');
  // código CNES

  const [nome_solicitante, setnome_solicitante] = useState('');
  const [conselho_solicitante, setconselho_solicitante] = useState('');
  const [n_conselho_solicitante, setn_conselho_solicitante] = useState('');
  const [uf_solicitante, setuf_solicitante] = useState('');
  const [codigo_cbo, setcodigo_cbo] = useState('');

  const [data_atendimento, setdata_atendimento] = useState(moment().format('DD/MM/YYYY'));
  const [tipoconsulta, settipoconsulta] = useState('');
  const [tabela, settabela] = useState('04'); // consulta - obtido da tabela de domínio 50.
  const [codigo_procedimento, setcodigo_procedimento] = useState('?');
  const [valor_procedimento, setvalor_procedimento] = useState('R$ 300');
  const [observacao, setobservacao] = useState('CONSULTA MÉDICA');

  // campos para edição da guia.
  let timeout = null;
  const editcampo = (titulo, valor, setvalor, tamanho, grow, height) => {
    return (
      <div id="versão para edição"
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          position: 'relative',
          borderStyle: 'solid', borderWidth: 1, borderColor: 'black', borderRadius: 2.5,
          margin: 2, padding: 5,
          width: grow == 1 ? '' : tamanho,
          flexGrow: grow,
          minHeight: height == null ? 20 : height,
          maxHeight: height == null ? 20 : height,
          fontSize: 10, textAlign: 'left',
        }}>
        <div style={{
          position: 'absolute', top: -2.5, left: 5,
          backgroundColor: 'white',
          fontSize: 7,
          minHeight: 15, maxHeight: 15,
          paddingLeft: 2.5, paddingRight: 2.5,
        }}>
          {titulo}
        </div>
        <input
          id={'input ' + titulo}
          className='tiss_textarea'
          autoComplete="off"
          placeholder={titulo}
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => (e.target.placeholder = "")}
          // defaultValue={valor.length > 55 ? valor.toUpperCase().slice(0, 55) + '...' : valor.toUpperCase()}
          defaultValue={valor != null && valor.length > 50 ? valor.toUpperCase().slice(0, 55) + '...' : valor != null && valor.length < 51 ? valor.toUpperCase() : ''}
          style={{ backgroundColor: 'transparent', margin: 0, marginTop: 2, marginLeft: -2.5, padding: 0 }}
          onKeyUp={() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              setvalor(document.getElementById('input ' + titulo).value);
            }, 2000);
          }}
        >
        </input>
      </div>
    )
  }
  const editcampovalor = (titulo, valor, tamanho, grow) => {
    return (
      <div id="versão para edição"
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          position: 'relative',
          borderStyle: 'solid', borderWidth: 1, borderColor: 'black', borderRadius: 2.5,
          margin: 2, padding: 5,
          width: grow == 1 ? '' : tamanho,
          flexGrow: grow,
          minHeight: 20, maxHeight: 20,
          fontSize: 10, textAlign: 'left',
        }}>
        <div style={{
          position: 'absolute', top: -2.5, left: 5,
          backgroundColor: 'white',
          fontSize: 7,
          minHeight: 15, maxHeight: 15,
          paddingLeft: 2.5, paddingRight: 2.5,
        }}>
          {titulo}
        </div>
        <input
          id={'input ' + titulo}
          className='tiss_textarea'
          autoComplete="off"
          placeholder={titulo}
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => (e.target.placeholder = "")}
          defaultValue={valor != null && valor.length > 55 ? valor.toUpperCase().slice(0, 55) + '...' : valor != null && valor.length < 56 ? valor : ''}
          style={{ backgroundColor: 'transparent', margin: 0, marginTop: -2.5, marginLeft: -2.5, padding: 0 }}
        >
        </input>
      </div>
    )
  }

  // campo para impressão da guia.
  const pdfcampo = (titulo, valor, flex, height) => {
    return (
      <div id="versão para impressão" className='noprint'
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          position: 'relative',
          borderStyle: 'solid', borderWidth: 1, borderColor: 'black', borderRadius: 2.5,
          margin: 1, marginTop: 5,
          padding: 1.5,
          flex: flex,
          minHeight: height == null ? 15 : height,
          maxHeight: height == null ? 15 : height,
          fontSize: 8, textAlign: 'left',
          fontFamily: 'Helvetica'
        }}>
        <div style={{
          position: 'absolute', top: -6, left: 5,
          backgroundColor: 'white',
          fontSize: 7,
          minHeight: 10, maxHeight: 10,
          paddingLeft: 2.5, paddingRight: 2.5,
          fontFamily: 'Helvetica'
        }}>
          {titulo}
        </div>
        <div style={{
          paddingTop: 5,
          fontFamily: 'Helvetica'
        }}>
          {valor != null && valor.length > 50 ? valor.toUpperCase().slice(0, 55) + '...' : valor != null && valor.length < 51 ? valor.toUpperCase() : ''}
        </div>
      </div>
    )
  }

  // IMPRESSÃO DA GUIA DE CONSULTA.
  function printDiv() {

    var opt = {
      margin: 0.1,
      filename: 'guia_consulta',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: 'css' }
    };

    var element = document.getElementById('GUIA CONSULTA PRINT').innerHTML;
    html2pdf().set(opt).from(element).output('dataurlnewwindow');
  }

  if (operadora != null) {
    return (
      <div id="guia-consulta"
        className='card-aberto'
        style={{ display: 'none', visibility: 'hidden' }}
      >
        <div className="text3">GUIA CONSULTA</div>
        < div className="fundo"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="janela scroll"
            style={{
              width: '80vw', height: '70vh',
              padding: 20, paddinRight: 30,
              backgroundColor: 'white', borderColor: 'white',
              flexDirection: 'column', justifyContent: 'flex-start',
              overflowX: 'scroll', overflowY: 'scroll',
            }}>
            <div id="botões da guia"
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignSelf: 'flex-end',
                paddingRight: 20,
              }}>
              <div
                id="botão de retorno"
                className="button-red"
                style={{
                  display: 'flex',
                  opacity: 1,
                  alignSelf: "center",
                }}
                onClick={() => {
                  document.getElementById("guia-consulta").style.display = 'none';
                  document.getElementById("guia-consulta").style.visibility = 'hidden';
                }}
              >
                <img alt="" src={back} style={{ width: 30, height: 30 }}></img>
              </div>
              <div
                id="botão de impressão"
                className="button-red"
                style={{
                  display: 'flex',
                  opacity: 1,
                  alignSelf: "center",
                }}
                onClick={() => {
                  printDiv();
                }}
              >
                <img alt="" src={imprimir} style={{ width: 30, height: 30 }}></img>
              </div>
            </div>
            <div id="GUIA CONSULTA EDIT"
              className='noprint'
              style={{
                display: 'flex', flexDirection: 'column', width: 'calc(100% - 20px)',
                justifyContent: 'flex-start', marginTop: 25
              }}>
              <div id="cabeçalho" style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                height: 100, alignContent: 'center',
                alignItems: 'center',
              }}>
                <img alt="" src={logo}
                  style={{
                    display: logo == '' ? 'none' : 'flex',
                    height: 80,
                    borderRadius: 5,
                    marginBottom: 5,
                  }}>
                </img>
                <div style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', width: 500 }}>
                  {'GUIA DE CONSULTA'}
                </div>
                {editcampo('2 - Nº DA GUIA DO PRESTADOR', guia_prestador, setguia_prestador, 120, 0)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                {editcampo('1- REGISTRO ANS', registro_ans, setregistro_ans, 100, 0)}
                {editcampovalor('3 - NÚMERO DA GUIA PRINCIPAL', '', '', 0)}
              </div>
              <div className='grupo'>{'DADOS DO BENEFICIÁRIO'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('4 - Nº DA CARTEIRA', n_carteira, setn_carteira, 100, 0)}
                {editcampo('5 - VALIDADE DA CARTEIRA', validade_carteira, setvalidade_carteira, 70, 0)}
                {editcampo('6 - ATENDIMENTO A RN', rn, setrn, 90, 0)}

                {editcampo('7 - NOME', nome, setnome, '', 1)}
                {editcampo('8 - CARTÃO NACIONAL DE SAÚDE', cns, setcns, 90, 0)}
              </div>
              <div className='grupo'>{'DADOS DO CONTRATADO'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('9 - CÓDIGO NA OPERADORA', codigo_prestador, setcodigo_prestador, 200, 0)}
                {editcampo('10 - NOME DO CONTRATADO', nome_contratado, setnome_contratado, '', 1)}
                {editcampo('11 - CÓDIGO CNES', localStorage.getItem('PARTICULAR') == 'PARTICULAR' ? '' : cliente.cnes, setcodigo_cbo, 200, 0)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('12 - NOME DO PROFISSIONAL EXECUTANTE', nome_solicitante, setnome_solicitante, '', 1)}
                {editcampo('13 - CONSELHO PROFISSIONAL', conselho_solicitante, setconselho_solicitante, 100, 0)}
                {editcampo('14 - NÚMERO NO CONSELHO', n_conselho_solicitante, setn_conselho_solicitante, 150, 0)}
                {editcampo('15 - UF', uf_solicitante, setuf_solicitante, 100, 0)}
                {editcampo('16 - CÓDIGO CBO', codigo_cbo, setcodigo_cbo, 100, 0)}
              </div>
              <div className='grupo'>{'DADOS DO ATENDIMENTO / PROCEDIMENTO  REALIZADO'}</div>
              {editcampovalor('17 - INDICAÇÃO DE ACIDENTE (ACIDENTE OU DOENÇA RELACIONADA)', '9', 400, 0)}
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('18 - DATA DO ATENDIMENTO', data_atendimento, setdata_atendimento, 250, 0)}
                {editcampo('19 - TIPO DE CONSULTA', tipoconsulta, settipoconsulta, 50, 0)}
                {editcampo('20 - TABELA', tabela, settabela, 200, 0)}
                {editcampo('21 - CÓDIGO DO PROCEDIMENTO', codigo_procedimento, setcodigo_procedimento, 300, 0)}
                {editcampo('22 - VALOR DO PROCEDIMENTO', valor_procedimento, setvalor_procedimento, 300, 0)}
              </div>
              {editcampo('23 - OBSERVAÇÃO / JUSTIFICATIVA', observacao, setobservacao, '100%', 1, 100)}
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 2.5,
                  margin: 2,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%',
                  }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='fonte_titulo_header' style={{ minWidth: 300, maxWidth: 300 }}>
                      {'24 - ASSINATURA DO PROFISSIONAL EXECUTANTE'}
                    </div>
                    <div className='fonte_titulo_header' style={{ minWidth: 400, width: 400, marginTop: 10 }}>{'__________________________________________________________'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='fonte_titulo_header' style={{ minWidth: 300, maxWidth: 300 }}>
                      {'25 - ASSINATURA DO BENEFICIÁRIO OU RESPONSÁVEL'}
                    </div>
                    <div className='fonte_titulo_header' style={{ minWidth: 400, width: 400, marginTop: 10 }}>{'__________________________________________________________'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div id="GUIA CONSULTA PRINT"
              className='print'
              style={{
                display: 'none', flexDirection: 'column', width: 'calc(100% - 20px)',
                justifyContent: 'flex-start', marginTop: 25
              }}>
              <div id="cabeçalho" style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                height: 100, alignContent: 'center',
                alignItems: 'center',
              }}>
                <img alt="" src={logo}
                  style={{
                    display: logo == '' ? 'none' : 'flex',
                    height: 80,
                    borderRadius: 5,
                    marginBottom: 5,
                  }}>
                </img>
                <div style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', width: 500 }}>
                  {'GUIA DE CONSULTA'}
                </div>
                {pdfcampo('2 - Nº DA GUIA DO PRESTADOR', guia_prestador, 1)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                {pdfcampo('1- REGISTRO ANS', registro_ans, 1)}
                {pdfcampo('3 - NÚMERO DA GUIA PRINCIPAL', '', 1)}
              </div>
              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}
              >{'DADOS DO BENEFICIÁRIO'}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('4 - Nº DA CARTEIRA', n_carteira, 3)}
                {pdfcampo('5 - VALIDADE DA CARTEIRA', validade_carteira, 2)}
                {pdfcampo('6 - ATENDIMENTO A RN', rn, 1)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('7 - NOME', nome, 4)}
                {pdfcampo('8 - CARTÃO NACIONAL DE SAÚDE', cns, 1)}
              </div>
              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}
              >
                {'DADOS DO CONTRATADO'}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('9 - CÓDIGO NA OPERADORA', codigo_prestador, 2)}
                {pdfcampo('10 - NOME DO CONTRATADO', nome_contratado, 4)}
                {pdfcampo('11 - CÓDIGO CNES', localStorage.getItem('PARTICULAR') == 'PARTICULAR' ? '' : cliente.cnes, 2)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('12 - NOME DO PROFISSIONAL EXECUTANTE', nome_solicitante, 5)}
                {pdfcampo('13 - CONSELHO PROFISSIONAL', conselho_solicitante, 3)}
                {pdfcampo('14 - NÚMERO NO CONSELHO', n_conselho_solicitante, 3)}
                {pdfcampo('15 - UF', uf_solicitante, 1)}
                {pdfcampo('16 - CÓDIGO CBO', codigo_cbo, 3)}
              </div>

              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}
              >
                {'DADOS DO ATENDIMENTO / PROCEDIMENTO  REALIZADO'}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row', width: 400 }}>
                {pdfcampo('17 - INDICAÇÃO DE ACIDENTE (ACIDENTE OU DOENÇA RELACIONADA)', '9', 1)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('18 - DATA DO ATENDIMENTO', data_atendimento, 1)}
                {pdfcampo('19 - TIPO DE CONSULTA', tipoconsulta, 1)}
                {pdfcampo('20 - TABELA', tabela, 1)}
                {pdfcampo('21 - CÓDIGO DO PROCEDIMENTO', codigo_procedimento, 1)}
                {pdfcampo('22 - VALOR DO PROCEDIMENTO', valor_procedimento, 1)}
              </div>
              {pdfcampo('23 - OBSERVAÇÃO / JUSTIFICATIVA', observacao, 1, 200)}
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 2.5,
                  margin: 1,
                  marginTop: 5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%',
                  }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='fonte_titulo_header' style={{ minWidth: 300, maxWidth: 300 }}>
                      {'24 - ASSINATURA DO PROFISSIONAL EXECUTANTE'}
                    </div>
                    <div className='fonte_titulo_header' style={{ minWidth: 400, width: 400, marginTop: 10 }}>{'__________________________________________________________'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='fonte_titulo_header' style={{ minWidth: 300, maxWidth: 300 }}>
                      {'25 - ASSINATURA DO BENEFICIÁRIO OU RESPONSÁVEL'}
                    </div>
                    <div className='fonte_titulo_header' style={{ minWidth: 400, width: 400, marginTop: 10 }}>{'__________________________________________________________'}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div >
    )
  } else {
    return (
      <div id="guia-consulta"
        className='card-aberto'
        style={{ display: 'none', visibility: 'hidden' }}
      >
        < div className="fundo"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
          <div className="janela">PREPARANDO GUIA...</div>
        </div>
      </div>
    )
  }
}

export default GuiaConsulta;
