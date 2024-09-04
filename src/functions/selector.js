const selector = (lista, botao, tempo) => {
  setTimeout(() => {
    if (botao !== undefined) {
      var botoes = document
        .getElementById(lista)
        .getElementsByClassName("button-selected");
      for (var i = 0; i < botoes.length; i++) {
        botoes.item(i).className = "button";
      }
      document.getElementById(botao).className = "button-selected";
    }
  }, tempo);
}

export default selector;
