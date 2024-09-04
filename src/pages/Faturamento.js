/* eslint eqeqeq: "off" */
import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
// imagens.
import power from '../images/power.svg';
import refresh from "../images/refresh.svg";
// import salvar from "../images/salvar.svg";
import "moment/locale/pt-br";
// router.
import { useHistory } from "react-router-dom";
// functions.
import selector from "../functions/selector";
import { XMLBuilder } from 'fast-xml-parser';

function Faturamento() {

  // context.
  const {
    pagina, setpagina,
    html,
    atendimentos, setatendimentos,
    unidades,
    atendimento, setatendimento,
    pacientes, setpacientes,
    setpaciente,
    aih, setaih,
  } = useContext(Context);

  const [arrayatendimentos, setarrayatendimentos] = useState([]);
  const loadAtendimentos = () => {
    axios
      .get(html + "all_atendimentos")
      .then((response) => {
        setatendimentos(response.data.rows);
        setarrayatendimentos(response.data.rows);
      });
  };
  const loadPacientes = () => {
    axios.get(html + "list_pacientes").then((response) => {
      setpacientes(response.data.rows);
      loadAtendimentos();
    });
  }
  const loadAih = () => {
    axios.get(html + 'load_aih').then((response) => {
      setaih(response.data.rows);
    });
  }

  useEffect(() => {
    // eslint-disable-next-line
    if (pagina == 'FATURAMENTO') {
      console.log('PÁGINA DE FATURAMENTO');
      setitem_aih([]);
      loadAtendimentos();
      loadPacientes();
      loadAih();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // history (router).
  let history = useHistory();

  const [filterpaciente, setfilterpaciente] = useState("");
  var searchpaciente = "";
  var timeout = null;
  const filterPaciente = () => {
    clearTimeout(timeout);
    document.getElementById("inputPaciente").focus();
    searchpaciente = document
      .getElementById("inputPaciente")
      .value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchpaciente == "") {
        setfilterpaciente("");
        setarrayatendimentos(atendimentos);
        document.getElementById("inputPaciente").value = "";
        setTimeout(() => {
          document.getElementById("inputPaciente").focus();
        }, 100);
      } else {
        setfilterpaciente(
          document.getElementById("inputPaciente").value.toUpperCase()
        );
        setarrayatendimentos(
          atendimentos.filter((item) =>
            item.nome_paciente.includes(searchpaciente)
          )
        );
        document.getElementById("inputPaciente").value = searchpaciente;
        setTimeout(() => {
          document.getElementById("inputPaciente").focus();
        }, 100);
      }
    }, 1000);
  };
  // filtro de paciente por nome.
  function FilterPaciente() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
        <div className='button-red'
          title={'SAIR'}
          onClick={() => {
            setpagina(0);
            history.push('/');
          }}>
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
        <input
          className="input cor2"
          autoComplete="off"
          placeholder="BUSCAR PACIENTE..."
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => (e.target.placeholder = "BUSCAR PACIENTE...")}
          onKeyUp={() => filterPaciente()}
          type="text"
          id="inputPaciente"
          defaultValue={filterpaciente}
          maxLength={100}
          style={{ width: '100%' }}
        ></input>
        <div
          id="botão para atualizar a lista de pacientes."
          className="button"
          style={{
            display: "flex",
            opacity: 1,
            alignSelf: "center",
          }}
          onClick={() => { loadPacientes(); setatendimento(null); }}
        >
          <img
            alt="" src={refresh}
            style={{ width: 30, height: 30 }}></img>
        </div>
      </div >
    );
  }
  // lista de atendmentos para faturamento.
  const ListaDeAtendimentos = useCallback(() => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: '25vw',
        }}
      >
        <FilterPaciente></FilterPaciente>
        <div id="scroll atendimentos com pacientes"
          className="scroll"
          style={{
            display: arrayatendimentos.length > 0 ? "flex" : "none",
            justifyContent: "flex-start",
            margin: 5, marginBottom: 0,
            height: 'calc(100vh - 205px)',
            width: 'calc(100% - 20px)'
          }}
        >
          <div id="scroll atendimentos faturamento">
            {
              arrayatendimentos
                .filter(item => item.situacao == 1) // permitir opção para ver atendimentos encerrados...
                .sort((a, b) => (a.leito > b.leito ? 1 : -1))
                .map((item) => (
                  <div key={"pacientes" + item.id_atendimento} style={{ width: '100%' }}>
                    <div
                      className="row"
                      style={{
                        position: "relative",
                        margin: 2.5, padding: 0,
                      }}
                    >
                      <div
                        className="button"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          marginRight: 0,
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          minHeight: 100,
                          height: 100,
                          width: 60,
                          backgroundColor: '#004c4c'
                        }}
                      >
                        <div
                          className='text2'
                          style={{ margin: 5, padding: 0 }}
                        >
                          {unidades.filter(x => x.id_unidade == item.id_unidade).map(x => x.nome_unidade)}
                        </div>
                        <div
                          className='text2'
                          style={{ margin: 5, padding: 0 }}
                        >
                          {item.leito}
                        </div>
                      </div>
                      <div
                        id={"atendimento " + item.id_atendimento}
                        className="button"
                        style={{
                          flex: 3,
                          flexDirection: 'column',
                          marginLeft: 0,
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          minHeight: 100,
                          height: 100,
                          width: '100%',
                        }}
                        onClick={() => {
                          setatendimento(item.id_atendimento);
                          setpaciente(item.id_paciente);
                          selector("scroll atendimentos faturamento", "atendimento " + item.id_atendimento, 100);
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            padding: 5
                          }}
                        >
                          {pacientes.filter(
                            (valor) => valor.id_paciente == item.id_paciente
                          )
                            .map((valor) => valor.nome_paciente)}
                          <div>
                            {moment().diff(
                              moment(
                                pacientes
                                  .filter(
                                    (valor) => valor.id_paciente == item.id_paciente
                                  )
                                  .map((item) => item.dn_paciente)
                              ),
                              "years"
                            ) + " ANOS"}
                          </div>
                        </div>
                        <div>{'INTERNAÇÃO: ' + item.id_atendimento}</div>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
        <div id="scroll atendimento vazio"
          className="scroll"
          style={{
            display: arrayatendimentos.length > 0 ? "none" : "flex",
            justifyContent: "center",
            marginTop: 5,
            height: 'calc(100vh - 205px)',
          }}
        >
          <div className="text3" style={{ opacity: 0.5 }}>
            SEM PACIENTES CADASTRADOS PARA ESTA UNIDADE
          </div>
        </div>
      </div>
    );
    // eslint-disable-next-line
  }, [arrayatendimentos]);

  const [item_aih, setitem_aih] = useState([]); // objeto de AIH selecionado.
  const ListaDeAIHs = useCallback(() => {
    return (
      <div className="scroll"
        id="lista de aih"
        style={{
          display: 'flex', flexDirection: 'row',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          overflowX: 'scroll', overflowY: 'hidden',
        }}
      >
        {aih.filter(item => item.id_atendimento == atendimento).map(item => (
          <div id={"botao aih " + item.id} className="button" style={{ width: 200, minWidth: 200 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}
              onClick={() => {
                setitem_aih(item);
                console.log(item);
                selector("lista de aih", "botao aih " + item.id, 100);
              }}
            >
              <div>
                {moment(item.data_abertura).format('DD/MM/YYYY')}
              </div>
              <div style={{ fontSize: 16 }}>
                {item.numero_aih}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }, [aih, atendimento]);

  const inputAih = (campo, valor, largura) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <div className="text1">{campo}</div>
        <textarea
          style={{
            display: 'flex',
            width: largura == 1 ? 200 : 400,
            minWidth: largura == 1 ? 200 : 400,
          }}
          id={campo}
          className='textarea_campo'
          defaultValue={valor != null ? valor : ''}
          onKeyUp={() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              // updateAih(item_aih, document.getElementById(campo).value.toUpperCase());
            }, 500);
          }}
        >
        </textarea>
      </div>
    )
  }

  const ViewAih = useCallback(() => {
    return (
      <div className='scroll'
        style={{
          display: item_aih != [] ? 'flex' : 'none',
          flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap',
          marginTop: 20, height: '60vh'
        }}>
        {inputAih('DATA DE ABERTURA', moment(item_aih.data_abertura).format('DD/MM/YY'), 1)}
        {inputAih('DATA DE FECHAMENTO', moment(item_aih.data_fechamento).format('DD/MM/YY'), 1)}
        {inputAih('NOME DO PACIENTE', item_aih.nome_paciente, 2)}
        {inputAih('NÚMERO DA AIH', item_aih.numero_aih, 1)}
        {inputAih('CARTÃO SUS', item_aih.cartao_sus, 1)}
        {inputAih('DATA DE NASCIMENTO', moment(item_aih.dn).format('DD/MM/YYYY'), 1)}
        {inputAih('SEXO', item_aih.sexo, 1)}
        {inputAih('NOME DA MÃE', item_aih.nome_mae, 2)}
        {inputAih('LOGRADOURO', item_aih.endereco_logradouro, 2)}
        {inputAih('NÚMERO', item_aih.endereco_numero, 1)}
        {inputAih('COMPLEMENTO', item_aih.endereco_complemento, 1)}
        {inputAih('BAIRRO', item_aih.endereco_bairro, 1)}
        {inputAih('CEP', item_aih.endereco_cep, 1)}
        {inputAih('CÓD. MUNICÍPIO', item_aih.cod_municipio, 1)}
        {inputAih('TEELFONE', item_aih.telefone_paciente, 1)}
        {inputAih('NACIONALIDADE', item_aih.nacionalidade, 1)}
        {inputAih('COR', item_aih.cor, 1)}
        {inputAih('ETNIA', item_aih.etnia, 1)}
        {inputAih('TIPO DE DOCUMENTO', item_aih.tipo_documento_paciente, 1)}
        {inputAih('NÚMERO DO DOCUMENTO', item_aih.numero_documento_paciente, 1)}
        {inputAih('ÓRGÃO EMISSOR', item_aih.orgao_emissor, 1)}
        {inputAih('TIPO DE AIH', item_aih.tipo_aih, 1)}
        {inputAih('APRESENTAÇÃO', item_aih.apresentacao, 2)}
        {inputAih('PROCEDIMENTO SOLICITADO', item_aih.proc_solicitado, 1)}
        {inputAih('PROCEDIMENTO PRINCIPAL', item_aih.proc_principal, 1)}
        {inputAih('MUDANÇA DE PROCEDIMENTO', item_aih.mudanca_procedimento, 1)}
        {inputAih('MODALIDADE', item_aih.modalidade, 1)}
        {inputAih('ESPEC_LEITO', item_aih.espec_leito, 1)}
        {inputAih('CID PRINCIPAL', item_aih.cid_principal, 1)}
        {inputAih('MOTIVO DO ENCERRAMENTO', item_aih.motivo_encerramento, 1)}
        {inputAih('DOC. PROF. SOLICITANTE', item_aih.doc_profissional_solicitante, 1)}
        {inputAih('DOC. PROF. RESPONSÁVEL', item_aih.doc_profissional_responsavel, 1)}
        {inputAih('DOC. PROFISSIONAL AUTORIZADOR', item_aih.doc_autorizador, 1)}
        {inputAih('DATA DA AUTORIZAÇÃO', item_aih.data_autorizador, 1)}
        {inputAih('AIH ANTERIOR', item_aih.aih_anterior, 1)}
        {inputAih('AIH POSTERIOR', item_aih.aih_posterior, 1)}
        {inputAih('CNPJ DO EMPREGADOR', item_aih.cnpj_empregador, 1)}
        {inputAih('CNAER', item_aih.cnaer, 1)}
        {inputAih('VÍNCULO PREVIDÊNCIA', item_aih.vinculo_previdencia, 1)}
        {inputAih('CBO_COMPLETA', item_aih.cbo_completa, 1)}
        <div className="button green"
          onClick={() => createXML()}
        >
          CRIAR XML
        </div>
      </div>
    )
    // eslint-disable-next-line
  }, [item_aih, atendimento]);

  // criando XML para AIH:
  const createXML = () => {
    const books = [
      {
        tag1: 'tag1',
        tag2: {
          tag2_1: 'tag2_1',
          tag2_2: 'tag2_2',
        }
      },
    ];
    const builder = new XMLBuilder({
      arrayNodeName: "book"
    });
    const xmlContent = `<?xml version="1.0"?>
    <aih>
      ${builder.build(books)}
    </aih>`
    console.log("xml: ", xmlContent.substring(0, 118));
  }

  return (
    <div id="tela de faturamento"
      className='main'
      style={{
        display: pagina == 'FATURAMENTO' ? 'flex' : 'none',
      }}
    >
      <div className='chassi'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly',
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', position: 'sticky', top: 5, width: '30vw' }}>
          <ListaDeAtendimentos></ListaDeAtendimentos>
        </div>
        <div style={{ margin: 20 }}>
          <ListaDeAIHs></ListaDeAIHs>
          <ViewAih></ViewAih>
        </div>
      </div>
    </div>
  )
}

export default Faturamento;