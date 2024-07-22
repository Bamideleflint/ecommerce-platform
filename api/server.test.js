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
