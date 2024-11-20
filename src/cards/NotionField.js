/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback } from 'react';
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

function NotionField() {

  // context.
  const {
    html,
    atendimento,
    paciente,
    pacientes,
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
      nome_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_paciente).pop(),
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
      localStorage.setItem("documento", 0);
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
      localStorage.setItem("documento", 0);
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
        localStorage.setItem("documento", 0);
      }
    })
  }
  // excluir documento.
  const deleteDocumento = (id) => {
    axios.get(html + 'delete_documento/' + id).then(() => {
      loadNotionDocs();
      setselecteddocumento([]);
      localStorage.setItem("documento", 0);
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
    printWindow.document.close();
    //printWindow.print();
    //printWindow.close();
  }

  const ListaDeDocumentos = useCallback(() => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '25vw',
          margin: 0, marginLeft: 10,
          height: '75vh',
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
          // onClick={() => setviewselectmodelos(1)}
          >
            <img
              alt=""
              src={favorito_usar}
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
            height: '100%',
            width: 'calc(100% - 20px)',
          }}
        >
          {documentos.filter(item => item.tipo_documento == tipodocumento).map((item) => (
            <div id={'documento notion ' + item.id}
              className='button'
              onClick={() => {
                console.log(item);
                localStorage.setItem("documento", item.id);
                setselecteddocumento(item);
                document.getElementById('notionfield').innerHTML = item.texto;
                setTimeout(() => {
                  selector("lista de documentos estruturados", 'documento notion ' + item.id, 100);
                }, 200);
              }}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 180 }}
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
    let element = document.createElement("p");
    element.id = 'notionblock ' + random;
    element.className = 'notion_p';
    element.setAttribute('contenteditable', "true");
    if (document.getElementById("notionfield").nextSibling) {
      console.log(document.getElementById(document.activeElement.id).nextSibling.id);
      document.getElementById("notionfield").insertBefore(document.activeElement.nextSibling, element);
    } else {
      document.getElementById("notionfield").appendChild(element);
    }
    document.getElementById(element.id).focus();
  };
  const insereTitulo = () => {
    console.log('insere título');
    let random = Math.random();
    let element = document.createElement("p");
    element.id = 'notionblock ' + random;
    element.className = 'notion_titulo';
    element.setAttribute('contenteditable', "true");
    if (document.getElementById("notionfield").nextSibling) {
      console.log(document.getElementById(document.activeElement.id).nextSibling.id);
      document.getElementById("notionfield").insertBefore(document.activeElement.nextSibling, element);
    } else {
      document.getElementById("notionfield").appendChild(element);
    }
    document.getElementById(element.id).focus();
  }

  const insereP = () => {
    console.log('insere <p> após um elemento pré-existente');
    let random = Math.random();
    if (document.activeElement.nextSibling != null) {
      let element = document.createElement("div");
      element.id = 'notionblock ' + random;
      element.className = 'notion_p';
      element.setAttribute('contenteditable', "true");
      document.getElementById("notionfield").insertBefore(element, document.activeElement.nextSibling);
      document.getElementById(element.id).focus();
    } else {
      let element = document.createElement("div");
      element.id = 'notionblock ' + random;
      element.className = 'notion_p';
      element.setAttribute('contenteditable', "true");
      document.getElementById("notionfield").appendChild(element);
      document.getElementById(element.id).focus();
    }
  }

  // função que insere ou altera elementos ao clicar-se em uma tecla do teclado.
  const keyHandler = (e) => {
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
        }
      }
    } else if (e.keyCode == 38) { // tecla seta para cima
      if (document.activeElement.previousSibling != null) {
        console.log('DESLOCANDO PARA O ELEMENTO ANTERIOR');
        let id = document.getElementById(document.activeElement.id).previousSibling.id;
        document.getElementById(id).focus();
      }
    } else if (e.keyCode == 40) { // tecla seta para baixo
      if (document.activeElement.nextSibling != null) {
        console.log('DESLOCANDO PARA O PRÓXIMO ELEMENTO');
        let id = document.getElementById(document.activeElement.id).nextSibling.id;
        document.getElementById(id).focus();
      }
    } else {
      // console.log('CADASTRAR NOVAS TECLAS E FUNCOINALIDADES...');
    }
    localStorage.setItem('texto_notion', document.getElementById('notionfield').innerHTML);
  }

  return (
    <div style={{
      display: card == 'card-notion' ? 'flex' : 'none',
      flexDirection: 'row',
      justifyItems: 'center',
      alignSelf: 'center',
      width: '65vw',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        height: '75vh',
        marginLeft: 10,
      }}>
        <div id='menu'
          style={{
            display: 'flex',
            flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap',
            opacity: selecteddocumento == [] ? 0.3 : 1,
            pointerEvents: selecteddocumento == null ? 'none' : 'auto',
          }}
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
        </div>
        <div id='notionfield'
          className='scroll'
          style={{
            display: 'flex',
            flexDirection: 'column', justifyContent: 'flex-start',
            alignSelf: 'center', alignContent: 'flex-start',
            height: '100%',
            width: '45vw',
            backgroundColor: 'white',
            borderColor: 'white',
            borderRadius: 5,
            marginTop: 10,
            position: 'relative',
          }}
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
