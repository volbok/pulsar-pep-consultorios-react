const toast = (settoast, mensagem, cor, duracao) => {
  settoast({ display: 'flex', mensagem: mensagem, cor: cor });
  setTimeout(() => {
    settoast({ display: 'none', mensagem: '', cor: 'transparent' });
  }, duracao);
}

export default toast;
