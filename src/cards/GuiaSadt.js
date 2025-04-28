/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
// import moment from "moment";
import toast from '../functions/toast';
// imagens.
import back from '../images/back.png';
import imprimir from '../images/imprimir.png';
import html2pdf from 'html2pdf.js'

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.addVirtualFileSystem(pdfFonts);

function GuiaSadt() {

  // context.
  const {
    html,
    atendimento,
    objatendimento,
    card, setcard,
    laboratorio,
    setlaboratorio,
    usuario,
    cliente,
    objpaciente,
    settoast,
  } = useContext(Context);

  useEffect(() => {
    console.log('GUIA SADT CARREGADA');
    if (card == 'guia-sadt') {
      loadExames();
      loadOperadoras();
      setnome(objpaciente.nome_paciente);
      setcns(objpaciente.cns);
      // setnome_contratado(cliente.nome_cliente);
      setnome_contratado('');
      setnome_solicitante(usuario.nome_usuario);
      setconselho_solicitante(usuario.conselho);
      setn_conselho_solicitante(usuario.n_conselho);
      setuf_solicitante('MG');
      setcodigo_cbo(usuario.codigo_cbo);
      // atendimento por convênio.
      if (localStorage.getItem('PARTICULAR') != 'PARTICULAR') {
        setn_carteira(objpaciente.convenio_carteira);
        setvalidade_carteira(objpaciente.validade_carteira);
      } else {
        setn_carteira('');
        setvalidade_carteira('');
      }
    }
    // eslint-disable-next-line
  }, [card, atendimento]);

  const [logo, setlogo] = useState();
  const [operadora, setoperadora] = useState(null);

  // campos da guia TISS-SADT.
  const [guia_prestador, setguia_prestador] = useState('');
  const [registro_ans, setregistro_ans] = useState('');
  const [n_guia_principal, setn_guia_principal] = useState('');
  const [data_autorizacao, setdata_autorizacao] = useState('');
  const [senha, setsenha] = useState('');
  const [validade_senha, setvalidade_senha] = useState('');
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

  const [logos, setlogos] = useState([]);
  const loadOperadoras = () => {
    axios.get(html + 'all_operadoras').then((response) => {
      console.log(cliente.id_cliente);
      var y = [];
      var x = response.data.rows;
      var z = x.filter(item => item.id_cliente == cliente.id_cliente);
      setlogos(z);
      y = x.filter(item => parseInt(item.id) == parseInt(objatendimento.convenio_id));
      let operadora = y.pop();
      setoperadora(operadora);
      console.log(operadora);
      if (operadora == undefined) {
        setlogo('');
        setregistro_ans('');
        setcodigo_prestador('');
        setoperadora('PARTICULAR');
      } else {
        setlogo(operadora.logo_operadora);
        setregistro_ans(operadora.registro_ans);
        setcodigo_prestador(operadora.codigo_prestador);
      }
    })
  }

  const [selectlogo, setselectlogo] = useState(0);
  function SelectLogo() {
    return (
      <div div className="fundo"
        onClick={() => setselectlogo(0)}
        style={{
          display: selectlogo == 1 ? 'flex' : 'none',
          flexDirection: 'column', justifyContent: 'center'
        }}>
        <div
          className="janela scroll"
          style={{ height: '80vh', width: '60vw' }}
          onClick={(e) => e.stopPropagation()}>
          {logos.map(item => (
            <div className='button'
              onClick={() => {
                setlogo(item.logo_operadora);
                setselectlogo(0);
              }}
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: 'calc(100% - 20px)',
                justifyContent: 'space-between',
                minHeight: 75, maxHeight: 75
              }}>
              <div style={{ marginLeft: 10 }}>{item.nome_operadora}</div>
              <img alt="" src={item.logo_operadora}
                style={{
                  display: 'flex',
                  height: 70,
                  borderRadius: 5,
                  marginRight: 2.5,
                }}
              ></img>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const loadExames = () => {
    let id_paciente = localStorage.getItem('item_exame');
    console.log(id_paciente);
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      var x = response.data.rows;
      var y = []
      setlaboratorio(x.filter(item => item.random == localStorage.getItem('random')));
      y = x.filter(item => item.random == localStorage.getItem('random'));
      console.log(y);
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
          position: 'absolute', top: -2, left: 5,
          backgroundColor: 'white',
          borderRadius: 2.5,
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
          defaultValue={valor != null && valor.length > 50 ? valor.toUpperCase().slice(0, 55) + '...' : valor != null && valor.length < 51 ? valor.toUpperCase() : ''}
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

  const updateLaboratorio = (item) => {
    let codigo = item.codigo_exame;
    let descricao = item.nome_exame;

    if (localStorage.getItem('campo_selecionado') == '25 - CÓDIGO DO PROCEDIMENTO OU ITEM ASSISTENCIAL') {
      codigo = localStorage.getItem('novo_valor');
      console.log('NOVO CÓDIGO: ' + codigo);
    }

    if (localStorage.getItem('campo_selecionado') == '26 - DESCRIÇÃO') {
      descricao = localStorage.getItem('novo_valor');
      console.log('NOVA DESCRIÇÃO: ' + descricao);
    }

    var obj = {
      id_paciente: item.id_paciente,
      id_atendimento: atendimento,
      data_pedido: item.data_pedido,
      data_resultado: null,
      codigo_exame: codigo,
      nome_exame: descricao,
      material: null,
      resultado: null,
      status: null,
      profissional: usuario.id,
      unidade_medida: null,
      vref_min: null,
      vref_max: null,
      obs: null,
      random: item.random,
      array_campos: null,
      metodo: null,
    }
    console.log(obj);
    axios.post(html + 'update_laboratorio/' + item.id, obj).then(() => {
      console.log('REGISTRO ATUALIZADO COM SUCESSO');
      loadLaboratorio(item.random);
    });
  }

  const loadLaboratorio = (random) => {
    axios.get(html + 'atendimento_laboratorio/' + atendimento).then((response) => {
      var x = response.data.rows;
      setlaboratorio(x.filter(item => item.random == random));
    });
  }

  const editcampovalor = (titulo, valor, tamanho, grow, item) => {
    let timeout = null;
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
          position: 'absolute', top: -2, left: 5,
          backgroundColor: 'white', borderRadius: 2.5,
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
          defaultValue={valor != null && valor.length > 50 ? valor.toUpperCase().slice(0, 55) + '...' : valor != null && valor.length < 51 ? valor.toUpperCase() : ''}
          onKeyUp={(e) => {
            console.log(e.target.value);
            let valor = e.target.value;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              // updatelaboratorio...
              localStorage.setItem('campo_selecionado', titulo);
              localStorage.setItem('novo_valor', valor);
              console.log(localStorage.getItem('campo_selecionado'));
              console.log(localStorage.getItem('novo_valor'));
              if (item != null) {
                updateLaboratorio(item);
                console.log('ATUALIZANDO REGISTRO DE LABORATÓRIO.');
              }
            }, 1000);
          }}
          style={{ backgroundColor: 'transparent', margin: 0, marginTop: 2, marginLeft: -2.5, padding: 0 }}
        >
        </input>
      </div>
    )
  }

  // campo para impressão da guia.
  const pdfcampo = (titulo, valor, flex) => {
    return (
      <div id="versão para impressão"
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          position: 'relative',
          borderStyle: 'solid', borderWidth: 1, borderColor: 'black', borderRadius: 2.5,
          margin: 1, marginTop: 5,
          padding: 1,
          flex: flex,
          minHeight: 12, maxHeight: 12,
          fontSize: 8, textAlign: 'left',
          fontFamily: 'Helvetica'
        }}>
        <div style={{
          position: 'absolute', top: -6, left: 5,
          backgroundColor: 'white',
          fontSize: 8,
          minHeight: 9, maxHeight: 9,
          paddingLeft: 1, paddingRight: 1,
          fontFamily: 'Helvetica'
        }}>
          {titulo}
        </div>
        <div style={{
          paddingTop: 1.8,
          fontFamily: 'Helvetica'
        }}>
          {valor != null && valor.length > 50 ? valor.toUpperCase().slice(0, 55) + '...' : valor != null && valor.length < 51 ? valor.toUpperCase() : ''}
        </div>
      </div>
    )
  }

  // IMPRESSÃO DA GUIA SADT.
  const [arrayguias, setarrayguias] = useState([]);

  function conteudo(grupo, pagina) {
    return (
      <div id={"GUIA SADT " + pagina}
        style={{
          display: 'none', flexDirection: 'column', justifyContent: 'flex-start',
          fontFamily: 'Helvetica',
          breakInside: 'avoid',
        }}>
        <div id="cabeçalho"
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          }}>
          <img alt="" src={logo}
            onClick={() => { setselectlogo(1); console.log('CLICA IMAGEM') }}
            style={{
              display: logo != '' ? 'flex' : 'none',
              height: 70,
              alignSelf: 'center',
              borderRadius: 5,
              marginBottom: 5,
            }}
          ></img>
          <div style={{
            fontSize: 14, fontWeight: 'bold', textAlign: 'center', flex: 4, fontFamily: 'Helvetica',
            alignSelf: 'center',
          }}>
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
          {pdfcampo('16 - CONSELHO PROFISSIONAL', conselho_solicitante, 2)}
          {pdfcampo('17 - NÚMERO NO CONSELHO', n_conselho_solicitante, 2)}
          {pdfcampo('18 - UF', uf_solicitante, 1)}
          {pdfcampo('19 - CÓDIGO CBO', codigo_cbo, 1)}
          {pdfcampo('20 - ASSINATURA DO PROFISSIONAL SOLICITANTE', '_________________________________________', 3)}
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
          {pdfcampo('22 - DATA DA SOLICITAÇÃO', '', 1)}
          {pdfcampo('23 - INDICAÇÃO CLÍNICA', '______________________', 4)}
        </div>
        <div id='linhas dos registros de exames solicitados'
          style={{
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            borderStyle: 'solid',
            borderColor: 'red',
            borderWidth: 1,
            borderRadius: 2.5,
            padding: 1,
            margin: 1,
            minHeight: 120,
          }}>
          {grupo.map(item => (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
              {pdfcampo('24 - TABELA', '21', 1)}
              {pdfcampo('25 - CÓDIGO DO PROCEDIMENTO OU ITEM ASSISTENCIAL', item.codigo_exame, 2)}
              {pdfcampo('26 - DESCRIÇÃO', item.nome_exame, 4)}
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
            padding: 1,
            margin: 1,
          }}
        >
          <div id='cabeçalho do grupo'
            style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
              width: 'calc(100% - 20px)', alignSelf: 'center'
            }}>
            <div className='fonte_titulo_header'
              style={{ minWidth: 140, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'36 - DATA'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'37 - HORA INICIAL'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'38 - HORA FINAL'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'39 - TABELA'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 160, maxWidth: 160, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'40 - CÓDIGO DO PROCEDIMENTO'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 160, maxWidth: 160, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'41 - DESCRIÇÃO'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 70, maxWidth: 70, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'42 - QTDE'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 40, maxWidth: 40, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'43 - VIA'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 40, maxWidth: 40, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'44 - TEC'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 80, maxWidth: 80, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'45 - FATOR PERD/ACRESC'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 140, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'46 - VALOR UNITÁRIO (R$)'}
            </div>
            <div className='fonte_titulo_header' style={{ minWidth: 140, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 8 }}>
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
            padding: 1,
            margin: 1,
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
            padding: 1,
            margin: 1,
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
          margin: 1, padding: 1,
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
            padding: 1,
            margin: 1,
          }}
        >
          <div id='cabeçalho do grupo'
            style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
              width: 'calc(100% - 20px)', alignSelf: 'center'
            }}>
            <div className='fonte_titulo_header' style={{ width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'59 - TOTAL DE PROCEDIMENTOS (R$)'}
            </div>
            <div className='fonte_titulo_header' style={{ width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'60 - TOTAL DE TAXAS E ALUGUÉIS (R$)'}
            </div>
            <div className='fonte_titulo_header' style={{ width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'61 - TOTAL DE MATERIAIS (R$)'}
            </div>
            <div className='fonte_titulo_header' style={{ width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'62 - TOTAL DE OPME (R$)'}
            </div>
            <div className='fonte_titulo_header' style={{ width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'63 - TOTAL DE MEDICAMENTOS (R$)'}
            </div>
            <div className='fonte_titulo_header' style={{ width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
              {'64 - TOTAL DE GASES MEDICINAIS (R$)'}
            </div>
            <div className='fonte_titulo_header' style={{ width: 200, fontFamily: 'Helvetica', fontSize: 8 }}>
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
            padding: 1,
            margin: 1,
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
    )
  }

  function printDiv() {
    let iniciogrupo = 0;
    let paginas = Math.ceil(laboratorio.length / 5);
    console.log('PÁGINAS: ' + paginas);

    // gerando as guias.
    let grupolaboratorio = [];
    while (paginas > 0) {
      // inserindo um grupo de 5 registros de procedimentos.
      grupolaboratorio.push(
        {
          pagina: paginas,
          procedimentos: laboratorio.slice(iniciogrupo, iniciogrupo + 5),
        }
      );
      // atualizando grupo para os próximos 5 procedimentos, até o esgotamento das páginas.
      iniciogrupo = iniciogrupo + 5;
      paginas = paginas - 1;
    }

    var nome_guia = 'GUIA SADT - ' + cliente.nome_cliente;
    var opt = {
      margin: 0.1,
      filename: nome_guia,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: 'css' }
    };

    // intervalo para que a array grupolaboratorio seja montada.
    setTimeout(() => {
      toast(settoast, 'PREPARANDO GUIAS PARA IMPRESSÃO, AGUARDE...', '#EC7063', 3000);
      // criando as guias de impressão, que ficam ocultas via css. 
      setarrayguias(grupolaboratorio);
      // intervalo para que as guias para impressão sejam "renderizadas".
      setTimeout(() => {
        grupolaboratorio.map(item => {
          setTimeout(() => {
            console.log('PREPARANDO PÁGINA: ' + item.pagina);
            toast(settoast, 'LANÇANDO PÁGINA ' + item.pagina + ' ...', '#EC7063', 3000);
            // capturando cada guia para impressão como elemento HTML e lançando para PDF.
            var element = document.getElementById('GUIA SADT ' + item.pagina).innerHTML;
            html2pdf().set(opt).from(element).output('dataurlnewwindow');
            // mountpdf(item);
          }, 1000);
          return null;
        })
      }, 1000 * paginas.length);
    }, 1000 * paginas.length);
  }

  // ALTERNATIVA: ## CRIAÇÃO DE DOCUMENTOS EM PDFMAKE E ASSINATURA DIGITAL ## //
  // construção do pdf.
  /*
  const mountpdf = (item) => {
    let arrayprocedimentos = item.procedimentos;

    const campo = (header, valor, largura) => {
      return (
        {
          table: {
            headerRows: 1,
            widths: [largura],
            body: [
              [
                {
                  stack: [
                    { text: header, style: 'header' },
                    { text: valor, style: 'row' }
                  ]
                }
              ],
            ],
          },
          width: largura,
        }
      )
    }

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: 10,

      // estilização CSS.
      styles: {
        header: {
          fontSize: 4,
          bold: true,
          alignment: 'left',
        },
        row: {
          fontSize: 6,
          bold: false,
          alignment: 'left'
        }
      },

      content: [
        {
          // cabeçalho da guia SADT
          columns: [
            {
              image: logo,
              height: 20,
              width: 50,
              alignment: 'center',
            },
            {
              text: 'GUIA DE SERVIÇO PROFISSIONAL / SERVIÇO AUXILIAR DE DIAGNÓSTICO E TERAPIA - SP/SADT',
              width: '*',
              fontSize: 12,
              bold: true,
              alignment: 'center',
            },
            campo('2 - Nº DA GUIA DO PRESTADOR', '______________________________', 100)
          ],
          columnGap: 10,
          margin: [20, 10, 20, 20]
        },
        // colocar todos os procedimentos da guia.
        arrayprocedimentos.map(item => (
          {
            columns: [
              campo('24 - TABELA', item.codigo_exame, 50),
              campo('25 - CÓDIGO DO PROCEDIMENTO OU ITEM ASSISTENCIAL', item.nome_exame, '*')
            ],
            columnGap: 12,
          }
        )),

      ],
    }
    // utilizando a lib pdfmake para gerar o pdf e converter em base64.
    setTimeout(() => {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.open();
    }, 3000);

  }
  */

  function GrupoExamesExecutados(numero) {
    return (
      <div id='grupo execução dos exames'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          width: 'calc(100% - 20px)', alignSelf: 'center'
        }}>
        <div className='fonte_titulo'
          style={{ minWidth: 140, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 10 }}>
          {numero + '|__|__|/|__|__|/|__|__|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__| : |__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__| : |__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 160, maxWidth: 160, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|__|__|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 160, maxWidth: 160, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'____________________________'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 70, maxWidth: 70, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 40, maxWidth: 40, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 40, maxWidth: 40, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|'}
        </div>
        <div id="45 - fator per/acresc" className='fonte_titulo'
          style={{ minWidth: 80, maxWidth: 80, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|,|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 140, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 10 }}>
          {'|__|__|__|__|__|__|,|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{ minWidth: 140, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 10 }}>
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
          width: 'calc(100% - 20px)', alignSelf: 'center', fontFamily: 'Helvetica', fontSize: 8
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
          {'_______________________________________________'}
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
          width: 'calc(100% - 20px)', alignSelf: 'center',
          fontFamily: 'Helvetica', fontSize: 8
        }}>
        <div className='fonte_titulo'
          style={{
            fontFamily: 'Helvetica', fontSize: 10, width: 200,
          }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{
            fontFamily: 'Helvetica', fontSize: 10, width: 200,
          }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{
            fontFamily: 'Helvetica', fontSize: 10, width: 200,
          }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{
          fontFamily: 'Helvetica', fontSize: 10, width: 200,
        }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{
          fontFamily: 'Helvetica', fontSize: 10, width: 200,
        }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{
          fontFamily: 'Helvetica', fontSize: 10, width: 200,
        }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
        <div className='fonte_titulo' style={{
          fontFamily: 'Helvetica', fontSize: 10, width: 200,
        }}>
          {'|__|__|__|__|__|__|__|__|.|__|__|'}
        </div>
      </div>
    )
  }

  function ProcedimentosEmSerie(numero) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div className='fonte_titulo' style={{
          fontFamily: 'Helvetica', fontSize: 10,
          marginRight: 2.5,
        }}>
          {numero + ' |__|__|/|__|__|/|__|__|__|__|'}
        </div>
        <div className='fonte_titulo'
          style={{
            fontFamily: 'Helvetica', fontSize: 10, marginLeft: 0, marginRight: 5,
          }}>
          {'_____________'}
        </div>
      </div>
    )
  }

  if (operadora != null) {
    return (
      <div id="guia-sadt"
        style={{ display: 'none', visibility: 'hidden' }}
      >
        < div className="fundo"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="janela scroll"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignContent: 'flex-start',
              alignItems: 'flex-start',
              width: '70vw',
              height: '70vh',
              padding: 20,
              backgroundColor: 'white', borderColor: 'white',
              overflowX: 'scroll', overflowY: 'scroll',
            }}>
            <SelectLogo></SelectLogo>
            <div id="botões da guia"
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignSelf: 'flex-start',
              }}>
              <div
                id="botão de retorno"
                className="button-red"
                style={{
                  display: 'flex',
                  opacity: 1,
                  // backgroundColor: "#ec7063",
                  alignSelf: "center",
                }}
                onClick={() => {
                  document.getElementById("guia-sadt").style.display = 'none';
                  document.getElementById("guia-sadt").style.visibility = 'hidden';
                  setcard('exames');
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
                  // printjsPdf();
                }}
              >
                <img alt="" src={imprimir} style={{ width: 30, height: 30 }}></img>
              </div>
            </div>
            <div id="GUIA SADT EDIT" className='landscape noprint'
              style={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-start',
                marginTop: 25, marginRight: 10,
                // backgroundColor: 'red',
              }}>
              <div id="cabeçalho" style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                alignContent: 'center',
                alignItems: 'center',
              }}>
                <img alt="" src={logo}
                  onClick={() => { setselectlogo(1); console.log('CLICA IMAGEM') }}
                  style={{
                    display: logo != '' ? 'flex' : 'none',
                    height: 70,
                    alignSelf: 'center',
                    borderRadius: 5,
                    marginBottom: 5,
                  }}>
                </img>
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
                {editcampovalor('22 - DATA DA SOLICITAÇÃO', '', 250, 0)}
                {editcampovalor('23 - INDICAÇÃO CLÍNICA', '', '', 1)}
              </div>
              <div id='linhas dos registros de exames solicitados'
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderStyle: 'solid',
                  borderColor: 'red',
                  borderWidth: 1,
                  borderRadius: 2.5,
                  padding: 2.5,
                  margin: 2.5,
                }}>
                {laboratorio.map(item => (
                  <div key={'LABORATÓRIO ' + item.id} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
                    {editcampovalor('24 - TABELA', '21', 50, 0)}
                    {editcampovalor('25 - CÓDIGO DO PROCEDIMENTO OU ITEM ASSISTENCIAL', item.codigo_exame, 130, 0, item)}
                    {editcampovalor('26 - DESCRIÇÃO', item.nome_exame, '', 1, item)}

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
                  padding: 2.5,
                  margin: 2.5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: 'calc(100% - 20px)', alignSelf: 'center'
                  }}>
                  <div className='fonte_titulo_header'
                    style={{ minWidth: 140, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'36 - DATA'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'37 - HORA INICIAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 100, maxWidth: 100, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'38 - HORA FINAL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 50, maxWidth: 50, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'39 - TABELA'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 160, maxWidth: 160, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'40 - CÓDIGO DO PROCEDIMENTO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 160, maxWidth: 160, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'41 - DESCRIÇÃO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 70, maxWidth: 70, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'42 - QTDE'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 40, maxWidth: 40, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'43 - VIA'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 40, maxWidth: 40, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'44 - TEC'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 80, maxWidth: 80, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'45 - FATOR PERD/ACRESC'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 140, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 8 }}>
                    {'46 - VALOR UNITÁRIO (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 140, maxWidth: 140, fontFamily: 'Helvetica', fontSize: 8 }}>
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
                  padding: 2.5,
                  margin: 2.5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: 'calc(100% - 20px)', alignSelf: 'center', fontFamily: 'Helvetica', fontSize: 8
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
                  padding: 2.5,
                  margin: 2.5,
                }}
              >
                <div className='fonte_titulo_header'
                  style={{ display: 'flex', justifyContent: 'flex-start', alignSelf: 'flex-start', fontFamily: 'Helvetica', fontSize: 8, margin: 2.5 }}>
                  {'56 - DATA DE REALIZAÇÃO DE PROCEDIMENTOS EM SÉRIE  57 - ASSINATURA DO BENEFICIÁRIO OU RESPONSÁVEL'}
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  {ProcedimentosEmSerie('01')}
                  {ProcedimentosEmSerie('03')}
                  {ProcedimentosEmSerie('05')}
                  {ProcedimentosEmSerie('07')}
                  {ProcedimentosEmSerie('09')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
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
                margin: 2.5,
              }}>
                <div style={{ position: 'absolute', top: 1, left: 5 }}>
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
                  padding: 2.5,
                  margin: 2.5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    width: 'calc(100% - 20px)', alignSelf: 'center'
                  }}>
                  <div className='fonte_titulo_header' style={{ width: 200 }}>
                    {'59 - TOTAL DE PROCEDIMENTOS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ width: 200 }}>
                    {'60 - TOTAL DE TAXAS E ALUGUÉIS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ width: 200 }}>
                    {'61 - TOTAL DE MATERIAIS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ width: 200 }}>
                    {'62 - TOTAL DE OPME (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ width: 200 }}>
                    {'63 - TOTAL DE MEDICAMENTOS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ width: 200 }}>
                    {'64 - TOTAL DE GASES MEDICINAIS (R$)'}
                  </div>
                  <div className='fonte_titulo_header' style={{ width: 200 }}>
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
                  padding: 2.5,
                  margin: 2.5,
                }}
              >
                <div id='cabeçalho do grupo'
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                  }}>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200 }}>
                    {'66 - ASSINATURA DO RESPONSÁVEL PELA AUTORIZAÇÃO'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200 }}>
                    {'67 - ASSINATURA DO BENEFICIÁRIO OU RESPONSÁVEL'}
                  </div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, maxWidth: 200 }}>
                    {'68 - ASSINATURA DO CONTRATADO'}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',

                  }}
                >
                  <div className='fonte_titulo_header' style={{ minWidth: 200, width: 200 }}>{'__________________________________________'}</div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, width: 200 }}>{'__________________________________________'}</div>
                  <div className='fonte_titulo_header' style={{ minWidth: 200, width: 200 }}>{'__________________________________________'}</div>
                </div>
              </div>
            </div>
            <div id="GUIA SADT PRINT"
              style={{
                display: 'none', flexDirection: 'column',
              }}>
              {arrayguias.map((item) => conteudo(item.procedimentos, item.pagina))}
            </div>
          </div>
        </div>
      </div >
    )
  } else {
    return (
      <div id="guia-sadt"
        style={{ display: 'none', visibility: 'hidden' }}
      >
        < div className="fundo"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
          <div className="janela">
            <div className='text1'>PREPARANDO GUIA...</div>
          </div>
        </div>
      </div>
    )
  }
}

export default GuiaSadt;
