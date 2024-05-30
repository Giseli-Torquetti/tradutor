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
                cppCode += lines[i].trim() + '\n';
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

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
        let line = lines[lineNumber];

        if (line.trim().startsWith('struct')) {
            let linesInStruct = translateStruct(lineNumber);
            lineNumber += linesInStruct; continue;
        }

        if (line.trim().startsWith('fn main()')) {
            cppCode += 'void main() {\n'; continue;
        }

        if (line.includes('let')) {
            line = line.trim().replace('let ', '').replace('mut ', '');
            let oldLineProps = line.split(' ');
            let varName = oldLineProps[0].trim().replace(':', '');
            let varType = oldLineProps[1].trim();
            let hasDefaultValue = line.includes("=");
            line = `${typeMapping[varType]} ${varName}`
            if (hasDefaultValue) {
                line += ` = ${oldLineProps[1]}`
            }
            line += ";"
            cppCode += line + "\n";
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
            const match = line.match(/for (\w+) in (\d+)\.\.(\d+)/);
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
    }

    return cppCode;
}

// Exemplo de uso
const rustCode = `
struct Pessoa {
    idade: i32,
    nome: String,
}

fn main() {
    let mut x: i32 = 10;

    if x > 5 {
        println!("x is greater than 5");
    } else {
        println!("x is less than or equal to 5");
    }

    for i in 0..10 {
        println!("i: {}", i);
    }

    while x > 0 {
        println!("x: {}", x);
        x -= 1;
    }
}
`;

console.log(convertRustToCpp(rustCode));
