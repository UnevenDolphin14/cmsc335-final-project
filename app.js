require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("Failed to connect to MongoDB", err));

// Define the stock schema
const stockSchema = new mongoose.Schema({
    symbol: String,
    shares: Number,
    averageCost: Number
});

// Create a model from the schema
const Portfolio = mongoose.model('Portfolio', stockSchema);

// Function to manage the portfolio
async function managePortfolio() {
    try {
        const action = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'Choose an action:',
            choices: ['Add Stock', 'View Portfolio', 'Update Stock', 'Exit']
        });

        switch (action.action) {
            case 'Add Stock':
                await addStock();
                break;
            case 'View Portfolio':
                await viewPortfolio();
                break;
            case 'Update Stock':
                await updateStock();
                break;
            case 'Exit':
                console.log('Exiting...');
                mongoose.disconnect();
                return;
            default:
                console.log('Invalid action!');
        }
        await managePortfolio();  // Recursive call to allow continuous interaction
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Function to add a new stock
async function addStock() {
    const stock = await inquirer.prompt([
        { name: 'symbol', type: 'input', message: 'Enter stock symbol:' },
        { name: 'shares', type: 'number', message: 'Enter number of shares:' },
        { name: 'averageCost', type: 'number', message: 'Enter average cost per share:' }
    ]);
    const newStock = new Portfolio(stock);
    await newStock.save();
    console.log('Stock added successfully.');
}

// Function to view all stocks
async function viewPortfolio() {
    const stocks = await Portfolio.find();
    console.log('Current Portfolio:', stocks.map(stock => `Symbol: ${stock.symbol}, Shares: ${stock.shares}, Avg. Cost: $${stock.averageCost}`).join('\n'));
}

// Function to update an existing stock
async function updateStock() {
    const { symbol } = await inquirer.prompt([
        { name: 'symbol', type: 'input', message: 'Enter the symbol of the stock to update:' }
    ]);
    const stock = await Portfolio.findOne({ symbol: symbol });
    if (!stock) {
        console.log('Stock not found!');
        return;
    }
    const updates = await inquirer.prompt([
        { name: 'shares', type: 'number', message: 'Enter new number of shares:', default: stock.shares },
        { name: 'averageCost', type: 'number', message: 'Enter new average cost per share:', default: stock.averageCost }
    ]);
    stock.shares = updates.shares;
    stock.averageCost = updates.averageCost;
    await stock.save();
    console.log('Stock updated successfully.');
}

// Start the application
managePortfolio();
