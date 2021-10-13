# BDD Specs

## Narrativa 1

```
Como um cliente online, quero que o sistema me mostre minhas compras para eu poder controlar minhas despesas
```

### Cenários

```
Dado que o cliente tem conexão com a internet, quando o cliente solicitar para carregar suas compras, então o sistema deve exibir suas compras vindo de uma API e substituir os dados do cache com os dados mais atuais
```

## Narrativa 2

```
Como um cliente offline, quero que o sistema me mostre minhas últimas compras gravadas para eu poder ver minahs despesas mesmo sem ter internet
```

### Cenários

```
Dado que o cliente não tem conexão com a internet e exista algum dado gravado no cache e os dados do cache forem mais velhos ou iguais a 3 dias quando o cliente solicitar para carregar suas compras, então o sistema deve exibir uma mensagem de erro

Dado que o cliente não tem conexão com a internet e o cache esteja vazio, quando o cliente solicitar para carregar suas compras, então o sistema deve exibir uma mensagem de erro
```