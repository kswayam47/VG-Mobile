const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/mobile", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const userSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number
});


const tabletSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number
});


const accessorySchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number
});
const tvSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number
});

module.exports.usermodel = mongoose.model('user', userSchema);
module.exports.tabletmodel = mongoose.model('tablet', tabletSchema);
module.exports.accessorymodel = mongoose.model('accessory', accessorySchema);
module.exports.tvmodel = mongoose.model('tv', tvSchema);


const boySchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    MobileNo: Number,
    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user' // Reference to your product model
            },
            quantity: { type: Number, default: 1 }
        }
    ]
});

module.exports.boymodel = mongoose.model('boy', boySchema);

module.exports.tvmodel = mongoose.model('tv', tvSchema);