# Estado das mensagens no dashboard

Mensagens pendentes mantêm o botão original. Quando `responded` está ativo, o
botão usa a variante preenchida e o ícone de check dos componentes compartilhados,
preservando o tema monocromático. O nome acessível informa que a mensagem está
respondida e que a ação disponível é marcar como pendente.

O indicador acompanha o estado retornado pelo serviço, após a atualização da
consulta. Marcar como respondida organiza a caixa e não envia e-mail. Esta
alteração visual não verifica envio ou persistência em serviços externos.
