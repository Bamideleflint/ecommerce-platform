# **E-Commerce Application CI/CD Pipeline with GitHub Actions**

### Setting Up Your Ecommerce Platform with GitHub Actions

This guide will walk you through creating and setting up an ecommerce platform with a backend and frontend, testing it, and setting up a CI/CD pipeline using GitHub Actions. You will also learn to integrate Docker for containerization and deploy your application to AWS ECR.

  

## **Create and Set Up Your Repository**

• Go to GitHub and create a repository named `ecommerce-platform`.

- **Clone the Repository to Your Local Machine**
    - Open your terminal.
    - Clone the repository using:

`git clone https://github.com/your-username/ecommerce-platform.git`⁠  
cd ecommerce-platform
    - Create two directories within your repository:
    - `api` for the backend
    - `app` for the frontend
    - `mkdir api app` 

![mkdir api app](https://github.com/user-attachments/assets/8ce97eaf-8b77-4d8b-9572-7384bca7a5a2)  

  

## **Task 2: Initialize GitHub Actions**

• Initialize a Git repository and add your initial project structure.

If not already initialized, run:

`git init`  
• Create _‘.github/workflows’_ directory in your repository for GitHub Actions.

`mkdir -p .github/workflows`  

### 

## **Task 3: Backend API setup**

• In the _‘’api”_ directory, set up a simple Nodejs/Express application that handles basic e-commerce operations.

- Navigate to the `api` directory:

```
cd api
```
- Initialize a new Node.js project:

```
npm init -y
```
- Install Express: Express is a backend framework built on NodeJS used for building backend api’s

```
npm install express
```

![server running port 4000](https://github.com/user-attachments/assets/a743b2ae-c060-4b8e-9b14-e936934f58c5) 

- In the api directory, create a file called `server.js`. This file contains the backend code for the ecommerce application

```
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;
app.use(express.json());

let products = [];

app.get('/products', (req, res) => res.json(products));
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
});

app.post('/products', (req, res) => {
    const newProduct = { id: String(products.length + 1), ...req.body };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Product not found' });
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
});

app.delete('/products/:id', (req, res) => {
    products = products.filter(p => p.id !== req.params.id);
    res.json({ message: 'Product deleted successfully' });
});

module.exports = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

- To test the backend server
- Install POSTMAN extension on VSCODE to test the backend endpoint

![PostMan NewRequest](https://github.com/user-attachments/assets/debb4dfd-777c-432c-8332-50617f788ce7) 

- We will be testing one of the endpoints, the endpoint for adding a product and its price
- On Postman create a collection > right click and create a new request > rename the request to "add\_products" > add the localhost address "locaalhost:4000/products"
- Send in the name and price as a json body entry and click on send request

![PostmanSent](https://github.com/user-attachments/assets/ad693318-6f3e-4909-91a3-ec416c4f02c1) 

### Creating Test File for code

- Create a `server.test.js` file in the `api` directory:

```
const request = require('supertest');
const app = require('./server'); 

let server;

beforeAll(async () => {
    server = app.listen(3000);
    await new Promise(resolve => server.on('listening', resolve));
});
afterAll(async () => server.close());

describe('API Endpoints', () => {
    let productId;
    it('should add a new product', async () => {
        const res = await request(app).post('/products').send({ name: 'Test Product', price: 10.99 });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        productId = res.body.id;
    });
    it('should get all products', async () => {
        const res = await request(app).get('/products');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
    it('should get a single product', async () => {
        const res = await request(app).get(`/products/${productId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Test Product');
    });
    it('should update a product', async () => {
        const res = await request(app).put(`/products/${productId}`).send({ name: 'Updated Product', price: 15.99 });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Updated Product');
    });
    it('should delete a product', async () => {
        const res = await request(app).delete(`/products/${productId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    });
});
```

**Implement Unit Tests**

- Install testing libraries  `jest` and `supertest`

```
npm install --save-dev jest supertest
```
- Update your `package.json` to run tests:

```
"scripts": {
  "test": "jest"
}
```

  

## **Task 4: Frontend Web Application Setup**

• In the _‘app’_ directory, create a simple React application that interacts with the backend API.  
• Ensure the frontend has basic features like product listing, user login, and order placement.

Navigate to the `app` directory:

![CdFrontend](https://github.com/user-attachments/assets/64e0cf3d-2449-45e1-ae5d-3670328d6e07) 

```
cd ../app
```

- Here we need to create a react app and this can be achieved using `npx create-react-app frontend` . A frontend directory will be created inside the app directory that contains the starter code for a simple react application. This app will run on port 3000 on the browser

![FrontendNPMStartlocalhost3000](https://github.com/user-attachments/assets/b65fe867-5331-4103-9ce6-0add351b702a)

- in the frontend directory, use `npm start` to start it.

![FrontendNpmStart](https://github.com/user-attachments/assets/dacfb28e-616f-48b4-8161-ee8b6899912e)

### Populating Frontend with Ecommerce Code

- In the frontend directory, inside the src directory create two directories
    - components
    - styles
- In the components directory, create two files named "ProductForm.jsx and ProductList.jsx"
- In the styles dir create two files "ProductFormStyles.js and ProductListStyles.js"

### **components/ProductForm.jsx:**

```
import React, { useState } from 'react';
import { Container, FormContainer, Input, Button } from '../styles/ProductFormStyles';

const ProductForm = () => {
    const [product, setProduct] = useState({ name: '', price: '' });
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product.name || !product.price) {
            alert("Missing Fields detected");
            return; 
        }
        try {
            const response = await fetch("http://localhost:4000/products", {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product)
            });
            if (!response.ok) throw new Error('Failed to add product');
            const data = await response.json();
            console.log(data);
            setProduct({ name: '', price: '' });
        } catch (error) {
            console.error("Error adding product:", error.message);
            alert(`Error adding product: ${error.message}`);
        }
    };
    return (
        <Container>
            <FormContainer onSubmit={handleSubmit}>
                <h2 style={{ textAlign: "center" }}>Add a Product</h2>
                <Input type="text" placeholder="Product Name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
                <Input type="number" placeholder="Product Price" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} />
                <Button type="submit">Add Product</Button>
            </FormContainer>
        </Container>
    );
};

export default ProductForm;
```

components/ProductList.jsx:

```
import React, { useState, useEffect } from 'react';
import { ListingContainer, ProductList, ProductItem } from '../styles/ProductListStyles';

const ProductListing = () => {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:4000/products');
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error.message);
            }
        };
        fetchData();
    }, []);
    return (
        <ListingContainer>
            <h2 style={{ textAlign: "center" }}>Products</h2>
            <ProductList>
                {products.map(product => <ProductItem key={product.id}>{product.name} - ${product.price}</ProductItem>)}
            </ProductList>
        </ListingContainer>
    );
};

