const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { usermodel, tabletmodel, accessorymodel, boymodel, tvmodel } = require("./models/user");

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const auth = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, "shhhhhhh", (err, decoded) => {
            if (err) {
                req.user = null;
            } else {
                req.user = decoded;   //user banadiya uss token ka and that is sent everypage   //req mai store krdiya user ko now can be accesed anywhere
            }
            next();
        });
    } else {
        req.user = null;
        next();
    }
};

app.use(auth);

app.get('/login', (req, res) => {
    res.render("login", { user: req.user });
});

app.get('/', (req, res) => {
    res.render("home", { user: req.user });
});

app.get('/aboutus', (req, res) => {
    res.render("aboutus", { user: req.user });
});

app.get('/contactus', (req, res) => {
    res.render("contactus", { user: req.user });
});

app.get('/mobile', async (req, res) => {
    let users = await usermodel.find();
    res.render("mobile", { users, user: req.user });
});
app.get('/tv', async (req, res) => {
    let tvs = await tvmodel.find();
    res.render("tv", { tvs, user: req.user });
});

app.get('/tablets', async (req, res) => {
    let tablets = await tabletmodel.find();
    res.render("tablets", { tablets, user: req.user });
});

app.get('/accessories', async (req, res) => {
    let accessories = await accessorymodel.find();
    res.render("accessories", { accessories, user: req.user });
});

app.get('/add', (req, res) => {
    res.render("add", { user: req.user});
});

app.get('/signup', (req, res) => {
    res.render("signup", { user: req.user });
});
app.get('/thankyou', (req, res) => {
    res.render("thanks");
});

app.post('/login', async (req, res) => {
    let { email, password } = req.body;

    let boy = await boymodel.findOne({ email: email });
    
    if (!boy) {
        
        return res.render('login', { error: "User not found", user: null });
    }

    bcrypt.compare(password, boy.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email: boy.email, username: boy.username, mobile: boy.MobileNo }, "shhhhhhh");
            res.cookie("token", token);
            res.redirect("/");
        } else {
          
            res.render('login', { error: "Incorrect password", user: null });
        }
    });
});


app.post('/signup', async (req, res) => {
    let { username, password, email, MobileNo } = req.body;

    bcrypt.genSalt(10, async (err, salt) => {
        if (err) {
            return res.send("Error generating salt");
        }
        
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) {
                return res.send("Error hashing password");
            }
            
            let createdUser = await boymodel.create({
                username,
                password: hash,
                email,
                MobileNo
            });

            if (createdUser) {
                let token = jwt.sign({ email: createdUser.email, username: createdUser.username, mobile: createdUser.MobileNo }, "shhhhhhh");

                res.cookie("token", token);
                res.redirect("/");
            } else {
                res.send("User creation failed");
            }
        });
    });
});


app.post('/createmobile', async (req, res) => {
    let { name, price, image } = req.body;
    await usermodel.create({ name, price, image });
    res.redirect("/mobile");
});
app.post('/createtv', async (req, res) => {
    let { name, price, image } = req.body;
    await tvmodel.create({ name, price, image });
    res.redirect("/tv");
});

app.post('/createtablet', async (req, res) => {
    let { name, price, image } = req.body;
    await tabletmodel.create({ name, price, image });
    res.redirect("/tablets");
});

app.post('/createaccessories', async (req, res) => {
    let { name, price, image } = req.body;
    await accessorymodel.create({ name, price, image });
    res.redirect("/accessories");
});
app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect('/');  //no render so jane ki jarurat nhi h
})
app.post('/add-to-cart/:id', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }

    const productId = req.params.id;
    const user = await boymodel.findOne({ email: req.user.email });

    const cartItem = user.cart.find(item => item.productId == productId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        user.cart.push({ productId });
    }

    await user.save();
    res.redirect('/mobile'); 
});
app.get('/cart', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login'); 
    }

    const user = await boymodel.findOne({ email: req.user.email }).populate('cart.productId');

    const totalPrice = user.cart.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

    res.render('cart', { cartItems: user.cart, totalPrice, user: req.user });
});

app.listen(3000);