const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const ejs = require('ejs');
const usuariosSenhas = require('./data/usuariosSenhas');
const spreadsheetId = 'YOUR_SPREADSHEET_ID'; // Substitua pelo ID da sua planilha

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log("Acessando a rota /");
  res.render('login', { message: null });
});

app.post('/login', (req, res) => {
  const { estado, usuario, senha } = req.body;

  if (usuariosSenhas.hasOwnProperty(estado)) {
    const usuariosNoEstado = usuariosSenhas[estado];
    const usuarioValido = usuariosNoEstado.find(user => user.usuario === usuario && user.senha === senha);

    if (usuarioValido) {
      console.log("Credenciais corretas. Redirecionando para /home.");
      res.redirect('/home');
    } else {
      res.render('login', { message: 'Credenciais inválidas. Tente novamente.' });
    }
  } else {
    res.redirect('/home', { message: 'Estado inválido. Tente novamente.' });
  }
});

// Adicione a rota para o formulário
app.get('/formulario', (req, res) => {
  console.log("Acessando a rota /formulario");
  res.render('formulario'); // Renderize o formulário HTML
});

// Crie uma rota para processar o formulário
app.post('/processar-formulario', async (req, res) => {
  console.log("Recebendo dados do formulário...");
  const { id, /* adicione outros campos aqui */ } = req.body;
  const data = {
    ID: id,
    /* atribua outros campos correspondentes aos nomes de coluna na planilha */
  };

  // Autenticação na planilha do Google Sheets
  const doc = new GoogleSpreadsheet(spreadsheetId);
  await doc.useServiceAccountAuth(require('./credentials.json'));

  await doc.loadInfo();
  console.log("Conectado à planilha do Google Sheets");

  const sheet = doc.sheetsByIndex[0];

  // Insira os dados na planilha
  await sheet.addRow(data);
  console.log("Dados enviados com sucesso para a planilha.");

  res.send('Dados enviados com sucesso para a planilha.');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
