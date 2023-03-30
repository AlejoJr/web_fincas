
function GetToken() {
    const tokenString = localStorage.getItem('user');
    const userToken = JSON.parse(tokenString);
    return userToken?.token;
}

$(document).ready(function(){
    const objUser = localStorage.getItem('user');
    const userJson = JSON.parse(objUser);

    setTimeout(() => {
        $('#idNameFinca').text(userJson.nombre_finca);
        console.log(userJson.nombre_finca);
        $('#data').jstree({
            'core': {
                'check_callback': true,
                'data': {
                    'type': 'POST',
                    'url': function (node) {
                        return 'http://localhost:8000/fincasapi/v1/scanDirectory/'; // API endpoint
                    },
                    'headers': { "Authorization": 'Token ' + GetToken() },
                    'dataType': 'json',
                    'contentType': 'application/json',
                    'data': function (node) {
                        console.log('Nodo: ', node);
                        return JSON.stringify({
                            "actual_dir": node,
                            "finca": userJson.is_superuser === true ? $('#fincasID').val() : userJson.cod_finca
                        });
                    }
                }
            },
            "types": {
                "folder": {
                    "icon": "jstree-icon jstree-folder"
                },
                "file": {
                    "icon": "jstree-icon jstree-file"
                }
            },
            "plugins": ["types"]
    
        });
    }, "500");
    
    // -> D E T E C T A - C L I C K - E N - U N - N O D O <-
    $('#data').bind("select_node.jstree", function (e, data) {
        var url = data.node.a_attr.href;

        // Habilita/Deshabilita los Botones
        if(data.node.type === "file" ){
            $("#CrearCarpetaId").attr("disabled", true).addClass("ui-state-disabled");
            $("#EliminarCarpetaId").attr("disabled", true).addClass("ui-state-disabled");
            window.open(url, '_blank'); //<- Abre o Descarga el file
        }else if (data.node.parent === "#"){
            $("#CrearCarpetaId").attr("disabled", false).removeClass("ui-state-disabled");
            $("#EliminarCarpetaId").attr("disabled", true).addClass("ui-state-disabled");
        }else{
            $("#CrearCarpetaId").attr("disabled", false).removeClass("ui-state-disabled");
            $("#EliminarCarpetaId").attr("disabled", false).removeClass("ui-state-disabled");
        }

    });

    // -> E V E N T O S - Crear nueva Carpeta <-   
    $( "#CrearCarpetaId" ).button().on( "click", function() {
        var node = getNodeSelected();
        $('#pathFolderSelected').html("Ruta: <b>" + node.text + '/' + "</b>");
        $('#nameFolder').val('');
        $('#nameFolder').removeClass('is-invalid');
    });
    $("#crear").button().on("click", async function(){
        console.log('si clicl')
        if(await addFolder()){
            console.log('Se creo la carpeta');
            $('#data').jstree(true).refresh();
            $('#modalNewFolder').modal('hide');
        }
    });

    // -> E V E N T O S - Eliminar Carpeta <-
    $( "#EliminarCarpetaId" ).button().on( "click", function() {
        var node = getNodeSelected();
        console.log(node)
        $('#idConfirm').html(
            "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='#EA0404' class='bi bi-exclamation-circle' viewBox='0 0 16 16'>" +
                "<path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z'/>" +
            "<path d='M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z'/>" +
            "</svg>" +
        "<br> Carpeta a eliminar: <b>" + node.text + "</b>" + "<br> Esta seguro de eliminar la carpeta con todos sus archivos" );
    });
    $("#eliminar").button().on("click", async function(){
        if(await deleteFolder()){
            $('#data').jstree(true).refresh();
            $('#modalDeleteFolder').modal('hide');
        }
    });
    
    // Cargar el arbol de la finca seleccionada
    $('#fincasID').change(function () { 
        $('#data').jstree(true).refresh();
    });

});

// -> C R E A R - N U E V A - C A R P E T A <-
async function addFolder() {
    if(!$('#nameFolder').val()){
        $('#nameFolder').addClass( "is-invalid");
        return false;
    }else{
        var nameNewFolder = $('#nameFolder').val();
        var node = getNodeSelected();

        const endpoint = 'http://localhost:8000/fincasapi/v1/createNewFolder/'
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', Authorization: "Token " + GetToken()},
            body: JSON.stringify({nameNewFolder, node})
        };
    const response = await fetch(endpoint, requestOptions)
    const responseJson = await response.json()

    if(responseJson[0]['status'] === 'OK'){
        return true;
    }else if(responseJson[0]['status'] === 'ERROR'){
        alert(responseJson[0]['message'] + '\n' + responseJson[0]['error']);
        return false
    }
    }
  }

  // -> E L I M I N A R - C A R P E T A <-
async function deleteFolder(){
    var node = getNodeSelected();

    const endpoint = 'http://localhost:8000/fincasapi/v1/deleteFolder/'
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: "Token " + GetToken()},
        body: JSON.stringify({node})
    };

    const response = await fetch(endpoint, requestOptions)
    const responseJson = await response.json()

    if(responseJson[0]['status'] === 'OK'){
        return true;
    }else if(responseJson[0]['status'] === 'ERROR'){
        alert(responseJson[0]['message'] + '\n' + responseJson[0]['error']);
        return false
    }
}

  // -> O B T E N E R - N O D O - S E L E C C I O N A D O <-
  function getNodeSelected(){
    var selected = $('#data').jstree('get_selected');
    var node = $('#data').jstree('get_node', selected);
    return node;
  }

// -> V A L I D A R - C A R A C T E R E S - E S P E C I A L E S  <-
  function check(e) {
    tecla = (document.all) ? e.keyCode : e.which;

    //Tecla de retroceso para borrar, siempre la permite
    if (tecla == 8) {
        return true;
    }

    // Patrón de entrada, en este caso solo acepta numeros y letras
    patron = /[A-Za-z0-9]/;
    tecla_final = String.fromCharCode(tecla);
    return patron.test(tecla_final);
}