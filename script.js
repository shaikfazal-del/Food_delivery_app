class CartManager {
    constructor() {
        if (CartManager.instance) {
            return CartManager.instance;
        }
        this.items = [];
        CartManager.instance = this;
    }

    addItem(item) {
        this.items.push(item);
        console.log(`Added ${item.name} to cart.`);
    }

    getItems() {
        return this.items;
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }

    clear() {
        this.items = [];
    }
}

// Usage: always returns same instance
const cart1 = new CartManager();
const cart2 = new CartManager();
console.log(cart1 === cart2); // true → Singleton works!

class MenuItem {
    constructor(name, price, category) {
        this.name = name;
        this.price = price;
        this.category = category;
    }
}

class MenuFactory {
    static createMenuItem(restaurant, itemName) {
        const menus = {
            "burger-king": {
                "Whopper": new MenuItem("Whopper", 220, "Burger"),
                "Cheeseburger": new MenuItem("Cheeseburger", 150, "Burger"),
                "Fries": new MenuItem("Fries", 80, "Sides")
            },
            "dominos": {
                "Margherita Pizza": new MenuItem("Margherita", 300, "Pizza"),
                "Pepperoni Pizza": new MenuItem("Pepperoni", 350, "Pizza"),
                "Garlic Bread": new MenuItem("Garlic Bread", 90, "Sides")
            },
            "pizza-hut": {
                "Paneer Pizza": new MenuItem("Paneer Supreme", 320, "Pizza"),
                "Chicken Dominator": new MenuItem("Chicken Dominator", 400, "Pizza"),
                "Pasta": new MenuItem("Pasta", 120, "Sides")
            }
        };

        return menus[restaurant]?.[itemName] || null;
    }
}

document.getElementById('restaurantSelect').addEventListener('change', function() {
    const restaurant = this.value;
    const menuContainer = document.getElementById('menuContainer');
    menuContainer.innerHTML = '';

    if (!restaurant) return;

    const menuItems = Object.keys(MenuFactory.createMenuItem(restaurant, Object.keys({})[0])?.constructor?.menus?.[restaurant] || {});
    
    menuItems.forEach(itemName => {
        const menuItem = MenuFactory.createMenuItem(restaurant, itemName);
        const button = document.createElement('button');
        button.textContent = `${menuItem.name} - ₹${menuItem.price}`;
        button.onclick = () => {
            cart1.addItem(menuItem);
            alert(`${menuItem.name} added to cart!`);
        };
        menuContainer.appendChild(button);
    });
});

// Abstract Product
class PaymentMethod {
    processPayment(amount) {
        throw new Error("Method must be implemented");
    }
}

// Concrete Products
class UPIPayment extends PaymentMethod {
    processPayment(amount) {
        return `✅ Paid ₹${amount} via UPI (PhonePe/GPay)`;
    }
}

class WalletPayment extends PaymentMethod {
    processPayment(amount) {
        return `✅ Paid ₹${amount} via App Wallet (Balance: ₹500)`;
    }
}

class CODPayment extends PaymentMethod {
    processPayment(amount) {
        return `✅ Cash on Delivery selected for ₹${amount}. Pay on arrival.`;
    }
}

class CreditCardPayment extends PaymentMethod {
    processPayment(amount) {
        return `✅ Paid ₹${amount} via Credit Card (**** 1234)`;
    }
}

// Abstract Factory
class PaymentFactory {
    static createPayment(type) {
        switch (type) {
            case 'upi': return new UPIPayment();
            case 'wallet': return new WalletPayment();
            case 'cod': return new CODPayment();
            case 'credit': return new CreditCardPayment();
            default: throw new Error("Unknown payment type");
        }
    }
}

const paymentOptions = document.getElementById('paymentOptions');
['upi', 'wallet', 'cod', 'credit'].forEach(type => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'payment';
    radio.value = type;
    label.appendChild(radio);
    label.append(` ${type.toUpperCase()}`);
    paymentOptions.appendChild(label);
    paymentOptions.appendChild(document.createElement('br'));
});

let selectedPayment = null;
paymentOptions.addEventListener('change', (e) => {
    selectedPayment = PaymentFactory.createPayment(e.target.value);
});

class Order {
    constructor() {
        this.items = [];
        this.paymentMethod = null;
        this.deliveryAddress = '';
        this.deliveryTime = '';
        this.orderId = `ORD${Date.now()}`;
    }

    addItem(item) {
        this.items.push(item);
        return this; // for chaining
    }

    setPayment(payment) {
        this.paymentMethod = payment;
        return this;
    }

    setDeliveryAddress(address) {
        this.deliveryAddress = address;
        return this;
    }

    setDeliveryTime(time) {
        this.deliveryTime = time;
        return this;
    }

    build() {
        if (!this.paymentMethod) throw new Error("Payment method required!");
        if (this.items.length === 0) throw new Error("No items in order!");
        return this;
    }

    getSummary() {
        const itemsList = this.items.map(i => `${i.name} (₹${i.price})`).join(', ');
        return `
            Order ID: ${this.orderId}
            Items: ${itemsList}
            Total: ₹${this.getTotal()}
            Payment: ${this.paymentMethod.constructor.name}
            Address: ${this.deliveryAddress}
            Delivery Time: ${this.deliveryTime}
        `;
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }
}

class OrderBuilder {
    constructor() {
        this.order = new Order();
    }

    addItemsFromCart(cart) {
        cart.getItems().forEach(item => this.order.addItem(item));
        return this;
    }

    withPayment(payment) {
        this.order.setPayment(payment);
        return this;
    }

    deliverTo(address) {
        this.order.setDeliveryAddress(address);
        return this;
    }

    schedule(time) {
        this.order.setDeliveryTime(time);
        return this;
    }

    getResult() {
        return this.order.build();
    }
}

document.getElementById('placeOrderBtn').addEventListener('click', () => {
    if (!selectedPayment) {
        alert("Please select a payment method!");
        return;
    }

    try {
        const order = new OrderBuilder()
            .addItemsFromCart(cart1)
            .withPayment(selectedPayment)
            .deliverTo("123 Main St, City")
            .schedule("30 mins")
            .getResult();

        const summaryDiv = document.getElementById('orderSummary');
        const summaryText = document.getElementById('summaryText');
        summaryText.textContent = order.getSummary();
        summaryDiv.classList.remove('hidden');

        // Simulate payment
        alert(selectedPayment.processPayment(order.getTotal()));

        // Clear cart
        cart1.clear();
    } catch (err) {
        alert(err.message);
    }
});

class OrderPrototype {
    clone() {
        const clone = Object.create(this);
        // Deep clone items array
        clone.items = [...this.items];
        return clone;
    }
}

// Mix into Order class
Object.assign(Order.prototype, OrderPrototype);

// Example: Save last order for cloning
let lastOrder = null;

// After placing order:
// lastOrder = order; (inside placeOrderBtn click)

// Add "Order Again" button later
function createOrderAgainButton() {
    if (!lastOrder) return;

    const btn = document.createElement('button');
    btn.textContent = "🔁 Order Again (Last Order)";
    btn.onclick = () => {
        const clonedOrder = lastOrder.clone();
        cart1.clear();
        clonedOrder.items.forEach(item => cart1.addItem(item));
        alert("Last order added back to cart!");
    };
    document.querySelector('.container').appendChild(btn);
}

// Call after first order
// createOrderAgainButton();