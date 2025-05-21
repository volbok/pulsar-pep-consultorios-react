/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback, useState } from 'react';
import Context from '../pages/Context';
import moment from "moment";
import axios from 'axios';
import selector from '../functions/selector';
// components.
import modal from '../functions/modal';
import Header from '../components/Header';
import Footer from '../components/Footer';
// imagens.
import back from '../images/back.png';
import print from '../images/imprimir.png';
import copiar from '../images/copiar.png';
import favorito_usar from '../images/favorito_usar.png';
import favorito_salvar from '../images/favorito_salvar.png';
import salvar from '../images/salvar.png';
import novo from '../images/novo.png';
import deletar from '../images/deletar.png';
import VanillaCaret from 'vanilla-caret-js';
import toast from '../functions/toast';
import flag from "../images/white_flag.png";
import text_center from "../images/text_center.png";
import text_left from "../images/text_left.png";
import text_right from "../images/text_right.png";
import ampliar from "../images/ampliar.png";
import reduzir from "../images/reduzir.png";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from 'html-to-pdfmake';

import { useHistory } from "react-router-dom";
pdfMake.addVirtualFileSystem(pdfFonts);


function ProcedimentosExames() {

  // context.
  const {
    html,
    objpaciente,
    usuario,
    tipodocumento, settipodocumento,
    selecteddocumento, setselecteddocumento,
    documentos, setdocumentos,
    setdialogo,
    settoast,
    cliente,
    pagina, setpagina,
  } = useContext(Context);

  useEffect(() => {
    if (pagina == 'PROCEDIMENTOS') {
      // loadExamesAgendados();
      loadModelos();
      loadFaturamentoClinicaProcedimentos();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // history (router).
  let history = useHistory();

  // carregando registros de procedimentos realizados para o cliente.
  const [procedimentos_cliente, setprocedimentos_cliente] = useState([]);
  const loadFaturamentoClinicaProcedimentos = () => {
    /*
    axios
      .get(html + "list_faturamento_clinicas_procedimentos/" + cliente.id_cliente)
      .then((response) => {
        setprocedimentos_cliente(response.data.rows);
      });
    */
    axios
      .get(html + "all_procedimentos")
      .then((response) => {
        var x = [];
        x = response.data.rows;
        setprocedimentos_cliente(response.data.rows);
        console.log(x.length);
      });
  };

  const loadNotionDocs = (item) => {
    axios.get(html + "list_documentos_idpct/" + item.id_paciente).then((response) => {
      var x = response.data.rows;
      setdocumentos(x.filter(documento => documento.tipo_documento == 'PROCEDIMENTO ' + item.nome_exame + '-' + item.id_paciente).sort((a, b) => moment(a.data) < moment(b.data) ? 1 : -1));
      setselecteddocumento([]);
    })
  }

  // inserir documento.
  const insertDocumento = (exame) => {
    var obj = {
      id_paciente: exame.id_paciente,
      nome_paciente: exame.nome_paciente,
      id_atendimento: null,
      data: moment(),
      texto: null,
      status: 0,
      tipo_documento: 'PROCEDIMENTO ' + exame.nome_exame + '-' + exame.id_paciente,
      profissional: exame.nome_profissional_executante,
      conselho: exame.conselho_profissional_executante,
      id_profissional: exame.id_profissional_executante,
    }
    axios.post(html + 'insert_documento', obj).then(() => {
      loadNotionDocs(exame);
      setselecteddocumento([]);
      localStorage.setItem("documento_notion", 0);
      localStorage.setItem("texto_notion", '');
      document.getElementById("notionfieldexames").innerHTML = '';
      let botao_id = localStorage.getItem('id_exame_selecionado');
      selector('lista de exames agendados para laudar', 'botão exame agendado ' + botao_id, 200);
    })
  }
  // copiar documento.
  const copiarDocumento = (item) => {
    var obj = {
      id_paciente: item.id_paciente,
      nome_paciente: item.nome_paciente,
      id_atendimento: item.id_atendimento,
      data: moment(),
      texto: item.texto,
      status: 0,
      tipo_documento: item.tipo_documento,
      profissional: usuario.nome_usuario + '\n' + usuario.conselho + '\n' + usuario.n_conselho
    }
    axios.post(html + 'insert_documento', obj).then(() => {
      let exame = JSON.parse(localStorage.getItem('exame_selecionado'));
      loadNotionDocs(exame);
      setselecteddocumento([]);
      localStorage.setItem("documento_notion", 0);
    })
  }
  // atualizar documento.
  const updateDocumento = (item, status) => {
    let texto = localStorage.getItem('texto_notion');
    var obj = {
      id_paciente: item.id_paciente,
      nome_paciente: item.nome_paciente,
      id_atendimento: item.id_atendimento,
      data: item.data,
      texto: texto,
      status: status,
      tipo_documento: item.tipo_documento,
      profissional: usuario.nome_usuario,
      conselho: usuario.conselho + ': ' + usuario.n_conselho,
      id_profissional: usuario.id,
    }
    axios.post(html + 'update_documento/' + item.id, obj).then(() => {
      if (status == 1) {
        let exame = JSON.parse(localStorage.getItem('exame_selecionado'));
        loadNotionDocs(exame);
        setselecteddocumento([]);
        localStorage.setItem("documento_notion", 0);
        localStorage.setItem("texto_notion", '');
        document.getElementById('notionfieldexames').innerHTML = '';
        let botao_id = localStorage.getItem('id_exame_selecionado');
        selector('lista de exames agendados para laudar', 'botão exame agendado ' + botao_id, 200);
      }
    })
  }
  // excluir documento.
  const deleteDocumento = (id) => {
    axios.get(html + 'delete_documento/' + id).then(() => {
      let exame = JSON.parse(localStorage.getItem('exame_selecionado'));
      loadNotionDocs(exame);
      setselecteddocumento([]);
      localStorage.setItem("documento_notion", 0);
      localStorage.setItem("texto_notion", '');
      document.getElementById("notionfieldexames").innerHTML = '';
    })
  }

  // registrando um documento a partir de modelo.
  const insertModeloDocumento = (item) => {
    let exame = JSON.parse(localStorage.getItem('exame_selecionado'));
    console.log(exame);
    var obj = {
      id_paciente: exame.id_paciente,
      nome_paciente: exame.nome_paciente,
      id_atendimento: null,
      data: moment(),
      texto: item.texto,
      status: 0,
      tipo_documento: 'PROCEDIMENTO ' + exame.nome_exame + '-' + exame.id_paciente,
      profissional: exame.nome_profissional_executante,
      conselho: exame.conselho_profissional_executante,
      id_profissional: exame.id_profissional_executante,
    }
    console.log(obj);
    axios.post(html + 'insert_documento', obj).then(() => {
      setviewselectmodelos(0);
      loadModelos();
      loadNotionDocs(exame);
    })
  }

  // gerando documento para impressão com o PDFmake:
  const geraPdfFromHtml = () => {
    const options = {
      defaultStyles: {
        // Override default element styles that are defined below
        div: { margin: 10, padding: 10, fillColor: '#a4bcbc', alignment: 'left' },
        b: { bold: true },
        strong: { bold: true },
        u: {
          bold: true, alignment: 'center', fillColor: '#b2bebe', margin: 10, padding: 10
        },
        del: { decoration: 'lineThrough' },
        s: { decoration: 'lineThrough' },
        em: { italics: true },
        i: { italics: true },
        h1: { bold: true, margin: 10 },
        h2: { bold: true, margin: 10, paddin: 10, fillColor: '#EEEEEE', alignment: 'center' },
        a: { color: 'blue', decoration: 'underline' },
        strike: { decoration: 'lineThrough' },
        p: { margin: 5, padding: 5 },
        ul: { marginBottom: 5, marginLeft: 5 },
        table: {
          // border: [false, false, false, false],
          alignment: 'center',
          padding: 5,
          margin: 5,
          // fillColor: '#EEEEEE',
          textAlign: 'center',
          widths: ['20%', '60%', '20%'],
        }, // tentar centralizar tabela, aumentar width, arredondar bordas e retirar as bordas.
        td: { color: 'white', border: [false, false, false, false] },
        th: { bold: true, width: '100%', fillColor: '#b2bebe', border: [false, false, false, false], alignment: 'center', alignSelf: 'center', borderRadius: '5px', margin: [0, 0, 0, 0], padding: [10, 10, 10, 10] },
        img: { alignment: 'center', alignSelf: 'center' }
      },
    }

    const converted = htmlToPdfmake(document.getElementById('notionfieldexames').innerHTML, options);
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
        converted
      ],
    }

    // Generate PDF
    pdfMake.createPdf(docDefinition).open();
  }

  const criarModeloDocumento = () => {
    let item = JSON.parse(localStorage.getItem('documento_selecionado'));
    var obj = {
      id_usuario: usuario.id,
      tipo_documento: item.tipo_documento,
      nome_modelo: document.getElementById("inputNomeModeloDocumento").value.toUpperCase(),
      texto: item.texto,
    }
    console.log(obj);
    axios.post(html + 'insert_model_documento', obj).then(() => {
      setviewcreatemodelo(0);
      loadModelos();
    })
  }
  const deletarModeloDocumento = (item) => {
    axios.get(html + 'delete_model_documento/' + item.id).then(() => {
      loadModelos();
    });
  }

  const [arraymodelos, setarraymodelos] = useState([]);
  const loadModelos = () => {
    axios.get(html + 'list_model_documentos/' + usuario.id).then((response) => {
      var x = response.data.rows;
      setarraymodelos(x);
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
            <div id="sair dos modelos"
              className="button-green"
              onClick={() => {
                criarModeloDocumento();
                setviewcreatemodelo(0);
              }}
              style={{
                display: 'flex',
                alignSelf: 'center',
              }}>
              <img
                alt=""
                src={salvar}
                style={{ width: 25, height: 25 }}
              ></img>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ListaDeDocumentos = useCallback(() => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          margin: 0, marginLeft: 7.5,
          width: '20vw',
          minWidth: '20vw',
          maxWidth: '20vw',
          height: 'calc(100% - 20px)',
          alignSelf: 'center',
        }}
      >
        <div
          id="lista de documentos exames"
          className='scroll'
          style={{
            backgroundColor: 'white',
            borderColor: 'white',
            height: 'calc(100vh - 20px)',
            width: 'calc(100% - 15px)',
          }}
        >
          {documentos.map((item) => (
            <div
              id={'documento exames ' + item.id}
              key={'documento exames ' + item.id}
              title={'documento exames ' + item.id}
              className='button'
              onClick={() => {
                localStorage.setItem("documento_notion", item.id);
                setselecteddocumento(item);
                document.getElementById('notionfieldexames').innerHTML = item.texto;
                selector("lista de documentos exames", 'documento exames ' + item.id, 100);
                setTimeout(() => {
                  if (item.id == localStorage.getItem("id_notion") && item.status == 0) {
                    document.getElementById("notionfieldexames").innerHTML = localStorage.getItem("texto_notion");
                  } else {
                    document.getElementById("notionfieldexames").innerHTML = item.texto;
                  }
                }, 100);
              }}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 180 }}
            >
              <div id="botões"
                style={{
                  display: 'flex', flexDirection: 'row', justifyContent: 'center',
                  pointerEvents: item.id == parseInt(localStorage.getItem("documento_notion")) ? 'auto' : 'none',
                  opacity: item.id == parseInt(localStorage.getItem("documento_notion")) ? 1 : 0.3
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
                <div id="botão para assinar documento"
                  className="button-green"
                  style={{
                    display: item.status == 0 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25,
                  }}
                  onClick={() => {
                    setselecteddocumento(item);
                    setTimeout(() => {
                      // retirando os botões de carregamento e edição de fotos, no notionfield, para gravação do documento.
                      var botoes_azuis = document.getElementById("notionfieldexames").getElementsByClassName('notion_img_button');
                      var botoes_vermelhos = document.getElementById("notionfieldexames").getElementsByClassName('notion_img_button_red');
                      let arraybotoes_azuis = Array.from(botoes_azuis);
                      let arraybotoes_vermelhos = Array.from(botoes_vermelhos);
                      arraybotoes_azuis.map(item => item.remove());
                      arraybotoes_vermelhos.map(item => item.remove());
                      setTimeout(() => {
                        localStorage.setItem('texto_notion', document.getElementById('notionfieldexames').innerHTML);
                        updateDocumento(item, 1);
                      }, 1000);
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
                    display: item.status == 1 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25, marginLeft: 0
                  }}
                  onClick={() => {
                    setselecteddocumento(item);
                    setTimeout(() => {
                      copiarDocumento(item);
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
                    display: item.status == 1 ? 'flex' : 'none',
                    alignSelf: 'center',
                    minHeight: 25, minWidth: 25, maxHeight: 24, maxWidth: 25, marginLeft: 0, marginRight: 0,
                  }}
                  onClick={() => {
                    setselecteddocumento(item);
                    document.getElementById("conteudo_notion").innerHTML = item.texto;
                    setTimeout(() => {
                      geraPdfFromHtml();
                      // geraPdfPuppeteer()
                    }, 1000);
                  }}>
                  <img
                    alt=""
                    src={print}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
                <div id="inputSalvarModelo"
                  className="button"
                  onClick={() => {
                    console.log('SALVAR MODELO');
                    localStorage.setItem('documento_selecionado', JSON.stringify(item));
                    setviewcreatemodelo(1);
                  }}
                  style={{
                    display: item.status == 1 ? 'flex' : 'none',
                    alignSelf: 'center',
                    width: 25, minWidth: 25, maxWidth: 25,
                    height: 25, minHeight: 25, maxHeight: 25,
                  }}>
                  <img
                    alt=""
                    src={favorito_salvar}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
              </div>
              <div>{tipodocumento}</div>
              <div>{moment(item.data).format('DD/MM/YY')}</div>
              <div>{moment(item.data).format('HH:mm')}</div>
              <div style={{ fontSize: 12, marginTop: 10, whiteSpace: 'pre-wrap', marginBottom: 5 }}>{'DR(A) ' + item.profissional}</div>
            </div>
          ))}
        </div>
      </div>
    )
    // eslint-disable-next-line
  }, [documentos]);

  // função que adiciona elementos ao NotionField.
  const appendElement = (tipo) => {
    if (tipo == 'titulo') {
      insereTitulo();
    } else if (tipo == 'texto') {
      insereFirstP();
    } else if (tipo == 'imagem') {
      insereImagem();
    }
  }

  function Conteudo() {
    return (
      <div id='conteudo_notion'
        style={{
          display: 'flex',
          flexDirection: 'column', justifyContent: 'flex-start',
          fontFamily: 'Helvetica',
          whiteSpace: 'pre-wrap',

        }}>
      </div>
    )
  }

  function PrintNotion() {
    return (
      <div id="IMPRESSÃO - NOTION"
        className='print'
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column', justifyContent: 'flex-start',
          marginTop: 10,
        }}>
          <Header></Header>
          <div style={{ marginTop: 20 }}>
            <Conteudo></Conteudo>
          </div>
        </div>
        <Footer></Footer>
      </div>
    )
  };

  // tipos de elementos HTML estilizados a serem inseridos.
  const insereFirstP = () => {
    console.log('insere <p>');
    let random = Math.random();
    let element = document.createElement("div");
    element.id = 'notionblock ' + random;
    element.className = 'notion_p';
    element.style.width = 300;
    element.setAttribute('contenteditable', "true");
    if (document.getElementById('notionfieldexames').nextElementSibling != null) {
      document.getElementById("notionfieldexames").insertBefore(element, document.activeElement.nextSibling);
    } else {
      document.getElementById("notionfieldexames").appendChild(element);
    }
    document.getElementById(element.id).focus();
    localStorage.setItem('element', element.id);
  };
  const insereP = () => {
    let random = Math.random();
    if (document.activeElement.nextSibling != null && !document.activeElement.id.includes('notionblock')) {
      let element = document.createElement("div");
      element.id = 'notionblock ' + random;
      element.className = 'notion_p';
      element.setAttribute('contenteditable', "true");
      document.getElementById("notionfieldexames").insertBefore(element, document.activeElement.nextSibling);
      document.getElementById(element.id).focus();
      localStorage.setItem('element', element.id);
    } else {
      let element = document.createElement("div");
      element.id = 'notionblock ' + random;
      element.className = 'notion_p';
      element.setAttribute('contenteditable', "true");
      document.getElementById("notionfieldexames").appendChild(element);
      document.getElementById(element.id).focus();
      localStorage.setItem('element', element.id);
    }
  }
  const insereTitulo = () => {
    console.log('insere título');
    let random = Math.random();
    let element = document.createElement("div");
    element.id = 'notionblock ' + random;
    element.className = 'notion_titulo';
    element.style.textAlign = 'center';
    element.style.fontWeight = 'bold';
    element.setAttribute('contenteditable', "true");
    if (document.getElementById('notionfieldexames').nextElementSibling != null) {
      document.getElementById("notionfieldexames").insertBefore(element, document.activeElement.nextSibling);
    } else {
      document.getElementById("notionfieldexames").appendChild(element);
    }
    document.getElementById(element.id).focus();
    localStorage.setItem('element', element.id);
  }
  const insereImagem = () => {
    console.log('insere canvas');
    // criando o random para tratamento dos id's dos elementos.
    let random = Math.random();
    // criando os elementos HTML.
    let element_canvas = null;
    let element_parent = null; // div que vai ter como elementos filhos o botão selecionar imagem, deletar imagem e botões de zoom.
    let element_input = null;
    let element_pseudo_input = null;
    let element_delete = null;
    let element_zoom_in = null;
    let element_zoom_out = null;
    let img = null;
    let element_image = null;
    element_canvas = document.createElement("canvas");
    element_canvas.id = 'notionblock_canvas ' + random;
    element_canvas.className = 'notion_canvas'
    element_parent = document.createElement("div");
    element_parent.id = 'notionblock_parent ' + random;
    element_parent.style.display = 'flex';
    element_parent.style.flexDirection = 'row';
    element_parent.style.justifyContent = 'center';
    element_input = document.createElement("input");
    element_input.type = 'file';
    element_input.id = 'notionblock_picker ' + random;
    element_input.style.display = 'none';
    element_pseudo_input = document.createElement("div");
    element_pseudo_input.className = "notion_img_button";
    element_pseudo_input.id = 'notionblock_pseudo_picker ' + random;
    let image_novo = document.createElement('img');
    image_novo.src = novo;
    image_novo.width = 25;
    image_novo.height = 25;
    image_novo.alt = "";
    element_pseudo_input.appendChild(image_novo);
    element_delete = document.createElement("div");
    element_delete.className = 'notion_img_button_red';
    element_delete.id = 'notionblock_delete ' + random;
    let image_delete = document.createElement('img');
    image_delete.src = deletar;
    image_delete.width = 25;
    image_delete.height = 25;
    image_delete.alt = "";
    element_delete.appendChild(image_delete);
    element_zoom_in = document.createElement("div");
    element_zoom_in.id = 'notionblock_zoom_in ' + random;
    element_zoom_in.className = 'notion_img_button';
    let element_ampliar_image = document.createElement("img");
    element_ampliar_image.src = ampliar;
    element_ampliar_image.height = 25;
    element_ampliar_image.width = 25;
    element_zoom_in.appendChild(element_ampliar_image);
    element_zoom_out = document.createElement("div");
    element_zoom_out.id = 'notionblock_zoom_out ' + random;
    element_zoom_out.className = 'notion_img_button';
    let element_reduzir_image = document.createElement("img");
    element_reduzir_image.src = reduzir;
    element_reduzir_image.height = 25;
    element_reduzir_image.width = 25;
    element_zoom_out.appendChild(element_reduzir_image);
    if (document.getElementById('notionfieldexames').nextElementSibling != null) {
      document.getElementById("notionfieldexames").insertBefore(element_canvas, document.activeElement.nextSibling);
      document.getElementById("notionfieldexames").insertBefore(element_parent, document.activeElement.nextSibling);
      element_parent.appendChild(element_input);
      element_parent.appendChild(element_pseudo_input);
      element_parent.appendChild(element_delete);
      element_parent.appendChild(element_zoom_in);
      element_parent.appendChild(element_zoom_out);
    } else {
      document.getElementById("notionfieldexames").appendChild(element_canvas);
      document.getElementById("notionfieldexames").insertBefore(element_parent, document.activeElement.nextSibling);
      element_parent.appendChild(element_input);
      element_parent.appendChild(element_pseudo_input);
      element_parent.appendChild(element_delete);
      element_parent.appendChild(element_zoom_in);
      element_parent.appendChild(element_zoom_out);
    }

    // adicionando as funções para abrir a janela do explorer e capturar uma imagem.
    element_pseudo_input.addEventListener('click', function () {
      document.getElementById('notionblock_picker ' + random).click();
    })

    // adicionando a função para aumentar o tamanho da imagem.
    element_zoom_in.addEventListener('click', function () {
      if (element_image != null) {
        let id = document.getElementById('notionblock_img ' + random);
        let width = id.offsetWidth;
        let textarea = document.getElementById('notionfieldexames').offsetWidth;
        console.log('IMAGEM: ' + width);
        console.log('FIELD: ' + textarea);
        if (width < textarea - 100) {
          let newsize = width + 50;
          console.log('NOVO TAMANHO: ' + newsize);
          id.style.width = newsize + 'px';
        }
      }
    });

    // adicionando a função para diminuir o tamanho da imagem.
    element_zoom_out.addEventListener('click', function () {
      if (element_image != null) {
        let id = document.getElementById('notionblock_img ' + random);
        let width = id.offsetWidth;
        let textarea = document.getElementById('notionfieldexames').offsetWidth;
        console.log('IMAGEM: ' + width);
        console.log('FIELD: ' + textarea);
        if (width > 0.3 * textarea) {
          let newsize = width - 50;
          console.log('NOVO TAMANHO: ' + newsize);
          id.style.width = newsize + 'px';
        }
      }
    });

    element_input.addEventListener('change', function () {
      // removendo o elemento imagem, caso existente, e adicionando o elemento canvas.
      if (element_image != null) {
        document.getElementById('notionblock_img ' + random).remove();
      }
      document.getElementById("notionfieldexames").appendChild(element_canvas);
      // carregando a imagem selecionada no explorador de arquivos no canvas.
      let canvas = document.getElementById(element_canvas.id);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      const myFile = document.getElementById('notionblock_picker ' + random).files[0];
      img = new Image();
      img.src = URL.createObjectURL(myFile);
      img.onload = () => {
        let notionfieldwidth = document.getElementById("notionfieldexames").offsetWidth;
        let ratio = notionfieldwidth / img.width;
        if (notionfieldwidth < img.width) {
          canvas.width = 0.6 * ratio * img.width;
          canvas.height = 0.6 * ratio * img.height;
        } else {
          canvas.width = 0.7 * img.width;
          canvas.height = 0.7 * img.height;
        }
        document.getElementById('notionblock_canvas ' + random).getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

        // criando o elemento imagem e transferindo a figura para o elemento imagem.
        element_image = document.createElement("img");
        element_image.id = 'notionblock_img ' + random;
        element_image.className = 'notion_image_grande';
        element_image.style.justifyContent = 'center';
        element_image.src = document.getElementById('notionblock_canvas ' + random).toDataURL("image/jpeg");

        document.getElementById("notionfieldexames").appendChild(element_image);

        // removendo o canvas com a imagem antiga e os elementos para seleção de um arquivo de imagem no computador.
        document.getElementById('notionblock_canvas ' + random).remove();
        document.getElementById('notionblock_picker ' + random).remove();
        document.getElementById('notionblock_pseudo_picker ' + random).remove();
        document.getElementById('notionblock_delete ' + random).remove();
        document.getElementById('notionblock_zoom_in ' + random).remove();
        document.getElementById('notionblock_zoom_out ' + random).remove();
        document.getElementById('notionblock_parent ' + random).remove();

        // recriar os elementos...
        document.getElementById("notionfieldexames").appendChild(element_parent);
        element_parent.appendChild(element_input);
        element_parent.appendChild(element_pseudo_input);
        element_parent.appendChild(element_delete);
        element_parent.appendChild(element_zoom_in);
        element_parent.appendChild(element_zoom_out);
      }
    })

    element_delete.addEventListener('click', function () {
      element_parent.remove();
      element_image.remove();
    })
  }

  // menu de atalho, com informações importantes para inserção no texto.
  const [viewmenucolinha, setviewmenucolinha] = useState(0);
  const putcolinha = (tag, dado) => {
    return (
      <div className='button' style={{ width: 250, justifyContent: 'flex-start', paddingLeft: 10 }}
        onClick={() => {
          if (objpaciente != null) {
            setviewmenucolinha(0);
            let element = localStorage.getItem('element');
            // console.log(element);
            let corte = localStorage.getItem('caret');
            // console.log(corte);
            let texto = document.getElementById(element).textContent;
            let text_before = texto.slice(0, corte);
            let text_after = texto.slice(corte, texto.length);
            document.getElementById(element).textContent = text_before + ' ' + dado + ' ' + text_after;
            let caret = new VanillaCaret(document.getElementById(element));
            let novocorte = parseInt(corte) + parseInt(dado.length) + 1;
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
          position: 'absolute',
          alignSelf: 'center',
          bottom: 5,
          left: 15,
          zIndex: 10,
          height: 280,
          // backgroundColor: '#a6cee8',
          // borderColor: '#a6cee8',
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

  // função que insere ou altera elementos ao clicar-se em uma tecla do teclado.
  const keyHandler = (e) => {
    console.log(document.activeElement.id);
    console.log(document.activeElement.parentElement.id);
    localStorage.setItem('element', document.activeElement.id);
    if (e.keyCode == 13) { // tecla enter
      e.preventDefault();
      insereP();
    } else if (e.keyCode == 8) { // tecla backspace
      // verificando se o conteúdo do elemento é vazio, para realizar sua exclusão.
      if (document.activeElement.textContent.length == 0) {
        if (document.activeElement.previousSibling != null) {
          e.preventDefault();
          console.log('DELETANDO ELEMENTO');
          let id = document.getElementById(document.activeElement.id).previousSibling.id;
          console.log(id);
          localStorage.setItem('element', id);
          document.getElementById("notionfieldexames").removeChild(document.activeElement);
          document.getElementById(id).focus();
          let caret = new VanillaCaret(document.getElementById(id));
          let conteudo = document.getElementById(id).innerText;
          console.log(conteudo);
          caret.setPos(conteudo.length);
        } else {
          document.activeElement.remove();
        }
      }
    } else if (e.keyCode == 38) { // tecla seta para cima
      if (document.activeElement.previousSibling != null) {
        let id = document.getElementById(document.activeElement.id).previousSibling.id;
        document.getElementById(id).focus();
        localStorage.setItem('element', id);
      }
    } else if (e.keyCode == 40) { // tecla seta para baixo
      if (document.activeElement.nextSibling != null) {
        let id = document.getElementById(document.activeElement.id).nextSibling.id;
        document.getElementById(id).focus();
        localStorage.setItem('element', id);
      }
    } else if (e.keyCode == 226) { // tecla de barra invertida >> "\" (para o menucolinhas!).
      e.preventDefault();
      let caret = new VanillaCaret(document.getElementById(document.activeElement.id));
      // console.log(caret.getPos());
      localStorage.setItem('caret', caret.getPos());
      setviewmenucolinha(1);
    } else if (e.keyCode == 46) { // tecla delete
      // verificando se o conteúdo do elemento é vazio, para realizar sua exclusão.
      if (document.activeElement.textContent.length == 0) {
        e.preventDefault();
        if (document.activeElement.previousSibling != null) {
          let id = document.getElementById(document.activeElement.id).previousSibling.id;
          document.getElementById("notionfieldexames").removeChild(document.activeElement);
          document.getElementById(id).focus();
          localStorage.setItem('element', id);
        } else {
          document.getElementById("notionfieldexames").removeChild(document.activeElement);
        }
      }
    } else if (e.keyCode == 27) { // tecla esc
      setviewmenucolinha(0);
    }
    localStorage.setItem("id_notion", selecteddocumento.id);
    localStorage.setItem('texto_notion', document.getElementById('notionfieldexames').innerHTML);
    updateDocumento(selecteddocumento, 0);
  }

  function Menu() {
    return (
      <div id='menu'
        className='scroll'
        style={{
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column', justifyContent: 'flex-start',
          alignSelf: 'center',
          width: 'calc(100% - 20px)',
          height: 110,
          opacity: selecteddocumento.length == 0 || selecteddocumento.status == 1 ? 0.3 : 1,
          pointerEvents: selecteddocumento.length == 0 || selecteddocumento.status == 1 ? 'none' : 'auto',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div className='button'
            onClick={() => appendElement('titulo')}
            style={{ width: 100, height: 25, minHeight: 25, maxHeight: 25 }}
          >
            TÍTULO
          </div>
          <div className='button'
            onClick={() => appendElement('texto')}
            style={{ width: 100, height: 25, minHeight: 25, maxHeight: 25 }}
          >
            TEXTO
          </div>
          <div className='button' for="uploader"
            onClick={() => appendElement('imagem')}
            style={{ width: 100, height: 25, minHeight: 25, maxHeight: 25 }}
          >
            IMAGEM
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div className='button'
            onClick={() => {
              let element = localStorage.getItem('element');
              document.getElementById(element).style.textAlign = 'left'
              document.getElementById(element).style.alignSelf = 'flex-start'
              document.getElementById(element).focus();
            }}
            style={{ width: 30, minWidth: 30, maxWidth: 30, height: 25, minHeight: 25, maxHeight: 25 }}
          >
            <img
              alt=""
              src={text_left}
              style={{ width: 25, height: 25 }}
            ></img>
          </div>
          <div className='button'
            onClick={() => {
              let element = localStorage.getItem('element');
              document.getElementById(element).style.textAlign = 'center'
              document.getElementById(element).style.alignSelf = 'center'
              document.getElementById(element).focus();
            }}
            style={{ width: 30, minWidth: 30, maxWidth: 30, height: 25, minHeight: 25, maxHeight: 25 }}
          >
            <img
              alt=""
              src={text_center}
              style={{ width: 25, height: 25 }}
            ></img>
          </div>
          <div className='button'
            onClick={() => {
              let element = localStorage.getItem('element');
              document.getElementById(element).style.textAlign = 'right'
              document.getElementById(element).style.alignSelf = 'flex-end'
              document.getElementById(element).focus();
            }}
            style={{ width: 30, minWidth: 30, maxWidth: 30, height: 25, minHeight: 25, maxHeight: 25, marginRight: 30 }}
          >
            <img
              alt=""
              src={text_right}
              style={{ width: 25, height: 25 }}
            ></img>
          </div>
          <div className='button'
            onClick={() => {
              let element = localStorage.getItem('element');
              if (document.getElementById(element).style.fontWeight == 'bold') {
                document.getElementById(element).style.fontWeight = 'normal'
              } else {
                document.getElementById(element).style.fontWeight = 'bold'
              }
              document.getElementById(element).focus();
            }}
            style={{ width: 30, minWidth: 30, maxWidth: 30, height: 25, minHeight: 25, maxHeight: 25 }}
          >
            B
          </div>
          <div className='button'
            onClick={() => {
              let element = localStorage.getItem('element');
              if (document.getElementById(element).style.fontStyle == 'italic') {
                document.getElementById(element).style.fontStyle = 'normal'
              } else {
                document.getElementById(element).style.fontStyle = 'italic'
              }
              document.getElementById(element).focus();
            }}
            style={{ width: 30, minWidth: 30, maxWidth: 30, height: 25, minHeight: 25, maxHeight: 25, fontStyle: 'italic' }}
          >
            I
          </div>
        </div>
      </div>
    )
  }

  function NotionField() {
    return (
      <div id='notionfieldexames'
        className='scroll'
        style={{
          display: 'flex',
          flexDirection: 'column', justifyContent: 'flex-start',
          alignContent: 'flex-start',
          alignSelf: 'center',
          width: 'calc(100% - 20px)',
          maxWidth: 'calc(100% - 20px)',
          height: 'calc(100% - 20px)',
          maxHeight: 'calc(100% - 20px)',
          backgroundColor: 'white',
          borderColor: 'white',
          borderRadius: 5,
          position: 'relative',
        }}
        onClick={() => setviewmenucolinha(0)}
        onKeyDown={(e) => {
          if (selecteddocumento.status == 0) {
            keyHandler(e);
          } else {
            e.preventDefault();
            toast(settoast, 'ESTE DOCUMENTO JÁ FOI FECHADO E NÃO PODE SER ALTERADO', '#EC7063', 2000);
          }
        }}
        onMouseMove={() => {
          localStorage.setItem('texto_notion', document.getElementById('notionfieldexames').innerHTML);
          // console.log(document.getElementById('notionfield').innerHTML);
        }}
      >
      </div>
    )
  }

  const [listexamesagendados, setlistexamesagendados] = useState([]);
  const loadExamesAgendados = () => {
    axios.get(html + 'list_exames_clinicas/' + cliente.id_cliente).then((response) => {
      var x = [];
      x = response.data.rows;
      // console.log(x);
      setlistexamesagendados(x);
    })
  }

  const [viewseletorexame, setviewseletorexame] = useState(0);
  const [selectedexame, setselectedexame] = useState('SELECIONE UM PROCEDIMENTO');
  function SeletorExame() {
    return (
      <div
        style={{ display: viewseletorexame == 1 ? 'flex' : 'none' }}
        className='fundo' onClick={() => setviewseletorexame(0)}>
        <div className='janela scroll'>
          <div className='grid'>
            {procedimentos_cliente.map(item => (
              <div
                key={item.tuss_codigo}
                className='button'
                style={{
                  width: 200, minWidth: 200, maxWidth: 200,
                  height: 200, minHeight: 200, maxHeight: 200,
                }}
                onClick={() => {
                  setselectedexame(item.tuss_rol_ans_descricao);
                  loadExamesAgendados();
                  setviewseletorexame(0);
                }}
              >
                {item.tuss_rol_ans_descricao}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const updateExame = ([exame, status]) => {
    let obj = {
      id_exame: null,
      nome_exame: exame.nome_exame,
      codigo_tuss: exame.codigo_tuss,
      valor_particular: exame.valor_particular,
      valor_convenio: exame.valor_convenio,
      particular: exame.particular,
      convenio: exame.convenio,
      codigo_operadora: exame.codigo_operadora,
      forma_pagamento: exame.pagamento,
      id_paciente: exame.id_paciente,
      nome_paciente: exame.nome_paciente,
      dn_paciente: exame.dn_paciente,
      id_profissional_executante: exame.id_profissional_executante,
      nome_profissional_executante: exame.nome_profissional_executante,
      conselho_profissional_executante: exame.conselho_profissional_executante,
      n_conselho_profissional_executante: exame.n_conselho_profissional_executante,
      status: status, // 0 = solicitado, 1 = executado, 2 = cancelado, 3 = desistência.
      laudohtml: exame.laudohtml,
      id_cliente: exame.id_cliente,
      data_exame: exame.data_exame,
    }
    console.log(obj);
    axios.post(html + 'update_exames_clinicas/' + exame.id, obj).then(() => {
      console.log('ITEM DE AGENDAMENTO DE EXAME ATUALIZADO COM SUCESSO');
      setselecteddocumento([]);
      localStorage.setItem("documento_notion", 0);
      localStorage.setItem("texto_notion", '');
      document.getElementById("notionfieldexames").innerHTML = '';
      let botao_id = localStorage.getItem('id_exame_selecionado');
      selector('lista de exames agendados para laudar', 'botão exame agendado ' + botao_id, 200);
      loadExamesAgendados();
    });
  }

  const ListaDeExames = useCallback(() => {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100% - 20px)',
        width: '50vw',
        alignSelf: 'center',
        marginRight: 5,
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          width: 'calc(100% - 20px)',
          alignSelf: 'center',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 5,
          }}>
            <div id="botão para sair da tela de exames"
              className="button-yellow"
              style={{
                display: 'flex',
                alignSelf: 'center',
              }}
              onClick={() => {
                setpagina(0);
                history.push("/");
              }}>
              <img
                alt=""
                src={back}
                style={{ width: 30, height: 30 }}
              ></img>
            </div>
            <div className='button'
              style={{ width: 'calc(100% - 20px)' }}
              onClick={() => setviewseletorexame(1)}>
              {selectedexame}
            </div>
          </div>
        </div>
        <div id="lista de exames agendados para laudar"
          className='scroll'
          style={{
            width: 'calc(100% - 20px)',
            minWidth: 'calc(100% - 20px)',
            height: '100vh'
          }}
        >
          {listexamesagendados.filter(item => item.id_profissional_executante == usuario.id && item.nome_exame == selectedexame).map(item => (
            <div className='button'
              id={'botão exame agendado ' + item.id}
              key={'botão exame agendado ' + item.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                position: 'relative',
                marginBottom: item.status == 0 ? 35 : 5,
                alignContent: 'flex-start',
                alignItems: 'flex-start',
                minHeight: 120,
              }}
              onClick={() => {
                localStorage.setItem('exame_selecionado', JSON.stringify(item));
                axios.get(html + "list_documentos_idpct/" + item.id_paciente).then((response) => {
                  var x = response.data.rows;
                  localStorage.setItem('id_exame_selecionado', item.id);
                  setdocumentos(x.filter(documento => documento.tipo_documento == 'PROCEDIMENTO ' + item.nome_exame + '-' + item.id_paciente).sort((a, b) => moment(a.data) < moment(b.data) ? 1 : -1));
                  selector('lista de exames agendados para laudar', 'botão exame agendado ' + item.id, 100);
                })
              }}
            >
              <div id="botões para finalizar o procedimento ou exame."
                className="cor0"
                style={{
                  display: item.status > 0 ? "none" : "flex",
                  flexDirection: "row",
                  alignContent: "center",
                  borderRadius: 5,
                  borderStyle: 'solid',
                  borderWidth: 3,
                  padding: 2,
                  margin: 2,
                  position: 'absolute',
                  bottom: -35, right: 5,
                }}
              >
                <div
                  id="botão encerrar"
                  className="button-true-green"
                  title="ENCERRAR CONSULTA"
                  onClick={() => {
                    modal(setdialogo, 'TEM CERTEZA QUE DESEJA FINALIZAR O PROCEDIMENTO?', updateExame, [item, 1]);
                  }}
                  style={{
                    display: "flex",
                    borderColor: "#f2f2f2",
                    width: 20,
                    minWidth: 20,
                    height: 20,
                    minHeight: 20,
                    margin: 0,
                    padding: 7.5,
                  }}
                >
                  <img alt="" src={flag} style={{ width: 25, height: 25 }}></img>
                </div>
                <div
                  id="botão cancelar exame ou procedimento"
                  className="button-true-red"
                  title="CANCELAR CONSULTA"
                  onClick={() => {
                    modal(setdialogo, 'TEM CERTEZA QUE DESEJA CANCELAR A CONSULTA?', updateExame, [item, 2]);
                  }}
                  style={{
                    display: "flex",
                    borderColor: "#f2f2f2",
                    width: 20,
                    minWidth: 20,
                    height: 20,
                    minHeight: 20,
                    margin: 0, marginLeft: 5,
                    padding: 7.5,
                  }}
                >
                  <img alt="" src={flag} style={{ width: 25, height: 25 }}></img>
                </div>
                <div id="btnNovoDocumento"
                  className='button-green'
                  style={{
                    display: "flex",
                    borderColor: "#f2f2f2",
                    width: 20,
                    minWidth: 20,
                    height: 20,
                    minHeight: 20,
                    margin: 0, marginLeft: 5,
                    padding: 7.5,
                  }}
                  onClick={(e) => {
                    selector('lista de exames agendados para laudar', 'botão exame agendado ' + item.id, 100);
                    settipodocumento('PROCEDIMENTO ' + item.nome_exame + '-' + item.id_paciente);
                    insertDocumento(item);
                    e.stopPropagation();
                  }}
                >
                  <img
                    alt=""
                    src={novo}
                    style={{ width: 20, height: 20 }}
                  ></img>
                </div>
                <div id="btnBaixarModelo"
                  className="button"
                  onClick={() => {
                    localStorage.setItem('exame_selecionado', JSON.stringify(item));
                    console.log(JSON.parse(localStorage.getItem('exame_selecionado')));
                    setviewselectmodelos(1);
                  }}
                  style={{
                    display: "flex",
                    borderColor: "#f2f2f2",
                    width: 20,
                    minWidth: 20,
                    height: 20,
                    minHeight: 20,
                    margin: 0, marginLeft: 5,
                    padding: 7.5,
                  }}>
                  <img
                    alt=""
                    src={favorito_usar}
                    style={{ width: 25, height: 25 }}
                  ></img>
                </div>
              </div>
              <div
                className={item.status == 1 ? 'button green' : item.status == 2 ? 'button-grey' : 'button orange'}
                style={{ width: 150, display: 'flex', flexDirection: 'column' }}
              >
                <div>
                  {item.data_exame.slice(0, 10)}
                </div>
                <div>
                  {item.data_exame.slice(12, 20)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'left' }}>{item.nome_exame}</div>
                <div style={{ textAlign: 'left' }}>{'PROFISSIONAL: ' + item.nome_profissional_executante}</div>
                <div style={{ textAlign: 'left' }}>{'PACIENTE: ' + item.nome_paciente}</div>
                <div style={{ textAlign: 'left' }}>{'DN: ' + item.dn_paciente}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
    // eslint-disable-next-line
  }, [listexamesagendados, setdocumentos, settipodocumento, selectedexame]);

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
          <div className='text1'>{'MODELOS DE DOCUMENTO PERSONALIZADOS:'}</div>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {arraymodelos.filter(item => JSON.stringify(item.tipo_documento).includes('PROCEDIMENTO') == true).map(item => (
              <div
                key={'arraymodelos de documentos ' + item.id}
                className='button'
                style={{ width: 150, height: 150, position: 'relative' }}
                onClick={() => insertModeloDocumento(item)}
              >
                <div>
                  {item.nome_modelo}
                </div>
                <div id="botão para acessar a janela de criação de modelo de laudo de exame ou procedimento."
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
            onClick={() => setviewselectmodelos(0)}
            style={{
              display: 'flex',
              alignSelf: 'center',
            }}>
            <img
              alt=""
              src={back}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="main"
      style={{ display: pagina == 'PROCEDIMENTOS' ? "flex" : "none" }}
    >
      <div
        className="chassi"
        id="conteúdo do prontuário"
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          width: 'calc(100vw - 20px)',
          height: 'calc(100vw - 20px)',
        }}
      >
        <MenuColinhas></MenuColinhas>
        <ListaDeExames></ListaDeExames>
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          width: '100%',
          position: 'relative',
          height: 'calc(100% - 20px)',
          alignSelf: 'center',
        }}>
          <Menu></Menu>
          <NotionField></NotionField>
          <ViewCreateModelo></ViewCreateModelo>
          <div style={{ backgroundColor: 'red' }}></div>
        </div>
        <ListaDeDocumentos></ListaDeDocumentos>
        <ViewSelectModelos></ViewSelectModelos>
        <PrintNotion></PrintNotion>
        <SeletorExame></SeletorExame>
      </div>
    </div>
  )
}

export default ProcedimentosExames;
