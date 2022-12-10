//  Funçao Conecta com BD
function BD ()
{
	process.env.ORA_SDTZ = 'UTC-3'; // horário de Brasília
	this.getConexao = async function ()
	{
        
		if (global.conexao)
			return global.conexao;

        const oracledb = require('oracledb');
        
        try
        {
		    global.conexao = await oracledb.getConnection({user: "system", password: "415482", connectionString: "localhost"});
		}
		catch (erro)
		{
			console.log ('Não foi possível estabelecer conexão com o BD!');
			process.exit(1);
		}

		return global.conexao;
	}

}



//`${data.getDate()}-${data.getMonth()+1}-${data.getFullYear()}`

//  Funçao metodos
function Bilhete (bd)
{
    this.bd = bd;
	this.inclua = async function (codigo)
	{
        try{
            conexao = await bd.getConexao();

            const sql1 = 'INSERT INTO Bilhete VALUES (:0, SYSDATE)';
            const dados = [codigo];
            await conexao.execute(sql1,dados);
            const sql2 = 'COMMIT';
            await conexao.execute(sql2);
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
	}
    this.recupera_all = async function(lista){
        try{
            conexao = await bd.getConexao();

            //const sql = "SELECT cod_bilhete, to_char(data_geração, 'HH24:MI:SS DD-MON-RRRR') DATA FROM Bilhete";
            //const sql = "SELECT cod_bilhete, DATA_geração FROM Bilhete";
            const sql = 0;
		    //const dados = [codigo];
		    ret =  await conexao.execute("SELECT * FROM Bilhete");
            console.log(ret.rows);
            for(let i = 0 ; i < ret.rows.length; i++){
                lista.push(ret.rows[i]);
            }
		    //return ret.rows;
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
    this.recupera_one = async function(codigo, lista){
        try{
            conexao = await bd.getConexao();

            //const sql = "SELECT cod_bilhete, to_char(data_geração, 'HH24:MI:SS DD-MON-RRRR') DATA FROM Bilhete";
            //const sql = "SELECT cod_bilhete, DATA_geração FROM Bilhete";
            const sql = "SELECT * FROM Bilhete where cod_bilhete = :0";
		    const dados = [codigo];
		    ret =  await conexao.execute(sql, dados);
            lista.push(ret.rows[0]);
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
}

function Recarga(bd){

    this.bd = bd;
    this.inclua = async function(codigo, tipo){
        try{
            conexao = await bd.getConexao();

            const sql1 = 'INSERT INTO Recarga VALUES (:0, SYSDATE, :1)';
            const dados = [tipo, codigo];
            await conexao.execute(sql1,dados);

            const sql2 = 'COMMIT';
            await conexao.execute(sql2);
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
    this.recupera_one = async function(codigo, lista){
        try{
            conexao = await bd.getConexao();

            //const sql = "SELECT cod_bilhete, to_char(data_geração, 'HH24:MI:SS DD-MON-RRRR') DATA FROM Bilhete";
            //const sql = "SELECT cod_bilhete, DATA_geração FROM Bilhete";
            const sql = "SELECT * FROM recarga where cod_bilhete = :0";
		    const dados = [codigo];
		    ret =  await conexao.execute(sql, dados);
		    lista.push(ret);
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
    this.recupera_all = async function(lista){
        try{
            conexao = await bd.getConexao();

            //const sql = "SELECT cod_bilhete, to_char(data_geração, 'HH24:MI:SS DD-MON-RRRR') DATA FROM Bilhete";
            //const sql = "SELECT cod_bilhete, DATA_geração FROM Bilhete";
            const sql = 0;
		    //const dados = [codigo];
		    ret =  await conexao.execute("SELECT * FROM recarga");
            console.log(ret.rows);
            for(let i = 0 ; i < ret.rows.length; i++){
                lista.push(ret.rows[i]);
            }
		    //return ret.rows;
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
}



//  Módulos
const express = require('express');
const path = require('path');
const app = express();
const oracledb = require('oracledb');
const body = require('body-parser');
const bodyParser = require('body-parser');
const { send } = require('process');
const bd = new BD();
const handlebars = require('express-handlebars');
const { builtinModules } = require('module');


//  BodyParser
//app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));

app.set('view engine', 'ejs');

const bilhete = new Bilhete(bd);
const recarga = new Recarga(bd);


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));


let lista_bilhete = new Array();
let lista_recarga = new Array();


bilhete.recupera_all(lista_bilhete);
recarga.recupera_all(lista_recarga);


//  Rotas

app.post('/form_codigo/:def?', (req, res) => {
    let ver = false;
    for(let i = 0; i<lista_recarga.length; i++){
        console.log(lista_recarga[i][2]);
        if(req.body.cod_ger == lista_recarga[i][2]){
            ver = true;
            break;
        }
    }
    if(ver === true){
        console.log('fodase mermao');
        if(req.params.def == 'relatorio'){
            console.log('fodase mermao');
            res.redirect(`/gerenciamento/${req.body.cod_ger}`);
        }
        else if(req.params.def == 'uso'){
            console.log('fodase mermao');
            res.redirect(`/uso/${req.body.cod_ger}`);
        }
    }
    else{
        res.redirect('error');
    }
})
app.get('/confirmacao/:codigo?/:data?/:horario?', (req, res) => {
    res.render('confirma', {codigo: req.params.codigo, data: req.params.data, horario: req.params.horario});
})
app.get('/error', (req, res) => {
    res.render('error');
})
app.get('/dig_cod/:def?', (req, res) => {
    res.render('codigo', {lista: lista_recarga, def: req.params.def});
})
app.get('/gerenciamento/:codigo?', function (req, res){
    res.render(`gerenciamento`, {lista: lista_recarga, codigo: req.params.codigo});
    //console.log(lista[1][0]);
})
app.get('/uso/:codigo?', (req, res) => {
    res.render('uso', {lista: lista_recarga, codigo: req.params.codigo});
})
app.get('/tela_inicial.html', function(req, res){
    res.sendFile(__dirname + "/html/tela_inicial.html");
    console.log(lista_bilhete);
})
app.get('/tela_recarga.html', function(req, res) {
    res.sendFile(__dirname + "/html/tela_recarga.html");
})
app.get('/tela_gerar_bilhete.html', function(req, res) {
    res.sendFile(__dirname + "/html/tela_gerar_bilhete.html");
})
app.get('/tela_termo.html', function(req, res){
    res.sendFile(__dirname + "/html/tela_termo.html");
})
app.post('/formulario1', function(req, res){
    let ver;
    let cod = Math.floor(Math.random() * (10000 - 1000) + 1000);
    do{
        ver = false;
        for(let i = 0; i<lista_bilhete.length; i++){
            if(lista_bilhete[i][0] == cod){
                ver = true;
            }
        }
        if(ver === true){
            cod = Math.floor(Math.random() * (10000 - 1000) + 1000);
        }
    }while(ver != false);


    let meses = new Array();
    meses[0] = 'JAN';
    meses[1] = 'FEB';
    meses[2] = 'MAR';
    meses[3] = 'ABR';
    meses[4] = 'MAY';
    meses[5] = 'JUN';
    meses[6] = 'JUL';
    meses[7] = 'AUG';
    meses[8] = 'SEP';
    meses[9] = 'OCT';
    meses[10] = 'NOV';
    meses[11] = 'DEC';
    bilhete.inclua(cod);
    bilhete.recupera_one(cod, lista_bilhete);
    let data = new Date();
    let horario_atual = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
    let data_atual = `${data.getDate()}-${meses[data.getMonth()]}-${data.getFullYear()}`;

    res.redirect(`/confirmacao/${cod}/${data_atual}/${horario_atual}`);
})
app.post('/formulario2', function(req, res){
    //console.log(req.body.cod_bilhete, req.body.salvar_data, req.body.salvar_tipo);
    recarga.inclua(req.body.cod_bilhete, req.body.salvar_tipo);
    recarga.recupera_one(req.body.cod_bilhete, lista_recarga);
    for(let i = 0; i<lista.length; i++){
        if(parseInt(req.body.cod_bilhete) === lista_bilhete[i][0]){
            console.log("encontrado");
        }
        else{
            console.log("nao en");
        }
    }
    res.redirect(`/gerenciamento/${lista_bilhete}`);
})


BD();
app.listen(8082);