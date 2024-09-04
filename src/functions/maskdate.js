// função para tratar entradas em campos de data.
import moment from "moment";

const maskdate = (timeout, id) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    var regExp = /^\d+$/;
    var x = document.getElementById(id).value;
    if (regExp.test(x) === false && x.includes("/") === false) {
      x = "";
      document.getElementById(id).value = "";
    }
    if (x.includes("//") || x.substring(0, 1) === "/") {
      x = "";
      document.getElementById(id).value = "";
    }
    if (x.length === 2) {
      x = x + "/";
      document.getElementById(id).value = x;
    }
    if (x.length === 5) {
      x = x + "/";
      document.getElementById(id).value = x;
    }
    if (x.length > 10) {
      x = "";
      document.getElementById(id).value = "";
    }
    if (x.length === 10) {
      var date = moment(document.getElementById(id).value, "DD/MM/YYYY", true);
      if (date.isValid() === false) {
        x = "";
        document.getElementById(id).value = "";
      } else {
        document.getElementById(id).value = moment(date).format("DD/MM/YYYY");
      }
    }
    return x;
  }, 100);
};

export default maskdate;
