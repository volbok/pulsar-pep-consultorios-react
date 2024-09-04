const modal = (setdialogo, mensagem, funcao, parametros) => {
  setdialogo({
    mensagem: mensagem,
    funcao: funcao,
    parametros: parametros
  });
}

export default modal;
