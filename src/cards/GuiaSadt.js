/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from "moment";
// imagens.
import back from '../images/back.svg';
import imprimir from '../images/imprimir.svg';

function GuiaSadt() {

  // context.
  const {
    html,
    atendimento,
    objatendimento,
    card,
    laboratorio,
    setlaboratorio,
    objpaciente,
  } = useContext(Context);

  useEffect(() => {
    console.log('GUIA SADT CARREGADA');
    if (card == 'guia-sadt') {
      loadExames();
      loadOperadoras();
    }
    // eslint-disable-next-line
  }, [card]);

  const [logo, setlogo] = useState();
  const [operadora, setoperadora] = useState(null);
  const loadOperadoras = () => {
    axios.get(html + 'all_operadoras').then((response) => {
      var y = [];
      var x = response.data.rows;
      y = x.filter(item => parseInt(item.id) == parseInt(objatendimento.convenio_id));
      let operadora = y.pop();
      setoperadora(operadora);
      setlogo(operadora.logo_operadora);
    })
  }

  const loadExames = () => {
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      var x = response.data.rows;
      setlaboratorio(x.filter(item => item.random == localStorage.getItem('random')));
    });
  }

  // campo para impressão da guia.
  const pdfcampo = (titulo, flex) => {
    return (
      <div id="versão para impressão" className='print'
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          position: 'relative',
          borderStyle: 'solid', borderWidth: 2.5, borderColor: 'black', borderRadius: 5,
          margin: 5, padding: 10,
          flex: flex,
          minHeight: 25, maxHeight: 25,
          fontSize: 12, textAlign: 'left',
          fontFamily: 'Helvetica',
          breakInside: 'auto',
          whiteSpace: 'pre-wrap',
        }}>
        <div style={{
          position: 'absolute', top: -8, left: 5,
          backgroundColor: 'white',
          fontSize: 8,
          maxWidth: 150,
          minHeight: 20, maxHeight: 20,
          paddingLeft: 2.5, paddingRight: 2.5,
        }}>
          {titulo}
        </div>
        <div
          id={'input_print ' + titulo}
          style={{
            paddingTop: 15,
          }}>
          {
            //document.getElementById('input ' + titulo).value != null ? document.getElementById('input ' + titulo).value : ''
          }
        </div>
      </div>
    )
  }

  let interval = null;
  const editcampo = (titulo, valor, tamanho, grow) => {
    return (
      <div id="versão para edição"
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          position: 'relative',
          borderStyle: 'solid', borderWidth: 2.5, borderColor: 'black', borderRadius: 5,
          margin: 5, padding: 10,
          width: grow == 1 ? '' : tamanho,
          flexGrow: grow,
          minHeight: 25, maxHeight: 25,
          fontSize: 12, textAlign: 'left',
        }}>
        <div style={{
          position: 'absolute', top: -8, left: 5,
          backgroundColor: 'white',
          fontSize: 8,
          maxWidth: 150,
          minHeight: 20, maxHeight: 20,
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
          onBlur={(e) => (e.target.placeholder = { titulo })}
          defaultValue={valor.length > 55 ? valor.toUpperCase().slice(0, 55) + '...' : valor.toUpperCase()}
        >
        </input>
      </div>
    )
  }

  // IMPRESSÃO DA GUIA SADT.
  function printDiv() {
    let printdocument = document.getElementById("GUIA SADT PRINT").innerHTML;
    var a = window.open();
    a.document.write('<html>');
    a.document.write(printdocument);
    a.document.write('</html>');
    a.print();
  }

  // PENDÊNCIAS:
  /*
  1. Acrescenter função para atualizar registro da guia
  */

  if (operadora != null) {
    return (
      <div id="guia-sadt"
        className='card-aberto'
        style={{ display: 'none', visibility: 'hidden' }}
      >
        <div className="text3">GUIA SADT</div>
        < div className="fundo"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="janela scroll"
            style={{
              position: 'relative',
              width: '80vw', height: '70vh', padding: 20,
              backgroundColor: 'white', borderColor: 'white',
              flexDirection: 'column', justifyContent: 'center',
              overflowX: 'scroll', overflowY: 'scroll',
            }}>

            <div id="botões da guia"
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                position: 'absolute',
                top: 5, right: 10,
              }}>
              <div
                id="botão de retorno"
                className="button-red"
                style={{
                  display: 'flex',
                  opacity: 1,
                  backgroundColor: "#ec7063",
                  alignSelf: "center",
                }}
                onClick={() => {
                  document.getElementById("guia-sadt").style.display = 'none';
                  document.getElementById("guia-sadt").style.visibility = 'hidden';
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
                  backgroundColor: "#ec7063",
                  alignSelf: "center",
                }}
                onClick={() => {
                  printDiv();
                }}
              >
                <img alt="" src={imprimir} style={{ width: 30, height: 30 }}></img>
              </div>
            </div>

            <div id="GUIA SADT EDIT"
              className='noprint'
              style={{ display: 'flex', flexDirection: 'column', width: 'calc(100% - 20px)', marginTop: 100 }}>
              <div id="cabeçalho" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 }}>
                <img alt="" src={logo} style={{ width: 100, height: 50 }}></img>
                <div style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', width: 500 }}>
                  {'GUIA DE SERVIÇO PROFISSIONAL / SERVIÇO AUXILIAR DE DIAGNÓSTICO E TERAPIA - SP/SADT'}
                </div>
                {editcampo('2 - Nº DA GUIA DO PRESTADOR', '', 120, 0)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                {editcampo('1- REGISTRO ANS', operadora.registro_ans, 100, 0)}
                {editcampo('3 - NÚMERO DA GUIA PRINCIPAL', '', '', 0)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('4 - DATA DA AUTORIZAÇÃO', moment().format('DD/MM/YYYY'), 150, 0)}
                {editcampo('5 - SENHA', '', '', 0)}
                {editcampo('6 - DATA DE VALIDADE DA SENHA', '', 150, 0)}
                {editcampo('7 - NÚMERO DA GUIA ATRIBUÍDO PELA OPERADORA', '', '', 1)}
              </div>
              <div id='grupo' style={{ fontSize: 10, backgroundColor: '#b2babb', marginLeft: 5, marginRight: 5 }}>{'DADOS DO BENEFICIÁRIO'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('8 - Nº DA CARTEIRA', objpaciente.convenio_carteira, 100, 0)}
                {editcampo('9 - VALIDADE DA CARTEIRA', objpaciente.validade_carteira, 70, 0)}
                {editcampo('10 - NOME', objpaciente.nome_paciente, '', 1)}
                {editcampo('11 - CARTÃO NACIONAL DE SAÚDE', objpaciente.cns, 150, 0)}
                {editcampo('12 - ATENDIMENTO A RN', 'NÃO', 65, 0)}
              </div>
              <div id='grupo' style={{ fontSize: 10, backgroundColor: '#b2babb', marginLeft: 5, marginRight: 5 }}>{'DADOS DO SOLICITANTE'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('13 - CÓDIGO NA OPERADORA', operadora.codigo_prestador, 150, 0)}
                {editcampo('14 - NOME DO CONTRATADO', 'PENDENTE', 150, 0)}
              </div>

              <div id='linhas dos registros de exames'
                style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {laboratorio.map(item => (
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
                    <div>
                      {editcampo('CÓDIGO DO PROCEDIMENTO OU ITEM ASSISTENCIAL', item.codigo_exame, 200, 0)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
                      {editcampo('DESCRIÇÃO', item.nome_exame, 600, 1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="GUIA SADT PRINT"
              className='print'
              style={{
                display: 'flex', flexDirection: 'column', width: 'calc(100% - 20px)',
                fontFamily: 'Helvetica',
              }}>
              <div id="cabeçalho" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <img alt="" src={logo} style={{ width: 100, height: 50 }}></img>
                <div style={{
                  fontSize: 16, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Helvetica',
                  marginLeft: 40, marginRight: 40,
                  flex: 4
                }}>
                  {'GUIA DE SERVIÇO PROFISSIONAL / SERVIÇO AUXILIAR DE DIAGNÓSTICO E TERAPIA - SP/SADT'}
                </div>
                {pdfcampo('Nº DA GUIA DO PRESTADOR', 1)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                {pdfcampo('REGISTRO ANS', 3)}
                {pdfcampo('NÚMERO DA GUIA PRINCIPAL', 2)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('DATA DA AUTORIZAÇÃO', 2)}
                {pdfcampo('SENHA', 3)}
                {pdfcampo('DATA DE VALIDADE DA SENHA', 3)}
                {pdfcampo('NÚMERO DA GUIA ATRIBUÍDO PELA OPERADORA', 5)}
              </div>
              <div id='grupo'
                style={{
                  fontSize: 10, backgroundColor: '#b2babb',
                  marginLeft: 5, marginRight: 5,
                  fontFamily: 'Helvetica',
                }}>{'DADOS DO BENEFICIÁRIO'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('Nº DA CARTEIRA', 2)}
                {pdfcampo('VALIDADE DA CARTEIRA', 3)}
              </div>

              <div id='linhas dos registros de exames'
                style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {laboratorio.map(item => (
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {pdfcampo('CÓDIGO DO PROCEDIMENTO OU ITEM ASSISTENCIAL', 2)}
                    {pdfcampo('DESCRIÇÃO', 5)}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div id="guia-sadt"
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

export default GuiaSadt;
