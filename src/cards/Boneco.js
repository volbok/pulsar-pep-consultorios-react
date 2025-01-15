/* eslint eqeqeq: "off" */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
import moment from 'moment';
// funções.
import toast from '../functions/toast';
// imagens.
import salvar from '../images/salvar.png';
import refresh from '../images/refresh.png';
import back from '../images/back.png';
import body from '../images/body.png';
import dorso from '../images/dorso.png';
import calendario from '../images/calendario.png';
import deletar from '../images/deletar.png';

function Boneco() {

  // context.
  const {
    html,
    settoast,
    pagina,
    atendimento, // id_atendimento.
    paciente, // id_paciente.
    pickdate1, setpickdate1,
    pickdate2, setpickdate2,
    setviewdatepicker,
    card, setcard,
    mobilewidth,
    invasoes, setinvasoes,
  } = useContext(Context);

  useEffect(() => {
    if (card == 'card-boneco') {
      loadInvasoes();
      loadLesoes();
    }
    // eslint-disable-next-line
  }, [card]);

  // carregando resgistros de invasões.
  const loadInvasoes = () => {
    axios.get(html + 'list_invasoes/' + atendimento).then((response) => {
      setinvasoes(response.data.rows);
    });
  }

  // carregando registros de lesões.
  const [lesoes, setlesoes] = useState([]);
  const loadLesoes = () => {
    axios.get(html + 'paciente_lesoes/' + paciente).then((response) => {
      setlesoes(response.data.rows);

    });
  }

  // ## INVASÕES ## //
  // seleção de um sítio de invasão.
  const [localdispositivo, setlocaldispositivo] = useState('');
  const selectSitioInvasao = (sitio) => {
    setinvasaomenu(1);
    setlocaldispositivo(sitio);
    if (invasoes.filter(item => item.local == sitio && item.data_retirada == null).length > 0) {
      setpickdate1(invasoes.filter(item => item.local == sitio && item.data_retirada == null).map(item => moment(item.data_implante).format('DD/MM/YY')));
    } else {
      setpickdate1(moment().format('DD/MM/YYYY'));
    }
  }

  // listas de opções de dispositivos invasivos para cada sítio de invasão:
  const arraydispositivossnc = ['PVC', 'PIC', 'DVE'];
  const arraydispositivosva = ['CN', 'MF', 'TOT', 'TQT'];
  const arraydispositivosvasc = ['CVC', 'CDL', 'CAT']; // CAT = permcath, intracath, outros cateteres incomuns.
  const arraydispositivospia = ['PIA'];
  const arraydispositivosuro = ['SVD', 'SVD3']; // SVD3 = svd de três vias.
  const arraydispositivostorax = ['DRN', 'MCP']; // MAP = marcapasso epicárdico.
  const arraydispositivosabd = ['DRN', 'PEN']; // DRN = dreno, PEN = penrose.

  // atualizando uma invasão ativa.
  const updateInvasoes = (dispositivo) => {
    setinvasaomenu(0);
    let getinvasao = [];
    getinvasao = invasoes.filter(item => item.local == localdispositivo && item.data_retirada == null);
    setTimeout(() => {
      var id_invasao = getinvasao.map(item => item.id_invasao);
      var dispositivo_retirado = getinvasao.map(item => item.dispositivo).pop();
      var data_implante = getinvasao.map(item => item.data_implante);
      if (getinvasao.length > 0) {
        // atualizar a invasão anterior como encerrada.
        var obj = {
          id_atendimento: atendimento,
          local: localdispositivo,
          dispositivo: dispositivo_retirado, // dispositivo retirado!
          data_implante: data_implante,
          data_retirada: moment(),
        };
        axios.post(html + 'update_invasao/' + id_invasao, obj).then(() => {
          if (dispositivo != '' || dispositivo == null) {
            // inserir a invasão "atualizada".
            var obj = {
              id_atendimento: atendimento,
              local: localdispositivo,
              dispositivo: dispositivo, // novo dispositivo!
              data_implante: moment(pickdate1, 'DD/MM/YYYY HH:mm'),
              data_retirada: null,
            };
            axios.post(html + 'insert_invasao', obj).then(() => {
              loadInvasoes();
            });
          }
          loadInvasoes();
        });
      } else {
        // inserir uma invasão.
        obj = {
          id_atendimento: atendimento,
          local: localdispositivo,
          dispositivo: dispositivo, // novo dispositivo!
          data_implante: moment(pickdate1, 'DD/MM/YYYY HH:mm'),
          data_retirada: null,
        };
        axios.post(html + 'insert_invasao', obj).then(() => {
          loadInvasoes();
        });
      }
    }, 1000);
  };

  // menu para edição do sítio de invasão selecionado.
  const [invasaomenu, setinvasaomenu] = useState(0);
  function ShowInvasaoMenu() {
    if (invasaomenu === 1) {
      return (
        <div className="fundo"
          onClick={(e) => { setinvasaomenu(0); e.stopPropagation(); }}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div className="janela" onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
            <div className="text1" style={{ width: 150, marginBottom: 10 }}>{localdispositivo}</div>
            <div
              id="datepicker"
              className="button-grey"
              style={{
                flexDirection: 'column',
                width: 150,
                height: 75,
                marginBottom: 10,
              }}
              onClick={(e) => { setviewdatepicker(1); e.stopPropagation() }}
            >
              <img
                alt=""
                src={calendario}
                style={{
                  margin: 5,
                  height: 30,
                  width: 30,
                }}
              ></img>
              <div className='text2' style={{ marginTop: 0 }}>
                {pickdate1}
              </div>
            </div>
            {OpcoesDispositivos('SISTEMA NERVOSO CENTRAL', arraydispositivossnc)}
            {OpcoesDispositivos('VIA AÉREA', arraydispositivosva)}
            {OpcoesDispositivos('JUGULAR INTERNA DIREITA', arraydispositivosvasc)}
            {OpcoesDispositivos('JUGULAR INTERNA ESQUERDA', arraydispositivosvasc)}
            {OpcoesDispositivos('SUBCLÁVIA DIREITA', arraydispositivosvasc)}
            {OpcoesDispositivos('SUBCLÁVIA ESQUERDA', arraydispositivosvasc)}
            {OpcoesDispositivos('VEIA FEMORAL DIREITA', arraydispositivosvasc)}
            {OpcoesDispositivos('VEIA FEMORAL ESQUERDA', arraydispositivosvasc)}
            {OpcoesDispositivos('ARTÉRIA RADIAL DIREITA', arraydispositivospia)}
            {OpcoesDispositivos('ARTÉRIA RADIAL ESQUERDA', arraydispositivospia)}
            {OpcoesDispositivos('ARTÉRIA FEMORAL DIREITA', arraydispositivospia)}
            {OpcoesDispositivos('ARTÉRIA FEMORAL ESQUERDA', arraydispositivospia)}
            {OpcoesDispositivos('ARTÉRIA PEDIOSA DIREITA', arraydispositivospia)}
            {OpcoesDispositivos('ARTÉRIA PEDIOSA ESQUERDA', arraydispositivospia)}
            {OpcoesDispositivos('SONDA VESICAL DE DEMORA', arraydispositivosuro)}
            {OpcoesDispositivos('DRENO TORÁCICO DIREITO', arraydispositivostorax)}
            {OpcoesDispositivos('DRENO TORÁCICO ESQUERDO', arraydispositivostorax)}
            {OpcoesDispositivos('DRENO DE MEDIASTINO', arraydispositivostorax)}
            {OpcoesDispositivos('DRENO ABDOMINAL 1', arraydispositivosabd)}
            {OpcoesDispositivos('DRENO ABDOMINAL 2', arraydispositivosabd)}
            {OpcoesDispositivos('DRENO ABDOMINAL 3', arraydispositivosabd)}
            <button
              onClick={() => updateInvasoes('')}
              className="button"
              style={{ width: 150, margin: 2.5 }}
            >
              LIMPAR
            </button>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  // seletor de invasões no menu para edição dos sítios de invasões.
  function OpcoesDispositivos(local, arraydispositivos) {
    return (
      <div id={local} style={{
        display: localdispositivo == local ? 'flex' : 'none',
        flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
        flexWrap: 'wrap'
      }}>
        {arraydispositivos.map((item) => (
          <button
            key={'dispositivos: ' + item}
            onClick={() => updateInvasoes(item)}
            className={dispositivo == item ? "button-selected" : "button"}
            style={{ width: 150, margin: 2.5 }}
          >
            {item}
          </button>
        ))}
      </div>
    )
  }

  // sítios de invasões.
  const [dispositivo, setdispositivo] = useState('');
  function Sitio({ sitio, classe }) {
    if (pagina == 1 || pagina == -1) {
      return (
        <div
          className={classe} // ex.: "green-invasion snc"
          title={invasoes.filter(item => item.local == sitio && item.data_retirada == null).length > 0 ?
            'DATA DE INSERÇÃO: ' +
            invasoes.filter(item => item.local == sitio && item.data_retirada == null).map(item => moment(item.data_implante).format('DD/MM/YY'))
            :
            sitio
          }
          style={{
            height: 30,
            width: 30,
          }}
          onClick={(e) => {
            selectSitioInvasao(sitio);
            setdispositivo(invasoes.filter(item => item.local == sitio && item.data_retirada == null).map(item => item.dispositivo));
            e.stopPropagation();
          }}
        >
          {invasoes.filter(item => item.local == sitio && item.data_retirada == null).map(item => item.dispositivo)}
        </div>
      );
    } else {
      return null;
    }
  };

  // ## LESÕES ## //
  // seleção de um sítio de invasão.
  const [local, setlocal] = useState('');
  const [grau, setgrau] = useState(0);
  const [curativo, setcurativo] = useState('');
  const [observacoes, setobservacoes] = useState('');
  const clickLesao = (local, e) => {
    setpickdate1(null);
    setpickdate2(null);
    setlocal(local);
    // verificando se existe lesão ativa e mapeando suas informações.
    if (lesoes.filter((item) => item.local == local && item.data_fechamento == null).length > 0) {
      let x = lesoes.filter((item) => item.local == local && item.data_fechamento == null);
      setgrau(x.map(item => item.grau).pop());
      setcurativo(x.map(item => item.curativo).pop());
      setobservacoes(x.map(item => item.observacoes).pop());
      setpickdate1(x.map(item => moment(item.data_abertura).format('DD/MM/YY')));
      setpickdate2(null);
      setshowinfolesoes(1);
    } else {
      setgrau(0);
      setcurativo('');
      setobservacoes('');
      setpickdate1(moment().format('DD/MM/YY'));
      setpickdate2(null);
      setshowinfolesoes(1);
    }
    e.stopPropagation();
  }

  // exibição das lesões no boneco.
  function Lesao({ local, top, bottom, left, right, tamanho }) {
    if (pagina == 1 || pagina == -1) {
      var x = lesoes.filter(item => item.local == local && item.data_fechamento == null);
      if (x.length > 0) {
        return (
          <div
            className="red-invasion"
            title={' LESÃO - ' + local + '\nESTÁGIO: ' + x.map(item => item.grau)}
            style={{
              position: 'absolute',
              top: top,
              bottom: bottom,
              left: left,
              right: right,
              height: tamanho,
              width: tamanho,
            }}
            onClick={(e) => clickLesao(local, e)}
          >
            {x.map(item => item.grau)}
          </div>
        );
      } else {
        return (
          <div
            className="green-invasion"
            title={local}
            style={{
              position: 'absolute',
              top: top,
              bottom: bottom,
              left: left,
              right: right,
              height: tamanho,
              width: tamanho,
            }}
            onClick={(e) => clickLesao(local, e)}
          >
          </div>
        );
      }
    } else {
      return null;
    }
  };

  // componente para edição das lesões.
  const [showinfolesoes, setshowinfolesoes] = useState(0);
  const ShowInfoLesoes = useCallback(() => {
    if (showinfolesoes === 1) {
      return (
        <div className="fundo" onClick={(e) => { setshowinfolesoes(0); e.stopPropagation() }} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div className="scroll janela"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: window.innerWidth < mobilewidth ? '90vw' : '',
              height: '80vh',
              borderRadius: window.innerWidth < mobilewidth ? 0 : 5,
              padding: 10,
            }}>
            <div className="text1">{'LESÃO ' + local}</div>
            <div id="datas de abertura e fechamento da lesão"
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flex: 2 }}>
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                flex: 1,
              }}>
                <label className="text1">ABERTURA:</label>
                <div
                  id="datepicker1"
                  className="button-grey"
                  style={{
                    minWidth: 100,
                  }}
                  onClick={(e) => {
                    setviewdatepicker(1); e.stopPropagation();
                  }}
                >
                  {moment(pickdate1, 'DD/MM/YYYY').format('DD/MM/YYYY')}
                </div>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                flex: 1,
              }}>
                <label className="text1">FECHAMENTO:</label>
                <div
                  id="datepicker2"
                  className="button-grey"
                  style={{
                    minWidth: 100,
                  }}
                  onClick={(e) => {
                    setviewdatepicker(2); e.stopPropagation();
                  }}
                >
                  {pickdate2 == null ? '' : moment(pickdate2, 'DD/MM/YYYY').format('DD/MM/YYYY')}
                </div>
              </div>
            </div>
            <label className="text1" style={{ marginTop: 15 }}>
              ESTÁGIO DA LESÃO:
            </label>
            <div id="estágios da lesão" style={{
              display: 'flex',
              flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
              justifyContent: 'center',
              flex: 5,
            }}>
              <div
                className={grau == 1 ? "button-selected" : "button"}
                onClick={() => setgrau(1)}
                style={{ flex: 1, minWidth: 100, height: 50 }}
              >
                ESTÁGIO 1
              </div>
              <div
                className={grau == 2 ? "button-selected" : "button"}
                onClick={() => setgrau(2)}
                style={{ flex: 1, minWidth: 100, height: 50 }}
              >
                ESTÁGIO 2
              </div>
              <div
                className={grau == 3 ? "button-selected" : "button"}
                onClick={() => setgrau(3)}
                style={{ flex: 1, minWidth: 100, height: 50 }}
              >
                ESTÁGIO 3
              </div>
              <div
                className={grau == 4 ? "button-selected" : "button"}
                onClick={() => setgrau(4)}
                style={{ flex: 1, minWidth: 100, height: 50 }}
              >
                ESTÁGIO 4
              </div>
              <div
                className={grau == 5 ? "button-selected" : "button"}
                onClick={() => setgrau(5)}
                style={{ flex: 1, minWidth: 100, height: 50 }}
              >
                NÃO CLASSIFICÁVEL
              </div>
            </div>
            <label className="text1" style={{ marginTop: 15 }}>
              CURATIVO:
            </label>
            <div id="seletor de curativo"
              className="button"
              onClick={() => setshowcurativoslist(1)}
              style={{ paddingLeft: 10, paddingRight: 10, width: '90%' }}
            >
              {curativo}
            </div>
            <label
              className="text1" style={{ marginTop: 15 }}>
              OBSERVAÇÕES:
            </label>
            <textarea id="inputObservacoesLesao"
              autoComplete="off"
              className="textarea"
              placeholder="OBSERVAÇÕES."
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'OBSERVAÇÕES.')}
              onChange={(e) => setobservacoes(e.target.value)}
              title="INFORMAR AQUI OBSERVAÇÕES E OUTROS DETALHES REFERENTES À LESÃO."
              style={{
                width: '90%',
                minHeight: 100,
                height: 100,
              }}
              type="text"
              maxLength={200}
              defaultValue={observacoes}
            ></textarea>
            <div id="botões para salvar ou excluir"
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <div
                className="button-yellow"
                onClick={() => { setshowinfolesoes(0) }}
              >
                <img
                  alt=""
                  src={deletar}
                  style={{
                    margin: 10,
                    height: 30,
                    width: 30,
                  }}
                ></img>
              </div>
              <div
                className="button-green"
                onClick={(e) => {
                  updateLesoes();
                  e.stopPropagation();
                }}
              >
                <img
                  alt=""
                  src={salvar}
                  style={{
                    margin: 10,
                    height: 30,
                    width: 30,
                  }}
                ></img>
              </div>
            </div>
          </div>
        </div >
      );
    } else {
      return null;
    }
    // eslint-disable-next-line
  }, [showinfolesoes, grau, curativo, pickdate1, pickdate2]);

  const updateLesoes = () => {
    // verificando se o grau da lesão foi informado (único item obrigatório).
    if (grau != 0) {
      var x = [0, 1];
      // filtrando uma lesão ativa para o local selecionado (sem data de fechamento).
      x = lesoes.filter(item => item.local == local && item.data_fechamento == null);
      console.log('LOCAL: ' + local);
      console.log('LENGHT: ' + x.length);
      console.log('PICKDATE2: ' + pickdate2)
      var id = x.map(item => item.id_lesao);
      // atualizando o registro existente como encerrado (caso tenha sido definida a data de fechamento da lesão).
      if (x.length > 0 && pickdate2 != null) {
        var obj = {
          id_paciente: paciente,
          local: local,
          grau: grau,
          curativo: curativo,
          observacoes: document.getElementById("inputObservacoesLesao").value.toUpperCase(),
          data_abertura: moment(pickdate1, 'DD/MM/YYYY'),
          data_fechamento: moment(pickdate2, 'DD/MM/YYYY'),
        };
        axios.post(html + 'update_lesao/' + id, obj).then(() => {
          loadLesoes();
          setshowinfolesoes(0);
        });
      } else if (x.length > 0 && pickdate2 == null) {
        // atualizando o registro atual (lesão ainda ativa).
        obj = {
          id_paciente: paciente,
          local: local,
          grau: grau,
          curativo: curativo,
          observacoes: document.getElementById("inputObservacoesLesao").value.toUpperCase(),
          data_abertura: moment(pickdate1, 'DD/MM/YYYY'),
          data_fechamento: null,
        };
        axios.post(html + 'update_lesao/' + id, obj).then(() => {
          loadLesoes();
          setshowinfolesoes(0);
        });
      } else {
        // inserindo o primeiro registro de lesão.
        obj = {
          id_paciente: paciente,
          local: local,
          grau: grau,
          curativo: curativo,
          observacoes: document.getElementById("inputObservacoesLesao").value.toUpperCase(),
          data_abertura: moment(pickdate1, 'DD/MM/YYYY'),
          data_fechamento: null,
        };
        axios.post(html + 'insert_lesao/', obj).then(() => {
          loadLesoes();
          setshowinfolesoes(0);
        });
      }
    } else {
      toast(settoast, 'É NECESSÁRIO INFORMAR O GRAU DA LESÃO', 'rgb(231, 76, 60, 1)', 3000);
    }
  }

  var curativos = [
    'RAYNON',
    'FILME TRANSPARENTE',
    'HIDROCOLÓIDE',
    'HIDROGEL',
    'ALGINATO DE CÁLCIO',
    'PAPAÍNA',
    'COLAGENASE',
    'CARVÃO ATIVADO COM PRATA',
    'ESPUMA COM PRATA',
    'PLACA DE PRATA',
    'MATRIZ DE COLÁGENO',
    'MATRIZ DE CELULOSE',
    'PELE ALÓGENA'
  ]

  const [showcurativoslist, setshowcurativoslist] = useState(0);
  function ShowCurativosList() {
    if (showcurativoslist == 1) {
      return (
        <div className="fundo" onClick={(e) => { setshowcurativoslist(0); e.stopPropagation() }}>
          <div className="janela"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="scroll"
              id="lista de curativos"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                margin: 5,
                padding: 0,
                paddingRight: 5,
                height: 200,
                minHeight: 200,
                minWidth: window.innerWidth < mobilewidth ? '70vw' : '30vw',
                width: window.innerWidth < mobilewidth ? '70vw' : '30vw',
              }}
            >
              {curativos.map((item) => (
                <div
                  key={'curativo ' + item}
                  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                  <button
                    className={curativo == item ? "button-selected" : "button"}
                    onClick={(e) => {
                      setcurativo(item);
                      setshowcurativoslist(0);
                      e.stopPropagation();
                    }}
                    style={{
                      width: '100%',
                      margin: 2.5,
                      marginLeft: 5,
                      marginRight: 0,
                      flexDirection: 'column',
                    }}
                  >
                    <div>{item}</div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  // ## RENDERIZAÇÃO DO MANEQUIM, DISPOSITIVOS E LESÕES ## //
  // alternando entre visões de invasão e lesões.
  const [randombody, setrandombody] = useState(1);
  function Body() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          position: 'relative',
          height: 560,
          width: 240,
        }}
      >
        <img id="corpo"
          alt=""
          src={randombody == 1 ? body : dorso}
          style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignSelf: 'center',
            height: 560,
            width: 240,
          }}
        ></img>
        <div id="dispositivos"
          style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            display: randombody == 1 ? 'flex' : 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            height: 560,
            width: 240,
          }}
        >
          <Sitio sitio='SISTEMA NERVOSO CENTRAL' classe='green-invasion snc'></Sitio>
          <Sitio sitio='VIA AÉREA' classe='orange-invasion va'></Sitio>
          <Sitio sitio='JUGULAR INTERNA DIREITA' classe='blue-invasion jid'></Sitio>
          <Sitio sitio='JUGULAR INTERNA DIREITA' classe='blue-invasion jid'></Sitio>
          <Sitio sitio='JUGULAR INTERNA ESQUERDA' classe='blue-invasion jie'></Sitio>
          <Sitio sitio='SUBCLÁVIA DIREITA' classe='blue-invasion subcld'></Sitio>
          <Sitio sitio='SUBCLÁVIA ESQUERDA' classe='blue-invasion subcle'></Sitio>
          <Sitio sitio='VEIA FEMORAL DIREITA' classe='blue-invasion vfemd'></Sitio>
          <Sitio sitio='VEIA FEMORAL ESQUERDA' classe='blue-invasion vfeme'></Sitio>
          <Sitio sitio='ARTÉRIA RADIAL DIREITA' classe='red-invasion piaard'></Sitio>
          <Sitio sitio='ARTÉRIA RADIAL ESQUERDA' classe='red-invasion piaare'></Sitio>
          <Sitio sitio='ARTÉRIA FEMORAL DIREITA' classe='red-invasion afemd'></Sitio>
          <Sitio sitio='ARTÉRIA FEMORAL ESQUERDA' classe='red-invasion afeme'></Sitio>
          <Sitio sitio='ARTÉRIA PEDIOSA DIREITA' classe='red-invasion piapedd'></Sitio>
          <Sitio sitio='ARTÉRIA PEDIOSA ESQUERDA' classe='red-invasion piapede'></Sitio>
          <Sitio sitio='SONDA VESICAL DE DEMORA' classe='yellow-invasion svd'></Sitio>
          <Sitio sitio='DRENO TORÁCICO DIREITO' classe='green-invasion toraxd'></Sitio>
          <Sitio sitio='DRENO TORÁCICO ESQUERDO' classe='green-invasion toraxe'></Sitio>
          <Sitio sitio='DRENO DE MEDIASTINO' classe='green-invasion toraxm'></Sitio>
          <Sitio sitio='DRENO ABDOMINAL 1' classe='green-invasion abd1'></Sitio>
          <Sitio sitio='DRENO ABDOMINAL 2' classe='green-invasion abd2'></Sitio>
          <Sitio sitio='DRENO ABDOMINAL 3' classe='green-invasion abd3'></Sitio>
        </div>
        <div id="lesões"
          style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            display: randombody == 2 ? 'flex' : 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            height: 560,
            width: 240,
          }}
        >
          <Lesao local='OCCIPITAL' top='4%' bottom='' left='' right='' tamanho={30}></Lesao>
          <Lesao local='OMBRO DIREITO' top='18%' bottom='' left='65%' right='' tamanho={30}></Lesao>
          <Lesao local='OMBRO ESQUERDO' top='18%' bottom='' left='' right='65%' tamanho={30}></Lesao>
          <Lesao local='ESCÁPULA DIREITA' top='25%' bottom='' left='55%' right='' tamanho={30}></Lesao>
          <Lesao local='ESCÁPULA ESQUERDA' top='25%' bottom='' left='' right='55%' tamanho={30}></Lesao>
          <Lesao local='COTOVELO DIREITO' top='35%' bottom='' left='75%' right='' tamanho={30}></Lesao>
          <Lesao local='COTOVELO ESQUERDO' top='35%' bottom='' left='' right='75%' tamanho={30}></Lesao>
          <Lesao local='SACRAL' top='50%' bottom='' left='' right='' tamanho={30}></Lesao>
          <Lesao local='ISQUIÁTICA DIREITA' top='55%' bottom='' left='55%' right='' tamanho={30}></Lesao>
          <Lesao local='ISQUIÁTICA ESQUERDA' top='55%' bottom='' left='' right='55%' tamanho={30}></Lesao>
          <Lesao local='TROCANTÉRICA DIREITA' top='50%' bottom='' left='65%' right='' tamanho={30}></Lesao>
          <Lesao local='TROCANTÉRICA ESQUERDA' top='50%' bottom='' left='' right='65%' tamanho={30}></Lesao>
          <Lesao local='JOELHO DIREITO' top='70%' bottom='' left='55%' right='' tamanho={30}></Lesao>
          <Lesao local='JOELHO ESQUERDO' top='70%' bottom='' left='' right='55%' tamanho={30}></Lesao>
          <Lesao local='MALÉOLO DIREITO' top='88%' bottom='' left='60%' right='' tamanho={20}></Lesao>
          <Lesao local='MALÉOLO ESQUERDO' top='88%' bottom='' left='' right='60%' tamanho={20}></Lesao>
          <Lesao local='HÁLUX DIREITO' top='95%' bottom='' left='55%' right='' tamanho={20}></Lesao>
          <Lesao local='HÁLUX ESQUERDO' top='95%' bottom='' left='' right='55%' tamanho={20}></Lesao>
          <Lesao local='CALCÂNEO DIREITO' top='91%' bottom='' left='52%' right='' tamanho={20}></Lesao>
          <Lesao local='CALCÂNEO ESQUERDO' top='91%' bottom='' left='' right='52%' tamanho={20}></Lesao>
          <Lesao local='ORELHA DIREITA' top='8%' bottom='' left='55%' right='' tamanho={20}></Lesao>
          <Lesao local='ORELHA ESQUERDA' top='8%' bottom='' left='' right='55%' tamanho={20}></Lesao>
        </div>

      </div>
    );
  };

  function Botoes() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        <button
          id="botão alternador invasão x lesão"
          className="button"
          style={{
            padding: 10,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            width: 100
          }}
          title={randombody == 1 ? "VER LESÕES" : "VER INVASÕES"}
          onClick={(e) => {
            if (randombody == 1) {
              setrandombody(2); e.stopPropagation();
            } else {
              setrandombody(1); e.stopPropagation();
            }
          }}
        >
          <div id="legenda">
            {randombody == 1 ? 'INVASÕES' : 'LESÕES'}
          </div>
          <img
            alt=""
            src={refresh}
            style={{
              margin: 0,
              height: 20,
              width: 20,
            }}
          ></img>
        </button>
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
    )
  }

  function DetalhesInvasoes() {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <Botoes></Botoes>
        <div className='scroll'
          style={{
            display: randombody == 1 ? 'flex' : 'none',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            height: 400,
            textAlign: 'left',
            alignItems: 'flex-start',
            marginTop: 5
          }}>
          {invasoes.map(item => (
            <div className="palette2" style={{
              display: 'flex', flexDirection: 'row',
            }}>
              <div className='button red' style={{ marginRight: 5 }}>
                {item.dispositivo}
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', fontWeight: 'bold', fontSize: 12
              }}>
                <div>
                  {item.local}
                </div>
                <div>
                  {'DATA: ' + moment(item.data_implante).format('DD/MM/YYYY')}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='text1 janela scroll'
          style={{
            display: randombody == 2 ? 'flex' : 'none',
            width: window.innerWidth < mobilewidth ? '80vw' : 300,
            height: 400, marginRight: 20, textAlign: 'left',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start'
          }}>
          {lesoes.map(item => (
            <div className="palette2" style={{
              display: 'flex', flexDirection: 'row',
            }}>
              <div className='button red' style={{ marginRight: 5 }}>
                {item.grau}
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <div>
                  {item.local}
                </div>
                <div>
                  {'DATA: ' + moment(item.data_abertura).format('DD/MM/YYYY')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div id="boneco"
      className="card-aberto"
      style={{
        display: card == 'card-boneco' ? 'flex' : 'none',
        flexDirection: 'column',
        justifyContent: window.innerWidth < mobilewidth ? 'flex-start' : 'center',
        marginTop: window.innerWidth < mobilewidth ? 20 : 0,
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth < mobilewidth ? 'column' : 'row',
        justifyContent: window.innerWidth < mobilewidth ? 'center' : 'space-evenly',
      }}>
        <div
          style={{
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <Body></Body>
          <ShowInvasaoMenu></ShowInvasaoMenu>
          <ShowInfoLesoes></ShowInfoLesoes>
          <ShowCurativosList></ShowCurativosList>
        </div>
        <DetalhesInvasoes></DetalhesInvasoes>
      </div>
    </div>
  )
}

export default Boneco;