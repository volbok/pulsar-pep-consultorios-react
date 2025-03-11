/* eslint eqeqeq: "off" */
import React, { useContext, useState } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
// import moment from "moment";
import selector from '../functions/selector';
// criação dos documentos PDF.
import pdfMake from "pdfmake/build/pdfmake";
import moment from 'moment';
import toast from '../functions/toast';

function Pagamento() {

  const {
    hospital,
    cliente,
    objpaciente,
    setpagamento, pagamento,
    html,
    setfaturamento,
    setarrayatendimentos, arrayatendimentos,
    agenda,
    selectedespecialista,
    setarrayexames,
    agendaexame,
    pagina,
    settoast,
    objatendimento,
  } = useContext(Context);

  let arrayformaspagamento = [
    {
      forma: 'PIX',
      lancamentos: 1,
    },
    {
      forma: 'DÉBITO',
      lancamentos: 1,
    },
    {
      forma: 'CRÉDITO 1X',
      lancamentos: 1,
    },
    {
      forma: 'CRÉDITO 2X',
      lancamentos: 2,
    },
    {
      forma: 'CRÉDITO 3X',
      lancamentos: 3,
    },
    {
      forma: 'CRÉDITO 4X',
      lancamentos: 4,
    },
    {
      forma: 'CRÉDITO 5X',
      lancamentos: 5,
    },
    {
      forma: 'CRÉDITO 6X',
      lancamentos: 6,
    },
  ]

  const loadFaturamentos = () => {
    axios.get(html + 'list_faturamento_clinicas/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setfaturamento(x);
      console.log(x);
      console.log('LISTA DE FATURAMENTOS CARREGADA');
      if (localStorage.getItem('tela_agendamento') == 'CONSULTAS') {
        console.log('ATUALIZANDO LISTA DE CONSULTAS E HORÁRIOS LIVRES');
        loadModdedAtendimentos();
      } else {
        console.log('ATUALIZANDO LISTA DE PROCEDIMENTOS E HORÁRIOS LIVRES');
        setTimeout(() => {
          montaArrayAgenda(localStorage.getItem('selectdate'));
        }, 2000);
      }
    });
  }

  const [arrayfaturas, setarrayfaturas] = useState([]);
  const formapagamento = () => {
    // lancamentos = quantas vezes um registro de faturamento/pagamento deve ser lançado.
    return (
      <div id={'lista de formas de pagamento'}
        className='scroll'
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap',
          width: 'calc(100% - 20px)', height: 200,
        }}>
        <div className='grid'>
          {arrayformaspagamento.map(item => (
            <div
              className='button'
              style={{ width: 150 }}
              id={'forma_pgto ' + item.forma}
              key={'forma_pgto ' + item.forma}
              onClick={() => {
                selector('lista de formas de pagamento', 'forma_pgto ' + item.forma, 300);
                localStorage.setItem('forma_pagamento', item.forma);
                let valor = document.getElementById("inputValorParticular").value;
                let procedimento = JSON.parse(localStorage.getItem('obj_procedimento')); // obj_procedimento pode receber registro de consulta ou de atendimento/procedimento médico.
                let obj_agendado = JSON.parse(localStorage.getItem('obj_agendado'));
                let localarray = [];
                for (let step = 0; step < item.lancamentos; step++) {
                  let data = moment().add(step, 'month');
                  let obj = {
                    cliente_id: cliente.id_cliente,
                    cliente_nome: cliente.razao_social,
                    atendimento_id: localStorage.getItem('tipo_faturamento') == 'ATENDIMENTO' ? obj_agendado.id_atendimento : null,
                    procedimento_id: localStorage.getItem('tipo_faturamento') == 'PROCEDIMENTO' ? obj_agendado.id : null,
                    data_pagamento: step + 1 == 1 ? data.format('DD/MM/YYYY') : null, // primeira parcela paga à vista.
                    data_vencimento: data.format('DD/MM/YYYY'),
                    parcela: step + 1,
                    forma_pagamento: item.forma,
                    status_pagamento: step + 1 == 1 ? 'PAGO' : 'ABERTO', // passar como parâmetro.
                    valor_pagamento: (parseFloat(valor) / item.lancamentos).toFixed(2),
                    id_operadora: obj_agendado.id_operadora,
                    codigo_operadora: null,
                    codigo_tuss: procedimento.tuss_codigo,
                    nome_tuss: procedimento.tuss_rol_ans_descricao,
                    data_registro: moment().format('DD/MM/YYYY'),
                  }
                  // PENDENTE: adaptar para o agendamento de consultas!
                  localarray.push(obj);
                }
                setarrayfaturas(localarray);
                console.log(localarray);
              }}
            >
              {item.forma}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const gerarfaturamento = (obj) => {
    axios.post(html + 'insert_faturamento_clinicas', obj).then(() => {
      console.log('REGISTRO DE FATURAMENTO RECEBIDO COM SUCESSO');
    });
  }

  const updateAtendimento = (tipo) => {
    var obj = {
      data_inicio: objatendimento.data_inicio,
      data_termino: tipo == 'PARTICULAR' ? moment(objatendimento.data_inicio).add(cliente.tempo_consulta_particular, 'minutes') : moment(objatendimento.data_inicio).add(cliente.tempo_consulta_convenio, 'minutes'),
      problemas: objatendimento.problemas,
      id_paciente: objatendimento.id_paciente,
      id_unidade: 5, // ATENÇÃO: 5 é o ID da unidade ambulatorial.
      nome_paciente: objatendimento.nome_paciente,
      leito: null,
      situacao: 3, // 3 = atendimento ambulatorial (consulta).
      id_cliente: hospital,
      classificacao: null,
      id_profissional: objatendimento.id_profissional,
      convenio_id: objatendimento.convenio_codigo,
      convenio_carteira: objatendimento.convenio_carteira,
      faturamento_codigo_procedimento: tipo,
    };
    axios
      .post(html + "update_atendimento/" + objatendimento.id_atendimento, obj)
      .then(() => {
        console.log('AGENDAMENTO DE CONSULTA ATUALIZADO COM SUCESSO')
      });
  };

  const updateProcedimento = (tipo) => {
    let obj = {
      id_exame: null,
      nome_exame: objatendimento.nome_exame,
      codigo_tuss: objatendimento.codigo_tuss,
      particular: tipo == 'PARTICULAR' ? 1 : 0,
      convenio: tipo == 'PARTICULAR' ? 0 : 1,
      codigo_operadora: objatendimento.codigo_operadora,
      id_paciente: objatendimento.id_paciente,
      nome_paciente: objatendimento.nome_paciente,
      dn_paciente: moment(objatendimento.dn_paciente).format('DD/MM/YYYY'),
      id_profissional_executante: objatendimento.id_profissional_executante,
      nome_profissional_executante: objatendimento.nome_profissional_executante,
      conselho_profissional_executante: objatendimento.conselho_profissional_executante,
      n_conselho_profissional_executante: objatendimento.n_conselho_profissional_executante,
      status: objatendimento.status, // 0 = solicitado, 1 = executado, 2 = cancelado, 3 = desistência.
      laudohtml: objatendimento.laudohtml,
      id_cliente: cliente.id_cliente,
      data_exame: objatendimento.data_exame,
    }
    axios
      .post(html + "update_exames_clinicas/" + objatendimento.id, obj)
      .then(() => {
        console.log('AGENDAMENTO DE PROCEDIMENTO ATUALIZADO COM SUCESSO')
      });
  };

  // ## CRIAÇÃO DE RECIBOS EM PDFMAKE ## //
  // impressão de recibo de pagamento (consulta ou procedimento particular).
  const printFile = () => {
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
                    { text: 'DEPARTAMENTO FINANCEIRO', width: '*', alignment: 'center', fontSize: 8 },
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
        { text: 'RECIBO DE PAGAMENTO', alignment: 'center', fontSize: 14, bold: true, margin: 10 },
        { text: localStorage.getItem('texto_recibo'), fontSize: 10, bold: false },
        { text: '---x---', fontSize: 10, bold: true, color: '#ffffff' },
        { text: 'INFORMAÇÕES DO RECEBEDOR:', fontSize: 10, bold: true },
        { text: 'CNPJ: ' + cliente.cnpj, fontSize: 10, bold: false },
        { text: 'RAZÃO SOCIAL: ' + cliente.razao_social, fontSize: 10, bold: false },
        { text: 'ENDEREÇO: ' + cliente.endereco, fontSize: 10, bold: false },
      ],
    }
    // utilizando a lib pdfmake para gerar o pdf e converter em base64.
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.open();
  }
  const [reciboform, setreciboform] = useState(0);
  function ReciboNomePagador() {
    return (
      <div
        className="fundo"
        style={{ display: reciboform == 1 ? "flex" : "none" }}
        onClick={() => { setreciboform(0) }}
      >
        <div className="janela scroll cor2" onClick={(e) => e.stopPropagation()}>
          <div className='text1'>NOME DO PAGADOR</div>
          <input id="inputNomePagador"
            autoComplete="off"
            placeholder="NOME DO PAGADOR..."
            className="input"
            type="text"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "NOME DO PAGADOR...")}
            defaultValue={objpaciente != null ? objpaciente.nome_paciente : ''}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              textAlign: "center",
              width: 400,
              padding: 15,
              height: 20,
              minHeight: 20,
              maxHeight: 20,
            }}
          ></input>
          <div className='text1'>DOCUMENTO DO PAGADOR</div>
          <input id="inputDocumentoPagador"
            autoComplete="off"
            placeholder="DOCUMENTO DO PAGADOR..."
            className="input"
            type="text"
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "DOCUMENTO DO PAGADOR...")}
            defaultValue={objpaciente != null ? objpaciente.tipo_documento + ': ' + objpaciente.numero_documento : ''}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              textAlign: "center",
              width: 400,
              padding: 15,
              height: 20,
              minHeight: 20,
              maxHeight: 20,
            }}
          ></input>
          <div className='button green'
            style={{ width: 200 }}
            onClick={() => {
              if (localStorage.getItem('parcelas') < 2) {
                let texto = 'RECEBEMOS DE ' + document.getElementById('inputNomePagador').value.toUpperCase() + ', ' + document.getElementById('inputDocumentoPagador').value + ', A IMPORTÂNCIA DE R$' + localStorage.getItem('valor_total') + ', REFERENTE À REALIZAÇÃO DO EXAME/PROCEDIMENTO ' + localStorage.getItem('procedimento');
                localStorage.setItem('texto_recibo', texto);
              } else {
                let texto = 'PAGAMENTO PARCELADO'
                localStorage.setItem('texto_recibo', texto); // PENDENTE
              }
              printFile();
              setreciboform(0);
            }}
          >
            IMPRIMIR RECIBO
          </div>
        </div>
      </div >
    )
  }

  const loadModdedAtendimentos = () => {
    axios
      .get(html + "list_consultas/" + 5) // 5 corresponde ao id da unidade "AMBULATÓRIO".
      .then((response) => {
        var x = response.data.rows;
        var y = x.filter(item => item.id_unidade == 5 && item.id_cliente == cliente.id_cliente);
        carregaHorarioslivres(y);
      });
  };

  const montaArrayAgenda = (data) => {
    // atualizando lista de exames agendados.
    axios.get(html + 'list_exames_clinicas/' + cliente.id_cliente).then((response) => {
      var x = [];
      x = response.data.rows;
      console.log('MONTANDO AGENDA...');
      console.log(data);
      let localarrayexames = []
      // preenchendo a array com os exames já agendados.
      let arrayexamesdodia = x.filter(item => item.id_cliente == cliente.id_cliente && moment(item.data_exame, 'DD/MM/YYYY - HH:mm').format('DD/MM/YYYY') == data);
      arrayexamesdodia.map(item => {
        let obj = {
          id: item.id,
          nome_exame: item.nome_exame,
          data_exame: item.data_exame,
          id_profisisonal_executante: item.id_profissional_executante,
          nome_profissional_executante: item.nome_profissional_executante,
          conselho: item.n_conselho_profissional_executante,
          id_paciente: item.id_paciente,
          nome_paciente: item.nome_paciente,
          dn_paciente: item.dn_paciente,
          status: item.status,
          codigo_operadora: item.codigo_operadora,
          codigo_tuss: item.codigo_tuss,
          particular: item.particular,
        }
        localarrayexames.push(obj);
        return null;
      });
      console.log('ARRAY EXAMES AGENDADOS DO DIA:');
      console.log(localarrayexames);
      // preenchendo a array com os horários disponíveis para agendamento, excluindo os já agendados.
      let arrayagendadodia = agendaexame.filter(item => item.id_cliente == cliente.id_cliente && item.dia_semana == moment(data, 'DD/MM/YYYY').format('dddd').toUpperCase());
      arrayagendadodia.map(item => {
        if (arrayexamesdodia.filter(valor => moment(valor.data_exame, 'DD/MM/YYYY - HH:mm').format('HH:mm') == item.hora_inicio).length == 0) {
          let obj = {
            id: null,
            nome_exame: item.exame,
            data_exame: data + ' - ' + item.hora_inicio,
            id_profissional_executante: item.id_usuario,
            nome_profissional_executante: item.id_nome_usuario,
            conselho: null,
            nome_paciente: null,
            dn_paciente: null,
          }
          localarrayexames.push(obj);
        }
        console.log('ARRAY COM HORÁRIOS MARCADOS E DISPONÍVEIS DO DIA:');
        console.log(localarrayexames);
        return null;
      })
      setarrayexames(localarrayexames);
    });
  }

  // PENDÊNCIA!
  // se disparado da tela mapa, mudar o filtro de agenda retirando o filtro id.usuario.
  const carregaHorarioslivres = (array) => {
    setarrayatendimentos([]);
    console.log(pagina);
    let selectdate = localStorage.getItem('selectdate');
    if (pagina == 'MAPA DE AGENDAMENTOS') { // carrega horários de todos os médicos registrados para o cliente.
      console.log('AGENDAMENTO VIA MAPA');
      let array_origin = array;
      agenda.filter(item => item.id_cliente == cliente.id_cliente && item.dia_semana == moment(selectdate, 'DD/MM/YYYY').format('dddd').toUpperCase()).map(item => {
        array_origin.push(
          {
            situacao: 'AGENDAMENTO',
            id_profissional: item.id_usuario,
            data_inicio: moment(selectdate + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'),
            data_termino: moment(selectdate + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm'),
            faturamento_codigo_procedimento: moment(selectdate + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm').diff(moment(selectdate + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'), 'minutes') == cliente.tempo_consulta_convenio ? 'CONVÊNIO' : 'PARTICULAR',
          }
        );
        return null;
      });
      setarrayatendimentos(array_origin);
    } else {
      console.log('AGENDAMENTO VIA CADASTRO');
      let array_origin = arrayatendimentos;
      agenda.filter(item => item.id_usuario == selectedespecialista.id_usuario && item.dia_semana == moment(selectdate, 'DD/MM/YYYY').format('dddd').toUpperCase()).map(item => {
        array_origin.push(
          {
            situacao: 'AGENDAMENTO',
            id_profissional: selectedespecialista.id_usuario,
            data_inicio: moment(selectdate + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'),
            data_termino: moment(selectdate + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm'),
            faturamento_codigo_procedimento: moment(selectdate + ' - ' + item.hora_termino, 'DD/MM/YYYY - HH:mm').diff(moment(selectdate + ' - ' + item.hora_inicio, 'DD/MM/YYYY - HH:mm'), 'minutes') == cliente.tempo_consulta_convenio ? 'CONVÊNIO' : 'PARTICULAR',
          }
        );
        return null;
      });
      setarrayatendimentos(array_origin);
    }
  }

  return (
    <div
      className="fundo"
      style={{ display: pagamento == 1 ? "flex" : "none" }}
      onClick={() => {
        setpagamento(0);
        var botoes = document
          .getElementById('lista de formas de pagamento')
          .getElementsByClassName("button-selected");
        for (var i = 0; i < botoes.length; i++) {
          botoes.item(i).className = "button";
        }
      }}
    >
      <div className="janela scroll cor2" style={{ height: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className='button cor1'
            style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{ padding: 20, fontSize: 20 }}>PARTICULAR</div>
            <div style={{ opacity: 0.6 }}>{'VALOR (R$)'}</div>
            <input id="inputValorParticular"
              autoComplete="off"
              placeholder="VALOR PART..."
              className="input"
              type="text"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "VALOR PART...")}
              style={{
                flexDirection: "center",
                justifyContent: "center",
                alignSelf: "center",
                textAlign: "center",
                width: 200,
                padding: 15,
                height: 20,
                minHeight: 20,
                maxHeight: 20,
              }}
            ></input>
            <div style={{ opacity: 0.6, marginTop: 10, marginBlock: 5 }}>{'FORMA DE PAGAMENTO'}</div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
              {formapagamento(localStorage.getItem('situacao'))}
            </div>
            <div style={{ opacity: 0.6, marginTop: 10 }}>{'EMISSÕES PARA O CLIENTE'}</div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 10, marginTop: 0 }}>
              <div className='button'
                onClick={() => {
                  localStorage.setItem('valor_total', document.getElementById('inputValorParticular').value);
                  setreciboform(1);
                }}
                style={{ width: 200 }}>
                RECIBO
              </div>
              <div className='button' style={{ width: 200 }}>NFE</div>
              <div
                className='button'
                style={{
                  display: 'flex',
                  width: 200,
                }}
                onClick={() => {
                  if (localStorage.getItem('forma_pagamento') != 'indefinida') {
                    localStorage.setItem('valor_total', document.getElementById('inputValorParticular').value);
                    console.log(localStorage.getItem('valor_total'));
                    setpagamento(0);
                    var botoes = document
                      .getElementById('lista de formas de pagamento')
                      .getElementsByClassName("button-selected");
                    for (var i = 0; i < botoes.length; i++) {
                      botoes.item(i).className = "button";
                    }

                    if (localStorage.getItem('tela_agendamento') == 'CONSULTAS') {
                      updateAtendimento('PARTICULAR');
                    } else {
                      updateProcedimento('PARTICULAR');
                    }

                    arrayfaturas.map(item => gerarfaturamento(item));
                    setTimeout(() => {
                      loadFaturamentos();
                    }, 1000);

                  } else {
                    toast(
                      settoast,
                      "INDIQUE A FORMA DE PAGAMENTO",
                      "#EC7063",
                      1000
                    );
                  }
                }}
              >
                CONCLUIR FATURAMENTO
              </div>
            </div>
          </div>
          <div className='button cor1'
            style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{ padding: 20, paddingBottom: 5, fontSize: 20 }}>CONVÊNIO</div>
            <div style={{ marginTop: 0, color: '#52be80' }}>{objpaciente != null ? objpaciente.convenio_nome : ''}</div>
            <div style={{ marginTop: 20, opacity: 0.6 }}>{'VALOR (R$)'}</div>
            <input id="inputValorConvenio"
              autoComplete="off"
              placeholder="VALOR CONV..."
              className="input"
              type="text"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "VALOR CONV...")}
              style={{
                flexDirection: "center",
                justifyContent: "center",
                alignSelf: "center",
                textAlign: "center",
                width: 200,
                padding: 15,
                height: 20,
                minHeight: 20,
                maxHeight: 20,
              }}
            ></input>
            <div style={{ opacity: 0.6, marginTop: 10 }}>{'EMISSÕES PARA O CLIENTE'}</div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div
                className='button' style={{ width: 200 }}
                onClick={() => {
                  console.log('ABRIR GUIA SADT');
                }}
              >
                EMITIR GUIA SADT
              </div>
              <div
                className='button' style={{ width: 200 }}
                onClick={() => {
                  localStorage.setItem('valor_total', document.getElementById('inputValorConvenio').value);
                  setpagamento(0);
                  let objprocedimento = JSON.parse(localStorage.getItem('obj_procedimento'));
                  let objagendado = JSON.parse(localStorage.getItem('obj_agendado'));
                  let obj = {
                    cliente_id: cliente.id_cliente,
                    cliente_nome: cliente.razao_social,
                    atendimento_id: localStorage.getItem('tipo_faturamento') == 'ATENDIMENTO' ? objagendado.id_atendimento : null,
                    procedimento_id: localStorage.getItem('tipo_faturamento') == 'PROCEDIMENTO' ? objagendado.id : null,
                    data_pagamento: moment().format('DD/MM/YYYY'),
                    data_vencimento: moment().format('DD/MM/YYYY'),
                    parcela: 1,
                    forma_pagamento: 'CONVÊNIO',
                    status_pagamento: 'ABERTO',
                    valor_pagamento: parseFloat(localStorage.getItem('valor_total')).toFixed(2),
                    id_operadora: objprocedimento.id_operadora,
                    codigo_operadora: null,
                    codigo_tuss: objprocedimento.tuss_codigo,
                    nome_tuss: objprocedimento.tuss_rol_ans_descricao,
                    data_registro: moment().format('DD/MM/YYYY'),
                  }
                  gerarfaturamento(obj);

                  if (localStorage.getItem('tela_agendamento') == 'CONSULTAS') {
                    updateAtendimento('CONVÊNIO');
                  } else {
                    updateProcedimento('CONVÊNIO');
                  }

                  setTimeout(() => {
                    loadFaturamentos();
                  }, 1000);
                  
                }}
              >
                CONCLUIR FATURAMENTO
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReciboNomePagador></ReciboNomePagador>
    </div>
  )
}

export default Pagamento;
