/* eslint eqeqeq: "off" */
import React, { useContext, useEffect } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
// router.
import { useHistory } from 'react-router-dom';
// funções.
import toast from '../functions/toast';
// imagens.
import back from '../images/back.svg';

function Exames() {

  // history (router).
  let history = useHistory();

  // context.
  const {
    html,
    settoast,
    setpagina,
    card, setcard,
    pacientes, setpacientes,
    paciente,
    mobilewidth,
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-exames') {
      // console.log(paciente);
      document.getElementById("inputExamesAtuaisCard").value = pacientes.filter(item => item.id_paciente == paciente).map(item => item.exames_atuais);
    }
    // eslint-disable-next-line
  }, [card, paciente]);


  // carregando os registros de pacientes.
  const loadPacientes = () => {
    axios.get(html + 'list_pacientes').then((response) => {
      setpacientes(response.data.rows);
    })
      .catch(function (error) {
        if (error.response == undefined) {
          toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 3000);
          setTimeout(() => {
            setpagina(0);
            history.push('/');
          }, 3000);
        } else {
          toast(settoast, error.response.data.message + ' REINICIANDO APLICAÇÃO.', 'black', 3000);
          setTimeout(() => {
            setpagina(0);
            history.push('/');
          }, 3000);
        }
      });
  }

  // atualizando exames atuais (tabela pacientes).
  const updatePaciente = () => {
    var obj = {
      nome_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_paciente).pop(),
      nome_mae_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.nome_mae_paciente).pop(),
      dn_paciente: pacientes.filter(item => item.id_paciente == paciente).map(item => item.dn_paciente).pop(),
      antecedentes_pessoais: pacientes.filter(item => item.id_paciente == paciente).map(item => item.antecedentes_pessoais).pop(),
      medicacoes_previas: pacientes.filter(item => item.id_paciente == paciente).map(item => item.medicacoes_previas).pop(),
      exames_previos: pacientes.filter(item => item.id_paciente == paciente).map(item => item.exames_previos).pop(),
      exames_atuais: document.getElementById("inputExamesAtuaisCard").value.toUpperCase(),
    }
    // console.log(JSON.stringify(obj));
    axios.post(html + 'update_paciente/' + paciente, obj).then(() => {
      loadPacientes();
    })
      .catch(function () {
        toast(settoast, 'ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.', 'black', 5000);
        setTimeout(() => {
          setpagina(0);
          history.push('/');
        }, 5000);
      });
  }

  function Botoes() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div id="botão de retorno"
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
      </div>
    );
  }

  var timeout = null;
  return (
    <div id="scroll-evolucoes"
      className='card-aberto'
      style={{ display: card == 'card-exames' ? 'flex' : 'none' }}
    >
      <div className="text3">
        EXAMES RELEVANTES
      </div>
      <div
        style={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-start',
          flex: 1
        }}>
        <textarea
          className="textarea"
          placeholder='EXAMES ATUAIS'
          onFocus={(e) => (e.target.placeholder = '')}
          onBlur={(e) => (e.target.placeholder = 'EXAMES ATUAIS')}
          defaultValue={pacientes.filter(item => item.id_paciente == paciente).map(item => item.exames_atuais)}
          onKeyUp={() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              updatePaciente();
            }, 3000);
          }}
          style={{
            display: 'flex',
            flexDirection: 'center', justifyContent: 'center', alignSelf: 'center',
            width: window.innerWidth < mobilewidth ? '70vw' : '50vw',
            height: 300,
            whiteSpace: 'pre-wrap'
          }}
          id={"inputExamesAtuaisCard"}
          title="EXAMES ATUAIS."
        >
        </textarea>
        <Botoes></Botoes>
      </div>
    </div >
  )
}

export default Exames;