window.addEventListener("load", (event) => {
    hljs.highlightAll();
    hljs.initLineNumbersOnLoad();
    document.querySelectorAll("pre #destino").forEach((el) => {
        hljs.highlightElement(el);
    });
    document.getElementById('btn-download').addEventListener("click", downloadCod);
    document.getElementById('btn-translate').addEventListener("click", translateCode);
});

function downloadCod(){

}

function translateCode(){

}