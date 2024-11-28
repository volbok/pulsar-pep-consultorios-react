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
import back from '../images/back.svg';
import print from '../images/imprimir.svg';
import copiar from '../images/copiar.svg';
import favorito_usar from '../images/favorito_usar.svg';
import salvar from '../images/salvar.svg';
import novo from '../images/novo.svg';
import deletar from '../images/deletar.svg';
import VanillaCaret from 'vanilla-caret-js';

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
    console.log(obj);
    console.log(usuario);
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
    console.log(obj);
    axios.post(html + 'insert_documento', obj).then(() => {
      loadNotionDocs();
      setselecteddocumento([]);
      localStorage.setItem("documento_notion", 0);
    })
  }
  // atualizar documento.
  const updateDocumento = (item, status) => {
    let texto = localStorage.getItem('texto_notion');
    console.log(texto);
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
  // imprimir documento.
  function printDiv() {
    let divContents = document.getElementById("IMPRESSÃO - NOTION").innerHTML;
    var printWindow = window.open();
    printWindow.document.write('<html><head>');
    printWindow.document.write('<link rel="stylesheet" href="notionfield.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(divContents);
    printWindow.document.write('</body></html>');
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
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
                      console.log(document.getElementById("notionfield").innerHTML);
                      updateDocumento(item, 1);
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
    } else if (tipo == 'imagem'){
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
      console.log(document.getElementById(document.activeElement.id).nextSibling.id);
      document.getElementById("notionfield").insertBefore(document.activeElement.nextSibling, element);
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
    let element = document.createElement("div");
    element.id = 'notionblock ' + random;
    element.className = 'notion_block';
    element.setAttribute('contenteditable', "true");
    if (document.getElementById('notionfield').nextElementSibling != null) {
      document.getElementById("notionfield").insertBefore(element, document.activeElement.nextSibling);
    } else {
      document.getElementById("notionfield").appendChild(element);
    }
    document.getElementById(element.id).focus();
    localStorage.setItem('element', element.id);
  }
  const insereImagem = () => {
    
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
            console.log(element);
            let corte = localStorage.getItem('caret');
            console.log(corte);
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
    console.log(e.keyCode);
    console.log(document.activeElement.id);
    localStorage.setItem('element', document.activeElement.id);
    if (e.keyCode == 13) { // tecla enter
      e.preventDefault();
      insereP();
    } else if (e.keyCode == 8) { // tecla backspace
      console.log('ID: ' + document.activeElement.id);
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
        console.log('DESLOCANDO PARA O ELEMENTO ANTERIOR');
        let id = document.getElementById(document.activeElement.id).previousSibling.id;
        document.getElementById(id).focus();
        localStorage.setItem('element', id);
      }
    } else if (e.keyCode == 40) { // tecla seta para baixo
      if (document.activeElement.nextSibling != null) {
        console.log('DESLOCANDO PARA O PRÓXIMO ELEMENTO');
        let id = document.getElementById(document.activeElement.id).nextSibling.id;
        document.getElementById(id).focus();
        localStorage.setItem('element', id);
      }
    } else if (e.keyCode == 226) { // tecla de barra invertida >> "\" (para o menucolinhas!).
      e.preventDefault();
      let caret = new VanillaCaret(document.getElementById(document.activeElement.id));
      console.log(caret.getPos());
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
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
        position: 'relative',
        alignSelf: 'flex-end',
      }}>
        <div id='menu'
          style={{
            display: 'flex',
            flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', 
            width: '100%',
            opacity: selecteddocumento.length == 0 || selecteddocumento.status == 1 ? 0.3 : 1,
            pointerEvents: selecteddocumento.length == 0 || selecteddocumento.status == 1 ? 'none' : 'auto',
            marginBottom: 10,
          }}
          onMouseOver={() => console.log(selecteddocumento)}
        >
          <div className='button'
            onClick={() => appendElement('titulo')}
            style={{ width: 100 }}
          >
            TÍTULO
          </div>
          <div className='button'
            onClick={() => appendElement('texto')}
            style={{ width: 100 }}
          >
            TEXTO
          </div>
          <div className='button'
            onClick={() => appendElement('bloco')}
            style={{ width: 100 }}
          >
            BLOCO
          </div>
          <div className='button'
            onClick={() => appendElement('imagem')}
            style={{ width: 100 }}
          >
            IMAGEM
          </div>
        </div>
        <div id='notionfield'
          className='scroll'
          style={{
            display: 'flex',
            flexDirection: 'column', justifyContent: 'flex-start',
            alignContent: 'flex-start',
            height: 'calc(100vh - 200px)',
            width: 'calc(100% - 15px)',
            backgroundColor: 'white',
            borderColor: 'white',
            borderRadius: 5,
            position: 'relative',
            pointerEvents: selecteddocumento.status == 1 ? 'none' : 'auto',
          }}
          onClick={() => setviewmenucolinha(0)}
          onKeyDown={(e) => {
            keyHandler(e);
          }}
          onMouseMove={() => {
            localStorage.setItem('texto_notion', document.getElementById('notionfield').innerHTML);
            console.log(document.getElementById('notionfield').innerHTML);
          }}
        >
        </div>
      </div>
      <ListaDeDocumentos></ListaDeDocumentos>
      <PrintNotion></PrintNotion>
    </div>
  )
}

export default NotionField;
