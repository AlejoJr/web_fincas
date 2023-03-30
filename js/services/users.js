function GetToken() {
  const tokenString = localStorage.getItem("user");
  const userToken = JSON.parse(tokenString);
  return userToken?.token;
}

$(document).ready(function () {
    const user = localStorage.getItem("user");
    if (user === null) {
        window.location.href = "login.html";
    } else {
        const userJson = JSON.parse(user);
        if (userJson.is_superuser === true) {
            $("#nameFincaId").hide();
            $.ajax({
                url: "http://localhost:8000/fincasapi/v1/users/",
                type: "get",
                dataType: "json",
                headers: { Authorization: "Token " + GetToken() },
                contentType: "application/json",
                success: function (response) {
                    console.log('Fincas: ',response.results);
                    $("#fincasID").empty();
                    for (var i = 0; i < response.count; i++) {
                        if (response.results[i]["is_superuser"] === false) {
                            var id = response.results[i]["cod_finca"];
                            var name = response.results[i]["nombre_finca"];
                            $("#fincasID").append("<option value='" + id + "'>" + name + "</option>");
                        }
                    }
                },
            });
        } else {
            $("#nameFincaId").text(userJson.nombre_finca);
            $("#fincasID").hide();
        }
    }
});
