# Cápsula do Tempo

**Cápsula do Tempo** é uma Visual Novel interativa desenvolvida em React, ambientada no Rio de Janeiro do ano 2050. O jogo explora um futuro distópico onde o jogador toma decisões que determinam se a cidade caminha para a utopia ou colapso.

## Sobre o Projeto

O jogador assume o papel de um especialista enviado em uma missão temporal crítica. Através de escolhas narrativas, o destino do Rio de Janeiro é moldado. O jogo apresenta múltiplos finais dependendo das decisões tomadas ao longo da história.

### Personagens

- **Cadu** — Protagonista, engenheiro improvisado e hacker de sobrevivência
- **Mila** — Aliada estratégica, especialista em biologia e diplomacia
- **Zion** — IA de controle da cidade, pode ser aliada ou adversária
- **Mentor Sujo** — Guia das ruas, conhecimento marginal do sistema
- **Diplomata Veterano** — Representante das antigas estruturas de poder

### Temas

- Mudanças climáticas e resiliência urbana
- Inteligência artificial e controle social
- Restauração ambiental vs. colapso civilizatório

## Tecnologias

- **React 18** — Interface do usuário
- **Vite 5** — Build tool e servidor de desenvolvimento
- **Tailwind CSS** — Estilização
- **Framer Motion** — Animações
- **Lucide React** — Ícones
- **Web Audio API** — Síntese de áudio procedural (BGM e efeitos sonoros)

## Estrutura do Projeto

```
capsula-do-tempo/
├── public/
│   └── assets/
│       ├── audio/          # Músicas de fundo e efeitos sonoros
│       ├── bg_*.jpg        # Imagens de fundo das cenas
│       ├── npc_*.png       # Sprites dos personagens
│       └── cg_*.jpg        # CGs de eventos especiais
├── src/
│   ├── components/
│   │   └── VisualNovelEngine.jsx   # Motor principal da Visual Novel
│   ├── data/
│   │   └── storyData.json          # Dados das cenas e roteiro
│   ├── App.jsx                     # Componente raiz
│   ├── main.jsx                    # Ponto de entrada React
│   └── index.css                   # Estilos globais
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Como Executar

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5173`.

### Build de Produção

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

### Preview da Build

```bash
npm run preview
```

## Sistema de Cenas

As cenas são definidas em `src/data/storyData.json`. Cada cena possui a seguinte estrutura:

```json
{
  "nome_da_cena": {
    "speakerName": "Nome do personagem",
    "text": "Texto do diálogo",
    "bgImage": "/assets/bg_exemplo.jpg",
    "bgMusic": "/assets/audio/musica.mp4",
    "npcSprite": "/assets/npc_personagem.png",
    "eventCG": "/assets/cg_evento.jpg",
    "soundEffect": "nome_do_sfx",
    "uiTheme": "clean | distopic | glitch",
    "choices": [
      {
        "label": "Texto da escolha",
        "nextScene": "proxima_cena"
      }
    ]
  }
}
```

### Temas de Interface (`uiTheme`)

- `clean` — Interface futurista limpa (cenários seguros)
- `distopic` — Visual degradado e neon (cenários de risco)
- `glitch` — Efeitos de falha digital (momentos críticos)

## Licença

Projeto privado. Todos os direitos reservados.
