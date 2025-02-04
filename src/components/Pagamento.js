/* eslint eqeqeq: "off" */
import React, { useContext, useState } from 'react';
import Context from '../pages/Context';
import axios from 'axios';
// import moment from "moment";
import selector from '../functions/selector';
// criação dos documentos PDF.
import pdfMake from "pdfmake/build/pdfmake";
import moment from 'moment';

function Pagamento() {

  const {
    cliente,
    objpaciente,
    setpagamento, pagamento,
    html,
    setfaturamento,
    setarrayatendimentos,
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
    })
  }

  const loadConsultas = () => {
    axios
      .get(html + "list_consultas/" + 5) // 5 corresponde ao id da unidade "AMBULATÓRIO".
      .then((response) => {
        var x = response.data.rows;
        var y = x.filter(item => item.id_unidade == 5);
        setarrayatendimentos(y.filter(atendimento => atendimento.id_cliente == cliente.id_cliente));
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
                let procedimento = JSON.parse(localStorage.getItem('obj_procedimento')); // obj_procedimento pode receber registro de consulta ou de atendimento/procedimento médico.
                let obj_agendado = JSON.parse(localStorage.getItem('obj_agendado'));
                let localarray = [];
                for (let step = 0; step < item.lancamentos; step++) {
                  let obj = {
                    cliente_id: cliente.id_cliente,
                    cliente_nome: cliente.razao_social,
                    atendimento_id: localStorage.getItem('tipo_faturamento') == 'ATENDIMENTO' ? obj_agendado.id_atendimento : null,
                    procedimento_id: localStorage.getItem('tipo_faturamento') == 'PROCEDIMENTO' ? obj_agendado.id : null,
                    data_pagamento: moment().format('DD/MM/YYYY'),
                    data_vencimento: null,
                    parcela: step + 1,
                    forma_pagamento: item.forma,
                    status_pagamento: 'ABERTO', // passar como parâmetro.
                    valor_pagamento: parseInt(procedimento.valor_part) / item.lancamentos,
                    id_operadora: obj_agendado.id_operadora,
                    codigo_operadora: null,
                    codigo_tuss: procedimento.tuss_codigo,
                    nome_tuss: procedimento.tuss_rol_ans_descricao,
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
            defaultValue={objpaciente.nome_paciente}
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
            defaultValue={objpaciente.tipo_documento + ': ' + objpaciente.numero_documento}
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

  return (
    <div
      className="fundo"
      style={{ display: pagamento == 1 ? "flex" : "none" }}
      onClick={() => { setpagamento(0) }}
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
                className='button' style={{ width: 200 }}
                onClick={() => {
                  setpagamento(0);
                  arrayfaturas.map(item => gerarfaturamento(item));
                  // PENDENTE! separar a ativação destas funções para economizar recursos!
                  // trocar o loadConsultas por função loadModdedAtendimentos em AgendamentoConsultas.js.
                  loadFaturamentos();
                  loadConsultas();
                }}
              >
                CONCLUIR FATURAMENTO
              </div>
            </div>
          </div>
          <div className='button cor1'
            style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{ padding: 20, paddingBottom: 5, fontSize: 20 }}>CONVÊNIO</div>
            <div style={{ marginTop: 0, color: '#52be80' }}>{objpaciente.convenio_nome}</div>
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
                  console.log('LANÇAR REGISTRO DE FATURAMENTO - CONVÊNIO');
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
