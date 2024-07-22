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
