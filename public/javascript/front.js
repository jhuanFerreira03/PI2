//  ALL

function Voltar_Princ(){
    window.location.href = '/home';
}

function Voltar_Cod(def){
    window.location.href = `/dig_cod/${def}`;
}

function Voltar_Recarga(cod){
    window.location.href = `/recarga/${cod}`;
}


//  TELA TERMO

function avancar_termo(){
    window.location.href = '/gerar_bilhete';
}


//  TELA GERAR

function Gerar_Bilhete(){
       /* let meses = new Array();
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
        let result = Math.floor(Math.random() * (10000 - 1000) + 1000);
        document.getElementById('codigo_bilhete').innerHTML = result;
        document.getElementById('inp_cod').value = result;
        let data = new Date();
        let data_atual = `${data.getDate()}-${meses[data.getMonth()]}-${data.getFullYear()}`;
        let horario_atual = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
        document.getElementById('data_bilhete').value = data_atual;
        document.getElementById('dat_bilhete').innerHTML = `Gerado em: <span style="color: #01DF01;">${data_atual}</span> às <span style="color: #01DF01;">${horario_atual}</span>`;
        window.location.href = '/tela_inicial.html';*/
}


//  TELA RECARGA


function Escolher(nome){
    document.getElementById('40_min').style.border = '3px solid #01A9DB';
    document.getElementById('duplo').style.border = '3px solid #01A9DB';
    document.getElementById('7_dias').style.border = '3px solid #01A9DB';
    document.getElementById('30_dias').style.border = '3px solid #01A9DB';
    if(nome == '40_min'){
        document.getElementById('salvar_tipo').value = 'Bilhete Unico';
        document.getElementById('salvar_valor').value = 10;
    }
    if(nome == 'duplo'){
        document.getElementById('salvar_tipo').value = 'Bilhete Duplo';
        document.getElementById('salvar_valor').value = 15;
    }
    if(nome == '7_dias'){
        document.getElementById('salvar_tipo').value = 'Bilhete de Sete Dias';
        document.getElementById('salvar_valor').value = 20;
    }
    if(nome == '30_dias'){
        document.getElementById('salvar_tipo').value = 'Bilhete de Trinta Dias';
        document.getElementById('salvar_valor').value = 25;
    }
    document.getElementById(nome).style.border = '7px solid #3ADF00';
    document.getElementById('tipo_recarga').innerHTML = nome;
}

function Abrir(nome, cod){
    document.getElementById('cod_re').value = cod;
    if(document.getElementById('salvar_tipo').value == 0){
        alert("Escolha o tipo da recarga!");
        return;
    }
    document.getElementById(nome).style.display = 'block';
    document.getElementById('confirma_codigo').innerHTML = `Codigo do Bilhete: <span class="azul">${document.getElementById('cod_re').value}</span>`;
    document.getElementById('confirma_tipo').innerHTML = `Tipo de Recarga: <span class="azul">${document.getElementById('salvar_tipo').value}</span>`;
    document.getElementById('confirma_valor').innerHTML = `Valor: <span class="azul">R$${document.getElementById('salvar_valor').value},00</span>`;
    Data();
}

function Fechar(nome){
    document.getElementById(nome).style.display = 'none';
}

function Data(){
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
    let data = new Date();
    let data_atual = `${data.getDate()}-${meses[data.getMonth()]}-${data.getFullYear()}`;
    let horario_atual = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
    document.getElementById('salvar_data').value = data_atual;
    document.getElementById('data_escolha').innerHTML = `Recarga efetuada em: <span style="color: #01DF01;">${data_atual}</span> às <span style="color: #01DF01;">${horario_atual}</span>`;
}

function imp_recarga(i_d, i_d2){
    document.getElementById(i_d).addEventListener('input', () => {
        let n = document.getElementById(i_d).value;
        if(n.length != 4){
            document.getElementById('cod_ger').style.borderColor = 'red';
            document.getElementById(i_d2).disabled = true;
        }
        else{
            document.getElementById('cod_ger').style.borderColor = '#01A9DB';
            document.getElementById(i_d2).disabled = false;
        }
    })
}
function imp_recarga1(){
    if(document.getElementById('cod_ger').value.length != 4){
        document.getElementById('cod_ger').style.borderColor = 'red';
        return;
    }
    else{
        document.getElementById('cod_ger').style.borderColor = '#01A9DB';
        document.getElementById('btn_imp_recarga').setAttribute('disable', 'false');
    }
    let ver = false;
    for(let i = 0; i<lista.length; i++){
        if(document.getElementById('cod_ger').value == lista[i][0]){
            document.write(lista[i]);
            ver = true;
        }
    }
    if(ver === true){
        document.getElementById('btn_imp_recarga').submit() = false;
    }
}