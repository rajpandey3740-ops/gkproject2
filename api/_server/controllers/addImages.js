const axios = require("axios");
const mongoose = require("mongoose");
const Product = require("./models/Product");

// ✅ Replace <db_password> with your real password
mongoose.connect(
  "mongodb+srv://gkstore_user:Rajpandey3740@cluster0.0cbhqlf.mongodb.net/?appName=Cluster0"
);

const UNSPLASH_KEY = "0BGRa3qva3gjpnOeCRZn_7Yy3MLlUma7AOCTYdBXNHU";

async function addImages() {
  try {
    const products = await Product.find({ image: { $exists: false } });

    for (let product of products) {
      const res = await axios.get(
        `https://api.unsplash.com/search/photos?query=${product.name}&per_page=1`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_KEY}`,
          },
        }
      );

      const imageUrl =
        res.data.results[0]?.urls?.regular ||
        "https://picsum.photos/400/400";

      product.image = imageUrl;
      await product.save();

      console.log("Updated:", product.name);
    }

    console.log("All images added");
  } catch (error) {
    console.error("Error adding images:", error.message);
  } finally {
    mongoose.disconnect();
  }
}

addImages();
