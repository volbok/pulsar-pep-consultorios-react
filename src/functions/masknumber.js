// função para tratar entradas em campos numéricos.
const masknumbers = (timeout, id, tamanho) => {
  clearTimeout(timeout);
  var regExp = /^\d+$/;
  var x = document.getElementById(id).value;
  if (regExp.test(x) === false) {
    x = "";
    document.getElementById(id).value = "";
  } else {
  }
  timeout = setTimeout(() => {
    let x = document.getElementById(id).value;
    let last = x.substring(x.length - 1, x.length);
    if (isNaN(last) === true) {
      document.getElementById(id).className = "input toasty";
      document.getElementById(id).value = "";
    }
    if (x.length > tamanho) {
      document.getElementById(id).className = "input toasty";
      document.getElementById(id).value = x.substring(0, x.length - 1);
    }
  }, 100);
};

export default masknumbers;
