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

function indentCppCode(code) {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentSize = 4;
    const indentChar = ' ';

    const indentedLines = lines.map(line => {
        line = line.trim();
        if (line.endsWith('}') || line.startsWith('}')) {
            indentLevel--;
        }

        const indent = indentChar.repeat(indentLevel * indentSize);

        const indentedLine = indent + line;

        if (line.endsWith('{')) {
            indentLevel++;
        }

        return indentedLine;
    });

    return indentedLines.join('\n');
}