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
import salvar from '../images/salvar.png';
import novo from '../images/novo.png';
import deletar from '../images/deletar.png';
import VanillaCaret from 'vanilla-caret-js';
import toast from '../functions/toast';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from 'html-to-pdfmake';
pdfMake.addVirtualFileSystem(pdfFonts);


function NotionField() {

  // context.
  const {
    html,
    atendimento,
    paciente,
    objpaciente,
    usuario,
    card, setcard,
    tipodocumento, settipodocumento,
    selecteddocumento, setselecteddocumento,
    documentos, setdocumentos,
    setdialogo,
    settoast,
    cliente
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-notion') {
      settipodocumento('NOTION');
      loadNotionDocs();
    }
    // eslint-disable-next-line
  }, [card]);

  const loadNotionDocs = () => {
    axios.get(html + "list_documentos/" + atendimento).then((response) => {
      var x = response.data.rows;
      setdocumentos(x.filter(item => item.tipo_documento == 'NOTION').sort((a, b) => moment(a.data) < moment(b.data) ? 1 : -1));
      setselecteddocumento([]);
    })
  }

  // inserir documento.
  const insertDocumento = () => {
    var obj = {
      id_paciente: paciente,
      nome_paciente: objpaciente.nome_paciente,
      id_atendimento: atendimento,
      data: moment(),
      texto: null,
      status: 0,
      tipo_documento: tipodocumento,
      profissional: usuario.nome_usuario,
      conselho: usuario.conselho + ': ' + usuario.n_conselho,
      id_profissional: usuario.id,
    }
    // console.log(obj);
    // console.log(usuario);
    axios.post(html + 'insert_documento', obj).then(() => {
      loadNotionDocs();
      setselecteddocumento([]);
      localStorage.setItem("documento_notion", 0);
      localStorage.setItem("texto_notion", '');
      document.getElementById("notionfield").innerHTML = '';
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
    // console.log(obj);
    axios.post(html + 'insert_documento', obj).then(() => {
      loadNotionDocs();
      setselecteddocumento([]);
      localStorage.setItem("documento_notion", 0);
    })
  }
  // atualizar documento.
  const updateDocumento = (item, status) => {

    let texto = localStorage.getItem('texto_notion');
    // console.log(texto);
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
        loadNotionDocs();
        setselecteddocumento([]);
        localStorage.setItem("documento_notion", 0);
        // limpando o notionfield.
        // removeAllChildNodes(document.getElementById('notionfield'));
        localStorage.setItem("texto_notion", '');
        document.getElementById('notionfield').innerHTML = '';
      }
    })
  }

  // excluir documento.
  const deleteDocumento = (id) => {
    axios.get(html + 'delete_documento/' + id).then(() => {
      loadNotionDocs();
      setselecteddocumento([]);
      localStorage.setItem("documento_notion", 0);
      localStorage.setItem("texto_notion", '');
      document.getElementById("notionfield").innerHTML = '';
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

    const converted = htmlToPdfmake(document.getElementById('notionfield').innerHTML, options);
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

  const ListaDeDocumentos = useCallback(() => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          margin: 0, marginLeft: 10,
          width: '25vw',
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
            onClick={() => insertDocumento()}
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
          >
            <img
              alt=""
              src={favorito_usar}
              style={{ width: 30, height: 30 }}
            ></img>
          </div>
        </div>
        <div
          id="lista de documentos notion"
          className='scroll'
          style={{
            backgroundColor: 'white',
            borderColor: 'white',
            height: 'calc(100vh - 200px)',
            width: 'calc(100% - 15px)',
          }}
        >
          {documentos.filter(item => item.tipo_documento == tipodocumento).map((item) => (
            <div id={'documento notion ' + item.id}
              title={'documento notion ' + item.id}
              className='button'
              onClick={() => {
                localStorage.setItem("documento_notion", item.id);
                setselecteddocumento(item);
                document.getElementById('notionfield').innerHTML = item.texto;
                selector("lista de documentos notion", 'documento notion ' + item.id, 100);
                setTimeout(() => {
                  if (item.id == localStorage.getItem("id_notion") && item.status == 0) {
                    document.getElementById("notionfield").innerHTML = localStorage.getItem("texto_notion");
                  } else {
                    document.getElementById("notionfield").innerHTML = item.texto;
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
                      var botoes_azuis = document.getElementById("notionfield").getElementsByClassName('notion_img_button');
                      var botoes_vermelhos = document.getElementById("notionfield").getElementsByClassName('notion_img_button_red');
                      let arraybotoes_azuis = Array.from(botoes_azuis);
                      let arraybotoes_vermelhos = Array.from(botoes_vermelhos);
                      arraybotoes_azuis.map(item => item.remove());
                      arraybotoes_vermelhos.map(item => item.remove());
                      setTimeout(() => {
                        localStorage.setItem('texto_notion', document.getElementById('notionfield').innerHTML);
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
              </div>
              <div>{tipodocumento}</div>
              <div>{moment(item.data).format('DD/MM/YY')}</div>
              <div>{moment(item.data).format('HH:mm')}</div>
              <div style={{ fontSize: 12, marginTop: 10, whiteSpace: 'pre-wrap', marginBottom: 5 }}>{item.profissional}</div>
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
    } else if (tipo == 'bloco') {
      insereBloco();
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

    if (document.getElementById('notionfield').nextElementSibling != null) {
      document.getElementById("notionfield").insertBefore(element, document.activeElement.nextSibling);
    } else {
      document.getElementById("notionfield").appendChild(element);
    }

    document.getElementById(element.id).focus();
    localStorage.setItem('element', element.id);
  };
  const insereP = () => {
    let random = Math.random();
    if (document.activeElement.nextSibling != null) {
      let element = document.createElement("div");
      element.id = 'notionblock ' + random;
      element.className = 'notion_p';
      element.setAttribute('contenteditable', "true");
      document.getElementById("notionfield").insertBefore(element, document.activeElement.nextSibling);
      document.getElementById(element.id).focus();
      localStorage.setItem('element', element.id);
    } else {
      let element = document.createElement("div");
      element.id = 'notionblock ' + random;
      element.className = 'notion_p';
      element.setAttribute('contenteditable', "true");
      document.getElementById("notionfield").appendChild(element);
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
    if (document.getElementById('notionfield').nextElementSibling != null) {
      document.getElementById("notionfield").insertBefore(element, document.activeElement.nextSibling);
    } else {
      document.getElementById("notionfield").appendChild(element);
    }
    document.getElementById(element.id).focus();
    localStorage.setItem('element', element.id);
  }
  const insereBloco = () => {
    console.log('insere bloco');
    let random = Math.random();
    let element_bloco = document.createElement("table"); // porra.
    element_bloco.className = 'notion_block';
    element_bloco.id = 'notionblock ' + random;
    let element_lateral_e = document.createElement("td");
    let element_lateral_d = document.createElement("td");
    let element_table_text = document.createElement("th");

    element_table_text.style.className = 'notion_block_editable';
    element_table_text.style.width = '60%';
    element_table_text.setAttribute('contenteditable', "true");

    element_lateral_d.className = 'notion_block_lateral';
    element_lateral_e.className = 'notion_block_lateral';
    element_lateral_d.style.color = '#FFFFFF';
    element_lateral_e.style.color = '#FFFFFF';
    element_lateral_d.style.backgroundColor = '#FFFFFF';
    element_lateral_e.style.backgroundColor = '#FFFFFF';
    element_lateral_e.textContent = '............................'
    element_lateral_d.textContent = '............................'

    if (document.getElementById('notionfield').nextElementSibling != null) {
      document.getElementById("notionfield").insertBefore(element_bloco, document.activeElement.nextSibling);
      element_bloco.appendChild(element_lateral_e);
      element_bloco.appendChild(element_table_text);
      element_bloco.appendChild(element_lateral_d);
      element_table_text.focus();

    } else {
      document.getElementById("notionfield").appendChild(element_bloco);
      element_bloco.appendChild(element_lateral_e);
      element_bloco.appendChild(element_table_text);
      element_bloco.appendChild(element_lateral_d);
      element_table_text.focus();
    }

    document.getElementById(element_bloco.id).focus();
    localStorage.setItem('element', element_bloco.id);

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
    element_zoom_in.className = 'notion_img_button';
    element_zoom_in.innerText = '+';
    element_zoom_in.id = 'notionblock_zoom_in ' + random;

    element_zoom_out = document.createElement("div");
    element_zoom_out.className = 'notion_img_button';
    element_zoom_out.innerText = '-';
    element_zoom_out.id = 'notionblock_zoom_out ' + random;

    if (document.getElementById('notionfield').nextElementSibling != null) {
      document.getElementById("notionfield").insertBefore(element_canvas, document.activeElement.nextSibling);
      document.getElementById("notionfield").insertBefore(element_parent, document.activeElement.nextSibling);
      element_parent.appendChild(element_input);
      element_parent.appendChild(element_pseudo_input);
      element_parent.appendChild(element_delete);
      element_parent.appendChild(element_zoom_in);
      element_parent.appendChild(element_zoom_out);
      //document.getElementById("notionfield").insertBefore(element_input, document.activeElement.nextSibling);
      //document.getElementById("notionfield").insertBefore(element_pseudo_input, document.activeElement.nextSibling);
    } else {
      document.getElementById("notionfield").appendChild(element_canvas);
      document.getElementById("notionfield").insertBefore(element_parent, document.activeElement.nextSibling);
      element_parent.appendChild(element_input);
      element_parent.appendChild(element_pseudo_input);
      element_parent.appendChild(element_delete);
      element_parent.appendChild(element_zoom_in);
      element_parent.appendChild(element_zoom_out);
      // document.getElementById("notionfield").appendChild(element_input);
      // document.getElementById("notionfield").appendChild(element_pseudo_input);
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
        let textarea = document.getElementById('notionfield').offsetWidth;
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
        let textarea = document.getElementById('notionfield').offsetWidth;
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
      document.getElementById("notionfield").appendChild(element_canvas);

      // carregando a imagem selecionada no explorador de arquivos no canvas.
      let canvas = document.getElementById(element_canvas.id);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      const myFile = document.getElementById('notionblock_picker ' + random).files[0];
      img = new Image();
      img.src = URL.createObjectURL(myFile);
      img.onload = () => {
        console.log('image uploaded');

        console.log('IMG WIDTH: ' + img.width);
        console.log('IMG HEIGHT: ' + img.height);

        let notionfieldwidth = document.getElementById("notionfield").offsetWidth;
        let ratio = notionfieldwidth / img.width;

        if (notionfieldwidth < img.width) {
          // console.log('imagem grande!');
          canvas.width = 0.6 * ratio * img.width;
          canvas.height = 0.6 * ratio * img.height;
          // console.log('VEJA: ' + canvas.width + ' - ' + canvas.height);
        } else {
          // console.log('imagem menor...');
          canvas.width = 0.7 * img.width;
          canvas.height = 0.7 * img.height;
          // console.log('VEJA: ' + canvas.width + ' - ' + canvas.height);
        }

        document.getElementById('notionblock_canvas ' + random).getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

        // criando o elemento imagem e transferindo a figura para o elemento imagem.
        element_image = document.createElement("img");
        element_image.id = 'notionblock_img ' + random;
        element_image.className = 'notion_image_grande';
        element_image.style.justifyContent = 'center';
        element_image.src = document.getElementById('notionblock_canvas ' + random).toDataURL("image/jpeg");

        document.getElementById("notionfield").appendChild(element_image);

        // removendo o canvas com a imagem antiga e os elementos para seleção de um arquivo de imagem no computador.
        document.getElementById('notionblock_canvas ' + random).remove();
        document.getElementById('notionblock_picker ' + random).remove();
        document.getElementById('notionblock_pseudo_picker ' + random).remove();
        document.getElementById('notionblock_delete ' + random).remove();
        document.getElementById('notionblock_zoom_in ' + random).remove();
        document.getElementById('notionblock_zoom_out ' + random).remove();
        document.getElementById('notionblock_parent ' + random).remove();

        // recriar os elementos...
        document.getElementById("notionfield").appendChild(element_parent);
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
    // console.log(e.keyCode);
    // console.log(document.activeElement.id);
    localStorage.setItem('element', document.activeElement.id);
    // console.log(localStorage.getItem('element'));
    if (e.keyCode == 13) { // tecla enter
      e.preventDefault();
      insereP();
    } else if (e.keyCode == 8) { // tecla backspace
      // console.log('ID: ' + document.activeElement.id);
      // verificando se o conteúdo do elemento é vazio, para realizar sua exclusão.
      if (document.activeElement.textContent.length == 0) {
        if (document.activeElement.previousSibling != null) {
          console.log('DELETANDO ELEMENTO');
          let id = document.getElementById(document.activeElement.id).previousSibling.id;
          document.getElementById("notionfield").removeChild(document.activeElement);
          document.getElementById(id).focus();
          localStorage.setItem('element', id);
        } else {
          document.getElementById("notionfield").removeChild(document.activeElement);
        }
      }
    } else if (e.keyCode == 38) { // tecla seta para cima
      if (document.activeElement.previousSibling != null) {
        // console.log('DESLOCANDO PARA O ELEMENTO ANTERIOR');
        let id = document.getElementById(document.activeElement.id).previousSibling.id;
        document.getElementById(id).focus();
        localStorage.setItem('element', id);
      }
    } else if (e.keyCode == 40) { // tecla seta para baixo
      if (document.activeElement.nextSibling != null) {
        // console.log('DESLOCANDO PARA O PRÓXIMO ELEMENTO');
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
          document.getElementById("notionfield").removeChild(document.activeElement);
          document.getElementById(id).focus();
          localStorage.setItem('element', id);
        } else {
          document.getElementById("notionfield").removeChild(document.activeElement);
        }
      }
    } else if (e.keyCode == 27) { // tecla esc
      setviewmenucolinha(0);
    }
    localStorage.setItem("id_notion", selecteddocumento.id);
    localStorage.setItem('texto_notion', document.getElementById('notionfield').innerHTML);
    updateDocumento(selecteddocumento, 0);
  }

  return (
    <div style={{
      display: card == 'card-notion' ? 'flex' : 'none',
      flexDirection: 'row',
      width: '100%',
      height: '100%',
      position: 'relative',
    }}>
      <MenuColinhas></MenuColinhas>
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        position: 'relative',
        alignSelf: 'flex-end',
        // backgroundColor: 'red',
      }}>
        <div id='menu'
          className='scroll'
          style={{
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'column', justifyContent: 'flex-start',
            alignSelf: 'center',
            width: 'calc(100% - 15px)',
            height: 90,
            opacity: selecteddocumento.length == 0 || selecteddocumento.status == 1 ? 0.3 : 1,
            pointerEvents: selecteddocumento.length == 0 || selecteddocumento.status == 1 ? 'none' : 'auto',
            marginBottom: 10,
          }}
        // onMouseOver={() => console.log(selecteddocumento)}
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
            <div className='button'
              onClick={() => appendElement('bloco')}
              style={{ width: 100, height: 25, minHeight: 25, maxHeight: 25 }}
            >
              BLOCO
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
              L
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
              C
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
              R
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
        <div id='notionfield' // porra!
          className='scroll'
          style={{
            display: 'flex',
            flexDirection: 'column', justifyContent: 'flex-start',
            alignContent: 'flex-start',
            alignSelf: 'flex-end',
            maxHeight: 'calc(100vh - 230px)',
            flexGrow: 1,
            width: 'calc(100% - 15px)',
            maxWidth: 'calc(55vw - 15px)',
            backgroundColor: 'white',
            borderColor: 'white',
            borderRadius: 5,
            position: 'relative',
            marginBottom: -2.5,
            // pointerEvents: selecteddocumento.status == 1 ? 'none' : 'auto',
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
            localStorage.setItem('texto_notion', document.getElementById('notionfield').innerHTML);
            // console.log(document.getElementById('notionfield').innerHTML);
          }}
        >
        </div>
        <div style={{ backgroundColor: 'red' }}></div>
      </div>
      <ListaDeDocumentos></ListaDeDocumentos>
      <PrintNotion></PrintNotion>
    </div>
  )
}

export default NotionField;
