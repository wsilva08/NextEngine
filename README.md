# Next Engine - Guia de Deploy com Docker Swarm e Traefik

Este guia fornece instruções sobre como implantar a landing page da Next Engine em um ambiente de produção moderno usando **Docker Swarm** como orquestrador e **Traefik** como proxy reverso e gerenciador de SSL.

Este método oferece descoberta automática de serviços, balanceamento de carga e renovação de certificados SSL de forma automatizada.

## Desenvolvimento Local

Para rodar o projeto em sua máquina local para desenvolvimento, siga os passos abaixo.

1.  **Pré-requisitos**:
    *   [Node.js](https://nodejs.org/) (versão 20 ou superior)
    *   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

2.  **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/nextengine.git
    cd nextengine
    ```

3.  **Instale as dependências**:
    ```bash
    npm install
    ```

4.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
    O site estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal). O servidor recarregará automaticamente a página sempre que você salvar uma alteração nos arquivos.

---

## Deploy em Produção com Docker Swarm

### Pré-requisitos

Antes de começar, certifique-se de que seu ambiente na VPS (Hetzner, etc.) atende aos seguintes requisitos:

1.  **Docker e Docker Swarm inicializado**: O Docker deve estar instalado e o modo Swarm ativado (`docker swarm init`).
2.  **Traefik rodando como um serviço Swarm**: Você já deve ter o Traefik configurado e implantado no seu cluster Swarm.
3.  **Uma rede Docker externa e "attachable"**: O Traefik precisa de uma rede compartilhada para se comunicar com os serviços que ele expõe. Geralmente, essa rede é chamada de `web` ou `traefik-public`.
    ```bash
    # Exemplo de como criar a rede, caso ainda não exista
    docker network create --driver=overlay --attachable web
    ```
4.  **Um nome de domínio** apontando para o endereço IP do seu nó manager do Swarm.

### Estrutura de Arquivos

Para este deploy, vamos precisar de 3 arquivos na raiz do projeto:

1.  `Dockerfile`: Define como construir a imagem da nossa aplicação.
2.  `docker-compose.yml`: Define o serviço para ser implantado no Swarm (chamado de "stack").
3.  `nginx/nginx.conf`: Uma configuração simples do Nginx para servir os arquivos estáticos dentro do container.

### Passos para o Deploy

#### Passo 1: Conecte-se ao seu VPS e Clone o Repositório

Conecte-se ao seu servidor (que é um manager do Swarm) e clone o projeto.

```bash
# Conecte-se via SSH
ssh usuario@seu_ip_de_servidor

# Clone o repositório do projeto
git clone sua_url_do_repositorio nextengine
cd nextengine
```

#### Passo 2: Crie o `Dockerfile`

Este arquivo irá construir uma imagem Docker otimizada para produção, contendo os arquivos compilados do Vite e um servidor Nginx leve para servi-los.

Crie um arquivo chamado `Dockerfile` na raiz do projeto com o seguinte conteúdo:

```dockerfile
# Estágio 1: Build da aplicação com Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências e instala
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Executa o build com Vite
RUN npm run build

# Estágio 2: Servidor de produção com Nginx
FROM nginx:1.25-alpine

# Copia os arquivos compilados do estágio de build para o diretório do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração customizada do Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d

# Expõe a porta 80 para o tráfego interno do Docker
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Passo 3: Crie a Configuração do Nginx

O `Dockerfile` acima precisa de um arquivo de configuração para o Nginx.

1.  Crie o diretório `nginx`:
    ```bash
    mkdir nginx
    ```
2.  Crie o arquivo `nginx/nginx.conf` com o conteúdo abaixo:
    ```nginx
    server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            # Essencial para que o roteamento de Single Page Applications funcione corretamente
            try_files $uri $uri/ /index.html;
        }
    }
    ```

#### Passo 4: Prepare o `docker-compose.yml` para o Swarm

O arquivo `docker-compose.yml` (já incluído neste repositório) define como o Docker Swarm deve executar nosso serviço.

**Antes de continuar, edite o arquivo `docker-compose.yml` e altere os seguintes valores:**

-   `seu-dominio.com.br`: Substitua pelo seu domínio real.
-   `myresolver`: Substitua pelo nome do seu "certresolver" configurado no Traefik (ex: `letsencrypt`).
-   `web`: Substitua pelo nome da sua rede Docker externa, se for diferente.

#### Passo 5: Construa a Imagem Docker

Diferente do `docker-compose up`, o `docker stack deploy` **não** constrói a imagem automaticamente. Precisamos construí-la primeiro.

```bash
# O -t define o nome e a tag da imagem (nome:tag)
docker build -t nextengine:latest .
```

#### Passo 6: Implante o "Stack"

Agora que a imagem `nextengine:latest` existe localmente, podemos implantar o stack. O Swarm irá utilizá-la para criar o serviço.

```bash
docker stack deploy -c docker-compose.yml nextengine
```

-   `-c docker-compose.yml`: Especifica o arquivo de composição.
-   `nextengine`: É o nome que daremos ao nosso "stack" (conjunto de serviços).

O Swarm agora irá garantir que o serviço esteja sempre rodando. O Traefik detectará as labels do novo serviço, solicitará um certificado SSL para o seu domínio e começará a rotear o tráfego para o container da sua aplicação.

### Verificação e Manutenção

-   **Verificar o status do serviço:**
    ```bash
    docker stack services nextengine
    ```
-   **Verificar os logs da aplicação:**
    ```bash
    # O nome do serviço geralmente é <stack_name>_<service_name>
    docker service logs -f nextengine_nextengine-app
    ```
-   **Atualizar a aplicação:** Para implantar uma nova versão, o fluxo é o mesmo: puxe as alterações, reconstrua a imagem e faça o deploy novamente. O Docker Swarm cuidará da atualização de forma gradual (rolling update) e sem tempo de inatividade.
    ```bash
    # Navegue até a pasta do projeto
    cd /caminho/para/nextengine
    
    # Puxe as novas alterações
    git pull
    
    # Reconstrua a imagem com as alterações
    docker build -t nextengine:latest .
    
    # Execute o deploy novamente para que o Swarm atualize o serviço
    docker stack deploy -c docker-compose.yml nextengine
    ```
-   **Remover o stack:**
    ```bash
    docker stack rm nextengine
    ```

É isso! Sua aplicação agora está implantada de forma robusta e moderna.
