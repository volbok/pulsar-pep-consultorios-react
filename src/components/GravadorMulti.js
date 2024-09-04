/* eslint eqeqeq: "off" */
import React, { useState } from 'react';

import microfone from '../images/microfone.svg';
import salvar from '../images/salvar.svg';
import deletar from '../images/deletar.svg';

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

function GravadorMulti({ funcao, campos }) {
  const [btngravavoz, setbtngravavoz] = useState("button-green");
  // speech-recognition.
  const {
    transcript,
    listening,
    resetTranscript,
  } = useSpeechRecognition();

  const [contador, setcontador] = useState(0);

  // eslint-disable-next-line
  const [capturas, setcapturas] = useState([]);

  const Gravador = (campo) => {
    return (
      <div className={btngravavoz == 'gravando' ? 'cor2' : ''}
        style={{
          display: campos.indexOf(campo) == contador ? 'flex' : 'none', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          borderRadius: 5,
        }}>
        <div id="btngravavoz" className={btngravavoz}
          style={{ display: 'flex', width: 50, height: 50 }}
          onClick={listening ?
            () => {
              // não faz nada.
            } :
            (e) => {
              document.getElementById("btngravavoz").style.pointerEvents = 'none';
              setbtngravavoz("gravando");
              SpeechRecognition.startListening();
              e.stopPropagation();
            }}
        >
          <img
            alt=""
            src={microfone}
            style={{
              margin: 10,
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
        <div id="lista de resultados"
          className="button blue"
          style={{
            alignSelf: 'center',
            width: window.innerWidth < 426 ? '70vw' : 150,
            minWidth: window.innerWidth < 426 ? '70vw' : '',
            maxWidth: window.innerWidth < 426 ? '70vw' : '',
            display: btngravavoz == "gravando" ? 'flex' : 'none',
            flexDirection: 'column', justifyContent: 'center', padding: 20,
          }}>
          {campo + ' ' + transcript.toUpperCase()}
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div id="botão excluir" className='button-yellow'
              style={{ width: 25, minWidth: 25, height: 25, minHeight: 25 }}
              onClick={(e) => {
                SpeechRecognition.stopListening();
                resetTranscript();
                setbtngravavoz("button-green");
                document.getElementById("btngravavoz").style.pointerEvents = 'auto';
                e.stopPropagation();
              }}>
              <img
                alt=""
                src={deletar}
                style={{
                  margin: 10,
                  height: 25,
                  width: 25,
                }}
              ></img>
            </div>
            <div id="botão salvar" className='button-green'
              style={{ width: 25, minWidth: 25, height: 25, minHeight: 25 }}
              onClick={(e) => {
                capturas.push(transcript.toUpperCase());
                console.log(capturas);
                if (capturas.length == campos.length) {
                  SpeechRecognition.stopListening();
                  funcao(capturas);
                  setbtngravavoz("button-green");
                  document.getElementById("btngravavoz").style.pointerEvents = 'auto';
                }
                resetTranscript();
                setcontador(contador + 1);
                e.stopPropagation();
                SpeechRecognition.startListening();
              }}>
              <img
                alt=""
                src={salvar}
                style={{
                  margin: 10,
                  height: 25,
                  width: 25,
                }}
              ></img>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {campos.map(item => Gravador(item))}
    </div>
  )
}

export default GravadorMulti;