const express = require("express");
const fs = require("fs");
const router = express.Router();

router.get("/", function (req, res, next) {
    // get flowers array
    let flowers = JSON.parse(fs.readFileSync("./data/flowers.json", "utf8"));
    if (flowers) {
        // get filters array
        let filters = {};
        filters.type = Array.from(arrayCheckboxes("category", flowers));

        // set selected filters from query
        let selectedFilters = {};
        selectedFilters.search = req.query.search || "";
        selectedFilters.sort = req.query.sort || "";
        selectedFilters.category = req.query.category || [];
        selectedFilters.price_range = req.query.price_range || "";
        selectedFilters.minimum_rating = req.query.minimum_rating || 0;
        selectedFilters.in_stock = req.query.stock_yes || false;

        // filter flowers array by query params
        let filterFunction = (item) =>
            searchProducts(item, req.query.search) &&
            getProductsByCategory(item, req.query.category) &&
            getProductsByPriceRange(item, req.query.price_range) &&
            getProductsByPublishingHouse(item, req.query.publishing_house) &&
            getProductsByRating(item, req.query.minimum_rating) &&
            getProductsByStock(item, req.query.stock_yes);

        let products = filterProducts(
            flowers,
            filterFunction,
            getSorted(req.query.sort)
        );

        let response = {
            products: products,
            filters: filters,
            selectedFilters: selectedFilters
        };

        res.status(200).json(response);
    } else {
        res.status(404).send({ message: "404 Not Found" });
    }
});

router.get("/:id", function (req, res, next) {
    let content = JSON.parse(fs.readFileSync("./data/flowers.json", "utf8"));
    let flower = content.find((item) => item["name"] == req.params.id);
    if (flower) {
        res.status(200).json(flower);
    } else {
        res.status(404).send({ message: "404 Not Found" });
    }
});

router.post("/", function (req, res, next) {
    let content = JSON.parse(fs.readFileSync("./data/flowers.json", "utf8"));
    if (
        req.body.name &&
        req.body.author &&
        req.body.category &&
        req.body.publishing_house &&
        req.body.price &&
        req.body.quantity &&
        req.body.availability_date &&
        req.body.image
    ) {
        let product = {
            id: content[content.length - 1].id + 1,
            name: req.body.name,
            author: req.body.author,
            category: req.body.category,
            publishing_house: req.body.publishing_house,
            price: Number(req.body.price),
            discount: Number(req.body.discount),
            quantity: Number(req.body.quantity),
            availability_date: req.body.availability_date,
            rating: Number(req.body.rating),
            image: req.body.image
        };

        if (validateProduct(product)) {
            let verifyProduct = content.find(
                (item) =>
                    item.name == product.name &&
                    item.category == product.category &&
                    item.author == product.author
            );
            if (verifyProduct) {
                res.status(403).send({ message: "Product already exist." });
            } else {
                content.push(product);
                fs.writeFile(
                    "./data/flowers.json",
                    JSON.stringify(content),
                    function (err) {
                        if (err) {
                            throw err;
                        } else {
                            res.status(200).send({
                                message: `Adding flower ${req.body.name}`
                            });
                        }
                    }
                );
            }
        } else {
            res.status(400).send({ message: "Bad request" });
        }
    } else {
        res.status(400).send({ message: "Please complete all fields" });
    }
});

// delete
router.delete("/:id", function (req, res) {
    let flowers = JSON.parse(fs.readFileSync("./data/flowers.json", "utf8"));
    let flower = flowers.find((flower) => flower.id == req.params.id);
    if (flower) {
        let updatedflowers = flowers.filter((flower) => flower.id != req.params.id);
        fs.writeFile(
            "./data/flowers.json",
            JSON.stringify(updatedflowers),
            function (err) {
                if (err) {
                    throw err;
                } else {
                    res.status(200).send({
                        message: `Deleting flower ${req.params.id}`
                    });
                }
            }
        );
    }
});

