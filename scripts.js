window.addEventListener("load", (event) => {
    hljs.highlightAll();
    hljs.initLineNumbersOnLoad();
    document.querySelectorAll("pre #destino").forEach((el) => {
        hljs.highlightElement(el);
    });
    document.getElementById('btn-download').addEventListener("click", downloadCod);
    document.getElementById('btn-translate').addEventListener("click", translateCode);
});

function downloadCod() {

}

function translateCode() {
    var selectElement = document.getElementById("language");
    var selectedValue = selectElement.value;
    var text = document.getElementById("original-code").value;
    var translatedCode = selectedValue == "1" ? convertRustToCpp(text) : translateCtoCpp(text);
    document.getElementById("destino").textContent = translatedCode;
}