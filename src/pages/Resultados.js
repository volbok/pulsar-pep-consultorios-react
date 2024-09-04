/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Context from "./Context";
// funções.
import toast from "../functions/toast";
import moment from "moment";
import selector from "../functions/selector";
// imagens.
import power from "../images/power.svg";
import lab_green from "../images/lab_green.svg";
import lab_red from "../images/lab_red.svg";
import lab_yellow from "../images/lab_yellow.svg";
import logo from '../images/logo.svg';
import zoio from '../images/zoio.svg';

// html2pdf
// import { Preview, print } from 'react-html2pdf';

// componentes.
import Logo from "../components/Logo";
// router.
import { useHistory } from "react-router-dom";

function Resultados() {
  // context.
  const {
    html,
    pagina,
    setpagina,
    settoast,
    cliente,
    mobilewidth,
  } = useContext(Context);

  // history (router).
  let history = useHistory();
  const [paciente, setpaciente] = useState([]);

  const [component, setcomponent] = useState('LOGIN');
  useEffect(() => {
    if (pagina == 'RESULTADOS') {
      setcomponent('LOGIN');
      localStorage.setItem('dados_exame', '');
    }
    // eslint-disable-next-line
  }, [pagina]);

  // checando se o usuário inserido está registrado no sistema.
  var timeout = null;
  const checkPaciente = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      let id_paciente = document.getElementById("inputIdPaciente").value;
      let dn = document.getElementById("inputDn").value;
      localStorage.setItem("idpaciente", id_paciente)
      localStorage.setItem('dn', dn);
      if (id_paciente != '') {
        var obj = {
          id_paciente: id_paciente,
        }
        axios.post(html + 'checkpaciente', obj).then((response) => {
          var x = [0, 1];
          x = response.data.rows;
          console.log(x);
          if (x.length == 1) {
            console.log('DN: ' + dn);
            console.log('SENHA: ' + x.map(item => moment(item.dn_paciente).format('DD/MM/YYYY')).pop());
            if (dn == x.map(item => moment(item.dn_paciente).format('DD/MM/YYYY')).pop()) {
              setpaciente(x);
              setcomponent('RESULTADOS');
              loadListaExames();
              loadExames();
            } else {
              toast(
                settoast,
                "SENHA INCORRETA",
                "rgb(231, 76, 60, 1)",
                3000
              );
            }
          } else {
            toast(
              settoast,
              "PACIENTE NÃO ENCONTRADO",
              "rgb(231, 76, 60, 1)",
              3000
            );
          }
        })
          .catch(function () {
            toast(
              settoast,
              "ERRO DE CONEXÃO, REINICIANDO APLICAÇÃO.",
              "black",
              5000
            );
            setTimeout(() => {
              setpagina(0);
              history.push("/");
            }, 5000);
          });
      } else {
        toast(
          settoast,
          "USUÁRIO OU SENHA INCORRETOS",
          "rgb(231, 76, 60, 1)",
          3000
        );
      }
    })
  }

  // inputs para login e senha.
  function Inputs() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <input
          autoComplete="off"
          placeholder="CÓDIGO DO PACIENTE"
          className="input"
          type="text"
          id="inputIdPaciente"
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => (e.target.placeholder = "CÓDIGO DO PACIENTE")}
          style={{
            marginTop: 10,
            marginBottom: 10,
            width: 200,
            height: 50,
          }}
        ></input>
        <div style={{ position: 'relative' }}>
          <input
            autoComplete="off"
            placeholder="SENHA"
            className="input"
            type="password"
            id="inputDn"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "SENHA")}
            style={{
              marginTop: 10,
              marginBottom: 10,
              width: 200,
              height: 50,
            }}
          ></input>
          <div id="btn ver senha"
            style={{
              position: 'absolute', top: 20, right: -40,
              borderRadius: 50, height: 40, width: 40,
              backgroundColor: 'white',
            }}
            onClick={() => {
              document.getElementById("inputDn").setAttribute('type', 'text');
              document.getElementById("inputDn").focus();
            }}
          >
            <img
              alt=""
              src={zoio}
              style={{
                margin: 5,
                height: 30,
                width: 30,
                opacity: 0.6,
              }}
            ></img>
          </div>
        </div>
        <div
          id="btnloginpaciente"
          className="button"
          style={{
            display: 'flex',
            margin: 5,
            width: 150,
            padding: 10,
            minWidth: 150,
            alignSelf: 'center',
          }}
          onClick={() => {
            checkPaciente();
          }}
        >
          ENTRAR
        </div>
      </div>
    );
    // eslint-disable-next-line
  };

  const [random, setrandom] = useState(0);
  function Exames() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="text2" style={{ fontSize: 24 }}>{'OLÁ, ' + paciente.map(item => item.nome_paciente)}</div>
        <div className="text2">{'ACESSE ABAIXO OS RESULTADOS DOS SEUS EXAMES'}</div>
        <div id="lista de pedidos de exames" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignSelf: 'center' }}>
          {listaexames.sort((a, b) => moment(a.data) < moment(b.data) ? 1 : -1).map(item => (
            <div
              style={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center',
                width: window.innerWidth < mobilewidth ? '90vw' : '50vw',
                alignSelf: 'center', alignContent: 'center',
              }}>
              <div id={"lista_exame " + item.id}
                onClick={() => {
                  localStorage.setItem('random', item.random);
                  localStorage.setItem('id_paciente', item.data);
                  localStorage.setItem('data_exames', item.data);
                  localStorage.setItem('nome_profissional', item.nome_profissional);
                  localStorage.setItem('registro_profissional', item.registro_profissional);
                  if (document.getElementById('todososexames ' + item.id).style.display == 'none') {
                    document.getElementById('todososexames ' + item.id).style.display = 'flex';
                  } else {
                    document.getElementById('todososexames ' + item.id).style.display = 'none';
                  }
                  selector("lista de pedidos de exames", "botao_exame " + item.id, 300);
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                }}>
                <div
                  className="button"
                  style={{
                    marginLeft: 0,
                    marginRight: 0,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                >
                  {moment(item.data).format('DD/MM/YYYY')}
                </div>
                <div id={"botao_exame " + item.id}
                  className="button"
                  style={{
                    display: 'flex', flexDirection: 'column',
                    marginLeft: 0,
                    marginRight: 0,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    opacity: 0.8,
                  }}
                >
                  <div>{item.nome_profissional}</div>
                  <div>{'CRM-MG ' + item.registro_profissional}</div>
                </div>
              </div>
              <div id={'todososexames ' + item.id}
                style={{
                  display: 'none',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 5,
                  marginTop: 0,
                }}
              >
                {exames.filter(valor => valor.random == item.random).map((item) => (
                  <div
                    style={{
                      display: 'grid',
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      gridTemplateColumns: window.innerWidth < mobilewidth ? '3fr 2fr 1fr' : '1fr 1fr 1fr',
                      width: '90%',
                      alignSelf: 'center',
                      alignContent: 'flex-start',
                    }}>
                    <div className="text1"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        textAlign: 'left', justifyContent: 'flex-start', alignContent: 'flex-start',
                        width: '100%',
                        alignSelf: 'flex-start',
                      }}>
                      {item.nome_exame}
                    </div>
                    <div className="text1" style={{ alignSelf: 'flex-start' }}>{item.material}</div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        width: '100%',
                        alignSelf: 'flex-start', alignContent: 'center',
                        marginTop: 5,
                      }}>
                      <img
                        alt=""
                        src={item.status == 1 ? lab_yellow : item.status == 2 ? lab_green : lab_red}
                        style={{
                          margin: 5,
                          height: 20,
                          width: 20,
                        }}
                      ></img>
                    </div>
                  </div>
                ))}
                <div style={{
                  display: 'flex', flexDirection: 'row', justifyContent: 'center',
                  width: '60vw',
                  alignSelf: 'center',
                }}>
                  <div
                    className="button"
                    style={{ width: 150 }}
                    onClick={() => {
                      setrandom(localStorage.getItem('random'));
                      setTimeout(() => {
                        // setcomponent('PDF');
                        printDiv();
                      }, 1000);
                    }}
                  >
                    BAIXAR PDF
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function Header() {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column', justifyContent: 'center',
        fontFamily: 'Helvetica',
        breakInside: 'avoid',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          width: '100%',
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
            <img
              alt=""
              src={logo}
              style={{
                margin: 0,
                height: window.innerWidth < mobilewidth ? 0.2 * window.innerWidth : 75,
                width: window.innerWidth < mobilewidth ? 0.2 * window.innerWidth : 75,
              }}
            ></img>
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              alignItems: 'flex-start',
              textAlign: 'left',
              marginRight: 10,
              alignContent: 'flex-start',
            }}>
              <div className='text1'
                style={{
                  margin: 1.5, padding: 0, alignSelf: 'flex-start', textAlign: 'left',
                  fontSize: window.innerWidth < mobilewidth ? 8 : 10,
                  color: 'black',
                }}>
                {cliente.razao_social}
              </div>
              <div className='text1'
                style={{
                  margin: 2, padding: 0, alignSelf: 'flex-start', textAlign: 'left',
                  fontSize: window.innerWidth < mobilewidth ? 9 : 12,
                  color: 'black',
                }}>
                {cliente.cnpj}
              </div>
              <div className='text1'
                style={{
                  margin: 2, padding: 0, alignSelf: 'flex-start', textAlign: 'left',
                  fontSize: window.innerWidth < mobilewidth ? 9 : 12,
                  color: 'black',
                }}>
                {cliente.texto1}
              </div>
              <div className='text1'
                style={{
                  margin: 2, padding: 0, alignSelf: 'flex-start', textAlign: 'left',
                  fontSize: window.innerWidth < mobilewidth ? 9 : 12,
                  color: 'black',
                }}>
                {cliente.texto2}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            }}>
            <div
              style={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-start',
                borderRadius: 5, backgroundColor: 'gray', color: 'white',
                padding: 5, margin: 10,
                alignSelf: 'flex-start',
              }}>
              <div
                className="text1"
                style={{
                  margin: 2, padding: 0, alignSelf: 'flex-start', textAlign: 'left',
                  fontSize: window.innerWidth < mobilewidth ? 12 : 14,
                  color: 'white',
                }}>
                {'DATA DO EXAME: ' + moment(localStorage.getItem("data_exames")).format('DD/MM/YY - HH:mm')}
              </div>
              <div
                className="text1"
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                  margin: 2, padding: 0, alignSelf: 'flex-start', textAlign: 'left',
                  fontSize: window.innerWidth < mobilewidth ? 12 : 14,
                  color: 'white',
                  alignContent: 'flex-start',
                }}>
                {'PRONTUÁRIO: ' + paciente.map(item => item.id_paciente)}
              </div>
            </div>
          </div>
        </div>
        <div className="text1" style={{ alignSelf: 'flex-start', textAlign: 'left', margin: 2, marginTop: 10, padding: 0, color: 'black' }}>
          {'NOME CIVIL: ' + paciente.map(item => item.nome_paciente)}
        </div>
        <div className="text1" style={{ alignSelf: 'flex-start', textAlign: 'left', margin: 2, padding: 0, color: 'black' }}>
          {'DN: ' + paciente.map(item => moment(item.dn_paciente).format('DD/MM/YYYY'))}
        </div>
        <div className="text1" style={{ alignSelf: 'flex-start', textAlign: 'left', margin: 2, padding: 0, color: 'black' }}>
          {'NOME DA MÃE: ' + paciente.map(item => item.nome_mae_paciente)}
        </div>
      </div >
    )
  }

  function Conteudo() {
    if (exames.length > 0) {
      return (
        <div
          id="conteudo laudo de exames laboratoriais"
          style={{
            display: 'flex', flexDirection: 'column',
            flexWrap: 'wrap',
            justifyContent: 'center',
            fontFamily: 'Helvetica',
            breakInside: 'auto',
            whiteSpace: 'pre-wrap',
            flex: 1,
            alignSelf: 'flex-start',
            alignContent: 'flex-start',
            width: 'calc(100% - 20px)',
          }}>
          <div id='profissional requisitante'
            className="text1"
            style={{
              display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-start',
              alignSelf: 'flex-start', textAlign: 'left', margin: 2, padding: 0, color: 'black', fontWeight: 'normal',
              fontSize: 10,
            }}
          >
            {'PROFISSIONAL SOLICITANTE:' + localStorage.getItem('nome_profissional') + ' - Nº CONSELHO: ' + localStorage.getItem('registro_profissional')}
          </div>
          {exames.filter(item => item.random == random && item.resultado != null && item.status == 2).map(item => itemLaboratorioConstructor(item))}
        </div>
      )
    } else {
      return null
    }
  }

  function Footer() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        fontFamily: 'Helvetica',
        breakInside: 'avoid',
      }}>
        <div>_____________________________</div>
        <div
          className="text1"
          style={{
            alignSelf: 'flex-start', textAlign: 'left', margin: 2, padding: 0, color: 'black',
            fontSize: 10,
          }}
        >
          {'NOME DO RESPONSÁVEL TÉCNICO PELO LABORATÓRIO'}
        </div>
        <div
          className="text1"
          style={{
            alignSelf: 'flex-start', textAlign: 'left', margin: 2, padding: 0, color: 'black', fontWeight: 'normal',
            fontSize: 10,
          }}
        >
          {'RESPONSÁVEL TÉCNICO'}
        </div>
      </div>
    )
  }

  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
    }
  }

  const itemLaboratorioConstructor = (item) => {
    console.log(item);
    let resultado = JSON.parse(item.resultado);
    if (resultado != null && resultado.length > 1) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: 5,
            margin: 5,
            borderRadius: 5,
            borderColor: 'black',
            borderWidth: 1,
            borderStyle: 'solid',
            fontFamily: 'Helvetica',
            breakInside: 'avoid',
            flexGrow: 'inherit',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 'bolder' }}>{item.nome_exame}</div>
          <div style={{ fontSize: 8, fontWeight: 'normal' }}>{'MATERIAL: ' + item.material}</div>
          <div style={{ fontSize: 8, fontWeight: 'normal', marginTop: 5 }}>{'RESULTADO:'}</div>
          <div style={styles.grid}>
            {resultado.map(valor => (
              <div style={{
                display: 'flex', flexDirection: 'column',
                margin: 2, padding: 2, borderRadius: 5,
              }}
              >
                <div style={{ fontSize: 12, fontWeight: 'bolder' }}>{valor.campo + ': ' + valor.valor}</div>
                <div style={{ fontSize: 8 }}>{valor.vref_min == null || valor.vref_man == null ? '' : 'REFERÊNCIA: ' + valor.vref_min + ' A ' + valor.vref_max + '.'}</div>
              </div>
            ))}
          </div>
        </div>
      )
    } else if (resultado != null && resultado.length == 1) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            width: '100%',
            padding: 5,
            margin: 5,
            borderRadius: 5,
            borderColor: 'black',
            borderWidth: 1,
            borderStyle: 'solid',
            fontFamily: 'Helvetica',
            breakInside: 'avoid',
            flexGrow: 'inherit',
          }}
        >
          <div>
            {resultado.map(valor => (
              <div style={{
                display: 'flex', flexDirection: 'column',
                margin: 2, padding: 2, borderRadius: 5,
              }}
              >
                <div style={{ fontSize: 12, fontWeight: 'bolder' }}>{valor.campo}</div>
                <div style={{ fontSize: 8 }}>{'MATERIAL: ' + item.material}</div>
                <div style={{ fontSize: 8, marginTop: 5 }}>{'RESULTADO:'}</div>
                <div style={{ fontSize: 12, fontWeight: 'bolder' }}>{valor.valor}</div>
                <div style={{ fontSize: 8 }}>{valor.vref_min == null || valor.vref_max == null ? '' : 'REFERÊNCIA: ' + valor.vref_min + ' A ' + valor.vref_max + '.'}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  function PrintDocumento() {
    if (exames.length > 0) {
      return (
        <div style={{
          flexDirection: 'column', justifyContent: 'flex-start',
          backgroundColor: 'white', width: '100vw', height: '100vh',
        }}
        >
          <div id="pdf" style={{ width: '100%', backgroundColor: 'white' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ width: '100%' }}>
                <tr style={{ width: '100%' }}>
                  <td style={{ width: '100%' }}>
                    <Header></Header>
                  </td>
                </tr>
              </thead>
              <tbody style={{ width: '100%' }}>
                <tr style={{ width: '100%' }}>
                  <td style={{ width: '100%' }}>
                    <div id="campos"
                      style={{
                        display: 'flex', flexDirection: 'column',
                        breakInside: 'auto', alignSelf: 'center', width: '100%'
                      }}>
                      <Conteudo></Conteudo>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot style={{ width: '100%' }}>
                <tr style={{ width: '100%' }}>
                  <td style={{ width: '100%' }}>
                    <Footer></Footer>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )
    } else {
      return (
        <div>
        </div>
      )
    }
  }

  function printDiv() {
    let printdocument = document.getElementById("pdf").innerHTML;
    var a = window.open('  ', 'DOCUMENTO PARA IMPRESSÃO');
    a.document.write('<html>');
    a.document.write(printdocument);
    a.document.write('</html>');
    a.print();
    // a.close();
  }

  const [listaexames, setlistaexames] = useState([]);
  function loadListaExames() {
    console.log(localStorage.getItem("idpaciente"));
    axios.get(html + 'lista_laboratorio_cliente/' + localStorage.getItem("idpaciente")).then((response) => {
      var x = [0, 1];
      x = response.data.rows;
      setlistaexames(x);
      console.log(x.length);
    });
  }

  const [exames, setexames] = useState([]);
  function loadExames() {
    var obj = {
      id_paciente: localStorage.getItem("idpaciente"),
    }
    axios.post(html + 'laboratorio_cliente', obj).then((response) => {
      var x = [0, 1];
      x = response.data.rows;
      setexames(x);
      console.log(x.length);
    });
  }

  return (
    <div
      className="main"
      style={{ display: pagina == 'RESULTADOS' ? "flex" : "none" }}
    >
      <div id="conteúdo do login"
        className="chassi"
        style={{
          display: component == 'LOGIN' ? 'flex' : 'none',
          visibility: component == 'LOGIN' ? 'visible' : 'hidden',
        }}
      >
        <div
          className="button-red"
          style={{
            display: "flex",
            position: "sticky",
            top: 10,
            right: 10,
            alignSelf: 'flex-end'
          }}
          title="FAZER LOGOFF."
          onClick={() => {
            setpaciente([]);
            setpagina(0);
            history.push("/");
          }}
        >
          <img
            alt=""
            src={power}
            style={{
              margin: 0,
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
        <div
          className="text2 popin"
        >
          <Logo href="/site/index.html" target="_blank" rel="noreferrer" height={200} width={200}></Logo>
        </div>
        <div
          className="text2"
          style={{
            margin: 20, marginTop: 10,
            fontSize: 28,
          }}
        >
          PULSAR
        </div>
        <Inputs></Inputs>
      </div>
      <div id="conteúdo dos exames"
        className="chassi"
        style={{
          display: component == 'RESULTADOS' ? 'flex' : 'none',
          visibility: component == 'RESULTADOS' ? 'visible' : 'hidden',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          overflowY: 'scroll',
        }}
      >
        <div
          className="button-red"
          style={{
            display: "flex",
            position: "sticky",
            top: 10,
            right: 10,
            alignSelf: 'flex-end'
          }}
          title="FAZER LOGOFF."
          onClick={() => {
            setpaciente([]);
            setpagina(0);
            history.push("/");
          }}
        >
          <img
            alt=""
            src={power}
            style={{
              margin: 0,
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
        <Exames></Exames>
      </div>
      <div id="impressão"
        style={{
          display: component == 'PDF' ? 'flex' : 'none',
          visibility: component == 'PDF' ? 'visible' : 'hidden',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          width: '100%',
        }}
        onClick={() => setcomponent('RESULTADOS')}
      >
        <PrintDocumento></PrintDocumento>
      </div>
    </div>
  )
}

export default Resultados;
