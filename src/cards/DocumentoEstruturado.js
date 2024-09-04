/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import Context from '../pages/Context';
import moment from 'moment';
import axios from 'axios';
// imagens.
import back from '../images/back.svg';
import print from '../images/imprimir.svg';
import copiar from '../images/copiar.svg';
import novo from '../images/novo.svg';
import salvar from '../images/salvar.svg';
import deletar from '../images/deletar.svg';
// funções.
import selector from '../functions/selector';
// componentes.
import Header from '../components/Header';
import Footer from '../components/Footer';

function DocumentoEstruturado() {

  // context.
  const {
    html,
    atendimento,
    paciente,
    pacientes,
    card, setcard,
    usuario,
    tipodocumento, settipodocumento,
    setselecteddocumento,
    setdono_documento,
    cliente,
    mobilewidth,
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-doc-estruturado-aih') {
      loadCodigoProcedimentoAih();
      settipodocumento('AIH');
      loadDocumentosEstruturados('AIH');
    }
    // eslint-disable-next-line
  }, [card, paciente, atendimento]);

  // CARREGANDO DOCUMENTOS ESTRUTURADOS E RESPECTIVOS CAMPOS.
  const [arraydocumentosestruturados, setarraydocumentosestruturados] = useState([]);
  const loadDocumentosEstruturados = (tipodocumento) => {
    axios.get(html + 'documentos_estruturados/' + paciente).then((response) => {
      var x = response.data.rows;
      setarraydocumentosestruturados(x.filter(item => item.tipodocumento == tipodocumento).sort((a, b) => moment(a.data) < moment(b.data) ? 1 : -1));
    })
  }
  const [camposestruturados, setcamposestruturados] = useState([]);
  const loadCamposEstruturados = (id) => {
    if (id != null) {
      axios.get(html + 'campos_estruturados/' + id).then((response) => {
        var x = response.data.rows;
        setcamposestruturados(x);
      })
    } else {
      setcamposestruturados([]);
    }
  }

  // CRUD PARA DOCUMENTOS ESTRUTURADOS E SEUS RESPECTIVOS CAMPOS.
  const insertDocumentoEstruturado = (tipodocumento) => {
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data: moment(),
      id_usuario: usuario.id,
      status: 0, // 0 = documento novo; 1 = documento assinado.
      tipodocumento: tipodocumento,
      id_profissional: usuario.id,
      conselho: usuario.conselho + ': ' + usuario.n_conselho,
      nome_profissional: usuario.nome_usuario
    }
    let iddocumento = null;
    axios.post(html + 'insert_documento_estruturado', obj).then(() => {
      // recuperando id do documento estruturado...
      axios.get(html + 'documentos_estruturados/' + paciente).then((response) => {
        var x = response.data.rows;
        var y = x.filter(item => item.tipodocumento == tipodocumento).sort((a, b) => moment(a.data) > moment(b.data) ? 1 : -1).slice(-1);
        iddocumento = y.map(item => item.id).pop();
        // inserir campos estruturados correspondentes.
        insertGrupoCamposEstruturados(iddocumento, tipodocumento, obj);
        setselecteddocumento([]);
      })
    })
  }
  const updateDocumentoEstruturado = (item) => {
    var obj = {
      id_paciente: item.id_paciente,
      id_atendimento: item.id_atendimento,
      data: moment(),
      id_usuario: item.id_usuario,
      status: 1, // 0 = documento novo; 1 = documento assinado.
      tipodocumento: item.tipodocumento,
      id_profissional: usuario.id,
      conselho: usuario.conselho + ': ' + usuario.n_conselho,
      nome_profissional: usuario.nome_usuario
    }
    axios.post(html + 'update_documento_estruturado/' + item.id, obj).then(() => {
      createFaturamentoAIH(item.id)
      loadDocumentosEstruturados(tipodocumento);
      loadCamposEstruturados(null);
      setselecteddocumento([]);
    })
  }

  const insertGrupoCamposEstruturados = (iddocumento, tipodocumento, obj) => {
    if (tipodocumento == 'AIH') {
      let lastevolucao = '';
      // recuperando informações da última evolução para alimentar a AIH...
      axios.get(html + "list_documentos/" + atendimento).then((response) => {
        var x = response.data.rows;
        lastevolucao = x.filter(item => item.tipo_documento == 'EVOLUÇÃO').map(item => item.texto).slice(-1).pop();
        // INSERIR CAMPOS COMPLEMENTARES NA AIH PARA FATURAMENTO.
        // AO SALVAR O DOCUMENTO DE AIH, RECUPERAR OS REGISTROS DE CAMPOS ESTRUTURADOS CORRESPONDENTES AO DOCUMENTO E LANÇAR NA TABELA DE FATURAMENTO.
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '1 - NOME DO ESTABELECIMENTO DE SOLICITANTE', cliente.razao_social, 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '2 - CNES', '6632858', 50, 1, 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '3- NOME DO ESTABELECIMENTO EXECUTANTE', cliente.razao_social, 0);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '4 - CNES', cliente.cnes, 0);
        insertCampoEstruturado('textarea', '60%', iddocumento, tipodocumento, obj, '5 - NOME DO PACIENTE', pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_paciente).pop(), 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '6 - Nº DO PRONTUÁRIO', paciente, 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '7 - DATA DE NASCIMENTO', pacientes.filter(item => item.id_paciente == paciente).map(item => moment(item.dn_paciente).format('DD/MM/YY')).pop(), 1);
        insertCampoEstruturado('opcaounica', null, iddocumento, tipodocumento, obj, '8 - SEXO', '', 1, 'M,F,I');
        insertCampoEstruturado('opcaounica', null, iddocumento, tipodocumento, obj, '9 - RAÇA', '', 1, 'BRANCA,PRETA,AMARELA');
        insertCampoEstruturado('textarea', '60%', iddocumento, tipodocumento, obj, '10 - NOME DA MÃE', pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_mae_paciente).pop(), 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '11 - TELEFONE DE CONTATO', pacientes.filter(item => item.id_paciente == paciente).map(item => item.telefone).pop(), 1);
        insertCampoEstruturado('textarea', '60%', iddocumento, tipodocumento, obj, '12 - NOME DO RESPONSÁVEL', pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_responsavel).pop(), 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '13 - TELEFONE DE CONTATO', '', 1);
        insertCampoEstruturado('textarea', '60%', iddocumento, tipodocumento, obj, '14 - ENDEREÇO (RUA, Nº, BAIRRO', pacientes.filter(item => item.id_paciente == paciente).map(item => item.endereco).pop(), 1);
        insertCampoEstruturado('textarea', '60%', iddocumento, tipodocumento, obj, '15 - MUNICÍPIO DE RESIDÊNCIA', pacientes.filter(item => item.id_paciente == paciente).map(item => item.localidade).pop(), 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '16 - CÓD. IBGE MUNICÍPIO', '', 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '17 - UF', pacientes.filter(item => item.id_paciente == paciente).map(item => item.uf).pop(), 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '18 - CEP', pacientes.filter(item => item.id_paciente == paciente).map(item => item.cep).pop(), 1);
        insertCampoEstruturado('textarea', '60%', iddocumento, tipodocumento, obj, '19 - PRINCIPAIS SINAIS E SINTOMAS CLÍNICOS', lastevolucao, 1, '');
        insertCampoEstruturado('textarea', '60%', iddocumento, tipodocumento, obj, '20 - CONDIÇÕES QUE JUSTIFICAM A INTERNAÇÃO', 'RISCO DE MORTE', 1, '');
        insertCampoEstruturado('textarea', '60%', iddocumento, tipodocumento, obj, '21 - PRINCIPAIS RESULTADOS DE PROVAS DIAGNÓSTICAS (RESULTADOS DE EXAMES REALIZADOS)', 'VIDE EXAMES ACIMA', 1, '');
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '22 - DIAGNÓSTICO INICIAL', '', 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '23 - CID 10 PRINCIPAL', '', 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '24 - CID 10 SECUNDÁRIO', '', 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '25 - CID 10 CAUSAS ASSOCIADAS', '', 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '26 - DESCRIÇÃO DO PROCEDIMENTO SOLICITADO', '', 1);
        insertCampoEstruturado('botao', null, iddocumento, tipodocumento, obj, '27 - CÓDIGO DO PROCEDIMENTO', '', 1, '', 'faturamento_sus_tabela_aih');
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '28 - CLÍNICA', 'CLÍNICA MÉDICA', 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '29 - CARÁTER DE INTERNAÇÃO', 'URGÊNCIA', 1);
        insertCampoEstruturado('opcaounica', null, iddocumento, tipodocumento, obj, '30 - TIPO DE LEITO', '', 1, 'ENFERMARIA,CTI');
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '31 - NOME DO PROFISSIONAL SOLICITANTE/ASSISTENTE', usuario.nome_usuario, 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '32 - DOCUMENTO DO PROFISSIONAL SOLICITANTE', usuario.cpf_usuario, 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '33 - DATA DA SOLICITAÇÃO', moment().format('DD/MM/YYYY'), 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '34 - ASSINTAURA E CARIMBO (Nº DO REGISTRO DO CONSELHO)', '', 1);

        // testando opção múltipla.
        // insertCampoEstruturado('opcaomultipla', null, iddocumento, tipodocumento, obj, '36 - OPÇÕES VARIADAS PARA TESTE', '', 1, 'A,B,C,D');

        // causas externas.
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '35 - CNPJ DO EMPREGADOR', '', 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '36 - CNAER', '', 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '37 - VÍNCULO PREVIDÊNCIA', '', 1);
        insertCampoEstruturado('textarea', null, iddocumento, tipodocumento, obj, '38 - CBO COMPLETA', '', 1);

        loadDocumentosEstruturados(tipodocumento);
      });
    }
  }

  // função que insere um registro de faturamento de AIH:
  const createFaturamentoAIH = (id) => {
    // recuperando os campos do documento estruturado AIH cadastrado.
    axios.get(html + 'campos_estruturados/' + id).then((response) => {
      var x = response.data.rows;
      var obj = {
        data_abertura: moment(),
        data_fechamento: null,
        id_paciente: paciente,
        nome_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_paciente).pop(),
        id_atendimento: atendimento,
        numero_aih: null,
        cartao_sus: pacientes.filter(item => item.id_paciente == paciente).map(item => item.cns).pop(),
        dn: pacientes.filter(item => item.id_paciente == paciente).map(item => item.dn_paciente).pop(),
        sexo: pacientes.filter(item => item.id_paciente == paciente).map(item => item.sexo).pop(),
        nome_mae: pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_mae_paciente).pop(),
        nome_responsavel: pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_responsavel).pop(),
        endereco_logradouro: pacientes.filter(item => item.id_paciente == paciente).map(item => item.endereco).pop(),
        endereco_numero: pacientes.filter(item => item.id_paciente == paciente).map(item => item.endereco_numero).pop(),
        endereco_complemento: pacientes.filter(item => item.id_paciente == paciente).map(item => item.endereco_complemento).pop(),
        endereco_bairro: pacientes.filter(item => item.id_paciente == paciente).map(item => item.bairro).pop(),
        endereco_cep: pacientes.filter(item => item.id_paciente == paciente).map(item => item.cep).pop(),
        cod_municipio: pacientes.filter(item => item.id_paciente == paciente).map(item => item.localidade).pop(),
        telefone_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.telefone).pop(),
        nacionalidade: pacientes.filter(item => item.id_paciente == paciente).map(item => item.nacionalidade).pop(),
        cor: pacientes.filter(item => item.id_paciente == paciente).map(item => item.cor).pop(),
        etnia: pacientes.filter(item => item.id_paciente == paciente).map(item => item.etnia).pop(),
        tipo_documento_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.tipo_documento).pop(),
        numero_documento_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.numero_documento).pop(),
        tipo_aih: null,
        apresentacao: null, // mês/ano (competência?)
        orgao_emissor: pacientes.filter(item => item.id_paciente == paciente).map(item => item.orgao_emissor).pop(), // órgão emissor do documento?
        proc_solicitado: x.filter(valor => valor.titulo == '27 - CÓDIGO DO PROCEDIMENTO').map(item => item.valor).pop(),
        proc_principal: x.filter(valor => valor.titulo == '27 - CÓDIGO DO PROCEDIMENTO').map(item => item.valor).pop(),
        mudanca_procedimento: null,
        modalidade: null,
        espec_leito: x.filter(valor => valor.titulo == '30 - TIPO DE LEITO').map(item => item.valor).pop(),
        cid_principal: x.filter(valor => valor.titulo == '23 - CID 10 PRINCIPAL').map(item => item.valor).pop(),
        motivo_encerramento: null,
        doc_profissional_solicitante: usuario.nome_usuario,
        doc_profissional_responsavel: usuario.cpf_usuario,
        doc_autorizador: null,
        data_autorizador: null,
        aih_anterior: null,
        aih_posterior: null,
        cnpj_empregador: x.filter(valor => valor.titulo == '35 - CNPJ DO EMPREGADOR').map(item => item.valor).pop(),
        cnaer: x.filter(valor => valor.titulo == '36 - CNAER').map(item => item.valor).pop(),
        vinculo_previdencia: x.filter(valor => valor.titulo == '37 - VÍNCULO PREVIDÊNCIA').map(item => item.valor).pop(),
        cbo_completa: x.filter(valor => valor.titulo == '38 - CBO COMPLETA').map(item => item.valor).pop(),
      }
      axios.post(html + 'insert_aih', obj).then((response) => {
        console.log('AIH REGISTRADA COM SUCESSO');
      })
    })
  }

  const deleteDocumentoEstruturado = (id) => {
    axios.get(html + 'delete_documento_estruturado/' + id).then(() => {
      console.log('DOCUMENTO ESTRUTURADO EXCLUÍDO COM SUCESSO');
      // deletando campos estruturados associados.
      axios.get(html + 'campos_estruturados/' + id).then((response) => {
        var x = response.data.rows;
        x.map(item => deleteCampoEstruturado(item.id));
        loadDocumentosEstruturados(tipodocumento);
        loadCamposEstruturados(null);
        setselecteddocumento([]);
      });
    });
  }
  const insertCampoEstruturado = (tipocampo, largura, iddocumento, tipodocumento, obj, titulo, valor, obrigatorio, opcoes, funcao) => {
    var obj1 = {
      id_documento: iddocumento,
      id_paciente: obj.id_paciente,
      id_atendimento: obj.id_atendimento,
      data: obj.data,
      valor: valor,
      titulo: titulo,
      tipo: tipodocumento,
      altura: null,
      largura: largura,
      obrigatorio: obrigatorio,
      tipocampo: tipocampo,
      opcoes: opcoes,
      funcao: funcao,
    }
    axios.post(html + 'insert_campo_estruturado', obj1).then(() => {
      console.log('CAMPO INSERIDO COM SUCESSO');
    })
  }
  const updateCampoEstruturado = (item, valor) => {
    console.log(item);
    console.log(valor);
    var obj = {
      id_documento: item.id_documento,
      id_paciente: item.id_paciente,
      id_atendimento: item.id_atendimento,
      data: item.data,
      valor: valor,
      titulo: item.titulo,
      tipo: item.tipo,
      altura: item.altura,
      largura: item.largura,
      obrigatorio: item.obrigatorio,
      tipocampo: item.tipocampo,
      opcoes: item.opcoes,
      funcao: item.funcao,
    }
    axios.post(html + 'update_campo_estruturado/' + item.id, obj).then(() => {
      console.log('CAMPO ATUALIZADO COM SUCESSO');
    })
  }
  const deleteCampoEstruturado = (item) => {
    axios.get(html + 'delete_campo_estruturado/' + item).then(() => {
      console.log('CAMPO DELETADO COM SUCESSO');
    });
  }
  const copiarDocumentoEstruturado = (id) => {
    // inserindo um novo documento estruturado.
    var obj = {
      id_paciente: paciente,
      id_atendimento: atendimento,
      data: moment(),
      id_usuario: usuario.id,
      status: 0, // 0 = documento novo; 1 = documento assinado.
      tipodocumento: tipodocumento,
    }
    axios.post(html + 'insert_documento_estruturado', obj).then(() => {
      // recuperando a id do documento criado.
      axios.get(html + 'documentos_estruturados/' + paciente).then((response) => {
        var x = response.data.rows;
        var y = x.filter(item => item.tipodocumento == tipodocumento).sort((a, b) => moment(a.data) > moment(b.data) ? 1 : -1).slice(-1);
        let iddocumento = y.map(item => item.id).pop();
        console.log('TIPO DE DOCUMENTO: ' + tipodocumento);
        console.log('ID NOVA: ' + iddocumento);
        // carregando os campos estruturados do documento copiado.
        axios.get(html + 'campos_estruturados/' + id).then((response) => {
          var x = response.data.rows;
          // eslint-disable-next-line
          x.filter(item => item.id_documento == id).map(item => {
            var obj = {
              id_documento: iddocumento,
              id_paciente: item.id_paciente,
              id_atendimento: atendimento,
              data: moment(),
              valor: item.valor,
              titulo: item.titulo,
              tipo: item.tipo,
              altura: item.altura,
              largura: item.largura,
              obrigatorio: item.obrigatorio,
              tipocampo: item.tipocampo,
              opcoes: item.opcoes,
            }
            axios.post(html + 'insert_campo_estruturado', obj).then(() => {
              console.log('CAMPO COPIADO COM SUCESSO');
            });
          });
          setselecteddocumento([])
          loadDocumentosEstruturados(tipodocumento);
          loadCamposEstruturados(null);
        });
      });
    });
  }

  const ListaDeDocumentosEstruturados = useCallback(() => {
    return (
      <div id="componente lista de documentos e botões"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '25vw',
          margin: 0, marginLeft: 10,
          height: '100%',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center',
          marginBottom: 10,
        }}>
          <div id="botão para sair da tela de documentos"
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
          <div className='button-green'
            style={{ marginLeft: 0 }}
            onClick={() => insertDocumentoEstruturado(tipodocumento)}
          >
            <img
              alt=""
              src={novo}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
        </div>
        <div
          id="lista de documentos estruturados"
          className='scroll'
          style={{
            backgroundColor: 'white',
            borderColor: 'white',
            height: '100%', marginBottom: 0.5,
            width: 'calc(100% - 20px)',
          }}
        >
          {arraydocumentosestruturados.map((item) => (
            <div id={'documento estruturado' + item.id}
              className='button'
              onClick={() => {
                setselecteddocumento(item);
                setdono_documento({
                  id: item.id_profissional,
                  conselho: item.conselho,
                  nome: item.nome_profissional,
                })
                loadCamposEstruturados(item.id);
                selector("lista de documentos estruturados", 'documento estruturado' + item.id, 500);
              }}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 180 }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <div id="botão para deletar documento"
                  className="button-yellow"
                  style={{
                    display: item.id_usuario == usuario.id ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25,
                  }}
                  onClick={(e) => {
                    deleteDocumentoEstruturado(item.id)
                    e.stopPropagation();
                  }}>
                  <img
                    alt=""
                    src={deletar}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
                <div id="botão para assinar documento"
                  className="button-green"
                  style={{
                    display: item.status == 0 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25,
                  }}
                  onClick={(e) => {
                    setselecteddocumento(item);
                    updateDocumentoEstruturado(item);
                    e.stopPropagation();
                  }}>
                  <img
                    alt=""
                    src={salvar}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
                <div id="botão para copiar documento"
                  className="button-green"
                  style={{
                    display: item.status == 1 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25, marginLeft: 0
                  }}
                  onClick={() => {
                    setselecteddocumento(item);
                    copiarDocumentoEstruturado(item.id);
                  }}>
                  <img
                    alt=""
                    src={copiar}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
                <div id="botão para imprimir documento"
                  className="button-green"
                  style={{
                    display: item.status == 1 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25, marginLeft: 0,
                  }}
                  onClick={() => {
                    setselecteddocumento(item);
                    setdono_documento({
                      id: item.id_profissional,
                      conselho: item.conselho,
                      nome: item.profissional,
                    });
                    setTimeout(() => {
                      printDiv()
                    }, 1000);
                  }}>
                  <img
                    alt=""
                    src={print}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
              </div>
              <div>{tipodocumento}</div>
              <div style={{ fontSize: 10, marginTop: 10, whiteSpace: 'pre-wrap', marginBottom: 5 }}>{item.profissional}</div>
              <div>{moment(item.data).format('DD/MM/YY')}</div>
              <div>{moment(item.data).format('HH:mm')}</div>
            </div>
          ))}
        </div>
      </div >
    )
    // eslint-disable-next-line
  }, [arraydocumentosestruturados]);

  // CAMPOS ESTRUTURADOS PARA FORMULÁRIO E IMPRESSÃO.
  const printcampo = (tipocampo, titulo, valor) => {
    if (tipocampo == 'textarea') {
      return (
        <div style={{
          margin: 2.5, padding: 2.5,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          fontFamily: 'Helvetica',
          breakInside: 'avoid',
          borderStyle: 'solid', borderWidth: 1, borderRadius: 5,
          borderColor: 'black',
          flexGrow: 'inherit',
        }}
        >
          <div
            className='text1' style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 2.5 }}>{titulo}</div>
          <div
            id={titulo}
            className='text1'
            style={{ fontSize: 12, fontWeight: 'normal' }}
          >
            {valor == '' ? '-x-' : valor}
          </div>
        </div>
      )
    } else if (tipocampo == 'opcaounica') {
      return (
        <div style={{
          margin: 2.5, padding: 2.5,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          fontFamily: 'Helvetica',
          breakInside: 'avoid',
          borderStyle: 'solid', borderWidth: 1, borderRadius: 5,
          borderColor: 'black',
          flexGrow: 'inherit',
        }}>
          <div
            className='text1' style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 2.5 }}>{titulo}</div>
          <div
            id={titulo}
            className='text1'
            style={{ fontSize: 12, fontWeight: 'normal' }}
          >
            {valor == '' ? '-x-' : valor}
          </div>
        </div>
      )
    } else if (tipocampo == 'opcaomultipla') {
      return (
        <div style={{
          margin: 2.5, padding: 2.5,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          fontFamily: 'Helvetica',
          breakInside: 'avoid',
          borderStyle: 'solid', borderWidth: 1, borderRadius: 5,
          borderColor: 'black',
          flexGrow: 'inherit',
        }}>
          <div
            className='text1' style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 2.5 }}>{titulo}</div>
          <div
            id={titulo}
            className='text1'
            style={{
              fontSize: 12, fontWeight: 'normal',
              display: 'flex', flexDirection: 'row', flexWrap: 'wrap'
            }}
          >
            {valor.split(",").map((item) => (
              <div style={{ marginRight: 2.5 }}>{item}</div>
            ))}
          </div>
        </div>
      )
    }
  }

  // CÓDIGOS RELATIVOS AO DOCUMENTO AIH:
  const [codigoprocedimentoaih, setcodigoprocedimentoaih] = useState([]);
  const loadCodigoProcedimentoAih = () => {
    axios.get(html + 'load_codigos_aih').then((response) => {
      var x = [0, 1];
      x = response.data.rows;
      setcodigoprocedimentoaih(x);
    })
  }
  // FORMULÁRIO.
  function Formulario() {
    // CÓDIGOS PARA AIH:
    function GetProcedimentoAih() {
      const [arraycodigoprocedimentoaih, setarraycodigoprocedimentoaih] = useState([]);
      function FilterCodigoProcedimentoAih() {
        var timeout = null;
        var searchcodigoprocedimentoaih = "";
        const [filtercodigoprocedimentoaih, setfiltercodigoprocedimentoaih] = useState("");
        const filterCodigoProcedimentoAih = () => {
          clearTimeout(timeout);
          searchcodigoprocedimentoaih = document.getElementById("inputcodigoprocedimentoaih").value;
          document.getElementById("inputcodigoprocedimentoaih").focus();
          timeout = setTimeout(() => {
            if (searchcodigoprocedimentoaih == "") {
              searchcodigoprocedimentoaih = "";
              setarraycodigoprocedimentoaih([]);
              document.getElementById("inputcodigoprocedimentoaih").value = "";
              setTimeout(() => {
                document.getElementById("inputcodigoprocedimentoaih").focus();
              }, 100);
            } else {
              setfiltercodigoprocedimentoaih(searchcodigoprocedimentoaih);
              setTimeout(() => {
                setarraycodigoprocedimentoaih(codigoprocedimentoaih.filter((item) => item.procedimento.toUpperCase().includes(searchcodigoprocedimentoaih) || item.codigo.includes(searchcodigoprocedimentoaih)));
                document.getElementById("inputcodigoprocedimentoaih").value = searchcodigoprocedimentoaih;
                document.getElementById("inputcodigoprocedimentoaih").focus();
              }, 100);
            }
          }, 1000);
        };
        return (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
            <input
              className="input"
              autoComplete="off"
              placeholder={
                window.innerWidth < mobilewidth ? "BUSCAR PROCEDIMENTO..." : "BUSCAR..."
              }
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) =>
                window.innerWidth < mobilewidth
                  ? (e.target.placeholder = "BUSCAR PROCEDIMENTO...")
                  : "BUSCAR..."
              }
              onKeyUp={() => filterCodigoProcedimentoAih()}
              type="text"
              id="inputcodigoprocedimentoaih"
              maxLength={100}
              defaultValue={filtercodigoprocedimentoaih}
              style={{ width: '100%' }}
            ></input>
          </div>
        );
      }
      return (
        <div id="viewprocedimentosaih"
          style={{ display: 'none' }}
          className='fundo' onClick={() => document.getElementById("viewprocedimentosaih").style.display = 'none'}>
          <div
            className='janela scroll'
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
              width: '70vw', height: '70vh'
            }}>
            <FilterCodigoProcedimentoAih></FilterCodigoProcedimentoAih>
            {arraycodigoprocedimentoaih.map(item => (
              <div className='button'
                style={{ width: 'calc(100% - 20px)' }}
                onClick={() => {
                  let obj = localStorage.getItem("campo");
                  console.log(obj);
                  updateCampoEstruturado(JSON.parse(obj), item.codigo);
                  document.getElementById("viewprocedimentosaih").style.display = 'none'
                  setTimeout(() => {
                    document.getElementById("button_codigo_aih").innerHTML = item.codigo;
                  }, 200);
                }}
              >
                {item.codigo + ' - ' + item.procedimento.toUpperCase()}
              </div>
            ))}
          </div>
        </div >
      )
    }

    // CONSTRUTOR PARA OS CAMPOS ESTRUTURADOS.
    const campo = (item, tipocampo, largura, titulo, valor, obrigatorio, opcoes, funcao) => {
      var timeout = null;
      let arrayvalor = [];
      let arrayopcoes = [];

      if (valor != null) {
        arrayvalor = valor.split(",");
      }

      if (opcoes != null) {
        arrayopcoes = opcoes.split(",");
      }

      if (tipocampo == 'textarea') {
        return (
          <div style={{
            margin: 5, padding: 2.5,
            display: 'flex',
            flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative',
            flexGrow: 1,
            backgroundColor: '#00808030',
            borderRadius: 5,
            width: largura != null ? largura : '',
          }}
            onKeyUp={() => {
              if (document.getElementById(titulo).value != '') {
                document.getElementById('check ' + titulo).style.display = 'none'
              } else {
                document.getElementById('check ' + titulo).style.display = 'flex'
              }
            }}
          >
            <div id={'check ' + titulo}
              style={{
                display: obrigatorio == 1 && valor == '' ? 'flex' : 'none',
                position: 'absolute', bottom: 5, right: 5,
                borderRadius: 50,
                backgroundColor: '#EC7063',
                color: 'white', fontWeight: 'bold',
                width: 25, height: 25,
                justifyContent: 'center',
              }}>
              <div>!</div>
            </div>
            <div
              className='text1'
              title={titulo}
              style={{
                alignSelf: 'flex-start', textAlign: 'left',
              }}>
              {titulo}
            </div>
            <textarea
              id={titulo}
              className='textarea_campo'
              defaultValue={valor}
              onKeyUp={() => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                  updateCampoEstruturado(item, document.getElementById(titulo).value.toUpperCase());
                }, 500);
              }}
            >
            </textarea>
          </div>
        )
      } else if (tipocampo == 'opcaounica') {
        return (
          <div style={{
            margin: 5, padding: 2.5,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            position: 'relative',
            flexGrow: 1,
            backgroundColor: '#00808030',
            borderRadius: 5,
          }}
            onMouseLeave={() => {
              if (item.valor == '' && obrigatorio == 1) {
                document.getElementById('check ' + titulo).style.display = 'flex'
              } else {
                document.getElementById('check ' + titulo).style.display = 'none'
              }
            }}
          >
            <div id={'check ' + titulo}
              style={{
                display: obrigatorio == 1 && valor == '' ? 'flex' : 'none',
                position: 'absolute', bottom: 5, right: 5,
                borderRadius: 50,
                backgroundColor: '#EC7063',
                color: 'white', fontWeight: 'bold',
                width: 25, height: 25,
                justifyContent: 'center',
              }}>
              <div>!</div>
            </div>
            <div
              className='text1'
              title={titulo}
              style={{
                alignSelf: 'flex-start', textAlign: 'left',
              }}>
              {titulo}
            </div>
            <div id={'lista opcoes ' + item.id}
              style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'flex-start',
                flexWrap: 'wrap', minWidth: 200,
              }}>
              {arrayopcoes.map(valor => (
                <div
                  id={'btn ' + valor}
                  className={item.valor == valor ? 'button-selected' : 'button'}
                  style={{ padding: 10 }}
                  onClick={() => {
                    updateCampoEstruturado(item, valor);
                    selector('lista opcoes ' + item.id, 'btn ' + valor, 500);
                  }}
                >
                  {valor}
                </div>
              ))}
            </div>
          </div >
        )
      } else if (tipocampo == 'opcaomultipla') {
        return (
          <div style={{
            margin: 5, padding: 2.5,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            position: 'relative',
            flexGrow: 1,
            backgroundColor: '#00808030',
            borderRadius: 5,
          }}
            onMouseLeave={() => {
              if (item.valor == '' && obrigatorio == 1) {
                document.getElementById('check ' + titulo).style.display = 'flex'
              } else {
                document.getElementById('check ' + titulo).style.display = 'none'
              }
            }}
          >
            <div id={'check ' + titulo}
              style={{
                display: 'none',
                position: 'absolute', bottom: 5, right: 5,
                borderRadius: 50,
                backgroundColor: '#EC7063',
                color: 'white', fontWeight: 'bold',
                width: 25, height: 25,
                justifyContent: 'center',
              }}>
              <div>!</div>
            </div>
            <div
              className='text1'
              title={titulo}
              style={{ alignSelf: 'flex-start', textAlign: 'left' }}>
              {titulo}
            </div>
            <div id={"lista de opcoes multiplas " + item.id}
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', minWidth: 200 }}>
              {arrayopcoes.map(valor => (
                <div
                  id={'btn multi ' + valor}
                  className={arrayvalor.filter(x => x == valor).length > 0 ? 'button-selected' : 'button'}
                  style={{ padding: 10 }}
                  onClick={() => {
                    if (arrayvalor.filter(item => item == valor).length == 1) {
                      let newarray = [];
                      arrayvalor.filter(x => x != valor).map(x => newarray.push(x));
                      arrayvalor = newarray;
                      updateCampoEstruturado(item, arrayvalor.toString());
                      setTimeout(() => {
                        document.getElementById('btn multi ' + valor).className = "button";
                      }, 500);
                    } else {
                      arrayvalor.push(valor);
                      updateCampoEstruturado(item, arrayvalor.toString());
                      setTimeout(() => {
                        document.getElementById('btn multi ' + valor).className = "button-selected";
                      }, 500);
                    }
                  }}
                >
                  {valor}
                </div>
              ))}
            </div>
          </div>
        )
      } else if (tipocampo == 'botao') {
        if (funcao == 'faturamento_sus_tabela_aih') {
          return (
            <div style={{
              margin: 5, padding: 2.5,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
              position: 'relative',
              flexGrow: 1,
              backgroundColor: '#00808030',
              borderRadius: 5,
            }}>
              <div
                className='text1'
                title={titulo}
                style={{
                  alignSelf: 'flex-start', textAlign: 'left',
                }}>
                {titulo}
              </div>
              <div id="button_codigo_aih" className='button'
                style={{ paddingLeft: 20, paddingRight: 20 }}
                onClick={() => {
                  localStorage.setItem('campo', JSON.stringify(item));
                  document.getElementById("viewprocedimentosaih").style.display = 'flex';
                  console.log('CLICK');
                }}
              >
                {valor}
              </div>
            </div>
          )
        }
      }
    }

    return (
      <div className='scroll'
        id="formulario"
        style={{
          height: 'calc(100% - 10px)',
          width: 'calc(100%)',
          alignSelf: 'center',
          margin: 0,
          backgroundColor: 'white', borderColor: 'white',
          display: 'flex',
          flexDirection: 'row', flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}
      >
        {camposestruturados.sort((a, b) => parseInt(a.titulo.slice(0, 2)) > parseInt(b.titulo.slice(0, 2)) ? 1 : -1).map(item => campo(item, item.tipocampo, item.largura, item.titulo, item.valor, item.obrigatorio, item.opcoes, item.funcao))}
        <GetProcedimentoAih></GetProcedimentoAih>
      </div>
    )
  }

  // IMPRESSÃO.
  function printDiv() {
    console.log('PREPARANDO DOCUMENTO PARA IMPRESSÃO');
    let printdocument = document.getElementById("IMPRESSÃO - DOCUMENTO ESTRUTURADO").innerHTML;
    var a = window.open();
    a.document.write('<html>');
    a.document.write(printdocument);
    a.document.write('</html>');
    a.print();
    a.close();
  }
  function PrintDocumento() {
    return (
      <div id="IMPRESSÃO - DOCUMENTO ESTRUTURADO"
        className="print"
      >
        <table style={{ width: '100%' }}>
          <thead style={{ width: '100%' }}>
            <tr style={{ width: '100%' }}>
              <td style={{ width: '100%' }}>
                <Header></Header>
              </td>
            </tr>
          </thead>
          <tbody style={{ width: '100%' }}>
            <tr style={{ width: '100%' }}>
              <td style={{ width: '100%' }}>
                <div id="campos"
                  style={{
                    display: 'flex', flexDirection: 'column',
                    breakInside: 'auto', alignSelf: 'center', width: '100%'
                  }}>
                  <Conteudo></Conteudo>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot style={{ width: '100%' }}>
            <tr style={{ width: '100%' }}>
              <td style={{ width: '100%' }}>
                <Footer></Footer>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  };

  function Conteudo() {
    return (
      <div
        id="conteudo doc-estruturado"
        style={{
          display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
          justifyContent: 'center',
          fontFamily: 'Helvetica',
          breakInside: 'auto',
          whiteSpace: 'pre-wrap',
          flex: 1,
        }}>
        {camposestruturados.sort((a, b) => parseInt(a.titulo.slice(0, 2)) > parseInt(b.titulo.slice(0, 2))).map(item => printcampo(item.tipocampo, item.titulo, item.valor, item.altura, item.largura))}
      </div>
    )
  }

  return (
    <div id="scroll-documento-estruturado"
      className='card-aberto'
      style={{
        display: card == 'card-doc-estruturado-aih' ? 'flex' : 'none',
        flexDirection: 'row',
        justifyContent: 'center',
        height: '90vh',
        position: 'relative',
        alignSelf: 'center',
      }}
    >
      <Formulario></Formulario>
      <ListaDeDocumentosEstruturados></ListaDeDocumentosEstruturados>
      <PrintDocumento></PrintDocumento>
    </div>
  )
}

export default DocumentoEstruturado;