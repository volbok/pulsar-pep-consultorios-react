const clearselector = (lista, tempo) => {
  setTimeout(() => {
    var botoes = document
      .getElementById(lista)
      .getElementsByClassName("button-selected");
    for (var i = 0; i < botoes.length; i++) {
      botoes.item(i).className = "button";
    }
  }, tempo);
}

export default clearselector;