// update
router.put("/:id", function (req, res, next) {
    let products = JSON.parse(fs.readFileSync("./data/flowers.json", "utf8"));
    let flower = products.find((flower) => flower.id == req.params.id);
    if (flower) {
        flower.name = req.body.name;
        flower.author = req.body.author;
        flower.category = req.body.category;
        flower.publishing_house = req.body.publishing_house;
        flower.price = Number(req.body.price);
        flower.discount = Number(req.body.discount);
        flower.quantity = Number(req.body.quantity);
        flower.availability_date = req.body.availability_date;
        flower.rating = Number(req.body.rating);
        flower.image = req.body.image;

        if (validateProduct(flower)) {
            fs.writeFile(
                "./data/flowers.json",
                JSON.stringify(products),
                function (err) {
                    if (err) {
                        throw err;
                    } else {
                        res.status(200).send({
                            message: `Updating flower ${req.body.name}`
                        });
                    }
                }
            );
        } else {
            res.status(400).send({ message: "Bad request" });
        }
    } else {
        res.status(400).send({ message: "Please complete all fields" });
    }
});

function validateProduct(product) {
    let regexProductName = /^[\w\-\s\,]+$/;
    // let regexLetters = /^[a-zA-Z]{2,30}/;
    // let regexAlphaNumeric = /^[A-Za-z0-9]{2,30}/;
    let regexAuthor =
        /(^[a-zA-Z]{1,16})(\.{0,1})([ ]{0,1})([a-zA-Z]{1,16})(\.{0,1})([ ]{0,1})([a-zA-Z]{0,26})/;

    return (
        product.name &&
        product.author &&
        product.category &&
        product.publishing_house &&
        product.price &&
        product.quantity &&
        product.availability_date &&
        product.image &&
        product.name.match(regexProductName) &&
        product.name.length >= 1 &&
        product.name.length <= 50 &&
        product.category.match(regexProductName) &&
        product.category.length >= 2 &&
        product.category.length <= 30 &&
        product.author.match(regexAuthor) &&
        product.author.length >= 2 &&
        product.author.length <= 30 &&
        product.publishing_house.match(regexProductName) &&
        product.publishing_house.length >= 2 &&
        product.publishing_house.length <= 30 &&
        product.price > 0 &&
        product.discount >= 0 &&
        product.quantity >= 0 &&
        product.rating >= 0 &&
        product.rating <= 5 &&
        product.availability_date.length > 0
    );
}

//FUNCTIONS
function arrayCheckboxes(property, obj) {
    let propertySet = new Set();
    obj.forEach((product) => propertySet.add(product[property]));
    return propertySet;
}

function filterProducts(products, filterFunction, sortFunction) {
    if (filterFunction) {
        products = products.filter(filterFunction);
    }
    if (sortFunction) {
        products = products.sort(sortFunction);
    }
    return products;
}

function searchProducts(item, searchValue) {
    if (searchValue) {
        return (
            item.category.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.name.toLowerCase().includes(searchValue.toLowerCase())
        );
    }
    return true;
}

// filter by categories
function getProductsByCategory(item, categories) {
    if (categories) {
        return categories.indexOf(item.category) !== -1;
    }
    return true;
}

// filter by price range
function getProductsByPriceRange(item, range) {
    let checkedPriceRange = [];
    if (range) {
        checkedPriceRange.push(range);
        checkedPriceRange = checkedPriceRange[0].split("_");
    }
    if (checkedPriceRange.length > 0) {
        if (checkedPriceRange.length === 1) {
            return item.price - item.discount >= checkedPriceRange[0];
        } else {
            return (
                item.price - item.discount >= checkedPriceRange[0] &&
                item.price - item.discount <= checkedPriceRange[1]
            );
        }
    }
    return true;
}

// filter by OS
function getProductsByPublishingHouse(item, publishing_house) {
    if (publishing_house) {
        return publishing_house.indexOf(item.publishing_house) !== -1;
    }
    return true;
}

// filter by minimum rating
function getProductsByRating(item, rating) {
    // let selectedRating = document.getElementById('minimum_rating').value;
    if (rating) {
        return item.rating >= rating;
    }
    return true;
}

// filter by available stock (change stock to zero to see effects)
function getProductsByStock(item, stock) {
    if (stock === "true") {
        return item.quantity > 0;
    }
    return true;
}

function getSorted(sort) {
    if (sort === "none") {
        return false;
    }
    if (sort === "asc") {
        return (a, b) => a.price - a.discount - (b.price - b.discount);
    } else if (sort === "desc") {
        return (a, b) => b.price - b.discount - (a.price - a.discount);
    }
}

module.exports = {
    router,
    getProductsByCategory,
    getProductsByPublishingHouse,
    searchProducts
};