export default ProductListing;
```

styles/ProductFormStyles.js:

```
import styled from 'styled-components';

export const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;

export const FormContainer = styled.form`
    width: 600px;
    padding: 40px 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 3px 10px 10px rgba(0, 0, 0, 0.1);
`;

export const Input = styled.input`
    margin-bottom: 15px;
    padding: 10px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
`;

export const Button = styled.button`
    padding: 10px 15px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    width: 100%;
    &:hover {
        background-color: #0056b3;
    }
`;
```

styles/ProductListStyles.js:

```
import styled from 'styled-components';

export const ListingContainer = styled.div`
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 3px 10px 10px rgba(0, 0, 0, 0.1);
`;

export const ProductList = styled.ul`
    list-style: none;
    padding: 0;
`;

export const ProductItem = styled.li`
    padding: 10px 0;
    border-bottom: 1px solid #ccc;
    &:last-child {
        border-bottom: none;
    }
`;
```

Update App.js:

```
import React from 'react';
import ProductForm from './components/ProductForm';
import ProductListing from './components/ProductList';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f0f0f0;
`;

const App = () => (
    <Container>
        <ProductForm />
        <ProductListing />
    </Container>
);

export default App;
```

## 

## **Task 5:** Contiinuous Integration Workflow

- We will be creating a GitHub actions that performs basic CICD processes. The GitHub action will
    - Install dependencies
    - Run tests
    - Build application
