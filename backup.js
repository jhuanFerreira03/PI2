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
	this.inclua = async function (nome, codigo, data, tipo)
	{
        try{
            conexao = await bd.getConexao();
            if(nome === "incluir_bilhete"){
                const sql1 = 'INSERT INTO Bilhete VALUES (:0, SYSDATE)';
                const dados = [codigo];
                await conexao.execute(sql1,dados);

                const sql2 = 'COMMIT';
                await conexao.execute(sql2);
            }
            else if (nome === "incluir_recarga"){
                const sql1 = 'INSERT INTO Recarga VALUES (:0, SYSDATE, :2)';
                const dados = [tipo, codigo];
                await conexao.execute(sql1,dados);

                const sql2 = 'COMMIT';
                await conexao.execute(sql2);
            }
            else if(nome === "recuperar_bilhete"){
		        //const sql = "SELECT cod_bilhete, to_char(data_geração, 'HH24:MI:SS DD-MON-RRRR') DATA FROM Bilhete";
                //const sql = "SELECT cod_bilhete, DATA_geração FROM Bilhete";
                const sql = "SELECT json_object(*) FROM Bilhete";
		        //const dados = [codigo];
		        ret =  await conexao.execute(sql);
		        return ret.rows;
            }
            else if(nome === "recuperar_bilhete_um"){
		        //const sql = "SELECT cod_bilhete, to_char(data_geração, 'HH24:MI:SS DD-MON-RRRR') DATA FROM Bilhete";
                //const sql = "SELECT cod_bilhete, DATA_geração FROM Bilhete";
                const sql = "SELECT json_object(*) FROM Bilhete where cod_bilhete = :0";
		        const dados = [codigo];
		        ret =  await conexao.execute(sql, dados);
		        return ret.rows;
            }
            else if(nome === "recuperar_recarga"){
		        //const sql = "SELECT cod_bilhete, to_char(data_geração, 'HH24:MI:SS DD-MON-RRRR') DATA FROM Bilhete";
                //const sql = "SELECT cod_bilhete, DATA_geração FROM Bilhete";
                const sql = "SELECT json_object(*) FROM recarga";
		        //const dados = [codigo];
		        ret =  await conexao.execute(sql);
		        return ret.rows;
            }
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
app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');

global.Bilhete = new Bilhete(bd);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
//  Rotas
let lista;
//let lista2 = new Array();
lista = global.Bilhete.inclua("recuperar_bilhete_um", 2902);
//lista2 = global.Bilhete.inclua("recuperar_recarga");

app.get('/gerenciamento', function(req, res){
    Recupera(bd).then((sla) => {
        console.log(sla);
    }).catch(() => {
        console.log("");
    })
})
app.get('/tela_inicial.html', function(req, res){
    res.sendFile(__dirname + "/html/tela_inicial.html");
    //console.log(lista2);
    console.log(lista);
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
app.post('/tela_formulario', function(req, res){
    global.Bilhete.inclua("incluir_bilhete", req.body.cod_bilhete, req.body.data_bilhete);
    res.redirect("/tela_inicial.html");
})
app.post('/tela_formulario2', function(req, res){
    //console.log(req.body.cod_bilhete, req.body.salvar_data, req.body.salvar_tipo);
    global.Bilhete.inclua("incluir_recarga", req.body.cod_bilhete, req.body.salvar_data, req.body.salvar_tipo);
    res.redirect("/tela_inicial.html");
})


BD();
app.listen(8082);