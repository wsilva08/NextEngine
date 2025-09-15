# Next Engine - Guia de Deploy (Versão Vite)

Este guia fornece instruções sobre como compilar e implantar a landing page da Next Engine em um Servidor Virtual Privado (VPS), como os oferecidos pela Hetzner, Vultr ou DigitalOcean.

Este projeto utiliza o **Vite** para compilar e empacotar os recursos da aplicação (TypeScript, CSS). O novo processo de deploy envolve a compilação dos arquivos estáticos localmente no servidor e, em seguida, servi-los com o Nginx.

## Pré-requisitos

Antes de começar, certifique-se de que você possui:

1.  **Um VPS com uma distribuição Linux** (ex: Ubuntu 22.04).
2.  **Acesso SSH** ao seu VPS com um usuário que tenha privilégios `sudo`.
3.  **Um nome de domínio** (opcional, mas recomendado para um ambiente de produção).

## Passos para o Deploy

Siga estes passos para implantar a aplicação em seu servidor.

### Passo 1: Conecte-se ao seu VPS

Abra seu terminal e conecte-se ao seu servidor via SSH. Substitua `usuario` pelo seu nome de usuário e `seu_ip_de_servidor` pelo endereço IP do seu VPS.

```bash
ssh usuario@seu_ip_de_servidor
```

### Passo 2: Instale o Software Necessário

Primeiro, atualize a lista de pacotes do seu servidor. Em seguida, precisamos instalar o **Nginx** (servidor web), **Node.js** e **npm** (para compilar o projeto) e o **Git** (para obter o código).

```bash
# Atualiza as listas de pacotes
sudo apt update && sudo apt upgrade -y

# Instala o Nginx
sudo apt install nginx -y

# Instala o Git
sudo apt install git -y

# Instala o Node.js e o npm (este exemplo usa o NodeSource para uma versão recente)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Após a instalação, verifique as versões:
```bash
node -v
npm -v
nginx -v
```
Você também deve habilitar o Nginx para iniciar com o sistema: `sudo systemctl enable nginx`.

### Passo 3: Clone o Repositório da Aplicação

Clone o repositório do seu projeto do Git para um novo diretório dentro de `/var/www`.

```bash
# Substitua sua_url_do_repositorio pela URL real do seu repositório
sudo git clone sua_url_do_repositorio /var/www/nextengine
```

### Passo 4: Compile a Aplicação

Agora, navegue para o diretório do projeto, instale as dependências e execute o script de build.

```bash
# Vá para o diretório do projeto
cd /var/www/nextengine

# Instale as dependências do projeto (Vite, TypeScript, etc.)
# Use 'sudo' se encontrar problemas de permissão, mas geralmente é melhor corrigir as permissões do diretório.
sudo npm install

# Execute o processo de build
sudo npm run build
```
Este comando criará um novo diretório chamado `dist` dentro de `/var/www/nextengine`. Esta pasta `dist` contém os arquivos estáticos otimizados (HTML, JavaScript e CSS) que estão prontos para serem servidos aos usuários.

### Passo 5: Configure o Nginx para Servir o Site Compilado

Precisamos informar ao Nginx para servir os arquivos do diretório `dist` recém-criado.

1.  Crie um novo arquivo de configuração do Nginx para o seu site.

    ```bash
    sudo nano /etc/nginx/sites-available/nextengine
    ```

2.  Cole a seguinte configuração no arquivo. Se você tiver um domínio, substitua `seu_ip_de_servidor` pelo seu nome de domínio (ex: `nextengine.com.br`).

    ```nginx
    server {
        listen 80;
        listen [::]:80;

        # Substitua pelo seu nome de domínio ou deixe como o endereço IP
        server_name seu_ip_de_servidor;

        # Defina o diretório raiz para a pasta 'dist' do seu projeto
        root /var/www/nextengine/dist;

        # Defina o arquivo padrão a ser servido
        index index.html;

        location / {
            # Isso é importante para aplicações de página única (SPAs),
            # embora para este projeto, garanta principalmente um tratamento limpo de URLs.
            try_files $uri $uri/ /index.html;
        }
    }
    ```
    > **Nota:** A diretiva `root` agora aponta para a subpasta `dist`, que contém os arquivos prontos para produção.

3.  Salve o arquivo e saia do editor (`Ctrl+X`, depois `S` e `Enter`).

4.  Habilite a configuração criando um link simbólico.

    ```bash
    sudo ln -s /etc/nginx/sites-available/nextengine /etc/nginx/sites-enabled/
    ```

5.  Teste a configuração do Nginx para verificar erros de sintaxe.

    ```bash
    sudo nginx -t
    ```

6.  Se o teste for bem-sucedido, reinicie o Nginx para aplicar as alterações.

    ```bash
    sudo systemctl restart nginx
    ```

### Passo 6: Verificação Final

Abra seu navegador e acesse o endereço IP do seu servidor (`http://seu_ip_de_servidor`) ou seu nome de domínio. Você deve ver a sua landing page da Next Engine.

### Passo 7: (Recomendado) Protegendo com SSL (Let's Encrypt)

Se você estiver usando um nome de domínio, é crucial proteger seu site com um certificado SSL.

1.  Instale o Certbot para Nginx:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```
2.  Execute o Certbot para obter e instalar um certificado automaticamente. Substitua `seu_dominio.com` pelo seu domínio real.
    ```bash
    sudo certbot --nginx -d seu_dominio.com
    ```

O Certbot atualizará sua configuração do Nginx para lidar com HTTPS e configurará a renovação automática do certificado. Seu site agora estará acessível via `https://seu_dominio.com`.

---

É isso! Sua aplicação agora está compilada e implantada usando um fluxo de trabalho moderno e eficiente. Para atualizar o site no futuro, basta puxar as últimas alterações com `git pull` e executar o comando de build `npm run build` novamente.
