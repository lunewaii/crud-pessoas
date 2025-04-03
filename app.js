const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'lun3w411',
  database: 'crud_pessoas'
});

db.connect(err => {
  if (err){
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  };
  console.log('conectado ao banco de dados');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  db.query('SELECT id, nome, idade, peso FROM pessoas', (err, pessoas) => {
    if (err){
        console.error('Erro ao consultar o banco de dados:', err);
        res.send('Erro ao consultar o banco de dados');
        return;
    };
    res.render('index', { 
      pessoas: pessoas || [],
      editing: null // garante que editing existe mesmo quando não estiver editando
    });
  });
});

app.post('/save', (req, res) => {
  const { id, nome, idade, peso } = req.body;

  if(typeof nome !== 'string' || nome.length > 100 || peso > 999.99 || peso < 0 || idade < 0) {
    console.log('Dados inválidos!');
    res.redirect('/');
    return;
  }

  if(isNaN(idade)){
    console.log('escreveu algo diferente de número no campo idade');
    res.redirect('/');
    return;
  }

  if(isNaN(peso)){
    console.log('escreveu algo diferente de número no campo peso');
    res.redirect('/');
    return;
  }

  if(id && isNaN(id)){
    console.log('campo id não é número');
    res.redirect('/');
    return;
  }

  if((id && id.trim() === '') || nome.trim() === '' || idade.trim() === '' || peso.trim() === ''){
    console.log('deixou um campo vazio');
    res.redirect('/');
    return;
  }
  
  if (id) {
    // Atualização
    db.query('UPDATE pessoas SET nome=?, idade=?, peso=? WHERE id=?', 
      [nome, idade, peso, id], (err) => {
        if (err){
            console.error('Erro:', err);
        }
        res.redirect('/');
      });
  } else {
    // Inserção
    db.query('INSERT INTO pessoas (nome, idade, peso) VALUES (?, ?, ?)', 
      [nome, idade, peso], (err) => {
        if (err){
            console.error('Erro:', err);
            res.redirect('/');
            return;
        }
        res.redirect('/');
      });
  }
});

app.get('/edit/:id', (req, res) => {
  db.query('SELECT id, nome, idade, peso FROM pessoas WHERE id=?', 
    [req.params.id], (err, result) => {
      if (err){
        console.error('Erro:', err);
        res.redirect('/');
        return;
    }

      if (result.length === 0) {
        res.redirect('/');
        return;
      }
      
      db.query('SELECT id, nome, idade, peso FROM pessoas', (err, pessoas) => {
        if (err){
            console.error('Erro:', err);
            res.redirect('/');
            return;
        }
        res.render('index', { 
          pessoas: pessoas || [],
          editing: result[0] || null
        });
      });
    });
});

app.get('/delete/:id', (req, res) => {
  db.query('DELETE FROM pessoas WHERE id=?', [req.params.id], (err) => {
    if (err){
        console.error('Erro:', err);
    }
    res.redirect('/');
  });
});

app.listen(3000, () => console.log('servidor rodando na porta 3000'));