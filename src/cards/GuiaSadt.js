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
    usuario,
    cliente,
    objpaciente,
  } = useContext(Context);

  useEffect(() => {
    console.log('GUIA SADT CARREGADA');
    if (card == 'guia-sadt') {
      loadExames();
      loadOperadoras();
      setn_carteira(objpaciente.convenio_carteira);
      setvalidade_carteira(objpaciente.validade_carteira);
      setnome(objpaciente.nome_paciente);
      setcns(objpaciente.cns);
      setnome_contratado(cliente.nome_cliente);
      setnome_solicitante(usuario.nome_usuario);
      setconselho_solicitante(usuario.conselho);
      setn_conselho_solicitante(usuario.n_conselho);
      setuf_solicitante('MG');
      setcodigo_cbo(usuario.codigo_cbo);
      console.log(usuario);
    }
    // eslint-disable-next-line
  }, [card]);

  const [logo, setlogo] = useState();
  const [operadora, setoperadora] = useState(null);

  // campos da guia TISS-SADT.
  const [guia_prestador, setguia_prestador] = useState('');
  const [registro_ans, setregistro_ans] = useState('');
  const [n_guia_principal, setn_guia_principal] = useState('');
  const [data_autorizacao, setdata_autorizacao] = useState(moment().format('DD/MM/YYYY'));
  const [senha, setsenha] = useState('');
  const [validade_senha, setvalidade_senha] = useState(moment().add(30, 'days').format('DD/MM/YYYY'));
  const [n_guia_operadora, setn_guia_operadora] = useState('');
  const [n_carteira, setn_carteira] = useState('');
  const [validade_carteira, setvalidade_carteira] = useState('');
  const [nome, setnome] = useState('');
  const [cns, setcns] = useState('');
  const [rn, setrn] = useState('NÃO');
  const [codigo_prestador, setcodigo_prestador] = useState('');
  const [nome_contratado, setnome_contratado] = useState('');

  const [nome_solicitante, setnome_solicitante] = useState('');
  const [conselho_solicitante, setconselho_solicitante] = useState('');
  const [n_conselho_solicitante, setn_conselho_solicitante] = useState('');
  const [uf_solicitante, setuf_solicitante] = useState('');
  const [codigo_cbo, setcodigo_cbo] = useState('');



  const loadOperadoras = () => {
    axios.get(html + 'all_operadoras').then((response) => {
      var y = [];
      var x = response.data.rows;
      y = x.filter(item => parseInt(item.id) == parseInt(objatendimento.convenio_id));
      let operadora = y.pop();
      setoperadora(operadora);
      setlogo(operadora.logo_operadora);
      setregistro_ans(operadora.registro_ans);
      setcodigo_prestador(operadora.codigo_prestador);
    })
  }

  const loadExames = () => {
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      var x = response.data.rows;
      setlaboratorio(x.filter(item => item.random == localStorage.getItem('random')));
    });
  }

  // campos para edição da guia.
  let timeout = null;
  const editcampo = (titulo, valor, setvalor, tamanho, grow) => {
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
          position: 'absolute', top: -5, left: 5,
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
          onBlur={(e) => (e.target.placeholder = { titulo })}
          defaultValue={valor.length > 55 ? valor.toUpperCase().slice(0, 55) + '...' : valor.toUpperCase()}
          style={{ backgroundColor: 'transparent', margin: 0, marginTop: 2, marginLeft: -2.5, padding: 0 }}
          onKeyUp={() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              console.log(valor.toString())
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
          position: 'absolute', top: -5, left: 5,
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
          onBlur={(e) => (e.target.placeholder = { titulo })}
          defaultValue={valor != null && valor.length > 55 ? valor.toUpperCase().slice(0, 55) + '...' : ''}
          style={{ backgroundColor: 'transparent', margin: 0, marginTop: 2, marginLeft: -2.5, padding: 0 }}
        >
        </input>
      </div>
    )
  }

  // campo para impressão da guia.
  const pdfcampo = (titulo, valor, flex) => {
    return (
      <div id="versão para impressão" className='noprint'
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          position: 'relative',
          borderStyle: 'solid', borderWidth: 1, borderColor: 'black', borderRadius: 2.5,
          margin: 1, marginTop: 5,
          padding: 1.5,
          flex: flex,
          minHeight: 15, maxHeight: 15,
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
          {valor.length > 55 ? valor.toUpperCase().slice(0, 55) + '...' : valor.toUpperCase()}
        </div>
      </div>
    )
  }

  // IMPRESSÃO DA GUIA SADT.
  function printDiv() {
    let printdocument = document.getElementById("GUIA SADT PRINT").innerHTML;
    var a = window.open();
    a.document.write('<html>');
    a.document.write('<link rel="stylesheet" type="text/css" href="design.css"></link>');
    a.document.write(printdocument);
    a.document.write('</html>');
    a.print();
  }

  function GrupoExamesExecutados(numero) {
    return (
      <div id='grupo execução dos exames'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          width: '100%', alignSelf: 'center'
        }}>
        <div className='fonte_titulo'
          style={{ minWidth: 130, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 10 }}>
          {numero + '|__|__|/|__|__|/|__|__|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 73, maxWidth: 73, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__| : |__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 73, maxWidth: 73, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__| : |__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 38, maxWidth: 38, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 120, maxWidth: 120, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'_________________________'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 25, maxWidth: 25, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 25, maxWidth: 25, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|,|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 115, maxWidth: 110, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|,|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 115, maxWidth: 110, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|,|__|__|'}
        </div>
      </div>
    )
  }

  function GrupoIdentificacaoDosProfissionais() {
    return (
      <div id='grupo identificação dos profissionais'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          width: '100%', alignSelf: 'center', fontFamily: 'Helvetica', fontSize: 8
        }}>
        <div className='fonte_titulo' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 200, maxWidth: 200, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|__|__|__|__|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 270, maxWidth: 270, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'__________________________________________________'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 200, maxWidth: 200, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|'}
        </div>
      </div>
    )
  }

  function GrupoTotalDeGastos() {
    return (
      <div id='grupo total de gastos'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          width: 'calc(100% - 20px)', alignSelf: 'center', fontFamily: 'Helvetica', fontSize: 8
        }}>
        <div className='fonte_titulo' style={{
          minWidth: 150, maxWidth: 150, fontFamily: 'Helvetica', fontSize: 10,
        }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
      </div>
    )
  }

  function ProcedimentosEmSerie(numero) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div className='fonte_titulo' style={{
          minWidth: 150, maxWidth: 150, fontFamily: 'Helvetica', fontSize: 10,
          // backgroundColor: 'red',
          marginRight: 2.5,
        }}>
          {numero + ' |__|__|/|__|__|/|__|__|__|__|'}
        </div>
        <div className='fonte_titulo' style={{
          minWidth: 90, maxWidth: 90, fontFamily: 'Helvetica', fontSize: 10, marginLeft: 0, marginRight: 5,
        }}>
          {'________________'}
        </div>
      </div>
    )
  }

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
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignContent: 'flex-start',
              alignItems: 'flex-start',
              width: '80vw',
              height: '70vh',
              padding: 20, paddinRight: 30,
              backgroundColor: 'white', borderColor: 'white',
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
              style={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-start', marginTop: 25,
                width: '200%',
              }}>
              <div id="cabeçalho" style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                height: 100,
                alignContent: 'center',
                alignItems: 'center',
              }}>
                <img alt="" src={logo} style={{ width: 100, height: 100 }}></img>
                <div style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', width: 500 }}>
                  {'GUIA DE SERVIÇO PROFISSIONAL / SERVIÇO AUXILIAR DE DIAGNÓSTICO E TERAPIA - SP/SADT'}
                </div>
                {editcampo('2 - Nº DA GUIA DO PRESTADOR', guia_prestador, setguia_prestador, 120, 0)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                {editcampo('1- REGISTRO ANS', registro_ans, setregistro_ans, 100, 0)}
                {editcampo('3 - NÚMERO DA GUIA PRINCIPAL', n_guia_principal, setn_guia_principal, '', 0)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('4 - DATA DA AUTORIZAÇÃO', data_autorizacao, setdata_autorizacao, 150, 0)}
                {editcampo('5 - SENHA', senha, setsenha, 100, 0)}
                {editcampo('6 - DATA DE VALIDADE DA SENHA', validade_senha, setvalidade_senha, 150, 0)}
                {editcampo('7 - NÚMERO DA GUIA ATRIBUÍDO PELA OPERADORA', n_guia_operadora, setn_guia_operadora, '', 1)}
              </div>
              <div className='grupo'>{'DADOS DO BENEFICIÁRIO'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('8 - Nº DA CARTEIRA', n_carteira, setn_carteira, 100, 0)}
                {editcampo('9 - VALIDADE DA CARTEIRA', validade_carteira, setvalidade_carteira, 70, 0)}
                {editcampo('10 - NOME', nome, setnome, '', 1)}
                {editcampo('11 - CARTÃO NACIONAL DE SAÚDE', cns, setcns, 90, 0)}
                {editcampo('12 - ATENDIMENTO A RN', rn, setrn, 90, 0)}
              </div>
              <div className='grupo'>{'DADOS DO SOLICITANTE'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('13 - CÓDIGO NA OPERADORA', codigo_prestador, setcodigo_prestador, 200, 0)}
                {editcampo('14 - NOME DO CONTRATADO', nome_contratado, setnome_contratado, '', 1)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('15 - NOME DO PROFISSIONAL SOLICITANTE', nome_solicitante, setnome_solicitante, '', 1)}
                {editcampo('16 - CONSELHO PROFISSIONAL', conselho_solicitante, setconselho_solicitante, 100, 0)}
                {editcampo('17 - NÚMERO NO CONSELHO', n_conselho_solicitante, setn_conselho_solicitante, 150, 0)}
                {editcampo('18 - UF', uf_solicitante, setuf_solicitante, 100, 0)}
                {editcampo('19 - CÓDIGO CBO', codigo_cbo, setcodigo_cbo, 100, 0)}
                {editcampovalor('20 - ASSINATURA DO PROFISSIONAL SOLICITANTE', '', 200, 0)}
              </div>
              <div className='grupo'>{'DADOS DA SOLICITAÇÃO / PROCEDIMENTOS OU ITENS ASSISTENCIAIS SOLICITADOS'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampovalor('21 - CARÁTER DO ATENDIMENTO', '1 - ELETIVO', 200, 0)}
                {editcampovalor('22 - DATA DA SOLICITAÇÃO', moment().format('DD/MM/YYYY'), 250, 0)}
                {editcampovalor('23 - INDICAÇÃO CLÍNICA', '', '', 1)}
              </div>
              <div id='linhas dos registros de exames solicitados'
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}>
                {laboratorio.map(item => (
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
                    {editcampovalor('24 - TABELA', '21', 50, 0)}
                    {editcampovalor('25 - CÓDIGO DO PROCEDIMENTO OU ITEM ASSISTENCIAL', item.codigo_exame, 130, 0)}
                    {editcampovalor('26 - DESCRIÇÃO', item.nome_exame, '', 1)}
                    {editcampovalor('27 - QTDE SOLIC.', '01', 50, 0)}
                    {editcampovalor('28 - QTDE AUT.', '01', 50, 0)}
                  </div>
                ))}
              </div>
              <div className='grupo'>{'DADOS DO CONTRATADO EXECUTANTE'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampo('29 - CÓDIGO NA OPERADORA', operadora.codigo_prestador, setcodigo_cbo, 100, 0)}
                {editcampo('30 - NOME DO CONTRATADO', cliente.nome_cliente, setcodigo_cbo, '', 1)}
                {editcampo('31 - CÓDIGO CNES', cliente.cnes, setcodigo_cbo, 200, 0)}
              </div>
              <div className='grupo'>{'DADOS DO ATENDIMENTO'}</div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {editcampovalor('32 - TIPO DE ATENDIMENTO', '05', 80, 0)}
                {editcampovalor('33 - INDICAÇÃO DE ACIDENTE (ACIDENTE OU DOENÇA RELACIONADA)', '9', 150, 0)}
                {editcampovalor('34 - TIPO DE CONSULTA', localStorage.getItem("tipo_consulta"), 80, 0)}
                {editcampovalor('35 - MOTIVO DE ENCERRAMENTO DO ATENDIMENTO', '15', 200, 0)}
              </div>
              <div className='grupo'>{'DADOS DA EXECUÇÃO / PROCEDIMENTOS E EXAMES REALIZADOS'}</div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%', alignSelf: 'center'
                  }}>
                  <div className='fonte_titulo_header'
                    style={{ minWidth: 130, maxWidth: 130, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'36 - DATA'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 73, maxWidth: 73, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'37 - HORA INICIAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 73, maxWidth: 73, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'38 - HORA FINAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 38, maxWidth: 38, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'39 - TABELA'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'40 - CÓDIGO DO PROCEDIMENTO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 120, maxWidth: 120, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'41 - DESCRIÇÃO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'42 - QTDE'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 25, maxWidth: 25, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'43 - VIA'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 25, maxWidth: 25, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'44 - TEC'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'45 - FATOR PERD/ACRESC'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 115, maxWidth: 115, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'46 - VALOR UNITÁRIO (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 115, maxWidth: 115, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'47 - VALOR TOTAL (R$)'}
                  </div>
                </div>
                {GrupoExamesExecutados('1 ')}
                {GrupoExamesExecutados('2 ')}
                {GrupoExamesExecutados('3 ')}
                {GrupoExamesExecutados('4 ')}
                {GrupoExamesExecutados('5 ')}
              </div>
              <div className='grupo'>{'IDENTIFICAÇÃO DO(S) PROFISSIONAL(IS) EXECUTANTE(S)'}</div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%', alignSelf: 'center'
                  }}>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50 }}>
                    {'48 - SEQ. REF'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50 }}>
                    {'49 - GRAU PART.'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200 }}>
                    {'50 - CÓDIGO NA OPERADORA/CPF'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 270, maxWidth: 270 }}>
                    {'51 - NOME DO PROFISSIONAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 100, maxWidth: 100 }}>
                    {'52 - CONSELHO PROFISSIONAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200 }}>
                    {'53 - NÚMERO NO CONSELHO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50 }}>
                    {'54 - UF'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 100, maxWidth: 100 }}>
                    {'55 - CÓDIGO CBO'}
                  </div>
                </div>
                {GrupoIdentificacaoDosProfissionais()}
                {GrupoIdentificacaoDosProfissionais()}
                {GrupoIdentificacaoDosProfissionais()}
                {GrupoIdentificacaoDosProfissionais()}
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}
              >
                <div className='fonte_titulo_header'
                  style={{ display: 'flex', justifyContent: 'flex-start', alignSelf: 'flex-start', fontFamily: 'Helvetica', fontSize: 8 }}>
                  {'56 - DATA DE REALIZAÇÃO DE PROCEDIMENTOS EM SÉRIE  57 - ASSINATURA DO BENEFICIÁRIO OU RESPONSÁVEL'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {ProcedimentosEmSerie('01')}
                  {ProcedimentosEmSerie('03')}
                  {ProcedimentosEmSerie('05')}
                  {ProcedimentosEmSerie('07')}
                  {ProcedimentosEmSerie('09')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {ProcedimentosEmSerie('02')}
                  {ProcedimentosEmSerie('04')}
                  {ProcedimentosEmSerie('06')}
                  {ProcedimentosEmSerie('08')}
                  {ProcedimentosEmSerie('10')}
                </div>
              </div>

              <div className='fonte_titulo_header' style={{
                display: 'flex', flexDirection: 'row',
                height: 50, backgroundColor: '#B2BEBE',
                position: 'relative', width: '100%',
                borderRadius: 2.5,
                marginTop: 5, marginBottom: 5,
              }}>
                <div style={{ position: 'absolute', top: 5, left: 5 }}>
                  {'58 - OBSERVAÇÃO/JUSTIFICATIVA'}
                </div>
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: 'calc(100% - 20px)', alignSelf: 'center'
                  }}>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 140 }}>
                    {'59 - TOTAL DE PROCEDIMENTOS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 140 }}>
                    {'60 - TOTAL DE TAXAS E ALUGUÉIS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 140 }}>
                    {'61 - TOTAL DE MATERIAIS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 140 }}>
                    {'62 - TOTAL DE OPME (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 140 }}>
                    {'63 - TOTAL DE MEDICAMENTOS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 140 }}>
                    {'64 - TOTAL DE GASES MEDICINAIS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 140 }}>
                    {'65 - TOTAL GERAL (R$)'}
                  </div>
                </div>
                {GrupoTotalDeGastos()}
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%', alignSelf: 'center'
                  }}>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200 }}>
                    {'66 - ASSINATURA DO RESPONSÁVEL PELA AUTORIZAÇÃO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200 }}>
                    {'67 - ASSINATURA DO BENEFICIÁRIO OU RESPONSÁVEL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200 }}>
                    {'68 - ASSIANTURA DO CONTRATADO'}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%', alignSelf: 'center'
                  }}
                >
                  <div className='fonte_titulo_header' style={{ minWidth: 200, width: 200 }}>{'____________________________'}</div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, width: 200 }}>{'____________________________'}</div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, width: 200 }}>{'____________________________'}</div>
                </div>
              </div>
            </div>

            <div id="GUIA SADT PRINT"
              className='print'
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                width: 'calc(100% - 20px)', fontFamily: 'Helvetica',
              }}>
              <div id="cabeçalho" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <img alt="" src={logo} style={{ width: 100, height: 100, marginTop: -40 }}></img>
                <div style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', flex: 4, fontFamily: 'Helvetica' }}>
                  {'GUIA DE SERVIÇO PROFISSIONAL / SERVIÇO AUXILIAR DE DIAGNÓSTICO E TERAPIA - SP/SADT'}
                </div>
                {pdfcampo('2 - Nº DA GUIA DO PRESTADOR', guia_prestador, 1)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', fontFamily: 'Helvetica', width: '50vw' }}>
                {pdfcampo('1 - REGISTRO ANS', registro_ans, 1)}
                {pdfcampo('3 - NÚMERO DA GUIA PRINCIPAL', n_guia_principal, 1)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row', fontFamily: 'Helvetica' }}>
                {pdfcampo('4 - DATA DA AUTORIZAÇÃO', data_autorizacao, 1)}
                {pdfcampo('5 - SENHA', senha, 1)}
                {pdfcampo('6 - DATA DE VALIDADE DA SENHA', validade_senha, 1)}
                {pdfcampo('7 - NÚMERO DA GUIA ATRIBUÍDO PELA OPERADORA', n_guia_operadora, 1)}
              </div>
              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}>
                {'DADOS DO BENEFICIÁRIO'}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('8 - Nº DA CARTEIRA', n_carteira, 1)}
                {pdfcampo('9 - VALIDADE DA CARTEIRA', validade_carteira, 1)}
                {pdfcampo('10 - NOME', nome, 4)}
                {pdfcampo('11 - CARTÃO NACIONAL DE SAÚDE', cns, 2)}
                {pdfcampo('12 - ATENDIMENTO A RN', rn, 1)}
              </div>
              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}>
                {'DADOS DO SOLICITANTE'}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('13 - CÓDIGO NA OPERADORA', codigo_prestador, 1)}
                {pdfcampo('14 - NOME DO CONTRATADO', nome_contratado, 3)}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('15 - NOME DO PROFISSIONAL SOLICITANTE', nome_solicitante, 3)}
                {pdfcampo('16 - CONSELHO PROFISSIONAL', conselho_solicitante, 1)}
                {pdfcampo('17 - NÚMERO NO CONSELHO', n_conselho_solicitante, 1)}
                {pdfcampo('18 - UF', uf_solicitante, 1)}
                {pdfcampo('19 - CÓDIGO CBO', codigo_cbo, 1)}
                {pdfcampo('20 - ASSINATURA DO PROFISSIONAL SOLICITANTE', '________________________', 3)}
              </div>
              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}>
                {'DADOS DA SOLICITAÇÃO / PROCEDIMENTOS OU ITENS ASSISTENCIAIS SOLICITADOS'}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('21 - CARÁTER DO ATENDIMENTO', '1 - ELETIVO', 1)}
                {pdfcampo('22 - DATA DA SOLICITAÇÃO', moment().format('DD/MM/YYYY'), 1)}
                {pdfcampo('23 - INDICAÇÃO CLÍNICA', '______________________', 4)}
              </div>
              <div id='linhas dos registros de exames solicitados'
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: '#b2babb',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}>
                {laboratorio.map(item => (
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
                    {pdfcampo('24 - TABELA', '21', 1)}
                    {pdfcampo('25 - CÓDIGO DO PROCEDIMENTO OU ITEM ASSISTENCIAL', item.codigo_exame, 2)}
                    {pdfcampo('26 - DESCRIÇÃO', item.nome_exame, 4)}
                    {pdfcampo('27 - QTDE SOLIC.', '01', 1)}
                    {pdfcampo('28 - QTDE AUT.', '01', 1)}
                  </div>
                ))}
              </div>
              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}>
                {'DADOS DO CONTRATADO EXECUTANTE'}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('29 - CÓDIGO NA OPERADORA', operadora.codigo_prestador, 1)}
                {pdfcampo('30 - NOME DO CONTRATADO', cliente.nome_cliente, 3)}
                {pdfcampo('31 - CÓDIGO CNES', cliente.cnes, 1)}
              </div>
              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}>
                {'DADOS DO ATENDIMENTO'}
              </div>
              <div id='linha comum da guia' style={{ display: 'flex', flexDirection: 'row' }}>
                {pdfcampo('32 - TIPO DE ATENDIMENTO', '05', 1)}
                {pdfcampo('33 - INDICAÇÃO DE ACIDENTE (ACIDENTE OU DOENÇA RELACIONADA)', '9', 2)}
                {pdfcampo('34 - TIPO DE CONSULTA', localStorage.getItem("tipo_consulta"), 1)}
                {pdfcampo('35 - MOTIVO DE ENCERRAMENTO DO ATENDIMENTO', '15', 1)}
              </div>
              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}>
                {'DADOS DA EXECUÇÃO / PROCEDIMENTOS E EXAMES REALIZADOS'}
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%', alignSelf: 'center'
                  }}>
                  <div className='fonte_titulo_header'
                    style={{ minWidth: 130, maxWidth: 130, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'36 - DATA'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 73, maxWidth: 73, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'37 - HORA INICIAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 73, maxWidth: 73, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'38 - HORA FINAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 38, maxWidth: 38, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'39 - TABELA'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'40 - CÓDIGO DO PROCEDIMENTO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'41 - DESCRIÇÃO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'42 - QTDE'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 25, maxWidth: 25, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'43 - VIA'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 25, maxWidth: 25, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'44 - TEC'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 55, maxWidth: 55, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'45 - FATOR PERD/ACRESC'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 115, maxWidth: 115, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'46 - VALOR UNITÁRIO (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 115, maxWidth: 115, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'47 - VALOR TOTAL (R$)'}
                  </div>
                </div>
                {GrupoExamesExecutados('1 ')}
                {GrupoExamesExecutados('2 ')}
                {GrupoExamesExecutados('3 ')}
                {GrupoExamesExecutados('4 ')}
                {GrupoExamesExecutados('5 ')}
              </div>
              <div className='grupo'
                style={{
                  fontFamily: 'Helvetica', fontSize: 8,
                  backgroundColor: '#B2BEBE',
                  borderRadius: 2.5,
                  padding: 1,
                  margin: 1
                }}>
                {'IDENTIFICAÇÃO DO(S) PROFISSIONAL(IS) EXECUTANTE(S)'}
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%', alignSelf: 'center'
                  }}>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'48 - SEQ. REF'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'49 - GRAU PART.'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'50 - CÓDIGO NA OPERADORA/CPF'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 270, maxWidth: 270, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'51 - NOME DO PROFISSIONAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'52 - CONSELHO PROFISSIONAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'53 - NÚMERO NO CONSELHO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'54 - UF'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'55 - CÓDIGO CBO'}
                  </div>
                </div>
                {GrupoIdentificacaoDosProfissionais()}
                {GrupoIdentificacaoDosProfissionais()}
                {GrupoIdentificacaoDosProfissionais()}
                {GrupoIdentificacaoDosProfissionais()}
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}
              >
                <div className='fonte_titulo_header'
                  style={{ display: 'flex', justifyContent: 'flex-start', alignSelf: 'flex-start', fontFamily: 'Helvetica', fontSize: 8 }}>
                  {'56 - DATA DE REALIZAÇÃO DE PROCEDIMENTOS EM SÉRIE  57 - ASSINATURA DO BENEFICIÁRIO OU RESPONSÁVEL'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {ProcedimentosEmSerie('01')}
                  {ProcedimentosEmSerie('03')}
                  {ProcedimentosEmSerie('05')}
                  {ProcedimentosEmSerie('07')}
                  {ProcedimentosEmSerie('09')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {ProcedimentosEmSerie('02')}
                  {ProcedimentosEmSerie('04')}
                  {ProcedimentosEmSerie('06')}
                  {ProcedimentosEmSerie('08')}
                  {ProcedimentosEmSerie('10')}
                </div>
              </div>

              <div className='fonte_titulo_header' style={{
                display: 'flex', flexDirection: 'row',
                height: 50, backgroundColor: '#B2BEBE',
                position: 'relative', width: '100%', borderRadius: 2.5,
                marginTop: 5, marginBottom: 5,
              }}>
                <div style={{ position: 'absolute', top: 5, left: 5, fontFamily: 'Helvetica', fontSize: 8 }}>
                  {'58 - OBSERVAÇÃO/JUSTIFICATIVA'}
                </div>
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%', alignSelf: 'center'
                  }}>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'59 - TOTAL DE PROCEDIMENTOS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'60 - TOTAL DE TAXAS E ALUGUÉIS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'61 - TOTAL DE MATERIAIS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'62 - TOTAL DE OPME (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'63 - TOTAL DE MEDICAMENTOS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'64 - TOTAL DE GASES MEDICINAIS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 135, maxWidth: 135, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'65 - TOTAL GERAL (R$)'}
                  </div>
                </div>
                {GrupoTotalDeGastos()}
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 5,
                  margin: 5,
                  fontFamily: 'Helvetica', fontSize: 8,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%', alignSelf: 'center', fontFamily: 'Helvetica', fontSize: 8
                  }}>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'66 - ASSINATURA DO RESPONSÁVEL PELA AUTORIZAÇÃO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'67 - ASSINATURA DO BENEFICIÁRIO OU RESPONSÁVEL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'68 - ASSINATURA DO CONTRATADO'}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: '100%', alignSelf: 'center'
                  }}
                >
                  <div className='fonte_titulo_header' style={{ minWidth: 200, width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>{'____________________________'}</div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>{'____________________________'}</div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>{'____________________________'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
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
