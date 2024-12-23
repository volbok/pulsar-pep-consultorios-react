import moment from "moment";

// função para destacar campo obrigatório em branco (parametros é uma array).
const mountage = (item) => {
  let meses = moment().diff(moment(item, 'DD/MM/YYYY'), 'months');
  let dias = moment().diff(moment(item, 'DD/MM/YYYY'), 'days');
  let anos = Math.floor(meses / 12);
  let meses_restantes = meses - (anos * 12);
  if (meses > 12) {
    return anos + ' ANO(S) E ' + meses_restantes + ' MES(ES)';
  } else if (meses === 12) {
    return anos + ' ANO';
  } else if (meses < 12 && meses > 1){
    return meses_restantes + ' MESES';
  } else {
    return dias + ' DIAS'
  }
}

export default mountage;