
$(document).ready(function(){

    $('#btnLogin').click(function(event){
        event.preventDefault();
        var user = $('#idUsuario').val();
        var pass = $('#idContraseña').val();

        if(user === '' || pass === ''){
            alert('Ingrese usuario y contraseña');
        }else{
            login(user, pass);
            //window.location.href = 'index.html';
        }
    });

    /*$('#btnCarpeta').click(function(event){
        event.preventDefault();
        var nameCarpeta = $('#carpeta').val();
        miFuncionJs(nameCarpeta);
    });*/
 });



