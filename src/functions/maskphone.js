// função para tratar entradas em campos de data.
const maskphone = (timeout, id) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    var x = document.getElementById(id).value;
    var last = x.substring(x.length - 1, x.length);
    if (last === "(" || last === ")" || last === " " || isNaN(last) === true) {
      document.getElementById(id).value = "";
    }
    if (x.length === 2 && isNaN(last) === false) {
      x = "(" + x + ") ";
      document.getElementById(id).value = x;
    }
    if (x.length === 10) {
      x = x + "-";
      document.getElementById(id).value = x;
    }
    if (x.length > 15) {
      document.getElementById(id).value = "";
    }
  }, 10);
};

export default maskphone;
