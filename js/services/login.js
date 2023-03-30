async function login(username, password) {
    const endpoint = 'http://localhost:8000/fincasapi/v1/login'

    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    };

    const response = await fetch(endpoint, requestOptions)
    const responseJson = await response.json()

    if(responseJson['No Authenticate'] === undefined){
        localStorage.setItem('user', JSON.stringify(responseJson));
        window.location.href = "index.html";
    }else{
        alert(responseJson['No Authenticate']);
    }
}
