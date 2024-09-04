import toast from '../functions/toast';

// função para destacar campo obrigatório em branco (parametros é uma array).
const checkinput = (tipo, settoast, inputs, botao, funcao, parametros) => {

  // toast informando a existência de um ou mais campos em branco.
  if (inputs.filter(input => document.getElementById(input).value === '').length > 0) {
    toast(settoast, 'CAMPO(S) OBRIGATÓRIO(S) EM BRANCO', 'rgb(231, 76, 60, 1)', 1000);
  }

  // destacando em vermelho os campos em branco.
  setTimeout(() => {
    inputs.map(input => {
      var mappedinput = document.getElementById(input);
      // eslint-disable-next-line
      if (tipo == 'input') {
        // eslint-disable-next-line
        if (mappedinput.value == '') {
          mappedinput.className = 'input emptyinput emptyplaceholder'
        } else {
          mappedinput.className = 'input filledinput filledplaceholder'
        }
      } else {
        // eslint-disable-next-line
        if (mappedinput.value == '') {
          mappedinput.className = 'textarea emptyinput emptyplaceholder'
        } else {
          mappedinput.className = 'textarea filledinput filledplaceholder'
        }
      }
      return null;
    })
  }, 1300);

  // desabilitando o botão responsável pelo salvamento do registro.
  if (inputs.filter(input => document.getElementById(input).value === '').length > 0) {
    document.getElementById(botao).style.opacity = 0.3;
    setTimeout(() => {
      document.getElementById(botao).style.opacity = 1;
    }, 1000);
  } else {
    var x = parametros.map(item => item.toString());
    funcao(x);
    toast(settoast, 'DADOS ATUALIZADOS', 'rgb(82, 190, 128, 1)', 2000);
  }
}

export default checkinput;