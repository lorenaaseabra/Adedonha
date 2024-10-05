# Adedonha

Adedonha é um jogo divertido e desafiador que coloca os jogadores em competição para encontrar palavras que começam com uma letra específica em várias categorias. Este jogo é perfeito para grupos de amigos ou familiares que desejam se divertir e testar suas habilidades de vocabulário!

## Índice

- [Recursos](#recursos)
- [Como Jogar](#como-jogar)
- [Instalação](#instalação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Recursos

- Suporte para múltiplos jogadores.
- Definição de número de rodadas e tempo limite por turno.
- Sistema de pontuação baseado em respostas únicas e comuns.
- Visualização do placar em tempo real.
- Cartas de resposta ocultas para privacidade.

## Como Jogar

1. **Configuração Inicial**:

   - Os jogadores informam seus nomes e o número de rodadas desejadas.
   - Defina o tempo limite para cada turno.

2. **Jogabilidade**:

   - A cada rodada, uma letra aleatória é escolhida.
   - Cada jogador deve preencher as categorias disponíveis (como "nome", "país", "cor", etc.) com palavras que começam com a letra sorteada.
   - Após todos os jogadores encerrarem suas jogadas, a pontuação é calculada.

3. **Pontuação**:

   - Respostas únicas (apenas um jogador respondeu) recebem 10 pontos.
   - Respostas comuns (mais de um jogador respondeu) recebem 5 pontos.

4. **Fim do Jogo**:
   - O jogo termina após o número definido de rodadas, e o jogador com mais pontos é declarado o vencedor.

## Instalação

Para executar o jogo localmente, siga os passos abaixo:

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/adendonha.git
   ```
2. Navegue até o diretório do projeto:

   ```bash
   cd adedonha
   ```

3. Abra o arquivo `index.html` em seu navegador.

4. Certifique-se de que o arquivo `validAnswers.json` esteja no mesmo diretório, pois contém as respostas válidas para o jogo.

## Estrutura do Projeto

```
adedonha/
├── index.html             # Página principal do jogo
├── styles.css             # Estilos para a interface do usuário
├── script.js              # Lógica do jogo
└── validAnswers.json      # Respostas válidas para as categorias
```

## Tecnologias Utilizadas

- HTML
- CSS
- JavaScript

## Contribuindo

Contribuições são bem-vindas! Se você deseja melhorar o jogo ou adicionar novos recursos, siga estas etapas:

1. Faça um fork do repositório.
2. Crie uma nova branch:
   ```bash
   git checkout -b minha-feature
   ```
3. Faça suas alterações e commit:
   ```bash
   git commit -m 'Adicionando nova funcionalidade'
   ```
4. Envie para o repositório remoto:
   ```bash
   git push origin minha-feature
   ```
5. Abra um pull request.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo [LICENSE](LICENSE) para mais informações.
