# Next Evolution - Deployment Guide

This guide provides instructions on how to deploy the Next Evolution landing page application to a Virtual Private Server (VPS), such as those provided by Hetzner, Vultr, or DigitalOcean.

We will use Nginx as the web server to serve the static files.

## Prerequisites

Before you begin, ensure you have the following:

1.  **A VPS running a Linux distribution** (e.g., Ubuntu 22.04).
2.  **SSH access** to your VPS with a user that has `sudo` privileges.
3.  **A domain name** (optional, but recommended for a production setup).

## Deployment Steps

Follow these steps to deploy the application on your server.

### Step 1: Connect to Your VPS

Open your terminal and connect to your server using SSH. Replace `user` with your username and `your_server_ip` with your VPS's IP address.

```bash
ssh user@your_server_ip
```

### Step 2: Update and Install Required Software

First, update your server's package list and install Nginx, a powerful web server.

```bash
# Update package lists
sudo apt update
sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y
```

After installation, you can check Nginx's status:

```bash
sudo systemctl status nginx
```

If it's not running, you can start it with `sudo systemctl start nginx`. You should also enable it to start on boot: `sudo systemctl enable nginx`.

### Step 3: Upload Application Files

You need to get your application files (`index.html`, `index.css`, `index.tsx`, `brazil-states-cities.ts`) onto the server.

**Option A: Using Git (Recommended)**

If your project is in a Git repository, this is the easiest method.

1.  Install Git on your server:
    ```bash
    sudo apt install git -y
    ```
2.  Clone your repository into a new directory within `/var/www`. Replace `your_repository_url` with your actual repository URL.
    ```bash
    sudo git clone your_repository_url /var/www/nextevolution
    ```

**Option B: Using SCP (Secure Copy)**

If your files are on your local machine, you can copy them directly. From your **local terminal**, run:

```bash
# Create a temporary directory on the server
ssh user@your_server_ip "mkdir -p /tmp/nextevolution_files"

# Replace /path/to/your/local/project with the actual path to your files
scp /path/to/your/local/project/* user@your_server_ip:/tmp/nextevolution_files
```

Then, on the **server**, move the files to the final destination:

```bash
# Connect back to the server via SSH
ssh user@your_server_ip

# Create the directory and move the files
sudo mkdir -p /var/www/nextevolution
sudo mv /tmp/nextevolution_files/* /var/www/nextevolution/
```

### Step 4: Configure Nginx to Serve the Site

Now, we need to tell Nginx where to find your website's files.

1.  Create a new Nginx configuration file for your site using a text editor like `nano`.

    ```bash
    sudo nano /etc/nginx/sites-available/nextevolution
    ```

2.  Paste the following configuration into the file. If you have a domain, replace `your_server_ip` with your domain name (e.g., `nextevolution.ia.br`).

    ```nginx
    server {
        listen 80;
        listen [::]:80;

        # Replace with your domain name or leave as the IP address
        server_name your_server_ip;

        # Set the root directory to your project files
        root /var/www/nextevolution;

        # Set the default file to serve
        index index.html;

        location / {
            try_files $uri $uri/ =404;
        }

        # Ensure correct MIME types for TypeScript/TSX files served as modules
        types {
            application/javascript ts tsx;
        }
    }
    ```
    > **Note:** The `types` block is important. It tells Nginx to serve `.ts` and `.tsx` files with the `application/javascript` MIME type, which is required for browsers to execute them as ES modules.

3.  Save the file and exit the editor (in `nano`, press `Ctrl+X`, then `Y`, then `Enter`).

4.  Enable the configuration by creating a symbolic link to the `sites-enabled` directory.

    ```bash
    sudo ln -s /etc/nginx/sites-available/nextevolution /etc/nginx/sites-enabled/
    ```

5.  Test the Nginx configuration for syntax errors.

    ```bash
    sudo nginx -t
    ```

    If it shows `syntax is ok` and `test is successful`, you can proceed.

6.  Restart Nginx to apply the changes.

    ```bash
    sudo systemctl restart nginx
    ```

### Step 5: Final Verification

Open your web browser and navigate to your server's IP address (`http://your_server_ip`) or your domain name. You should now see your Next Evolution landing page.

### Step 6: (Recommended) Securing with SSL (Let's Encrypt)

If you are using a domain name, you must secure your site with an SSL certificate.

1.  Install Certbot for Nginx:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```
2.  Run Certbot to automatically obtain and install a certificate. Replace `your_domain.com` with your actual domain.
    ```bash
    sudo certbot --nginx -d your_domain.com
    ```

Certbot will update your Nginx configuration to handle HTTPS and set up automatic certificate renewal. Your site will now be accessible via `https://your_domain.com`.

---

That's it! Your application is now live.
