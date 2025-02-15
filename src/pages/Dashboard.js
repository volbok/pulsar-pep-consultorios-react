/* eslint eqeqeq: "off" */
import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import Context from "./Context";
import moment from "moment";
// imagens.
import back from '../images/back.png';
// funções.
import maskdate from "../functions/maskdate";
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useHistory } from "react-router-dom";

function Dashboard() {
  // context.
  const {
    html,
    pagina,
    cliente,
    // setfaturamento, faturamento,
    arrayatendimentos, setarrayatendimentos,
    usuarios,
    setpagina,
    operadoras,
  } = useContext(Context);

  useEffect(() => {
    if (pagina == 'DASHBOARD') {
      setoperadoracolors();
      // loadFaturamentos();
      loadRolProcedimentos();
      loadProcedimentos();
      loadConsultas();
      atualizarDashboard(moment().format('DD/MM/YYYY'), moment().format('DD/MM/YYYY'))
    }
    // eslint-disable-next-line
  }, [pagina]);

  // history (router).
  let history = useHistory();

  /*
  ## PENDÊNCIA! DASHBORAD DE FATURAMENTO! ##
  const [localfaturamento, setlocalfaturamento] = useState([]);
  const loadFaturamentos = () => {
    axios.get(html + 'list_faturamento_clinicas/' + cliente.id_cliente).then((response) => {
      let x = response.data.rows;
      setfaturamento(x);
      setlocalfaturamento(x);
    });
  }

  // carregando os registros de faturamento de consultas, procedimentos e exames de imagem realizados pelo cliente.
  function ListaFaturamento() {
    return (
      <div>
        {faturamento.map(item => (
          <div>
          </div>
        ))}
      </div>
    )
  }
  */

  // carregando registros de procedimentos e exames de imagem realizados para o cliente.
  const loadRolProcedimentos = () => {
    axios
      .get(html + "all_procedimentos")
      .then((response) => {
        var x = response.data.rows;
        colorizerolprocedimentos(x.filter(item => item.id_cliente == cliente.id_cliente));
      });
  };

  const colorizerolprocedimentos = (x) => {
    let localarrayroloperadoras = [];
    x.map(item => {
      let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      let obj = {
        id: item.id,
        id_operadora: item.id_operadora,
        nome_operadora: item.nome_operadora,
        procedimento: item.tuss_rol_ans_descricao,
        cor: color,
      }
      localarrayroloperadoras.push(obj);
      return localarrayroloperadoras;
    });
    setrefinedrolprocedimentos(localarrayroloperadoras);
  }

  const [procedimentos, setprocedimentos] = useState([]);
  const loadProcedimentos = () => {
    axios.get(html + 'list_exames_clinicas/' + cliente.id_cliente).then((response) => {
      setprocedimentos(response.data.rows);
    });
  }

  const rolprocedimtnosXprocedimentos = () => {
    let localarrayproc = [];
    refinedrolprocedimentos.map(item => {
      let obj = {
        name: item.procedimento,
        value: procedimentos.filter(proc => proc.nome_exame == item.procedimento).length,
        fill: item.cor,
      }
      localarrayproc.push(obj);
      return null;
    });
    console.log(localarrayproc);
    return (localarrayproc);
  }

  // carregando registros de consultas realizados para o cliente.
  const [localatendimentos, setlocalatendimentos] = useState([]);
  const loadConsultas = () => {
    axios.get(html + "list_consultas/" + 5) // 5 corresponde ao id da unidade "AMBULATÓRIO".
      .then((response) => {
        var x = response.data.rows;
        setarrayatendimentos(x.filter(atendimento => atendimento.id_cliente == cliente.id_cliente));
        setlocalatendimentos(x.filter(atendimento => atendimento.id_cliente == cliente.id_cliente));
      });
  };

  let timeout = null;
  const [datainicio, setdatainicio] = useState(moment().format('DD/MM/YYYY'));
  const [datatermino, setdatatermino] = useState(moment().add(1, 'month').format('DD/MM/YYYY'));
  function SeletorDeDatas() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div
          className="button-yellow"
          style={{ height: 50, minHeight: 50, maxHeight: 50, alignSelf: 'flex-end' }}
          onClick={() => {
            setpagina(0);
            history.push("/");
          }}
        >
          <img
            alt=""
            src={back}
            style={{
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
        <div id="data de início da pesquisa"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="text1">DATA DE INÍCIO</div>
          <textarea
            autoComplete="off"
            placeholder="INÍCIO"
            className="textarea"
            type="text"
            inputMode="numeric"
            maxLength={10}
            id="inputInicio"
            title="FORMATO: DD/MM/YYYY"
            onClick={() => document.getElementById("inputInicio").value = ""}
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "DN")}
            onKeyUp={() => maskdate(timeout, "inputInicio")}
            defaultValue={datainicio}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              width: 100,
              textAlign: "center",
              padding: 15,
              height: 20,
              minHeight: 20,
              maxHeight: 20,
            }}
          ></textarea>
        </div>
        <div id="data de término da pesquisa"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="text1">DATA DE TÉRMINO</div>
          <textarea
            autoComplete="off"
            placeholder="TÉRMINO"
            className="textarea"
            type="text"
            inputMode="numeric"
            maxLength={10}
            id="inputTermino"
            title="FORMATO: DD/MM/YYYY"
            onClick={() => document.getElementById("inputTermino").value = ""}
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "DN")}
            onKeyUp={() => maskdate(timeout, "inputTermino")}
            defaultValue={datatermino}
            style={{
              flexDirection: "center",
              justifyContent: "center",
              alignSelf: "center",
              width: 100,
              textAlign: "center",
              padding: 15,
              height: 20,
              minHeight: 20,
              maxHeight: 20,
            }}
          ></textarea>
        </div>
        <div id='botão pesquisar'
          className="button"
          style={{ maxHeight: 30, alignSelf: 'flex-end', paddingLeft: 20, paddingRight: 20 }}
          onClick={() => {
            setdatainicio(document.getElementById('inputInicio').value);
            setdatatermino(document.getElementById('inputTermino').value);
            atualizarDashboard(document.getElementById('inputInicio').value, document.getElementById('inputTermino').value);
          }}
        >
          PESQUISAR
        </div>
      </div>
    )
  }

  const atualizarDashboard = (inicio, termino) => {
    let arrayatendimento = arrayatendimentos.filter(item => moment(item.data_inicio) > moment(inicio, 'DD/MM/YYYY') && moment(item.data_inicio) < moment(termino, 'DD/MM/YYYY'));
    setlocalatendimentos(arrayatendimento);
  }

  const card = (tamanho, cor, titulo, conteudo) => {
    return (
      <div className="button"
        style={{
          backgroundColor: cor,
          width: tamanho, minWidth: tamanho, maxWidth: tamanho,
          height: tamanho, minHeight: tamanho, maxHeight: tamanho,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          inlineSize: tamanho,
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      >
        <div>{titulo}</div>
        <div>{conteudo != undefined ? conteudo : ''}</div>
      </div>
    )
  }

  // CHART (rechaarts lib).
  // construtor dos gráficos em linha.
  const dados_mes = (profissional) => {
    return (
      [
        {
          MES: moment().subtract(5, 'months').format('MM/YY').toString(),
          ATENDIDOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 4 && moment(item.data_inicio).format('MM/YY') == moment().subtract(5, 'months').format('MM/YY')).length,
          CANCELADOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 5 && moment(item.data_inicio).format('MM/YY') == moment().subtract(5, 'months').format('MM/YY')).length,
        },
        {
          MES: moment().subtract(4, 'months').format('MM/YY').toString(),
          ATENDIDOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 4 && moment(item.data_inicio).format('MM/YY') == moment().subtract(4, 'months').format('MM/YY')).length,
          CANCELADOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 5 && moment(item.data_inicio).format('MM/YY') == moment().subtract(4, 'months').format('MM/YY')).length,
        },
        {
          MES: moment().subtract(3, 'months').format('MM/YY').toString(),
          ATENDIDOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 4 && moment(item.data_inicio).format('MM/YY') == moment().subtract(3, 'months').format('MM/YY')).length,
          CANCELADOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 5 && moment(item.data_inicio).format('MM/YY') == moment().subtract(3, 'months').format('MM/YY')).length,
        },
        {
          MES: moment().subtract(2, 'months').format('MM/YY').toString(),
          ATENDIDOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 4 && moment(item.data_inicio).format('MM/YY') == moment().subtract(2, 'months').format('MM/YY')).length,
          CANCELADOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 5 && moment(item.data_inicio).format('MM/YY') == moment().subtract(2, 'months').format('MM/YY')).length,
        },
        {
          MES: moment().subtract(1, 'months').format('MM/YY').toString(),
          ATENDIDOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 4 && moment(item.data_inicio).format('MM/YY') == moment().subtract(1, 'months').format('MM/YY')).length,
          CANCELADOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 5 && moment(item.data_inicio).format('MM/YY') == moment().subtract(1, 'months').format('MM/YY')).length,
        },
        {
          MES: moment().format('MM/YY').toString(),
          ATENDIDOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 4 && moment(item.data_inicio).format('MM/YY') == moment().format('MM/YY')).length,
          CANCELADOS: arrayatendimentos.filter(item => item.id_profissional == profissional && item.situacao == 5 && moment(item.data_inicio).format('MM/YY') == moment().format('MM/YY')).length,
        }
      ]
    )
  }
  const linechart = (data, tamanho) => {
    const CustomTooltip = ({ payload, label }) => {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          backgroundColor: 'black', borderRadius: 5, padding: 10
        }}>
          <div>{label}</div>
          {payload.map(item => (
            <div>
              <div>{item.name + ': ' + item.value}</div>
            </div>
          ))}
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', borderRadius: 5, margin: 5 }}>
        <LineChart data={data} width={tamanho} height={tamanho / 4} style={{ alignSelf: 'center' }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="MES" />
          <YAxis />
          <Tooltip content={<CustomTooltip payload={["ATENDIDOS", "CANCELADOS"]} label={"MÊS"} />} />
          <Legend />
          <Line type="monotone" dataKey="ATENDIDOS" stroke="#52be80" />
          <Line type="monotone" dataKey="CANCELADOS" stroke="#EC7063" />
        </LineChart>
      </div>
    )
  }

  // construtor do gráfico em donut.
  const totalatendimentos = () => {
    return (
      [
        { name: 'TOTAL DE AGENDADOS', value: localatendimentos.filter(item => item.situacao == 3).length, fill: '#F7DC6F' },
        { name: 'TOTAL DE FINALIZADOS', value: localatendimentos.filter(item => item.situacao == 4).length, fill: '#52be80' },
        { name: 'TOTAL DE CANCELADOS', value: localatendimentos.filter(item => item.situacao == 5).length, fill: '#EC7063' },
      ]
    )
  }

  const profissionalatendimentos = (profissional) => {
    return (
      [
        { name: 'AGENDADOS', value: localatendimentos.filter(item => item.situacao == 3 && item.id_profissional == profissional).length, fill: '#F7DC6F' },
        { name: 'FINALIZADOS', value: localatendimentos.filter(item => item.situacao == 4 && item.id_profissional == profissional).length, fill: '#52be80' },
        { name: 'CANCELADOS', value: localatendimentos.filter(item => item.situacao == 5 && item.id_profissional == profissional).length, fill: '#EC7063' },
      ]
    )
  }

  const conveniosatendimentos = () => {
    let arrayconvenios_atendimentos = [];
    let particular = {
      name: 'PARTICULAR',
      value: localatendimentos.filter(item => item.faturamento_codigo_procedimento == 'PARTICULAR').length,
      fill: 'rgb(82, 190, 128, 1)'
    }
    arrayconvenios_atendimentos.push(particular);
    operadoras.map(operadora => {
      let obj = {
        name: operadora.nome_operadora,
        value: localatendimentos.filter(item => item.convenio_id == operadora.id && item.faturamento_codigo_procedimento != 'PARTICULAR').length,
        fill: arrayoperadorascolors.filter(color => color.id_operadora == operadora.id).map(item => item.color)
      }
      arrayconvenios_atendimentos.push(obj);
      return arrayconvenios_atendimentos;
    })
    return arrayconvenios_atendimentos;
  }

  const donutchart = (data, tamanho, fontsize, total) => {
    // tooltip
    const CustomTooltip = ({ payload, label }) => {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          backgroundColor: 'black', borderRadius: 5, padding: 10, color: 'white',
          fontSize: fontsize, fontWeight: 'bold',
        }}>
          <div>{label}</div>
          {payload.map(item => (
            <div>
              <div>{item.name + ': ' + item.value}</div>
              <div>{Math.ceil(item.value * 100 / total) + '%'}</div>
            </div>
          ))}
        </div>
      )
    }

    // labels.
    const RADIAN = Math.PI / 180;
    let renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {

      const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      if (Math.ceil(100 * value / localatendimentos.length) > 0) {
        return (
          <div style={{ backgroundColor: 'black' }} x={x} y={y} fill={'white'} fontWeight={'bold'} fontSize={fontsize} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {Math.ceil(100 * value / localatendimentos.length) + '%'}
          </div>
        );
      } else {
        return null;
      }
    }

    return (
      <div style={{ display: 'flex', borderRadius: 5, margin: 5 }}>
        <PieChart width={tamanho + 10} height={tamanho + 10} style={{ alignSelf: 'center' }}>
          <Tooltip content={<CustomTooltip payload={[]} />} />
          <Pie
            data={data} dataKey="value" nameKey={"name"} labelLine={false} label={renderLabel} cx={0.5 * tamanho} cy={0.5 * tamanho} outerRadius={0.5 * tamanho} innerRadius={0.2 * tamanho}
            stroke={''} strokeWidth={5}
          >
          </Pie>
        </PieChart>
      </div>
    )
  }

  const [arrayoperadorascolors, setarrayoperadorascolors] = useState([]);
  const setoperadoracolors = () => {
    let localarraycolors = [];
    operadoras.map(item => {
      let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      let obj = {
        id_operadora: item.id,
        nome_operadora: item.nome_operadora,
        color: color,
      }
      localarraycolors.push(obj);
      return localarraycolors;
    });
    setarrayoperadorascolors(localarraycolors);
  }

  function CardsDeAbertura() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
        {donutchart(totalatendimentos(), 300, 12, localatendimentos.length)}
        <div className="grid2">
          {card(150, '', 'ATENDIMENTOS CADASTRADOS', localatendimentos.length)}
          {card(150, '#F7DC6F', 'ATENDIMENTOS AGENDADOS', localatendimentos.filter(item => item.situacao == 3).length)}
          {card(150, '#52be80', 'ATENDIMENTOS FINALIZADOS', localatendimentos.filter(item => item.situacao == 4).length)}
          {card(150, '#EC7063', 'ATENDIMENTOS CANCELADOS', localatendimentos.filter(item => item.situacao == 5).length)}
        </div>
      </div>
    )
  }

  function CardPorProfissionalConsultas() {
    return (
      <div>
        {usuarios.filter(item => item.tipo_usuario != 'ADMINISTRATIVO').map(item => (
          <div className="row"
            style={{
              display: localatendimentos.filter(valor => valor.id_profissional == item.id_usuario).length > 0 ? 'flex' : 'none',
              flexDirection: 'row',
            }}>
            <div id="identificação do profissional"
              className='button'
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                width: '15vw', minHeight: '100%',
                opacity: 0.9,
                marginRight: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                padding: 20,
                alignContent: 'flex-start',
                alignItems: 'flex-start',
                fontSize: 18
              }}>
              <div style={{ textAlign: 'left' }}>{item.nome_usuario}</div>
              <div style={{ textAlign: 'left' }}>{item.conselho + ' - ' + item.n_conselho}</div>
              <div style={{ textAlign: 'left' }}>{item.tipo_usuario}</div>
            </div>
            <div id="estatísticas do profissional"
              className="button"
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                marginLeft: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                backgroundColor: '#ffffff',
              }}>
              <div
                style={{
                  display: 'flex', flexDirection: 'row', justifyContent: 'flex-start',
                }}>
                {donutchart(profissionalatendimentos(item.id_usuario), 150, 12, localatendimentos.filter(valor => valor.id_profissional == item.id_usuario).length)}
                {card(150, '#85C1E9', 'ATENDIMENTOS CADASTRADOS', localatendimentos.filter(valor => valor.id_profissional == item.id_usuario).length)}
                {card(150, '#F7DC6F', 'ATENDIMENTOS AGENDADOS', localatendimentos.filter(valor => valor.id_profissional == item.id_usuario && valor.situacao == 3).length)}
                {card(150, '#52be80', 'ATENDIMENTOS FINALIZADOS', localatendimentos.filter(valor => valor.id_profissional == item.id_usuario && valor.situacao == 4).length)}
                {card(150, '#EC7063', 'ATENDIMENTOS CANCELADOS', localatendimentos.filter(valor => valor.id_profissional == item.id_usuario && valor.situacao == 5).length)}
              </div>
              <div>
                {linechart(dados_mes(item.id_usuario), 600)}
              </div>
            </div>
          </div>
        ))
        }
      </div >
    )
  }

  function CardsConvenios() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center' }}>
        <div>
          {donutchart(conveniosatendimentos(), 250, 12, localatendimentos.length)}
        </div>
        <div className="grid1" style={{ justifyContent: 'flex-start', marginLeft: 5 }}>
          {card(125, 'rgb(82, 190, 128, 1)', 'PARTICULAR', localatendimentos.filter(atend => atend.faturamento_codigo_procedimento == 'PARTICULAR').length)}
          {operadoras.map(item => {
            return card(125, arrayoperadorascolors.filter(color => color.id_operadora == item.id).map(item => item.color), item.nome_operadora, localatendimentos.filter(atend => atend.convenio_id == item.id && atend.faturamento_codigo_procedimento != 'PARTICULAR').length)
          })}
        </div>
      </div>
    )
  }

  // ## EXAMES E PROCEDIMENTOS ##
  // remodelar array de rol de procedimentos, incluindo cor.
  const [refinedrolprocedimentos, setrefinedrolprocedimentos] = useState([]);
  // GRÁFICOS DE EXAMES.
  function CardProcedimentos() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        {donutchart(rolprocedimtnosXprocedimentos(), 250, 14, procedimentos.length)}
        <div className="grid">
          {refinedrolprocedimentos.map(item => {
            return (
              <div>
                {card(150, item.cor, item.procedimento, procedimentos.filter(proc => proc.nome_exame == item.procedimento).length)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className='main'
      style={{
        display: pagina == 'DASHBOARD' ? 'flex' : 'none',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#b2bebe',
      }}>
      <div
        className="chassi scroll"
        id="conteúdo do prontuário"
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          width: 'calc(100vw - 20px)',
        }}
      >
        <SeletorDeDatas></SeletorDeDatas>
        <div className="text2" style={{ fontSize: 20, margin: 20 }}>ATENDIMENTOS</div>
        <CardsDeAbertura></CardsDeAbertura>
        <div className="text2" style={{ fontSize: 20, margin: 20 }}>ATENDIMENTOS PARTICULARES E DISTRIBUÍDOS POR CONVÊNIOS</div>
        <CardsConvenios></CardsConvenios>
        <div className="text2" style={{ fontSize: 20, margin: 20 }}>ATENDIMENTOS DISTRIBUÍDOS POR PROFISSIONAL</div>
        <CardPorProfissionalConsultas></CardPorProfissionalConsultas>
        <div className="text2" style={{ fontSize: 20 }}>EXAMES E PROCEDIMENTOS</div>
        <CardProcedimentos></CardProcedimentos>
      </div>
    </div>
  )
}

export default Dashboard;