- This will be done for both frontend and backend
- In the root directory, create a directory called .github > inside it create a directory "workflow" > inside workflow create a file called `build.yaml`

```
name: Full Stack CI

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    services:
      docker:
        image: docker:19.03.12
        options: --privileged
        ports:
          - 2375:2375

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 14

      - name: Install backend dependencies
        run: |
          cd api
          npm install

      - name: Run backend tests
        run: |
          cd api
          npm test

      - name: Build and push backend Docker image
        run: |
          cd api
          docker build -t my-ecommerce-backend .
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag my-ecommerce-backend ${{ secrets.DOCKER_USERNAME }}/my-ecommerce-backend:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/my-ecommerce-backend:latest

      - name: Install frontend dependencies
        run: |
          cd app/frontend
          npm install

      - name: Build and push frontend Docker image
        run: |
          cd app/frontend
          docker build -t my-ecommerce-frontend .
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag my-ecommerce-frontend ${{ secrets.DOCKER_USERNAME }}/my-ecommerce-frontend:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/my-ecommerce-frontend:latest
```

- Commit the code and push to GitHub
- On the GitHub repository, click on Actions and you should see the action running

![GitHubActionsBuildyml](https://github.com/user-attachments/assets/c9770aa6-915a-4c56-99bc-9894f76e0f20)

## 

## **Task 6: Docker Integration**

• Create Dockerfiles for both the backend and frontend.

Create a `Dockerfile` for the backend in the `api` directory:

```
# Use the official Node.js image as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose port 4000 for the application
EXPOSE 4000

# Start the application
CMD ["node", "server.js"]
```

Create a `Dockerfile` for the frontend in the `app/frontend` directory:

```
# Use the official Node.js image as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

  
• Modify your GitHub Actions workflows to build Docker images.

```
name: Full Stack CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'

      # Build the backend
      - name: Install backend dependencies
        run: npm install
        working-directory: api

      # Build the frontend
      - name: Install frontend dependencies
        run: npm install
        working-directory: app/frontend


      # Build the backend Docker image
      - name: Build Backend Docker image
        run: docker build -t bamideleflint/api:latest .
        working-directory: api

      # Build the backend Docker image
      - name: Build Frontend Docker image
        run: docker build -t bamideleflint/app:latest .
        working-directory: app/frontend

      # Push the Docker image to a registry (replace with your registry)
      - name: Push Docker image
        run: |
          echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
          docker push bamideleflint/api:latest
          docker push bamideleflint/app:latest
        env:
            DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
            DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
```

- We need to create secrets that stores `DOCKER_USERNAME` and `DOCKER_PASSWORD`. On the GitHub repository, go to settings, click on secrets, click on actions and click on new repository access.

![DockerSecrets](https://github.com/user-attachments/assets/747f24d7-fdb3-4989-bd8d-35838690c6e5)

- Before pushing the image, we need to prepare Docker hub to receive the built image.
- Go to Docker hub and create repository called `api`. set the access to `Public` then create. Repeat process for the frontend using `app`.

![DockerImageApp](https://github.com/user-attachments/assets/31b496f3-f623-4f99-940c-5499a0113815)

- Commit the code to GitHub and check the Actions tab.

![DockerImageGitHubActions](https://github.com/user-attachments/assets/23ee0460-b84a-4c21-bbe6-88138c572b9a)

- A successful build will show the fill

  

## **Task 7: Deploy to Cloud**

• Choose a cloud platform for deployment (AWS, Azure, or GCP).

- During the course of deployment, backend and frontend could be worked on differently and following the use of a single workflow backend could be rebuilt and pushed into the container repository Docker hub even if its code itself does not change
- To fix this, we separate the workflows into frontend and backend workflows.
- In the workflows directory, create `frontend-ci.yaml and backend-ci.yaml`

```
name: Frontend CI

on:
  push:
    paths:
      - 'app/frontend/**' # Trigger only when changes are made in the frontend directory
  pull_request:
    paths:
      - 'app/frontend/**'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'

      # Install frontend dependencies
      - name: Install frontend dependencies
        run: npm install
        working-directory: app/frontend

      # Build the frontend Docker image
      - name: Build Frontend Docker image
        run: docker build -t bamideleflint/app:latest .
        working-directory: app/frontend

      # Log in to Docker Hub
      - name: Log in to Docker Hub
        run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}

      # Push the Frontend Docker image
      - name: Push Frontend Docker image
        run: docker push bamideleflint/app:latest
