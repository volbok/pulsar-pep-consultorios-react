/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect, useCallback } from 'react';
// import { useReactToPrint } from "react-to-print";
import Context from '../pages/Context';
import axios from 'axios';
import moment from "moment";
import VanillaCaret from 'vanilla-caret-js';
// funções.
import selector from '../functions/selector';
// imagens.
import print from '../images/imprimir.svg';
import certify from '../images/certify.svg';
import back from '../images/back.svg';
import copiar from '../images/copiar.svg';
import favorito_usar from '../images/favorito_usar.svg';
import favorito_salvar from '../images/favorito_salvar.svg';
import salvar from '../images/salvar.svg';
import novo from '../images/novo.svg';
import deletar from '../images/deletar.svg';
import checkinput from '../functions/checkinput';
// componentes.
import Cid10 from '../functions/cid10';
import modal from '../functions/modal';
import toast from '../functions/toast';
import Gravador from '../components/Gravador';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PDFDocument } from 'pdf-lib';
pdfMake.addVirtualFileSystem(pdfFonts);


function Documentos() {

  // context.
  const {
    html,
    // settoast,
    usuario,
    pacientes,
    paciente,
    atendimentos, // todos os registros de atendimento para a unidade selecionada.
    atendimento, // corresponde ao id_atendimento das tabela "atendimento".
    card, setcard,
    tipodocumento, settipodocumento,
    documentos, setdocumentos,
    settoast, setdialogo,
    // dados para importação na evolução.
    alergias,
    mobilewidth,
    objpaciente,

    cliente,

    selecteddocumento, setselecteddocumento,
  } = useContext(Context);

  const loadDocumentos = () => {
    setdocumentos([]);
    axios.get(html + "list_documentos_idpct/" + paciente).then((response) => {
      var x = response.data.rows;
      setdocumentos(x.sort((a, b) => moment(a.data) < moment(b.data) ? 1 : -1));
      setselecteddocumento([]);
    })
  }

  useEffect(() => {
    getFilesFromPlugSign('showlist');
    loadAllModelos();
    if (card == 'card-documento-admissao') {
      settipodocumento('ADMISSÃO');
      preparaDocumentos();
    } else if (card == 'card-documento-evolucao') {
      settipodocumento('EVOLUÇÃO');
      preparaDocumentos();
    } else if (card == 'card-documento-receita') {
      settipodocumento('RECEITA MÉDICA');
      preparaDocumentos();
    } else if (card == 'card-documento-atestado') {
      settipodocumento('ATESTADO MÉDICO');
      preparaDocumentos();
    } else if (card == 'card-documento-alta') {
      settipodocumento('ALTA HOSPITALAR');
      preparaDocumentos();
    } else if (card == 'card-documento-exame') {
      settipodocumento('EXAME');
      preparaDocumentos();
    } else if (card == 'card-documento-laudo') {
      settipodocumento('LAUDO');
      preparaDocumentos();
    } else if (card == 'card-documento-relatorio') {
      settipodocumento('RELATÓRIO');
      preparaDocumentos();
    } else if (card == 'card-documento-recibo') {
      settipodocumento('RECIBO');
      preparaDocumentos();
    }
    // eslint-disable-next-line
  }, [card, paciente, atendimentos, atendimento]);

  const preparaDocumentos = () => {
    loadModelos();
    loadDocumentos();
    setselecteddocumento([]);
  }

  // atualizando um documento.
  const updateDocumento = (item, texto, status) => {
    var obj = {
      id_paciente: item.id_paciente,
      nome_paciente: item.nome_paciente,
      id_atendimento: item.id_atendimento,
      data: item.data,
      texto: texto,
      status: status, // 0 = não salvo, 1 = salvo, 2 = assinado.
      tipo_documento: item.tipo_documento,
      profissional: usuario.nome_usuario,
      conselho: usuario.conselho + ': ' + usuario.n_conselho,
      id_profissional: usuario.id,
    }
    axios.post(html + 'update_documento/' + item.id, obj).then(() => {
      if (status > 0) {
        loadDocumentos();
        setselecteddocumento([]);
        localStorage.setItem("documento", 0);
      }
    })
  }

  const deleteDocumento = (id) => {
    axios.get(html + 'delete_documento/' + id).then(() => {
      loadDocumentos();
      setselecteddocumento([]);
      localStorage.setItem("documento", 0);
    })
  }

  // calculando o total de páginas do PDF gerado pelo pdfmake.
  let count_pages = 0;
  const getNumberPages = (pdf) => {
    pdf.getBlob((blob) => {
      blob.arrayBuffer().then((blobbuffer) => {
        // console.log(blobbuffer);
        PDFDocument.load(blobbuffer).then((result) => {
          const pages = result.getPages()
          // console.log(pages.length);
          count_pages = pages.length;
        });
      })
    });
  }

  // ## CRIAÇÃO DE DOCUMENTOS EM PDFMAKE E ASSINATURA DIGITAL ## //
  // imprimir arquivo não assinado.
  const printFile = () => {
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 200, 40, 120],
      header: {
        stack: [
          {
            columns: [
              {
                image: cliente.logo,
                width: 75,
                alignment: 'center',
              },
              {
                stack: [
                  { text: cliente.razao_social, alignment: 'left', fontSize: 10, width: 300 },
                  { text: 'ENDEREÇO: ' + cliente.endereco, alignment: 'left', fontSize: 6, width: 300 },
                  { text: 'TELEFONE: ' + cliente.telefone, alignment: 'left', fontSize: 6, width: 300 },
                  { text: 'EMAIL: ' + cliente.email, alignment: 'left', fontSize: 6, width: 300 },
                ],
                width: '*'
              },
              { qr: cliente.qrcode, width: '40%', fit: 75, alignment: 'right', margin: [0, 0, 10, 0] },
            ],
            columnGap: 10,
          },
          {
            "canvas": [{
              "lineColor": "gray",
              "type": "line",
              "x1": 0,
              "y1": 0,
              "x2": 524,
              "y2": 0,
              "lineWidth": 1
            }], margin: [0, 10, 0, 0], alignment: 'center',
          },

        ],
        margin: [40, 40, 40, 40],
      },
      footer: function (currentPage, pageCount) {
        return {
          stack: [
            {
              "canvas": [{
                "lineColor": "gray",
                "type": "line",
                "x1": 0,
                "y1": 0,
                "x2": 524,
                "y2": 0,
                "lineWidth": 1
              }], margin: [0, 10, 0, 0], alignment: 'center',
            },
            {
              columns: [
                {
                  stack: [
                    { text: '________________________________', alignment: 'center', width: 400 },
                    { text: localStorage.getItem("dono_documento"), width: '*', alignment: 'center', fontSize: 8 },
                  ], with: '30%',
                },
                { text: 'PÁGINA ' + currentPage.toString() + ' DE ' + pageCount, fontSize: 8 },
                { text: '', width: '*' },
              ],
              margin: [40, 40, 40, 40], alignment: 'center',
            },
          ],
        }
      },
      content: [
        { text: tipodocumento, alignment: 'center', fontSize: 14, bold: true, margin: 10 },
        { text: document.getElementById('inputFieldDocumento').value, fontSize: 10, bold: false },
      ],
    }
    // utilizando a lib pdfmake para gerar o pdf e converter em base64.
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.open();
  }

  // subir documento a ser assinado para a plataforma PlugSign.
  const uploadFile = (item) => {
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 150, 40, 120],
      header: {
        stack: [
          {
            columns: [
              {
                image: cliente.logo,
                width: 75,
                alignment: 'center',
              },
              {
                stack: [
                  { text: cliente.razao_social, alignment: 'left', fontSize: 10, width: 300 },
                  { text: 'ENDEREÇO: ' + cliente.endereco, alignment: 'left', fontSize: 6, width: 300 },
                  { text: 'TELEFONE: ' + cliente.telefone, alignment: 'left', fontSize: 6, width: 300 },
                  { text: 'EMAIL: ' + cliente.email, alignment: 'left', fontSize: 6, width: 300 },
                ],
                width: '*'
              },
              { qr: cliente.qrcode, width: '40%', fit: 75, alignment: 'right', margin: [0, 0, 10, 0] },
            ],
            columnGap: 10,
          },
          {
            "canvas": [{
              "lineColor": "gray",
              "type": "line",
              "x1": 0,
              "y1": 0,
              "x2": 524,
              "y2": 0,
              "lineWidth": 1
            }], margin: [0, 10, 0, 0], alignment: 'center',
          },
        ],
        margin: [40, 40, 40, 40],
      },
      footer: function (currentPage, pageCount) {
        return {
          stack: [
            {
              "canvas": [{
                "lineColor": "gray",
                "type": "line",
                "x1": 0,
                "y1": 0,
                "x2": 524,
                "y2": 0,
                "lineWidth": 1
              }], margin: [0, 10, 0, 0], alignment: 'center',
            },
            {
              columns: [
                {
                  stack: [
                    { text: '________________________________', alignment: 'center', width: 400 },
                    { text: localStorage.getItem("dono_documento"), width: '*', alignment: 'center', fontSize: 8 },
                  ], with: '30%',
                },
                { text: 'PÁGINA ' + currentPage.toString() + ' DE ' + pageCount, fontSize: 8 },
                { text: '', width: '*' },
              ],
              margin: [40, 40, 40, 40], alignment: 'center',
            },
          ],
        }
      },
      content: [
        { text: tipodocumento, alignment: 'center', fontSize: 14, bold: true, margin: 10 },
        { text: document.getElementById('inputFieldDocumento').value, fontSize: 10, bold: false },
      ],
    }

    // utilizando a lib pdfmake para gerar o pdf e converter em base64.
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    // pdfDocGenerator.open();
    getNumberPages(pdfDocGenerator);
    pdfDocGenerator.getBase64((data) => {
      // console.log(data);
      // enviando documento para a plataforma PlugSign.
      const token = cliente.token
      const headers = {
        'Authorization': token
      }
      let obj = {
        name: 'documento ' + cliente.id_cliente + ' - ' + moment(item.data).format('DD/MM/YYYY - HH:mm'),
        file: 'data:application/pdf;base64,' + data,
      }
      // console.log(obj);
      localStorage.setItem('document_name', 'documento ' + cliente.id_cliente + ' - ' + moment(item.data).format('DD/MM/YYYY - HH:mm'));
      axios.post('https://app.plugsign.com.br/api/files/upload', obj, { headers: headers }).then(() => {
        console.log('DOCUMENTO ENVIADO');

        /*
        Recuperando todos os documentos do cliente, para encontrar o documento recém-enviado pelo nome e recuperar dua document_key(id)...
        Seria melhor aqui recuperar o objeto documento, e não todos...
        */
        getFilesFromPlugSign('sign');

      })
        .catch(err => console.error('ERRO: ' + err));
    });
  }

  const deleteFile = (item) => {
    const token = cliente.token
    const headers = {
      'Authorization': token
    }
    axios.get('https://app.plugsign.com.br/api/docs', { headers: headers }).then((response) => {
      let x = response.data;
      // console.log(x);
      // console.log(x.data);
      let y = x.data;
      let document_name = 'documento ' + cliente.id_cliente + ' - ' + moment(item.data).format('DD/MM/YYYY - HH:mm');
      // console.log(document_name);
      let document_id = y.filter(item => item.name == document_name).map(item => item.id).pop();
      // console.log('ID: ' + document_id);
      const data = {
        'id': document_id
      }
      axios.delete('https://app.plugsign.com.br/api/docs', { data: data, headers: headers }).then(() => {
        console.log('DOCUMENTO ASSINADO EXCLUÍDO');
        getFilesFromPlugSign('showlist');
        updateDocumento(item, item.texto, 1);
      })
        .catch(err => console.error('ERRO: ' + err));
    });
  }

  // recuperando todos os documentos do plugsign, para o usuário do token.
  const getFilesFromPlugSign = (key) => {
    const token = cliente.token
    const headers = {
      'Authorization': token
    }
    axios.get('https://app.plugsign.com.br/api/docs', { headers: headers }).then((response) => {
      let x = response.data;
      // console.log(x);
      // console.log(x.data);
      let y = x.data;

      if (key == 'sign') {
        // assinando o documento identificado pela document_key.
        let document_key = y.filter(item => item.name == localStorage.getItem('document_name')).map(item => item.document_key).pop();
        console.log('KEY - ASSINATURA: ' + document_key);
        signFile(document_key);
      } else if (key == 'download') {
        // baixando um documento identificado pela document_key.
        let document_key = y.filter(item => item.name == localStorage.getItem('document_name')).map(item => item.document_key).pop();
        console.log('KEY - DOWNLOAD: ' + document_key);
        downloadDocumentoAssinado(document_key);
      } else if (key == 'showlist') {
        // listando documentos assinados.
        let count_docs_assinados = y.filter(doc => doc.status == "Signed").length;
        console.log('LISTANDO DOCUMENTOS ASSINADOS: ' + count_docs_assinados);
        localStorage.setItem('count_docs_signed', count_docs_assinados);
        if (cliente.total_docs - count_docs_assinados > 0) {
          localStorage.setItem('allowsign', 'yes');
        } else {
          localStorage.setItem('allowsign', 'no');
        }
      }
    })
  }

  const token = cliente.token
  const signFile = (document_key) => {
    const headers = {
      'accept': 'aplication/json',
      'content-type': 'application/json',
      'Authorization': token
    }
    let obj = {
      document_key: document_key,
      page: parseInt(count_pages),
      // user_id: onde obter?
      xPos: 40,
      yPos: 750,
    }
    // console.log(obj);

    axios.post('https://app.plugsign.com.br/api/files/sign', obj, { headers: headers }).then(() => {
      console.log('DOCUMENTO ASSINADO');
      getFilesFromPlugSign('showlist');
    })
      .catch(err => console.error('ERRO: ' + err));
  }

  const downloadDocumentoAssinado = (key) => {
    const headers = {
      'accept': 'aplication/json',
      'content-type': 'application/json',
      'Authorization': token
    }
    axios.get('https://app.plugsign.com.br/api/files/download/' + key, { headers: headers, responseType: 'blob' }).then((response) => {
      console.log('DOCUMENTO BAIXADO.');
      window.open(URL.createObjectURL(response.data));
    })
  }

  // GADGETS...
  // ATESTADO
  // componente que lista os principais gadgets de cid.
  function GadgetsParaAtestado() {

    const [viewseletorcid10, setviewseletorcid10] = useState(0);
    if (objpaciente != null) {
      // variáveis.
      let mae = objpaciente.nome_mae_paciente;
      let dias_atestado = 1;
      let paciente = objpaciente.nome_paciente;
      let hora_inicio = '';
      let hora_fim = '';
      let data = moment().format('DD/MM/YYYY');


      let arraymotivos = [
        'CONSULTA MÉDICA',
        'ACOMPANHAMENTO FAMILIAR',
        'FAZER EXAMES'
      ]

      let arraytiposatestados = [
        'ATESTADO DE COMPARECIMENTO AMBULATORIAL',
        'ATESTADO DE ACOMPANHAMENTO HOSPITALAR',
        'ATESTADO DE SAÚDE',
        'ATESTADO DE AFASTAMENTO'
      ]

      // botão para visualizar seletor para cid10.
      function BtnCid10() {
        return (
          <div id="botão para selecionar cid10"
            className="button-green"
            title="CLIQUE PARA SELECIONAR UM CID."
            style={{
              display: tipodocumento != 'ATESTADO MÉDICO' || selecteddocumento.status != 0 ? 'none' : 'flex',
              alignSelf: 'center',
              width: 100, minWidth: 100, maxWidth: 100
            }}
            onClick={() => {
              localStorage.setItem('texto', document.getElementById("inputFieldDocumento").value.toUpperCase());
              setviewseletorcid10(1);
            }}>
            CID-10
          </div>
        )
      }
      // componente para selação do cid-10.
      function SeletorCid10() {
        const [cid10] = useState(Cid10());
        const [arraycid10, setarraycid10] = useState([]);
        // filtro de paciente por nome.
        function FilterCid10() {
          var searchcid10 = "";
          const [filtercid10, setfiltercid10] = useState("");
          const filterCid10 = () => {
            clearTimeout(timeout);
            searchcid10 = document.getElementById("inputCid10").value;
            document.getElementById("inputCid10").focus();
            timeout = setTimeout(() => {
              if (searchcid10 == "") {
                searchcid10 = "";
                setarraycid10([]);
                document.getElementById("inputCid10").value = "";
                setTimeout(() => {
                  document.getElementById("inputCid10").focus();
                }, 100);
              } else {
                // console.log(searchcid10);
                setfiltercid10(searchcid10);
                setTimeout(() => {
                  // console.log(filtercid10);
                  setarraycid10(cid10.filter((item) => item.DESCRICAO.toUpperCase().includes(searchcid10) || item.DESCRICAO.includes(searchcid10)));
                  document.getElementById("inputCid10").value = searchcid10;
                  document.getElementById("inputCid10").focus();
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
                  window.innerWidth < mobilewidth ? "BUSCAR DOENÇA..." : "BUSCAR..."
                }
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) =>
                  window.innerWidth < mobilewidth
                    ? (e.target.placeholder = "BUSCAR DOENÇA...")
                    : "BUSCAR..."
                }
                onKeyUp={() => filterCid10()}
                type="text"
                id="inputCid10"
                maxLength={100}
                defaultValue={filtercid10}
                style={{ width: '100%' }}
              ></input>
            </div>
          );
        }
        return (
          <div
            style={{ display: viewseletorcid10 == 1 ? 'flex' : 'none' }}
            className='fundo' onClick={() => setviewseletorcid10(0)}>
            <div
              className='janela scroll'
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                width: '40vw', height: '70vh'
              }}>
              <FilterCid10></FilterCid10>
              {arraycid10.map(item => (
                <div className='button'
                  style={{ width: 'calc(100% - 20px)' }}
                  onClick={() => {
                    localStorage.setItem("cid", item.CAT);
                    setviewseletorcid10(0);
                  }}
                >
                  {item.CAT + ' - ' + item.DESCRICAO.toUpperCase()}
                </div>
              ))}
            </div>
          </div >
        )
      }

      return (
        <div className='gadget'
          style={{
            display: tipodocumento == 'ATESTADO MÉDICO' && selecteddocumento.id != undefined && selecteddocumento.status == 0 ? 'flex' : 'none',
            flexDirection: 'column',
            position: 'absolute', bottom: 20, left: 20
          }}>
          <div
            className='scroll'
            style={{
              display: 'flex', justifyContent: 'flex-start',
              flexDirection: 'column', flexWrap: 'wrap',
              backgroundColor: 'transparent', borderStyle: 'none',
              width: 255, height: 250,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexWrap: 'wrap' }}>
              <BtnCid10></BtnCid10>
              <SeletorCid10></SeletorCid10>
              <div id="inputs"
                style={{
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignContent: 'center', alignItems: 'center'
                }}>
                <div id='DiasAtestado'
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className='text2'>DIAS DE ATESTADO:</div>
                  <input id="inputDiasAtestado"
                    className='input input-gadget'
                    autoComplete="off"
                    placeholder=""
                    title=""
                    type="text"
                    onFocus={(e) => (e.target.placeholder = "")}
                    onBlur={(e) => (e.target.placeholder = "")}
                    onKeyUp={() => {
                      clearTimeout(timeout);
                      localStorage.setItem('dias', '');
                      timeout = setTimeout(() => {
                        localStorage.setItem('dias', document.getElementById('inputDiasAtestado').value);
                      }, 1000);
                    }}
                    defaultValue={dias_atestado}
                    style={{
                      width: 40, minWidth: 40, maxWidth: 40,
                      height: 40, minHeight: 40, maxHeight: 40,
                    }}
                  ></input>
                </div>
                <div id='HoraInicio'
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className='text2'>HORA INICIAL:</div>
                  <input id="inputHoraInicio"
                    className='input input-gadget'
                    autoComplete="off"
                    placeholder=""
                    title=""
                    type="text"
                    onFocus={(e) => (e.target.placeholder = "")}
                    onBlur={(e) => (e.target.placeholder = "")}
                    onKeyUp={() => {
                      clearTimeout(timeout);
                      localStorage.setItem('inicio', '');
                      timeout = setTimeout(() => {
                        localStorage.setItem('inicio', document.getElementById('inputHoraInicio').value);
                      }, 1000);
                    }}
                    defaultValue={hora_inicio}
                    style={{
                      width: 50, minWidth: 50, maxWidth: 50,
                      height: 40, minHeight: 40, maxHeight: 40,
                    }}
                  ></input>
                </div>
                <div id='HoraTermino'
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className='text2'>HORA FINAL:</div>
                  <input id="inputHoraTermino"
                    className='input input-gadget'
                    autoComplete="off"
                    placeholder=""
                    title=""
                    type="text"
                    onFocus={(e) => (e.target.placeholder = "")}
                    onBlur={(e) => (e.target.placeholder = "")}
                    onKeyUp={() => {
                      clearTimeout(timeout);
                      localStorage.setItem('termino', '');
                      timeout = setTimeout(() => {
                        localStorage.setItem('termino', document.getElementById('inputHoraTermino').value);
                      }, 1000);
                    }}
                    defaultValue={hora_fim}
                    style={{
                      width: 50, minWidth: 50, maxWidth: 50,
                      height: 40, minHeight: 40, maxHeight: 40,
                    }}
                  ></input>
                </div>
                <div style={{ fontSize: 14 }}>MOTIVO DO ATESTADO</div>
                <div id='seletor de motivo do atestado' style={{ width: '100%' }}>
                  {arraymotivos.map(item => (
                    <div
                      id={'motivo ' + item}
                      className='button'
                      style={{
                        width: 'calc(100% - 20px)',
                        minWidth: 'calc(100% - 20px)',
                        maxWidth: 'calc(100% - 20px)',
                        alignSelf: 'center'
                      }}
                      onClick={() => {
                        localStorage.setItem('MOTIVO', item);
                        selector('seletor de motivo do atestado', 'motivo ' + item, 100);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 14 }}>TIPO DE ATESTADO</div>
                <div id='seletor de tipo de atestado' style={{ width: '100%' }}>
                  {arraytiposatestados.map(tipo => (
                    <div
                      id={'tipo ' + tipo}
                      className='button'
                      style={{
                        width: 'calc(100% - 20px)',
                        minWidth: 'calc(100% - 20px)',
                        maxWidth: 'calc(100% - 20px)',
                        alignSelf: 'center',
                      }}
                      onClick={() => {
                        selector('seletor de tipo de atestado', 'tipo ' + tipo, 100);
                        localStorage.setItem('TIPO', tipo);
                        if (tipo == 'ATESTADO DE COMPARECIMENTO AMBULATORIAL') {

                          // texto do documento.
                          document.getElementById("inputFieldDocumento").value =
                            'ATESTADO DE COMPARECIMENTO / AMBULATORIAL \n\n' +
                            'ATESTO QUE A SRA. ' + mae + ' COMPARECEU A ESTE CONSULTÓRIO MÉDICO, NO HORÁRIO DE ' +
                            localStorage.getItem('inicio') + ' ÀS ' + localStorage.getItem('termino') +
                            ', EM ' + data + ' PARA ' + localStorage.getItem('MOTIVO') + '.';

                        } else if (tipo == 'ATESTADO DE ACOMPANHAMENTO HOSPITALAR') {
                          document.getElementById("inputFieldDocumento").value =
                            'ATESTADO DE ACOMPANHAMENTO HOSPITALAR \n\n' +
                            'ATESTO QUE A SRA. ' + mae + ' ESTEVE ACOMPANHANDO SEU FILHO, ' + paciente +
                            ' EM TRATAMENTO MÉDICO/HOSPITALAR, NO PERÍODO DE ### A ###.\n' +
                            'SENDO QUE O MESMO AINDA NECESSITA DE COMPANHIA MATERNA EM DOMICÍLIO, DURANTE ' +
                            localStorage.getItem('dias') + ' DIA(S), PARA A CONTINUIDADE DO TRATAMENTO PROPOSTO, CID ' +
                            localStorage.getItem('cid');
                        } else if (tipo == 'ATESTADO DE SAÚDE') {
                          document.getElementById("inputFieldDocumento").value =
                            'ATESTADO DE ACOMPANHAMENTO HOSPITALAR \n\n' +
                            'ATESTO QUE ' + paciente + ' AO EXAME CLÍNICO NÃO APRESENTOU SINAIS DE DOENÇAS INFECTO-CONTAGIOSAS, ' +
                            'DE ALTERAÇÕES EVIDENTES DOS ÓRGÃOS DOS SENTIDOS OU VÍCIOS DE CONFORMAÇÃO FÍSICA. DURANTE A ENTREVISTA ' +
                            'NÃO EVIDENCIOU SINAIS DE DÉFICIT OU DOENÇA NEURO-PSIQUIÁTRICA.'
                        } else if (tipo == 'ATESTADO DE AFASTAMENTO') {
                          document.getElementById("inputFieldDocumento").value =
                            'ATESTADO DE AFASTAMENTO \n\n' +
                            'ATESTO PARA OS DEVIDOS FINS QUE ' + paciente + ' DEVERÁ SER AFASTADO(A) DE SUAS ATIVIDADES ' +
                            'PROFISSIONAIS/ESCOLARES POR ' + localStorage.getItem('dias') + ' DIAS, DEVIDO A CID ' + localStorage.getItem('cid');
                        }
                      }}
                    >
                      {tipo}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return null;
    }
  }

  // inserindo um documento.
  const montaTexto = () => {
    // console.log(tipodocumento);
    if (tipodocumento == 'EVOLUÇÃO') {
      // recuperando alergias.
      let tag_alergias = '';

      // função para montar os dados importados dos cards e demais componentes.
      if (alergias.length > 0) {
        tag_alergias = "ALERGIAS:" + alergias.map(item => '\n' + item.alergia)
        let texto = tag_alergias + '\nESCREVA AQUI SUA EVOLUÇÃO LIVRE OU BAIXE UM MODELO.'
        insertDocumento(texto);
      } else {
        insertDocumento('POR FAVOR DIGITE AQUI A EVOLUÇÃO OU BAIXE UM MODELO.');
      }
    } else if (tipodocumento == 'RECEITA MÉDICA') {
      let texto =
        'DIGITE AQUI UMA RECEITA NOVA OU BAIXE UM MODELO.'
      insertDocumento(texto);
    } else if (tipodocumento == 'ATESTADO MÉDICO') {
      let texto =
        'INFORME ABAIXO OS DIAS E O CID DO ATESTADO, OU SELECIONE UM MODELO.';
      insertDocumento(texto);
      // document.getElementById("gadgets_atestado").style.display = 'flex';
    } else {
      let texto = 'POR FAVOR, EDITE AQUI SEU DOCUMENTO.'
      insertDocumento(texto);
    }
  }

  const insertDocumento = (texto) => {
    var obj = {
      id_paciente: paciente,
      nome_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_paciente).pop(),
      id_atendimento: atendimento,
      data: moment(),
      texto: texto,
      status: 0,
      tipo_documento: tipodocumento,
      profissional: usuario.nome_usuario,
      conselho: usuario.conselho + ': ' + usuario.n_conselho,
      id_profissional: usuario.id,
    }
    // console.log(obj);
    // console.log(usuario);
    axios.post(html + 'insert_documento', obj).then(() => {
      loadDocumentos();
      setselecteddocumento([]);
      localStorage.setItem("documento", 0);
    })
  }

  // copiar documento.
  const copiarDocumento = (item, texto) => {
    var obj = {
      id_paciente: item.id_paciente,
      nome_paciente: item.nome_paciente,
      id_atendimento: item.id_atendimento,
      data: moment(),
      texto: texto,
      status: 0,
      tipo_documento: item.tipo_documento,
      profissional: usuario.nome_usuario,
      conselho: usuario.conselho + ': ' + usuario.n_conselho,
      id_profissional: usuario.id,
    }
    // console.log(obj);
    axios.post(html + 'insert_documento', obj).then(() => {
      loadDocumentos();
      setselecteddocumento([]);
      localStorage.setItem("documento", 0);
    })
  }

  const ListaDeDocumentos = useCallback(() => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          margin: 0, marginLeft: 10,
          width: '25vw',
          height: '100%',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center',
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
            onClick={() => montaTexto()}
          >
            <img
              alt=""
              src={novo}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
          <div className='button'
            title="MEUS MODELOS"
            style={{ width: 50, marginLeft: 0 }}
            onClick={() => setviewselectmodelos(1)}
          >
            <img
              alt=""
              src={favorito_usar}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
        </div>
        <div className={localStorage.getItem('allowsign') == 'no' ? 'button red' : 'button green'}
          style={{ height: 50, marginBottom: 10, borderStyle: 'solid', borderWidth: 3, borderColor: 'white' }}
        >
          {'TOTAL DE DOCUMENTOS ASSINADOS: ' + localStorage.getItem('count_docs_signed') + '/' + cliente.total_docs}
        </div>
        <div
          id="lista de documentos"
          className='scroll'
          style={{
            display: 'flex',
            backgroundColor: 'white',
            borderColor: 'white',
            height: 'calc(100vh - 280px)',
            width: 'calc(100% - 15px)',
          }}
        >
          {documentos.filter(item => item.tipo_documento == tipodocumento).map((item) => (
            <div id={'documento ' + item.id}
              className='button'
              onClick={() => {
                localStorage.setItem("documento", item.id);
                setselecteddocumento(item);
                localStorage.setItem('dono_documento', item.profissional + ' - ' + item.conselho);
                setTimeout(() => {
                  if (item.id == localStorage.getItem("id")) {
                    document.getElementById("inputFieldDocumento").value = localStorage.getItem("texto");
                  } else {
                    document.getElementById("inputFieldDocumento").value = item.texto;
                  }
                  selector("lista de documentos", 'documento ' + item.id, 100);
                  if (selecteddocumento == 'ATESTADO MÉDICO' && item.status == 0) {
                    document.getElementById("gadgets_atestado").style.display = 'flex';
                  }
                }, 200);
              }}
              style={{
                display: atendimentos.length > 0 ? 'flex' : 'none',
                flexDirection: 'column', justifyContent: 'center', minHeight: 220,
                opacity: item.id_atendimento == atendimento ? 1 : 0.7
              }}
            >
              <div id="botões"
                style={{
                  display: 'flex', flexDirection: 'row', justifyContent: 'center',
                  pointerEvents: item.id == localStorage.getItem("documento") ? 'auto' : 'none',
                  opacity: item.id == localStorage.getItem("documento") ? 1 : 0.3
                }}>
                <div id="botão para deletar documento"
                  className="button-yellow"
                  style={{
                    display: item.id_profissional == usuario.id ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25,
                  }}
                  onClick={(e) => {
                    modal(setdialogo, 'TEM CERTEZA QUE DESEJA EXCLUIR ESTE DOCUMENTO?', deleteDocumento, item.id)
                    e.stopPropagation();
                  }}>
                  <img
                    alt=""
                    src={deletar}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
                <div id="botão para salvar documento"
                  className="button-green"
                  style={{
                    display: item.status == 0 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25,
                  }}
                  onClick={() => {
                    setselecteddocumento(item);
                    setTimeout(() => {
                      updateDocumento(item, document.getElementById("inputFieldDocumento").value.toUpperCase(), 1);
                    }, 200);
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
                    display: item.status > 0 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25, marginLeft: 0
                  }}
                  onClick={() => {
                    setselecteddocumento(item);
                    setTimeout(() => {
                      copiarDocumento(item, document.getElementById("inputFieldDocumento").value.toUpperCase())
                    }, 200);
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
                    display: item.status > 0 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25, marginLeft: 0, marginRight: 0,
                  }}
                  onClick={() => {
                    setselecteddocumento(item);
                    setTimeout(() => {
                      // printDiv(item.texto)
                      printFile();
                    }, 1000);
                  }}>
                  <img
                    alt=""
                    src={print}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
              </div>
              <div style={{ display: cliente.assinatura == 'sim' ? 'flex' : 'none' }}>
                <div id="botão para assinar documento"
                  className="button-true-blue"
                  style={{
                    display: item.status == 1 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 30, maxHeight: 30, paddingLeft: 10, paddingRight: 10,
                    marginBottom: 15,
                    position: 'relative',
                    opacity: localStorage.getItem('allowsign') == 'yes' ? 1 : 0.3,
                  }}
                  onClick={() => {
                    if (localStorage.getItem('allowsign') == 'yes') {
                      setselecteddocumento(item);
                      setTimeout(() => {
                        uploadFile(item);
                      }, 200);
                      setTimeout(() => {
                        updateDocumento(item, item.texto, 2);
                      }, 1000);
                    } else {
                      toast(settoast, 'COTA DE ASSINATURAS ATINGIDA.', '#EC7063', 1000);
                    }
                  }}>
                  <div>ASSINAR</div>
                </div>
                <div id="botão para baixar documento assinado"
                  className="button-true-green"
                  style={{
                    display: item.status == 2 ? 'flex' : 'none',
                    flexDirection: 'row',
                    alignSelf: 'center',
                    minHeight: 30, maxHeight: 30, paddingLeft: 20, paddingRight: 0,
                    marginBottom: 15,
                    position: 'relative',
                  }}
                  onClick={() => {
                    localStorage.setItem('document_name', 'documento ' + cliente.id_cliente + ' - ' + moment(item.data).format('DD/MM/YYYY - HH:mm'));
                    getFilesFromPlugSign('download');
                  }}>
                  <div>BAIXAR</div>
                  <div id="botão para deletar documento assinado"
                    className="button red"
                    style={{
                      display: item.id_profissional == usuario.id ? 'flex' : 'none',
                      alignSelf: 'center',
                      minHeight: 20, minWidth: 20, maxHeight: 20, maxWidth: 20, marginLeft: 20,
                    }}
                    onClick={(e) => {
                      modal(setdialogo, 'TEM CERTEZA QUE DESEJA DELETAR O DOCUMENTO ASSINADO?', deleteFile, item);
                      e.stopPropagation();
                    }}>
                    <img
                      alt=""
                      src={deletar}
                      style={{ width: 20, height: 20 }}
                    ></img>
                  </div>
                  <img
                    alt=""
                    src={certify}
                    style={{
                      width: 30, height: 30,
                      position: 'absolute',
                      top: 15, left: -12
                    }}
                  ></img>
                </div>
              </div>
              <div style={{ fontSize: 14 }}>{tipodocumento}</div>
              <div style={{ fontSize: 12, marginTop: 10, whiteSpace: 'pre-wrap', marginBottom: 5 }}>{'DR(A) ' + item.profissional}</div>
              <div style={{ fontSize: 12, marginBottom: 5, marginTop: -10 }}>
                {item.registro_profissional}
              </div>
              <div>{moment(item.data).format('DD/MM/YY')}</div>
              <div>{moment(item.data).format('HH:mm')}</div>
            </div>
          ))}
        </div>
      </div >
    )
    // eslint-disable-next-line
  }, [documentos]);

  function FieldDocumento() {
    // menu de atalho, com informações importantes para inserção no texto.
    const [viewmenucolinha, setviewmenucolinha] = useState(0);
    const putcolinha = (tag, dado) => {
      return (
        <div className='button' style={{ width: 250, justifyContent: 'flex-start', paddingLeft: 10 }}
          onClick={() => {
            if (objpaciente != null) {
              setviewmenucolinha(0);
              let element = document.getElementById("inputFieldDocumento");
              let corte = localStorage.getItem('caret');
              // console.log(corte);
              let texto = element.value;
              // console.log(texto);
              let text_before = texto.slice(0, corte);
              let text_after = texto.slice(corte, texto.length);
              element.value = text_before + ' ' + dado + ' ' + text_after;
              let caret = new VanillaCaret(document.getElementById("inputFieldDocumento"));
              let novocorte = parseInt(corte) + parseInt(dado.length) + 1;
              // console.log(novocorte);
              element.focus();
              caret.setPos(parseInt(novocorte));
            }
          }}
        >
          {objpaciente != null ? tag + ': ' + dado : ''}
        </div>
      )
    }
    function MenuColinhas() {
      return (
        <div className='janela scroll menucolinha'
          id="menucolinha"
          style={{
            display: viewmenucolinha == 1 ? 'flex' : 'none',
            // display: 'flex',
            position: 'absolute',
            alignSelf: 'center',
            bottom: 5,
            left: 5,
            zIndex: 10,
            height: 280,
          }}
          onMouseOver={() => {
            document.getElementById('menucolinha').style.backgroundColor = '#85c1e9';
            document.getElementById('menucolinha').style.borderColor = '#85c1e9';
          }}
          onMouseLeave={() => {
            document.getElementById('menucolinha').style.backgroundColor = '#a6cee8';
            document.getElementById('menucolinha').style.borderColor = '#a6cee8';
          }}
        >
          {putcolinha('HOJE', moment().format('DD/MM/YYYY'))}
          {putcolinha('PACIENTE', objpaciente != null ? objpaciente.nome_paciente : '')}
          {putcolinha('DN', objpaciente != null ? moment(objpaciente.dn_paciente).format('DD/MM/YY') : '')}
          {putcolinha('DOCUMENTO', objpaciente != null ? objpaciente.numero_documento : '')}
          {putcolinha('MÃE', objpaciente != null ? objpaciente.nome_mae_paciente : '')}
        </div>
      )
    }
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100%)', position: 'relative'
      }}>
        <textarea
          id="inputFieldDocumento"
          className="textarea"
          autoComplete='off'
          placeholder={selecteddocumento.length == 0 ? 'SELECIONE UM DOCUMENTO NA LISTA À DIREITA' : 'DIGITE AQUI O TEXTO DO DOCUMENTO.'}
          onFocus={(e) => (e.target.placeholder = '')}
          onBlur={(e) => (e.target.placeholder = 'DIGITE AQUI O TEXTO DO DOCUMENTO.')}
          style={{
            display: 'flex',
            flexDirection: 'row', justifyContent: 'center',
            alignContent: 'center',
            whiteSpace: 'pre-wrap',
            margin: 0,
            borderRadius: 5,
            pointerEvents: selecteddocumento.length == 0 ? 'none' : 'auto',
            position: 'relative',
            opacity: selecteddocumento.length == 0 ? 0.3 : 1,
            overflowY: 'unset',
            width: 'calc(100% - 30px)',
            height: '100%',
          }}
          onClick={() => setviewmenucolinha(0)}
          onChange={() => {
            if (selecteddocumento.status > 0) {
              toast(settoast, 'ESTE DOCUMENTO JÁ FOI FECHADO E NÃO PODE SER ALTERADO', '#EC7063', 2000);
              setTimeout(() => {
                document.getElementById("inputFieldDocumento").value = selecteddocumento.texto;
                selector("lista de documentos", 'documento ' + selecteddocumento.id, 100);
              }, 2100);
            }
          }}

          onKeyDown={(e) => {
            // capturando a posição da caret.
            if (e.key == "|") { // tecla de barra invertida >> "\" (para o menucolinhas!).
              e.preventDefault();
              let caret = new VanillaCaret(document.getElementById(document.activeElement.id));
              // console.log(caret.getPos());
              localStorage.setItem('caret', caret.getPos());
              setviewmenucolinha(1);
            } else if (e.keyCode == 27) { // tecla esc
              setviewmenucolinha(0);
            }
          }}

          onKeyUp={(e) => {
            let texto = document.getElementById("inputFieldDocumento").value.toUpperCase();
            if (selecteddocumento.status == 0) {
              clearTimeout(timeout);
              timeout = setTimeout(() => {
                if (document.getElementById("inputFieldDocumento").value != '') {
                  texto = document.getElementById("inputFieldDocumento").value.toUpperCase();
                  localStorage.setItem("id", selecteddocumento.id);
                  localStorage.setItem("texto", texto);
                  // console.log('ID:' + localStorage.getItem("id"));
                  updateDocumento(selecteddocumento, document.getElementById("inputFieldDocumento").value.toUpperCase(), 0);
                }
                e.stopPropagation();
              }, 1000);
            }
          }}
        >
        </textarea>
        <MenuColinhas></MenuColinhas>
      </div>
    )
  }

  function voiceField(texto) {
    let valor = texto.toString();
    document.getElementById("inputFieldDocumento").value = valor;
    localStorage.setItem('texto', texto);
  }

  // MODELOS DE DOCUMENTOS
  // modelos personalizados de receita médica e demais documentos, criados pelos usuários, que podem ser resgatados para edição de novos documentos.
  // selecionando modelos cadastrados e criando documentos a partir dos mesmos.
  const [arraymodelos, setarraymodelos] = useState([]);
  const loadModelos = () => {
    axios.get(html + 'list_model_documentos/' + usuario.id).then((response) => {
      var x = response.data.rows;
      setarraymodelos(x);
    });
  }
  const [allmodels, setallmodels] = useState([]);
  const loadAllModelos = () => {
    axios.get(html + 'list_all_model_documentos').then((response) => {
      var x = response.data.rows;
      setallmodels(x.filter(item => item.id_usuario == 0));
    });
  }
  const insertModeloDocumento = (item) => {
    var obj = {
      id_paciente: paciente,
      nome_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_paciente).pop(),
      id_atendimento: atendimento,
      data: moment(),
      texto: item,
      status: 0,
      tipo_documento: tipodocumento,
      profissional: usuario.nome_usuario + '\n' + usuario.conselho + '\n' + usuario.n_conselho,
      conselho: usuario.conselho + ': ' + usuario.n_conselho,
      id_profissional: usuario.id,
    }
    axios.post(html + 'insert_documento', obj).then(() => {
      setviewselectmodelos(0);
      loadDocumentos();
    })
  }
  const [viewselectmodelos, setviewselectmodelos] = useState(0);
  function ViewSelectModelos() {
    return (
      <div
        style={{ display: viewselectmodelos == 1 ? 'flex' : 'none' }}
        className='fundo' onClick={() => setviewselectmodelos(0)}>
        <div
          className='janela scroll'
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            maxHeight: '80vh', maxWidth: '50vw'
          }}
        >
          <div className='text1'>{'MODELOS DE DOCUMENTO PERSONALIZADOS - ' + tipodocumento}</div>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {allmodels.filter(item => item.tipo_documento == tipodocumento).map(item => (
              <div className='button'
                style={{ width: 150, height: 150, position: 'relative', backgroundColor: '#008080' }}
                onClick={() => insertModeloDocumento(item.texto)}
              >
                <div>
                  {item.nome_modelo}
                </div>
              </div>
            ))}
            {arraymodelos.filter(item => item.tipo_documento == tipodocumento).map(item => (
              <div className='button'
                style={{ width: 150, height: 150, position: 'relative' }}
                onClick={() => insertModeloDocumento(item.texto)}
              >
                <div>
                  {item.nome_modelo}
                </div>
                <div id="botão para acessar a janela de criação de modelo de documento."
                  className="button-yellow"
                  onClick={(e) => { deletarModeloDocumento(item); e.stopPropagation() }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    display: 'flex',
                    alignSelf: 'center',
                    minHeight: 30, maxHeight: 30, minWidth: 30, maxWidth: 30
                  }}>
                  <img
                    alt=""
                    src={deletar}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
              </div>
            ))}
          </div>
          <div id="botão para acessar a janela de criação de modelo de documento."
            className="button-green"
            onClick={() => setviewcreatemodelo(1)}
            style={{
              display: 'flex',
              alignSelf: 'center',
            }}>
            <img
              alt=""
              src={novo}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
        </div>
      </div>
    )
  }
  // criando um modelo de documento.
  const criarModeloDocumento = () => {
    var obj = {
      id_usuario: usuario.id,
      tipo_documento: tipodocumento,
      nome_modelo: document.getElementById("inputNomeModeloDocumento").value.toUpperCase(),
      texto: document.getElementById("inputTextoModeloDocumento").value.toUpperCase(),
    }
    axios.post(html + 'insert_model_documento', obj).then(() => {
      setviewcreatemodelo(0);
      loadModelos();
      loadDocumentos();
    })
  }
  const deletarModeloDocumento = (item) => {
    axios.get(html + 'delete_model_documento/' + item.id).then(() => {
      loadModelos();
    });
  }
  const [viewcreatemodelo, setviewcreatemodelo] = useState(0);
  function ViewCreateModelo() {
    return (
      <div
        style={{ display: viewcreatemodelo == 1 ? 'flex' : 'none' }}
        className='fundo' onClick={() => setviewcreatemodelo(0)}>
        <div
          className='janela'
          onClick={(e) => e.stopPropagation()}
        >
          <input
            autoComplete="off"
            placeholder="NOME DO MODELO"
            title="PROCURE USAR NOMES DE FÁCIL ASSOCIAÇÃO AO DOCUMENTO."
            className="input destacaborda"
            type="text"
            id="inputNomeModeloDocumento"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "NOME DO MODELO")}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignSelf: "center",
              width: window.innerWidth > 425 ? "30vw" : "70vw",
              alignContent: "center",
              height: 40,
              minHeight: 40,
              maxHeight: 40,
              borderStyle: "none",
              textAlign: "center",
            }}
          ></input>
          <textarea
            className="textarea"
            type="text"
            id="inputTextoModeloDocumento"
            placeholder="EDITE AQUI O CONTEÚDO DO MODELO DE DOCUMENTO."
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "EDITE AQUI O CONTEÚDO DO MODELO DE DOCUMENTO.")}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              width: "50vw",
              padding: 15,
              height: '40vh'
            }}
          ></textarea>

          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div id="sair dos modelos"
              className="button-yellow"
              onClick={() => setviewcreatemodelo(0)}
              style={{
                display: 'flex',
                alignSelf: 'center',
              }}>
              <img
                alt=""
                src={back}
                style={{ width: 25, height: 25 }}
              ></img>
            </div>
            <div id="inputSalvarModelo"
              className="button"
              onClick={() => checkinput("textarea", settoast, ["inputNomeModeloDocumento", "inputTextoModeloDocumento"], "inputSalvarModelo", criarModeloDocumento, [])}
              style={{
                display: 'flex',
                alignSelf: 'center',
              }}>
              <img
                alt=""
                src={favorito_salvar}
                style={{ width: 25, height: 25 }}
              ></img>
            </div>
          </div>
        </div>
      </div>
    )
  }

  var timeout = null;
  return (
    <div id="scroll-documentos"
      className='card-aberto'
      style={{
        display: card.toString().substring(0, 14) == 'card-documento' ? 'flex' : 'none',
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'relative',
        padding: 0,
        margin: 0,
        width: '100%',
        alignContent: 'flex-end',
        alignItems: 'flex-end',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        height: '100%',
      }}>
        <div style={{
          display: selecteddocumento.length == 0 || selecteddocumento.status > 0 ? 'none' : 'flex',
          position: 'absolute', bottom: 5, right: 5, zIndex: 20
        }}>
          <Gravador funcao={voiceField} continuo={true} ></Gravador>
        </div>
        <FieldDocumento></FieldDocumento>
      </div>
      <ListaDeDocumentos></ListaDeDocumentos>
      <ViewSelectModelos></ViewSelectModelos>
      <ViewCreateModelo></ViewCreateModelo>
      <GadgetsParaAtestado></GadgetsParaAtestado>
    </div>
  )
}

export default Documentos;