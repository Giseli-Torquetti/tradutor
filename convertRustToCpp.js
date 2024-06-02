function convertRustToCpp(rustCode) {
    const lines = rustCode.split('\n');
    let cppCode = '#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\n';
    const typeMapping = {
        'i32': 'int',
        'f64': 'double',
        'bool': 'bool',
        'String': 'string',
    };

    function translateStruct(structStartLine) {
        let lineCount = 0;
        cppCode += lines[structStartLine].trim() + '\n';
        for (let i = structStartLine + 1; ; i++) {
            lineCount++;
            if (lines[i].trim() == '}') {
                cppCode += lines[i].trim() + ';' + '\n';
                break;
            }
            let oldLine = lines[i];
            let oldLineProps = oldLine.split(':');
            let propName = oldLineProps[0].trim();
            let propType = oldLineProps[1].trim().replace(',', '');
            cppCode += `${typeMapping[propType]} ${propName};\n`
        }
        return lineCount;
    }

    function findVariableType(rustCode, varName) {
        const rustLines = rustCode.split('\n');
        const regex = new RegExp(`let\\s+mut?\\s+${varName}\\s*:\\s*([^;]+);`);
        for (const line of rustLines) {
            const match = line.trim().match(regex);
            if (match) {
                return typeMapping[match[1].split(" = ")[0].trim()];
            }
        }
        return null;
    }

    function converterAdicaoArrayRustParaCpp(linhaRust) {
        const regexAdicaoArrayRust = /([a-zA-Z0-9_]+)\.push\(([A-Za-z_{} ,]+)\);/;
        const match = linhaRust.match(regexAdicaoArrayRust);
        if (match) {
            const arrayNome = match[1];
            let valores = match[2].replace(/[{}]/g, '').split(',').map(valor => valor.trim());
            const variaveis = valores.slice(1).map(valor => valor.trim().split(' ')[0]);
            variaveis.push(valores[0].split(`  `)[1].trim());
            let operacaoCpp = '';
            for (let i = 0; i < variaveis.length; i++) {
                operacaoCpp += `${arrayNome}[i].${variaveis[i]} = ${variaveis[i]};\n`;
            }
            return operacaoCpp;
        }
        return null;
    }

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
        let line = lines[lineNumber];

        if (line.trim().startsWith('struct')) {
            let linesInStruct = translateStruct(lineNumber);
            lineNumber += linesInStruct; continue;
        }

        if (line.startsWith("fn ")) {
            if (line.startsWith("fn main")) {
                line = line.replace("fn main", "int main");
                line = line.replace("->", "");
                line = line.replace("{", "{");
                cppCode += line.trim() + "\n"; continue;
            } else {
                line = line.replace("fn ", "void ");
                line = line.replace("->", "");
                line = line.replace("{", "{");
                cppCode += line.trim() + "\n"; continue;
            }
        }

        const vetorStructRegex = /let mut (\w+): Vec<(\w+)> = Vec::with_capacity\((\w+)\);/;
        if (vetorStructRegex.test(line)) {
            const [, nomeVariavel, tipoStruct, capacidade] = line.match(vetorStructRegex);
            let newLine = `struct ${tipoStruct}* ${nomeVariavel} = (struct ${tipoStruct}*)malloc(${capacidade} * sizeof(struct ${tipoStruct}));`;
            cppCode += newLine + '\n'; continue;
        }

        if (line.includes('let')) {
            line = line.trim().replace('let ', '').replace('mut ', '');
            let oldLineProps = line.split(' ');
            let varName = oldLineProps[0].trim().replace(':', '');
            let varType = oldLineProps[1].trim();
            let hasDefaultValue = line.includes("=");
            line = `${typeMapping[varType]} ${varName}`
            if (hasDefaultValue) {
                if (oldLineProps[3].includes('String') && oldLineProps[3].includes('new')) {
                    line += ` = ""`;
                }
                else {
                    line += ` = ${oldLineProps[3].replace(";", "")}`
                }
            }
            line += ";"
            cppCode += line.trim() + "\n";
            continue;
        }

        if (line.trim().startsWith('if ')) {
            line = line.replace('if ', 'if (').replace('{', ') {');
            cppCode += line.trim() + '\n'; continue;
        }
        if (line.trim().startsWith('else if ')) {
            line = line.replace('else if ', 'else if (').replace('{', ') {');
            cppCode += line.trim() + '\n'; continue;
        }
        if (line.trim().startsWith('else')) {
            if (line.trim() === 'else') {
                line += ' {';
            }
            cppCode += line.trim() + '\n'; continue;
        }
        if (line.trim().startsWith('while ')) {
            line = line.replace('while ', 'while (').replace('{', ') {');
            cppCode += line.trim() + '\n'; continue;
        }
        if (line.trim().startsWith("for ")) {
            const match = line.match(/for (\w+) in (\d+)\.\.(\w+)/);
            if (match) {
                const varName = match[1];
                const start = match[2];
                const end = match[3];
                line = `for (int ${varName} = ${start}; ${varName} < ${end}; ++${varName}) {`;
                cppCode += line.trim() + '\n'; continue;
            }
        }
        if (line.trim() == '}') {
            cppCode += '}\n'; continue;
        }
        if (line.trim() == "") {
            cppCode += '\n'; continue;
        }

        if (line.includes('println!')) {
            const conteudo = line.match(/println!\((.*)\);/);
            if (conteudo) {
                let texto = conteudo[1];
                texto = texto.replace(/"\s*\+\s*/g, ' ').replace(/{}/g, '%d');
                line = line.replace(/println!\((.*)\);/, `printf(${texto}); printf("\\n");`);
                cppCode += line.trim() + '\n'; continue;
            }
        }

        if (line.includes('read_line')) {
            const variavel = line.match(/&mut (\w+)/);
            if (variavel) {
                var tipo = findVariableType(rustCode, variavel[1].trim());
                line = line.replace(/std::io::stdin\(\).read_line\(&mut \w+\)\.expect\(.*\);/, `scanf(${tipo == `int` ? `"%d"` : `"%s"`}, &${variavel[1]});`);
            }
            cppCode += line.trim() + '\n'; continue;
        }

        if (line.includes('.push')) {
            var codigo = converterAdicaoArrayRustParaCpp(line);
            cppCode += codigo + '\n'; continue;
        }

        cppCode += line.trim() + '\n';
    }

    return indentCppCode(cppCode);
}

const rustCode = `
struct Pessoa {
    idade: i32,
    nome: String,
}

fn main() {
    let mut x: i32 = 0;
    println!("Digite o numero de pessoas: ");
    std::io::stdin().read_line(&mut x).expect("Falha ao ler linha");

    let mut pessoas: Vec<Pessoa> = Vec::with_capacity(x);
    
    println!("cadastrando {} pessoas", x);

    for i in 0..x {
        println!("Digite o nome da pessoa {}: ", i + 1);
        let mut nome: String = String::new();
        std::io::stdin().read_line(&mut nome).expect("Erro ao ler entrada.");

        println!("Digite a idade da pessoa {}: ", i + 1);
        let mut idade: i32 = 0;
        std::io::stdin().read_line(&mut idade).expect("Erro ao ler entrada.");

        pessoas.push(Pessoa { nome, idade });
    }

    for i in 0..x {
        if pessoas[i].idade >= 18 {
            println!("{} é maior de idade", pessoas[i].nome);
        } else {
            println!("{} é menor de idade", pessoas[i].nome);
        }
    }
}
`;

console.log(convertRustToCpp(rustCode));
