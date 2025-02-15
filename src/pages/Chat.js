/* eslint eqeqeq: "off" */
import React, { useEffect, useContext, useState } from "react";
// import axios from "axios";
import Context from "./Context";
// imagens.
import play from "../images/play.png";
import chatimage from "../images/chat.png";
import chatsound from "../sounds/chat.mp3";
import deletar from "../images/deletar.png";

function Chat() {
  // context.
  const {
    usuario,
    chat,
    socket,
    cliente,
  } = useContext(Context);

  const [arraymessage, setarraymessage] = useState([]);

  useEffect(() => {
    if (chat == 1) {
      // criando o socket para o chat.
      socket.on('outcome_message', (result) => {
        // som da mensagem recebida.
        var audio = document.getElementById("chat");
        audio.play();
        console.log(result);
        setarraymessage(result);
      });
    }
    // eslint-disable-next-line
  }, [chat]);

  return (
    <div
      style={{
        display: chat == 1 ? 'flex' : 'none',
        visibility: chat == 1 ? 'visible' : 'hidden',
        zIndex: 200, position: 'absolute', right: 15, bottom: 0,
        flexDirection: 'column',
      }}>
      <div id="chat_off"
        className="button-green chat-unhide"
        onClick={() => {
          document.getElementById('chat_off').className = 'button-green chat-hide';
          document.getElementById('contador_chat_off').className = 'button red chat-hide';
          document.getElementById('chat_on').className = 'button-opaque chat-unhide';
          document.getElementById('contador_chat_on').className = 'button red chat-unhide';
        }}
        style={{
          width: 20, maxWidth: 20,
          height: 20, maxHeight: 20,
          padding: 0,
          position: 'absolute', bottom: 5, right: 5,
          borderStyle: 'solid',
          borderWidth: 2.5,
          borderColor: 'white',
        }}
      >
        <img
          alt=""
          src={chatimage}
          style={{
            height: 25,
            width: 25,
          }}
        ></img>
      </div>
      <div className="button red chat-unhide"
        id={'contador_chat_off'}
        style={{
          minWidth: 15, maxWidth: 15, minHeight: 15, maxHeight: 15,
          alignSelf: 'center',
          borderRadius: 50,
          position: 'absolute', top: -80, right: 10
        }}
      >
        {arraymessage.filter(valor => valor.cliente == cliente.id_cliente).length}
      </div>
      <div id="chat_on"
        className="button chat-hide"
        style={{
          position: 'relative',
          flexDirection: 'column',
        }}
      >
        <div
          className="button-green"
          onClick={() => {
            document.getElementById('chat_off').className = 'button-green chat-unhide';
            document.getElementById('contador_chat_off').className = 'button red chat-unhide';
            document.getElementById('chat_on').className = 'button chat-hide';
            document.getElementById('contador_chat_on').className = 'button red chat-hide';
          }}
          style={{
            width: 20, maxWidth: 20, height: 20, maxHeight: 20, padding: 0,
            position: 'absolute', top: -40,
          }}
        >
          <img
            alt=""
            src={chatimage}
            style={{
              height: 25,
              width: 25,
            }}
          ></img>
        </div>
        <div className="button red"
          id={'contador_chat_on'}
          style={{
            minWidth: 15, maxWidth: 15, minHeight: 15, maxHeight: 15,
            alignSelf: 'center',
            borderRadius: 50,
            position: 'absolute', top: -52, right: 80
          }}
          onClick={() => {
            let obj = {
              cliente: cliente.id_cliente,
              usuario: usuario.nome_usuario.split(" ",)[0],
              texto: document.getElementById("inputChat").value.toUpperCase()
            }
            socket.emit("income_message", obj);
            console.log('MENSAGEM ENVIADA');
            setTimeout(() => {
              document.getElementById("scrollchat").scrollTop = document.getElementById("scrollchat").scrollHeight;
              document.getElementById("inputChat").value = '';
            }, 1000);
          }}
        >
          {arraymessage.filter(valor => valor.cliente == cliente.id_cliente).length}
        </div>
        <div id='scrollchat' className="janela scroll cor2"
          style={{ width: 200, height: 300, }}
        >
          <div className="button red"
            title="LIMPAR O CHAT"
            style={{
              minWidth: 15, maxWidth: 15, minHeight: 15, maxHeight: 15,
              alignSelf: 'center',
              marginLeft: -15, marginRight: 0, marginBottom: 0,
              position: 'absolute', right: 25, top: 5,
            }}
            onClick={() => {
              setarraymessage([]);
              socket.emit("limpa_chat");
            }}
          >
            <img
              alt=""
              src={deletar}
              style={{
                height: 18,
                width: 18,
              }}
            ></img>
          </div>
          {arraymessage.filter(item => item.cliente == cliente.id_cliente).map(item => (
            <div
              key={item + Math.random()}
              className="text1" style={{
                textAlign: 'left', fontSize: 10,
                padding: 5,
                borderRadius: 5,
                alignSelf: 'flex-start',
              }}>
              {item.message}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', position: 'relative' }}>
          <textarea
            autoComplete="off"
            placeholder="ESCREVA AQUI..."
            className="textarea"
            type="text"
            id={"inputChat"}
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "ESCREVA AQUI...")}
            onKeyDown={(e) => {
              if (e.keyCode == 13) { // tecla enter
                e.preventDefault();
                let obj = {
                  cliente: cliente.id_cliente,
                  usuario: usuario.nome_usuario.split(" ",)[0],
                  texto: document.getElementById("inputChat").value.toUpperCase()
                }
                socket.emit("income_message", obj);
                console.log('MENSAGEM ENVIADA');
                setTimeout(() => {
                  document.getElementById("scrollchat").scrollTop = document.getElementById("scrollchat").scrollHeight;
                  document.getElementById("inputChat").value = '';
                }, 1000);
              }
            }}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              height: 30,
              minHeight: 30,
              maxHeight: 60,
              fontSize: 10,
              width: '100%',
              margin: 0, marginTop: 5,
            }}
          ></textarea>
          <div className="button green"
            style={{
              minWidth: 15, maxWidth: 15, minHeight: 15, maxHeight: 15,
              alignSelf: 'center',
              marginLeft: -15, marginRight: 0, marginBottom: 0,
              position: 'absolute', right: 5, bottom: 5,
            }}
            onClick={() => {
              let obj = {
                cliente: cliente.id_cliente,
                usuario: usuario.nome_usuario.split(" ",)[0],
                texto: document.getElementById("inputChat").value.toUpperCase()
              }
              socket.emit("income_message", obj);
              console.log('MENSAGEM ENVIADA');
              setTimeout(() => {
                document.getElementById("scrollchat").scrollTop = document.getElementById("scrollchat").scrollHeight;
                document.getElementById("inputChat").value = '';
              }, 1000);
            }}
          >
            <img
              alt=""
              src={play}
              style={{
                height: 18,
                width: 18,
              }}
            ></img>
            <audio id="chat">
              <source src={chatsound} type="audio/mpeg"></source>
            </audio>
          </div>
        </div>
      </div>
    </div>
  )

}

export default Chat;