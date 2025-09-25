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
3.  **Uma rede Docker externa e "attachable"**: O Traefik precisa de uma rede compartilhada para se comunicar com os serviços que ele expõe. Geralmente, essa rede é chamada de `web` ou `traefik-public`. O nome `network_public` é usado nos exemplos abaixo.
    ```bash
    # Exemplo de como criar a rede, caso ainda não exista
    docker network create --driver=overlay --attachable network_public
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

**Antes de continuar, edite o arquivo `docker-compose.yml` e altere os seguintes valores se necessário:**

-   `nextengine.com.br`: Substitua pelo seu domínio real.
-   `letsencrypt`: Substitua pelo nome do seu "certresolver" configurado no Traefik.
-   `network_public`: Substitua pelo nome da sua rede Docker externa, se for diferente.

#### Passo 5: Construa a Imagem Docker

Diferente do `docker-compose up`, o `docker stack deploy` **não** constrói a imagem automaticamente. Precisamos construí-la primeiro. É uma boa prática usar versões específicas em vez de `:latest` para garantir que a versão correta seja implantada.

```bash
# O -t define o nome e a tag da imagem (nome:tag)
docker build -t nextengine:1.0 .
```

#### Passo 6: Implante o "Stack"

Agora que a imagem `nextengine:1.0` existe localmente (e o `docker-compose.yml` aponta para ela), podemos implantar o stack.

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
-   **Atualizar a aplicação:** Para implantar uma nova versão do código, o fluxo é simples e garante que o site não saia do ar (rolling update).
    
    1.  **Baixe as novas alterações** do repositório.
    2.  **Reconstrua a imagem Docker** com uma nova tag de versão.
    3.  **Atualize o `docker-compose.yml`** para usar a nova tag da imagem.
    4.  **Execute o deploy novamente**; o Swarm cuidará da atualização.

    ```bash
    # 1. Navegue até a pasta do projeto e puxe as alterações
    cd /caminho/para/nextengine
    git pull
    
    # 2. Reconstrua a imagem com uma nova tag de versão (boa prática)
    # Supondo que a versão anterior era 1.0, a nova pode ser 1.1
    docker build -t nextengine:1.1 .
    
    # 3. ATENÇÃO: Atualize a tag da imagem no seu arquivo docker-compose.yml
    # Troque 'image: nextengine:1.0' para 'image: nextengine:1.1'
    # Você pode fazer isso manualmente com um editor como 'nano' ou 'vim'.
    # Ex: nano docker-compose.yml
    
    # 4. Execute o deploy novamente para que o Swarm atualize o serviço
    docker stack deploy -c docker-compose.yml nextengine
    ```
-   **Remover o stack:**
    ```bash
    docker stack rm nextengine
    ```

### Solução de Problemas

-   **Erro de Certificado Inválido (`NET::ERR_CERT_AUTHORITY_INVALID`)**
    
    Este erro significa que o Traefik não conseguiu obter um certificado SSL da Let's Encrypt para seu domínio e está usando um certificado autoassinado. A causa mais comum é um problema de DNS.
    
    1.  **Verifique os apontamentos de DNS:** Conecte-se à sua VPS e use o comando `dig` para confirmar que seu domínio e o subdomínio `www` apontam para o IP correto do servidor.
        ```bash
        # Verifique o domínio principal
        dig seu-dominio.com.br +short

        # Verifique também o www
        dig www.seu-dominio.com.br +short
        ```
        Ambos os comandos devem retornar o endereço IP público da sua VPS. Se não retornarem, corrija os registros `A` no painel do seu provedor de domínio.
    2.  **Verifique os logs do Traefik:** Os logs do Traefik fornecerão a causa exata da falha.
        ```bash
        docker service logs -f <nome_do_serviço_traefik>
        ```

-   **Erro ao executar `git pull`**
    
    Se você receber o erro `error: The following untracked working tree files would be overwritten by merge...`, significa que você criou ou modificou um arquivo no servidor que o Git agora está tentando baixar.
    
    Para resolver de forma segura, renomeie seu arquivo local e tente novamente:
    ```bash
    # Exemplo: se o arquivo conflitante for docker-compose.yml
    mv docker-compose.yml docker-compose.yml.old
    
    # Agora, puxe as alterações novamente
    git pull
    ```
É isso! Sua aplicação agora está implantada de forma robusta e moderna.