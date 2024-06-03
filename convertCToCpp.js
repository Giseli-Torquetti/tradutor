// Função principal
function translateCtoCpp(code) {
    // Divide o código em linhas
    const lines = code.split('\n');
    let result = [];
    
    // Loop através de cada linha do código
    for (let line of lines) {
        // Tira espaços em branco no início e no fim da linha
        line = line.trim();

        // Substitui bibliotecas C por bibliotecas C++
        if (line.startsWith('#include <')) {
            result.push(line.replace('stdio.h', 'iostream').replace('stdlib.h', 'cstdlib'));
            continue;
        }

        // Mantém declarações de variáveis sem alteração
        if (line.startsWith('int ') || line.startsWith('float ') || line.startsWith('char ') || line.startsWith('double ')) {
            result.push(line);
            continue;
        }

        // Mantém estruturas de controle (if, else if, else)
        if (line.startsWith('if (') || line.startsWith('else if (') || line.startsWith('else {')) {
            result.push(line);
            continue;
        }

        // Mantém laços de repetição (for, while, do)
        if (line.startsWith('for (') || line.startsWith('while (') || line.startsWith('do {')) {
            result.push(line);
            continue;
        }

        // Mantém declarações de funções e a função main
        if (line.startsWith('void ') || line.startsWith('int main(')) {
            result.push(line);
            continue;
        }

        // Converte printf para std::cout
        if (line.includes('printf(')) {
            // Manipula %s e %d múltiplos com \n
            // Transforma printf("texto %s texto %d texto\n", var1, var2);
            // em std::cout << "texto " << var1 << " texto " << var2 << " texto" << std::endl;
            line = line.replace(
                /printf\("([^%]*)%s([^%]*)%d([^%]*)\\n",\s*([^,]+),\s*([^;]+)\);/g,
                'std::cout << "$1" << $4 << "$2" << $5 << "$3" << std::endl;'
            );
            line = line.replace(
                /printf\("([^%]*)%d([^%]*)%s([^%]*)\\n",\s*([^,]+),\s*([^;]+)\);/g,
                'std::cout << "$1" << $4 << "$2" << $5 << "$3" << std::endl;'
            );

            // %d e %s com \n
            // Transforma printf("texto %d texto\n", var1);
            // em std::cout << "texto " << var1 << " texto" << std::endl;
            line = line.replace(
                /printf\("([^%]*)%d([^%]*)\\n",\s*([^;]+)\);/g,
                'std::cout << "$1" << $3 << "$2" << std::endl;'
            );
            // Transforma printf("texto %s texto\n", var1);
            // em std::cout << "texto " << var1 << " texto" << std::endl;
            line = line.replace(
                /printf\("([^%]*)%s([^%]*)\\n",\s*([^;]+)\);/g,
                'std::cout << "$1" << $3 << "$2" << std::endl;'
            );

            // %d e %s sem \n
            // Transforma printf("texto %d texto", var1);
            // em std::cout << "texto " << var1 << " texto";
            line = line.replace(
                /printf\("([^%]*)%d([^%]*)",\s*([^;]+)\);/g,
                'std::cout << "$1" << $3 << "$2";'
            );
            // Transforma printf("texto %s texto", var1);
            // em std::cout << "texto " << var1 << " texto";
            line = line.replace(
                /printf\("([^%]*)%s([^%]*)",\s*([^;]+)\);/g,
                'std::cout << "$1" << $3 << "$2";'
            );

            // strings simples com \n
            // Transforma printf("texto\n");
            // em std::cout << "texto" << std::endl;
            line = line.replace(
                /printf\("([^%]*)\\n"\);/g,
                'std::cout << "$1" << std::endl;'
            );

            // strings simples sem \n
            // Transforma printf("texto");
            // em std::cout << "texto";
            line = line.replace(
                /printf\("([^%]*)"\);/g,
                'std::cout << "$1";'
            );

            result.push(line);
            continue;
        }


        // Converte scanf para std::cin
        if (line.includes('scanf(')) {
            line = line.replace(/scanf\("%d",\s*&([^;]+)\);/g, 'std::cin >> $1;');
            line = line.replace(/scanf\("%s",\s*([^;]+)\);/g, 'std::cin >> $1;');
            result.push(line);
            continue;
        }

        // Converte malloc para new
        if (line.includes('malloc(')) {
            line = line.replace(/struct\s+(\w+)\*\s+(\w+)\s*=\s*\(struct\s+\w+\*\)\s*malloc\(([^;]+)\s*\*\s*sizeof\s*\(\s*struct\s+\w+\s*\)\);/, '$1* $2 = new $1[$3];');
            result.push(line);
            continue;
        }


        // Converte free para delete[]
        if (line.includes('free(')) {
            line = line.replace(/free\(([^;]+)\);/, 'delete[] $1;');
            result.push(line);
            continue;
        }

        // Adiciona a linha ao resultado final sem modificações
        result.push(line);
    }
    // Chama a função para ajustar a indentação do código C++
    return indentCppCode(result.join('\n'));
}

// Função para ajustar a indentação do código C++
function indentCppCode(code) {
    // Divide o código em linhas
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentSize = 4;  // Tamanho da indentação
    const indentChar = ' ';  // Caractere de indentação (espaço)

    // Adiciona indentação adequada a cada linha
    const indentedLines = lines.map(line => {
        line = line.trim();
        if (line.endsWith('}') || line.startsWith('}')) {
            indentLevel--;
        }
        const indent = indentChar.repeat(Math.max(0, indentLevel * indentSize));
        const indentedLine = indent + line;

        if (line.endsWith('{')) {
            indentLevel++;
        }

        return indentedLine;
    });
    return indentedLines.join('\n');
}

// Exemplo de código C para tradução
const codeC = `
#include <stdio.h>
#include <stdlib.h>

struct Pessoa {
    char nome[50];
    int idade;
};

int main() {
    int numPessoas;
    
    printf("Quantas pessoas deseja cadastrar? ");
    scanf("%d", &numPessoas);
    
    struct Pessoa* pessoas = (struct Pessoa*)malloc(numPessoas * sizeof(struct Pessoa));
    
    for (int i = 0; i < numPessoas; i++) {
        printf("Digite o nome da pessoa %d: ", i + 1);
        scanf("%s", pessoas[i].nome);
        printf("Digite a idade da pessoa %d: ", i + 1);
        scanf("%d", &pessoas[i].idade);
    }
    
    for (int i = 0; i < numPessoas; i++) {
        printf("%s é ", pessoas[i].nome);
        if (pessoas[i].idade >= 18) {
            printf("maior de 18 anos\\n");
        } else {
            printf("menor de 18 anos\\n");
        }
    }
    
    free(pessoas);
    
    return 0;
}
`;

// Traduz o código C para C++
const codeCpp = translateCtoCpp(codeC);
// log para testes mais rápidos
console.log(codeCpp);
