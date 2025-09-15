# Next Engine - Deployment Guide (Vite Version)

This guide provides instructions on how to build and deploy the Next Engine landing page application to a Virtual Private Server (VPS), such as those provided by Hetzner, Vultr, or DigitalOcean.

This project uses **Vite** to build and bundle the application assets (TypeScript, CSS). The new deployment process involves building the static files locally on the server and then serving them with Nginx.

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

### Step 2: Install Required Software

First, update your server's package list. Then, we need to install **Nginx** (web server), **Node.js** and **npm** (to build the project), and **Git** (to get the code).

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install Node.js and npm (this example uses NodeSource for a recent version)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

After installation, verify the versions:
```bash
node -v
npm -v
nginx -v
```
You should also enable Nginx to start on boot: `sudo systemctl enable nginx`.

### Step 3: Clone the Application Repository

Clone your project's repository from Git into a new directory within `/var/www`.

```bash
# Replace your_repository_url with your actual repository URL
sudo git clone your_repository_url /var/www/nextengine
```

### Step 4: Build the Application

Now, navigate into the project directory, install the dependencies, and run the build script.

```bash
# Go to the project directory
cd /var/www/nextengine

# Install project dependencies (Vite, TypeScript, etc.)
# Use 'sudo' if you encounter permission issues, but it's often better to fix directory permissions.
sudo npm install

# Run the build process
sudo npm run build
```
This command will create a new directory named `dist` inside `/var/www/nextengine`. This `dist` folder contains the optimized, static HTML, JavaScript, and CSS files that are ready to be served to users.

### Step 5: Configure Nginx to Serve the Built Site

We need to tell Nginx to serve the files from the newly created `dist` directory.

1.  Create a new Nginx configuration file for your site.

    ```bash
    sudo nano /etc/nginx/sites-available/nextengine
    ```

2.  Paste the following configuration into the file. If you have a domain, replace `your_server_ip` with your domain name (e.g., `nextengine.com.br`).

    ```nginx
    server {
        listen 80;
        listen [::]:80;

        # Replace with your domain name or leave as the IP address
        server_name your_server_ip;

        # Set the root directory to your project's 'dist' folder
        root /var/www/nextengine/dist;

        # Set the default file to serve
        index index.html;

        location / {
            # This is important for single-page applications, though for this
            # project, it primarily ensures clean URL handling.
            try_files $uri $uri/ /index.html;
        }
    }
    ```
    > **Note:** The `root` directive is now pointing to the `dist` subfolder, which contains the production-ready files.

3.  Save the file and exit the editor (`Ctrl+X`, then `Y`, then `Enter`).

4.  Enable the configuration by creating a symbolic link.

    ```bash
    sudo ln -s /etc/nginx/sites-available/nextengine /etc/nginx/sites-enabled/
    ```

5.  Test the Nginx configuration for syntax errors.

    ```bash
    sudo nginx -t
    ```

6.  If the test is successful, restart Nginx to apply the changes.

    ```bash
    sudo systemctl restart nginx
    ```

### Step 6: Final Verification

Open your web browser and navigate to your server's IP address (`http://your_server_ip`) or your domain name. You should now see your Next Engine landing page.

### Step 7: (Recommended) Securing with SSL (Let's Encrypt)

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

That's it! Your application is now built and deployed using a modern, efficient workflow. To update the site in the future, you just need to pull the latest changes with `git pull` and run the build command `npm run build` again.
