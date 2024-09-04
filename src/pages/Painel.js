/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
// som.
import ding from "../sounds/ding2.mp3";

// router.
import { useHistory } from "react-router-dom";

function Painel() {
  // context.
  const {
    html,
    unidade,
    pagina,
    setpagina,
    setusuario,
  } = useContext(Context);

  // history (router).
  let history = useHistory();

  const refreshApp = () => {
    setusuario({
      id: 0,
      nome_usuario: "LOGOFF",
      dn_usuario: null,
      cpf_usuario: null,
      email_usuario: null,
    });
    setpagina(0);
    history.push("/");
  };
  window.addEventListener("load", refreshApp);

  // recuperando o total de chamadas para a unidade de atendimento.
  let qtde = 0;
  const [chamadas, setchamadas] = useState([]);
  const loadChamadas = () => {
    axios.get(html + 'list_chamada/' + unidade).then((response) => {
      var x = response.data.rows;
      setchamadas(x.sort((a, b) => moment(a.data) < moment(b.data) ? 1 : -1));
      qtde = x.length;
      console.log('TOTAL INICIAL DE CHAMADAS: ' + qtde);
    })
  }
  const checkChamadas = () => {
    console.log('CHECANDO CHAMADAS');
    axios.get(html + 'list_chamada/' + unidade).then((response) => {
      var x = response.data.rows;
      setchamadas(x);
      if (x.length > qtde) {
        qtde = qtde + 1;
        console.log('NOVO TOTAL DE CHAMADAS: ' + x.length);
        console.log('NOVA CHAMADA DISPARADA: ' + qtde);
        // dispara o som e a chamada de voz.
        var audio = document.getElementById("ding");
        audio.play();
        setTimeout(() => {
          let utterance = new SpeechSynthesisUtterance(x.sort((a, b) => moment(a.data) < moment(b.data) ? -1 : 1).slice(-1).map(item => item.nome_paciente).pop());
          utterance.lang = "pt-BR";
          speechSynthesis.speak(utterance);
          setTimeout(() => {
            let utterance = new SpeechSynthesisUtterance(x.sort((a, b) => moment(a.data) < moment(b.data) ? -1 : 1).slice(-1).map(item => item.id_sala).pop());
            utterance.lang = "pt-BR";
            speechSynthesis.speak(utterance);
          }, 2000);
        }, 3500);
      }
    })
  }

  useEffect(() => {
    if (pagina == 40) {
      console.log(unidade);
      loadChamadas();
      setInterval(() => {
        checkChamadas();
      }, 5000);
    }

    // eslint-disable-next-line
  }, [pagina]);

  function UltimaChamada() {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          width: 'calc(100vw - 40px)',
          fontSize: 40,
          borderRadius: 5, backgroundColor: 'white',
          padding: 10, margin: 10,
        }}>
        {chamadas.sort((a, b) => moment(a.data) < moment(b.data) ? -1 : 1).slice(-1).map(item => (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: 24 }}>
            <div
              className="text1"
              style={{ fontSize: 30, marginTop: -5, marginBottom: -20 }}
            >
              {'PACIENTE:'}
            </div>
            <div
              className="text1"
              style={{ fontSize: 50, color: 'black' }}
            >
              {item.nome_paciente}
            </div>
            <div
              className="text1"
              style={{ fontSize: 30, marginTop: -5, marginBottom: -20 }}
            >
              {'SALA:'}
            </div>
            <div
              className="text1"
              style={{ fontSize: 50, color: 'black' }}
            >
              {item.id_sala}
            </div>
            <div
              className="text1"
              style={{ fontSize: 20, margin: 0 }}
            >
              {'HORA DA CHAMADA:'}
            </div>
            <div
              className="button"
              style={{
                display: 'flex', flexDirection: 'column',
                minWidth: 400, width: 400, fontSize: 40,
                alignSelf: 'center'
              }}>
              <div>
                {moment(item.data).format('DD/MM/YY') + ' - ' + moment(item.data).format('HH:mm')}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  function ListaDeChamadas() {
    return (
      <div
        style={{ width: 'calc(80vw - 40px)', height: '35vh' }}>
        <div className="text1" style={{ margin: 0, marginBottom: -10, fontSize: 20 }}>ÚLTIMAS CHAMADAS</div>
        <div
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center',
            fontSize: 20, margin: 0, marginBottom: -5
          }}>
          <div className="text1" style={{ width: 300, fontSize: 16 }}>{'HORA'}</div>
          <div className="text1" style={{ width: 300, fontSize: 16 }}>{'SALA'}</div>
          <div className="text1" style={{ width: '100%', fontSize: 16 }}>{'NOME'}</div>
        </div>
        {chamadas.slice(-3).sort((a, b) => moment(a.data) > moment(b.data) ? -1 : 1).map(item => (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div className="button" style={{ width: 300, fontSize: 20 }}>{moment(item.data).format('HH:mm')}</div>
            <div className="button" style={{ width: 300, fontSize: 20 }}>{item.id_sala}</div>
            <div className="button" style={{ width: '100%', fontSize: 20 }}>{item.nome_paciente}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="main fadein"
      style={{
        display: pagina == 40 ? "flex" : "none",
        flexDirection: "column",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <UltimaChamada></UltimaChamada>
      <ListaDeChamadas></ListaDeChamadas>
      <audio id="ding">
        <source src={ding} type="audio/mpeg"></source>
      </audio>
    </div>
  );
}

export default Painel;
