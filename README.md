# IMG ConverterZ — Conversor de Imagens

Conversor de imagensarno navegador que converte entre os principais formatos de imagem: JPG, PNG, WebP, GIF, BMP, TIFF, ICO e SVG. Todo o processamento acontece localmente no navegador — **sem upload para servidor**, sem privacidade comprometida.

---

## Funcionalidades

- **Conversão local**: imagens são processadas 100% no navegador
- **Múltiplos formatos**: converta entre JPG, PNG, WebP, GIF, BMP, TIFF, ICO e SVG
- **Arrastar e soltar**: arraste imagens para a área de upload
- **Qualidade ajustável**: escolha entre máxima, alta, média ou baixa qualidade
- **Visualização de resultado**: veja preview e economia de tamanho
- **Download em lote**: baixe todas as imagens convertidas de uma vez

---

## Formatos Suportados

| Formato | Extensão | Notas |
|---------|----------|-------|
| JPEG    | .jpg     | Compacto, sem suporte a transparência |
| PNG     | .png     | Suporta transparência, sem perda |
| WebP    | .webp    | Formato moderno, melhor compressão |
| GIF     | .gif     | Animado, 256 cores |
| BMP     | .bmp     | Sem compressão, arquivos grandes |
| TIFF    | .tiff    | Alta qualidade, usado em impressão |
| ICO     | .ico     | Ícones do Windows |
| SVG     | .svg     | Vetorial, escalável |

---

## Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos

1. **Clone o repositório** (ou extraia os arquivos)
   ```bash
   cd img-converterz
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   ```

4. Abra no navegador: `http://localhost:3000`

---

## Como Usar

1. **Arraste imagens** para a zona de upload (ou clique para selecionar)
2. **Escolha o formato** de destino (JPG, PNG, WebP, etc.)
3. **Ajuste a qualidade** (opcional — não aplicável a PNG e SVG)
4. Clique em **Converter**
5. **Baixe** as imagens convertidas (individualmente ou todas)

---

## Build para Produção

Para gerar os arquivos estáticos:

```bash
npm run build
```

Os arquivos serão gerados na pasta `build/`. Esses arquivos podem ser hospedados em qualquer servidor web estático (Vercel, Netlify, Nginx, etc.).

---

## Tecnologias

- **React** — Interface de usuário
- **browser-image-compression** — Processamento de imagens no navegador
- **Create React App** — Build e tooling

---

## Privacidade

Todas as conversões acontecem **localmente no navegador do usuário**. Nenhuma imagem é enviada para servidores externos. Seus arquivos nunca saem do seu dispositivo.

---

## Licença

MIT © **PhanterAI Creative Agency** — 2026
