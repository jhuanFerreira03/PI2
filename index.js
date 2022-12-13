const { lstat } = require('fs');

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

            const sql = 0;
		    ret =  await conexao.execute("SELECT * FROM Bilhete");

            for(let i = 0 ; i < ret.rows.length; i++){
                lista.push(ret.rows[i]);
            }
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
    this.recupera_one = async function(codigo, lista){
        try{
            conexao = await bd.getConexao();

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

            const sql1 = 'INSERT INTO Recarga (tipo, data_recarga, codigo) VALUES (:0, SYSDATE, :1)';
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
        console.log(lista);
        try{
            conexao = await bd.getConexao();
    
            const sql = "select * from Recarga where cod_recarga = (select max(cod_recarga) from Recarga)";
            const dados = [codigo];
            let ret = await conexao.execute(sql);

            for(let i = 0; i<ret.rows.length; i++){
                lista.push(ret.rows[0]);
            }
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
    this.recupera_all = async function(lista){
        try{
            conexao = await bd.getConexao();
            const sql = 0;
		    ret =  await conexao.execute("SELECT * FROM recarga");
            for(let i = 0 ; i < ret.rows.length; i++){
                lista.push(ret.rows[i]);
            }
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
}

function Uso(bd){
    this.bd = bd;
    this.inclua = async function(codigo){
        try{
            conexao = await bd.getConexao();

            const sql1 = 'INSERT INTO Uso (id_uso, data_uso, cod_recarga) VALUES (null, SYSDATE, :0)';
            const dados = [codigo];
            await conexao.execute(sql1,dados);

            const sql2 = 'COMMIT';
            await conexao.execute(sql2);
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
    this.recupera_one = async function(lista){
        try{
            conexao = await bd.getConexao();

            const sql = "select * from Uso  where id_uso = (select max(id_uso) from Uso)";
		    //const dados = [data];
            let ret = await conexao.execute(sql)
            console.log(ret.rows);
            lista.push(ret.rows[0]);
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
    this.recupera_all = async function(lista){
        try{
            conexao = await bd.getConexao();

            const sql = 0;
		    ret =  await conexao.execute("SELECT * FROM Uso");

           for(let i = 0; i<ret.rows.length; i++){
                lista.push(ret.rows[i]);
           }
        }
        catch(erro){
            console.log("Erro de conexão!" + erro);
        }
    }
}



function Verifica(lista, codigo, def){
    for(let i = 0; i<lista.length; i++){
        if(parseInt(codigo) == parseInt(lista[i][def])){
            return true;
        }
    }
    return false;
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

app.set('view engine', 'ejs');


//  BodyParser
//app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));


const bilhete = new Bilhete(bd);
const recarga = new Recarga(bd);
const uso = new Uso(bd);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));


let lista_bilhete = new Array();
let lista_recarga = new Array();
let lista_uso = new Array();

let meses = new Array();
meses[0] = 'JAN';
meses[1] = 'FEV';
meses[2] = 'MAR';
meses[3] = 'ABR';
meses[4] = 'MAI';
meses[5] = 'JUN';
meses[6] = 'JUL';
meses[7] = 'AGO';
meses[8] = 'SET';
meses[9] = 'OUT';
meses[10] = 'NOV';
meses[11] = 'DEZ';


bilhete.recupera_all(lista_bilhete);
recarga.recupera_all(lista_recarga);
uso.recupera_all(lista_uso);




function Verifica_Rec_Ativa(lista, lista_uso, codigo, tipo, salvar = false, uso_data, salvar_p = false){
    let count = 0;
    for(let i = 0; i<lista.length ; i++){ 
        if(parseInt(codigo) == parseInt(lista[i][2])){
                let count = 0;
                if(lista[i][0] == tipo){
                for(let j = 0; j < lista_uso.length; j++){
                    if(lista[i][3] == lista_uso[j][2]){
                        let data_ativacao = new Date(lista_uso[j][1]);
                        let data_atual = new Date();
                        if(tipo == 'Bilhete Unico'){
                            if(data_atual.getTime() - data_ativacao.getTime() <= 2400000){
                                if(salvar == true){
                                    console.log('bilhete');
                                    uso.inclua(lista[i][3]); uso.recupera_one(lista_uso); uso_data.push(data_ativacao);
                                }
                                return true;
                            }
                            else{
                                return false;
                            }
                        }
                        else if(tipo == 'Bilhete Duplo'){
                            let data_prox;
                            let count2 = 0;
                            for(let s = 0; s<lista_uso.length; s++){
                                if(lista_uso[s][2] == lista_uso[j][2]){
                                    if(lista_uso[s][1].getTime() - data_ativacao.getTime() >= 2400000){
                                        data_prox = new Date(new Date());
                                        count2 += 1;
                                        break;
                                    }
                                }
                            }
                            if(count2 == 0){
                                if(salvar === true){
                                    uso.inclua(lista[i][3]); uso.recupera_one(lista_uso); uso_data.push(data_ativacao);
                                }
                                return true;
                            }
                            else{
                                if(data_atual.getTime() - data_prox.getTime() <= 2400000){
                                    if(salvar === true){
                                        uso.inclua(lista[i][3]); uso.recupera_one(lista_uso); uso_data.push(data_prox); 
                                    }
                                    return true;
                                }
                                else{
                                    return false;
                                }
                            }
                        }
                        else if(tipo == 'Bilhete de Sete Dias'){ 
                            if(data_atual.getTime() - data_ativacao.getTime() <= 604800000){
                                if(salvar === true){
                                    uso.inclua(lista[i][3]); uso.recupera_one(lista_uso); uso_data.push(data_ativacao);
                                }
                                return true;
                            }
                            else{
                                return false;
                            }
                        }
                        else if(tipo == 'Bilhete de Trinta Dias'){
                            if(data_atual.getTime() - data_ativacao.getTime() <= 2592000000){
                                if(salvar === true){
                                    uso.inclua(lista[i][3]); uso.recupera_one(lista_uso); uso_data.push(data_ativacao);
                                }
                                return true;
                            }
                            else{
                                return false;
                            }
                        }
                    }               
                }
                if(salvar == true){uso.inclua(lista[i][3]); uso.recupera_one(lista_uso); uso_data.push(new Date()); return true}
                console.log('fodase mermao dddddd');
                return false;
            }
                
        }
    }
    return false;
}

//  Rotas

app.get('/recarga_ja_jeita/:codigo?/:tipo?', (req, res) => {
    res.render('recarga_ja_feita', {codigo: req.params.codigo, tipo: req.params.tipo});
})
app.get('/confirmacao_recarga/:codigo?/:data?/:horario?', (req, res) => {
    res.render('confirma_recarga');
})
app.get('/confirmacao_geracao/:codigo?/:data?/:horario?', (req, res) => {
    res.render('confirma_geracao', {codigo: req.params.codigo, data: req.params.data, horario: req.params.horario});
})
app.get('/error/:def?/:mensagem_erro?', (req, res) => {
    res.render('error', {erro:req.params.mensagem_erro, def: req.params.def});
})
app.get('/dig_cod/:def?', (req, res) => {
    res.render('codigo', {lista: lista_bilhete, def: req.params.def});
})
app.get('/gerenciamento/:codigo?', function (req, res){

    let data;
    let ver;
    ver = false;
    for(let i = 0; i<lista_bilhete.length; i++){
        if(lista_bilhete[i][0] == req.params.codigo){
            data = new Date(lista_bilhete[i][1]);
        }
    }


    let horario_atual = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
    let data_atual = `${data.getDate()}-${meses[data.getMonth()]}-${data.getFullYear()}`;

    console.log(lista_recarga);

    res.render(`gerenciamento`, {lista: lista_recarga, lista2:lista_bilhete, codigo: req.params.codigo, data: data_atual, horario: horario_atual, lista3: lista_uso , meses: meses});
})
app.get('/uso/:codigo?/:tipo?/:data?', (req, res) => {

    let data = new Date(req.params.data);
    let result;
    if(req.params.tipo == 'Bilhete Unico'){result = data.getTime() + 2400000}
    else if(req.params.tipo == 'Bilhete Duplo'){result = data.getTime() + 2400000}
    else if(req.params.tipo == 'Bilhete de Sete Dias'){result = data.getTime() + 604800000}
    else if(req.params.tipo == 'Bilhete de Trinta Dias'){result = data.getTime() + 2592000000}
    let prox = new Date(result);

    let horario_atual = `${prox.getHours()}:${prox.getMinutes()}:${prox.getSeconds()}`;
    let data_atual = `${prox.getDate()}-${meses[prox.getMonth()]}-${prox.getFullYear()}`;

    //console.log(prox);
    res.render('uso', {codigo: req.params.codigo, tipo: req.params.tipo, data: data_atual, horario: horario_atual});
})
app.get('/home', function(req, res){
    res.sendFile(__dirname + "/html/tela_inicial.html");

    /*console.log(lista_bilhete);
    console.log(lista_recarga);
    console.log(lista_uso);*/
})
app.get('/recarga/:codigo?', function(req, res) {
    res.render('recarga', {codigo: req.params.codigo});
})
app.get('/gerar_bilhete', function(req, res) {
    res.sendFile(__dirname + "/html/tela_gerar_bilhete.html");
})
app.get('/termo', function(req, res){
    res.sendFile(__dirname + "/html/tela_termo.html");
})
app.get('/route/:codigo?', (req, res) => {
    res.redirect(`/gerenciamento/${req.params.codigo}`);
})



app.post('/voltar_relatorio', (req, res) => {
    res.redirect('/dig_cod/relatorio');
})
app.post('/voltar_rec/:codigo?', (req, res) => {
    res.redirect(`/recarga/${req.params.codigo}`);
})

app.post('/erro/:def?', (req, res) => {
    res.redirect(`/dig_cod/${req.params.def}`);
})

app.post('/form_gerar', function(req, res){
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


    bilhete.inclua(cod);
    bilhete.recupera_one(cod, lista_bilhete);
    let data = new Date();
    let horario_atual = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
    let data_atual = `${data.getDate()}-${meses[data.getMonth()]}-${data.getFullYear()}`;

    res.redirect(`/confirmacao_geracao/${cod}/${data_atual}/${horario_atual}`);
})

app.post('/form_recarga/:codigo?', function(req, res){
    //console.log(Verifica(lista_recarga, req.params.codigo, 2));
    //console.log(Verifica_Rec_Ativa(lista_recarga, lista_uso, req.params.codigo, req.body.salvar_tipo));
    if(Verifica(lista_recarga, req.params.codigo, 2)){
        if(Verifica_Rec_Ativa(lista_recarga, lista_uso, req.params.codigo, req.body.salvar_tipo) === false){
            recarga.inclua(req.params.codigo, req.body.salvar_tipo);
            recarga.recupera_one(req.params.codigo, lista_recarga);
            res.redirect(`/confirmacao_recarga`);
        }
        else{
            res.redirect(`/recarga_ja_jeita/${req.params.codigo}/${req.body.salvar_tipo}`);
        }
    }
    else{
        //console.log(lista_recarga);
        recarga.inclua(req.params.codigo, req.body.salvar_tipo);
        recarga.recupera_one(req.params.codigo, lista_recarga);
        res.redirect(`/confirmacao_recarga`);
    }
})

app.post('/form_codigo/:def?', (req, res) => {
    if(Verifica(lista_bilhete, req.body.cod_ger, 0)){
        if(req.params.def == 'relatorio'){
            res.redirect(`/route/${req.body.cod_ger}`);
        }
        else if(req.params.def == 'uso'){
            let uso_data = new Array();
            if(Verifica(lista_recarga, req.body.cod_ger, 2) == false){
                res.redirect('/error/uso/Nenhuma Recarga Ativa Foi Encontrada Para Este Bilhete!');
            }
            else{
                // let tipos = ['Bilhete Unico', 'Bilhete Duplo', 'Bilhete de Sete Dias', 'Bilhete de Trinta Dias'] 

                // for(let i = 0; i<tipos.length;i++){
                //     console.log(tipos[i])
                //     if(Verifica_Rec_Ativa(lista_recarga, lista_uso, req.body.cod_ger, tipos[i], false, uso_data) == 1 ){
                //         if(Verifica_Rec_Ativa(lista_recarga, lista_uso, req.body.cod_ger, tipos[i], true, uso_data, true) == 0){
                //             res.redirect(`/uso/${req.body.cod_ger}/${tipos[i]}/${uso_data[0]}`);
                //             break;
                //         }
                //     }
                //     else if( Verifica_Rec_Ativa(lista_recarga, lista_uso, req.body.cod_ger, tipos[i], false, uso_data) == 0){
                //         if(Verifica_Rec_Ativa(lista_recarga, lista_uso, req.body.cod_ger, tipos[i], true, uso_data) == 0){
                //             res.redirect(`/uso/${req.body.cod_ger}/${tipos[i]}/${uso_data[0]}`);
                //             break;
                //         }
                //     }
                // }

                if(Verifica_Rec_Ativa(lista_recarga, lista_uso, req.body.cod_ger, 'Bilhete Unico', true, uso_data)) {res.redirect(`/uso/${req.body.cod_ger}/Bilhete Unico/${uso_data[0]}`);}
                else if(Verifica_Rec_Ativa(lista_recarga, lista_uso, req.body.cod_ger, 'Bilhete Duplo', true, uso_data)) {res.redirect(`/uso/${req.body.cod_ger}/Bilhete Duplo/${uso_data[0]}`);}
                else if(Verifica_Rec_Ativa(lista_recarga, lista_uso, req.body.cod_ger, 'Bilhete de Sete Dias', true, uso_data)) {res.redirect(`/uso/${req.body.cod_ger}/Bilhete de Sete Dias/${uso_data[0]}`);}
                else if(Verifica_Rec_Ativa(lista_recarga, lista_uso, req.body.cod_ger, 'Bilhete de Trinta Dias', true, uso_data)) {res.redirect(`/uso/${req.body.cod_ger}/Bilhete de Trinta Dias/${uso_data[0]}`);}
                else{
                    res.redirect('/error/uso/Nenhuma Recarga Ativa Foi Encontrada Para Este Bilhete!');
                }
            }
        }
        else if(req.params.def == 'recarga'){
            res.redirect(`/recarga/${req.body.cod_ger}`);
        }
    }
    else{
        res.redirect(`/error/${req.params.def}/Código não encontrado!`);
    }
})

BD();
app.listen(8082); 