```

```
name: Backend CI

on:
  push:
    paths:
      - 'api/**'  # Trigger only when changes are made in the backend directory
  pull_request:
    paths:
      - 'api/**'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'

      # Install backend dependencies
      - name: Install backend dependencies
        run: npm install
        working-directory: api

      # Build the backend Docker image
      - name: Build Backend Docker image
        run: docker build -t bamideleflint/api:latest .
        working-directory: api

      # Log in to Docker Hub
      - name: Log in to Docker Hub
        run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}

      # Push the Backend Docker image
      - name: Push Backend Docker image
        run: docker push bamideleflint/api:latest
```

  
Lets trigger a backend build by making a change in the api directory, a change in the api directory will only trigger the backend workflow.

![TriggerBackendBuildGitHubActions](https://github.com/user-attachments/assets/96624638-6605-423a-8360-cdeadd159d76)
  
![TriggerBackendBuildWithReadMeFile](https://github.com/user-attachments/assets/34a992fe-f61c-4316-8677-1e950f2394a1)
  

### **Task 8: AWS ECR Integration**

- We will modify our github action workflow to push the images into Amazons Elastic Container Registry
- First we create a user and create an access\_key
- Save the access key and secret key as secrets in the repository just as was done with docker username and docker password

In your GitHub repository, go to Settings > Secrets and add the following secrets:

- `AWS_ACCESS_KEY_ID`: Access key ID for the IAM user (`ecommerce`).
- `AWS_SECRET_ACCESS_KEY`: Secret access key for the IAM user (`ecommerce`).
- `AWS_ACCOUNT_ID`: Your AWS account ID.

   **.**   On AWS go to ECR and create 2 private repositories for both your backend and frontend.

    Update your `.github/workflows/` file to push images to AWS ECR:

```
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Build and push backend Docker image
        run: |
          cd api
          docker build -t my-ecommerce-backend .
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
          docker tag my-ecommerce-backend:latest ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/my-ecommerce-backend:latest
          docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/my-ecommerce-backend:latest

      - name: Build and push frontend Docker image
        run: |
          cd app/frontend
          docker build -t my-ecommerce-frontend .
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
          docker tag my-ecommerce-frontend:latest ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/my-ecommerce-frontend:latest
          docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/my-ecommerce-frontend:latest
```

![Backend ECR DockerImage](https://github.com/user-attachments/assets/69117ac0-c8fd-4891-9d4a-b99a85a1cfa1)  
  
![Backend ECR DockerImageGitActions](https://github.com/user-attachments/assets/147d9efa-7390-4c2c-9757-a4019d3b67ce)
  

## **Task 9: Performance and Security**

• Implement caching in your workflows to optimize build times.

- In the workflows directory, update `frontend-ci.yaml and backend-ci.yaml`

frontend-ci.yaml

```
 - name: Cache Node.js modules
        uses: actions/cache@v2
        with:
          path: |
            app/frontend/node_modules
            app/frontend/.cache
          key: ${{ runner.os }}-node-${{ hashFiles('app/frontend/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
```

  

backend-ci.yaml

```
- name: Cache Node.js modules
        uses: actions/cache@v2
        with:
          path: |
            api/node_modules
            api/.cache
          key: ${{ runner.os }}-node-${{ hashFiles('api/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
```

![BackendCachingImplemented](https://github.com/user-attachments/assets/d0013294-041f-4bb3-91dd-11f808d53880)
• Ensure all sensitive data, including API keys and database credentials, are secured using GitHub Secrets.  
![GitHubSecrets](https://github.com/user-attachments/assets/2c901a0b-9ed5-4cee-9342-5db928e8481c)

## 

## **Conclusion**

**This capstone project aims to provide hands-on experience in automating CI/CD pipelines for a real-world e-commerce application, encompassing aspects  
like backend API management, frontend web development, Docker containerization, and cloud deployment.**
