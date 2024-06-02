function translateCtoCpp(code) {
    const lines = code.split('\n');
    let result = [];
    let inStruct = false;
    
    for (let line of lines) {
        line = line.trim();
        
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

        if (line.startsWith('int ') || line.startsWith('float ') || line.startsWith('char ') || line.startsWith('double ')) {
            result.push(line);
            continue;
        }

        if (line.startsWith('if (') || line.startsWith('else if (') || line.startsWith('else {')) {
            result.push(line);
            continue;
        }

        if (line.startsWith('for (') || line.startsWith('while (') || line.startsWith('do {')) {
            result.push(line);
            continue;
        }

        if (line.startsWith('void ') || line.startsWith('int main(')) {
            result.push(line);
            continue;
        }

        result.push(line);
    }

    return indentCppCode(result.join('\n'));
}

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

const codeCpp = translateCtoCpp(codeC);
console.log(codeCpp);
