function translateCtoCpp(code) {
    const lines = code.split('\n');
    let result = [];
    let inStruct = false;
    
    for (let line of lines) {
        line = line.trim();
        
        // Traduzir structs
        if (line.startsWith('struct ')) {
            if (line.endsWith('{')) {
                inStruct = true;
                result.push(line);
            } else {
                result.push(line);
            }
            continue;
        }

        if (inStruct) {
            result.push(line);
            if (line.endsWith('};')) {
                inStruct = false;
            }
            continue;
        }

        // Traduzir variáveis e arrays
        if (line.startsWith('int ') || line.startsWith('float ') || line.startsWith('char ') || line.startsWith('double ')) {
            result.push(line);
            continue;
        }

        // Traduzir condicionais if/else
        if (line.startsWith('if (') || line.startsWith('else if (') || line.startsWith('else {')) {
            result.push(line);
            continue;
        }

        // Traduzir loops
        if (line.startsWith('for (') || line.startsWith('while (') || line.startsWith('do {')) {
            result.push(line);
            continue;
        }

        // Traduzir funções (incluindo main)
        if (line.startsWith('void ') || line.startsWith('int main(')) {
            result.push(line);
            continue;
        }

        // Outros casos
        result.push(line);
    }

    // Adicionar return 0 no main se não estiver presente
    let mainFunctionFound = false;
    for (let i = 0; i < result.length; i++) {
        if (result[i].includes('int main')) {
            mainFunctionFound = true;
            let mainBodyStart = result.indexOf(result[i]) + 1;
            let mainBodyEnd = result.indexOf('}', mainBodyStart);
            let mainBody = result.slice(mainBodyStart, mainBodyEnd);
            result = [...result.slice(0, mainBodyStart), ...mainBody, ...result.slice(mainBodyEnd)];
            break;
        }
    }

    return result.join('\n');
}

// Exemplo de uso
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
        printf("%s tem %d anos e é ", pessoas[i].nome, pessoas[i].idade);
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

const codeCpp = translateCtoCpp(codeC);
console.log(codeCpp);
