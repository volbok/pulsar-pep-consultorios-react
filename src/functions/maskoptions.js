// função para tratar entradas em campos numéricos.
const maskoptions = (timeout, id, tamanho, array) => {
  clearTimeout(timeout);
  document.getElementById(id).className = "input";
  timeout = setTimeout(() => {
    let x = "";
    x = document.getElementById(id).value.toUpperCase();
    let validatearray = [];
    array.map((item) =>
      validatearray.push({
        boolean: item.toString().includes(x),
        string: item,
      })
    );
    console.log(x);
    console.log(validatearray.filter((item) => item.boolean === true).length);

    if (validatearray.filter((item) => item.boolean === true).length === 1) {
      document.getElementById(id).value = validatearray
        .filter((item) => item.boolean === true)
        .map((item) => item.string);
    } else if (
      validatearray.filter((item) => item.boolean === true).length > 1
    ) {
    } else {
      document.getElementById(id).className = "input toasty";
      document.getElementById(id).value = "";
    }
    if (x.length > tamanho) {
      document.getElementById(id).className = "input toasty";
      document.getElementById(id).value = "";
    }
  }, 500);
};

export default maskoptions;
