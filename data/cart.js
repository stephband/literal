
const assign = Object.assign;

function Product(name, price) {
    assign(this, { name, price });
}

function Item(quantity, product) {
    assign(this, { product, quantity });
}

const items = [
    new Item(1, new Product('Crampons', 32)),
    new Item(2, new Product('Ice Axe', 59.99))
];

export { Item, Product, items };
