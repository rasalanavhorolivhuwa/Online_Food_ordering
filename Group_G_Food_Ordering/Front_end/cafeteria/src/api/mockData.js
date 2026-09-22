const KOTA = "https://upload.wikimedia.org/wikipedia/commons/7/7f/Kota%2C_Bunnychow_sa.jpg";
const COKE_500 = "https://www.zepbrook.co.uk/cdn/shop/files/cocacola500ml.jpg?v=1709044630&width=1000";
const COKE_BIG = "https://pngimg.com/uploads/cocacola/coca_cola_PNG8904.png";

// Same shape as MenuItemDto (+ category, which the backend doesn't have yet).
const items = (shopId, rows) =>
  rows.map(([name, description, price, category, image], index) => ({
    id: `${shopId}-${index}`,
    shopId,
    name,
    description,
    price,
    category,
    image,
    availability: true,
  }));

export const shops = [
  { id: "cafeteria", shopName: "Cafeteria", status: "OPEN", description: "Your campus favourites", accent: "#d65d3e" },
  { id: "gallitos", shopName: "Gallito's", status: "OPEN", description: "Flame-grilled chicken", accent: "#c03b2f" },
  { id: "fish", shopName: "Fish & Chips", status: "OPEN", description: "Crispy, golden and fresh", accent: "#146e8a" },
];

export const menus = {
  cafeteria: items("cafeteria", [
    ["Kota R25", "Fresh bread, chips, sausage and atchar", 25, "Kotas", KOTA],
    ["Kota R30", "Classic kota with egg and cheese", 30, "Kotas", KOTA],
    ["Kota R35", "Loaded with patty, egg, cheese and atchar", 35, "Kotas", KOTA],
    ["Kota R45", "Double patty, cheese, chips and atchar", 45, "Kotas", KOTA],
    ["Chicken plate R55", "Grilled chicken, pap and fresh salad", 55, "Plates", "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=85"],
    ["Chicken plate R65", "Large grilled chicken plate with sides", 65, "Plates", "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=85"],
    ["Beef plate R65", "Tender beef, pap and fresh salad", 65, "Plates", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85"],
    ["Beef plate R75", "Large beef plate with extra sides", 75, "Plates", "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=85"],
    ["Coke 500 ml", "Ice-cold Coca-Cola", 15, "Cold drinks", COKE_500],
    ["Coke 1 L", "Ice-cold Coca-Cola bottle", 21, "Cold drinks", COKE_BIG],
    ["Coke 2 L", "Large Coca-Cola bottle", 35, "Cold drinks", COKE_BIG],
    ["Fanta 2 L", "Large ice-cold Fanta bottle", 30, "Cold drinks", "https://continentalfoodstore.co.uk/cdn/shop/files/Fanta-OrangeBottle-2L.jpg?v=1740683709"],
  ]),
  gallitos: items("gallitos", [
    ["Quarter Chicken", "Flame-grilled chicken with your choice of basting", 49, "Chicken", "https://img.mrdfood.com/data/7ea1753e-209f-49ab-9037-461a4f1c5f01.png"],
    ["Half Chicken", "Flame-grilled chicken with your choice of basting", 89, "Chicken", "https://pbs.twimg.com/media/Gt_GO95XIAAt7of.jpg"],
    ["Full Chicken", "Whole flame-grilled chicken for sharing", 169, "Chicken", "https://pbs.twimg.com/media/Gt_GO95XIAAt7of.jpg"],
    ["Chicken Burger", "Flame-grilled chicken fillet on a fresh roll", 55, "Burgers", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85"],
    ["Double Chicken Burger", "Two flame-grilled chicken fillets", 79, "Burgers", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85"],
    ["Chicken Strips and Chips", "Crispy chicken strips served with chips", 59, "Meals", "https://images.bolt.eu/store/2026/2026-01-06/c5edcaac-65ed-4070-9e55-9e44a1eaa317.jpeg"],
    ["Pap and Gravy", "A traditional side with savoury gravy", 22, "Sides", "https://cdn.24.co.za/files/Cms/General/d/8475/4f54f83339574ba18109a4e6c2ae449b.png"],
    ["Regular Chips", "Golden, crispy chips", 25, "Sides", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85"],
    ["Coleslaw", "Creamy fresh coleslaw", 18, "Sides", "https://popmenucloud.com/cdn-cgi/image/width%3D1200%2Cheight%3D630%2Cformat%3Dauto%2Cfit%3Dcover/ywznsqig/870ff3e4-7754-4865-82f2-a5332b65ca5e.jpg"],
  ]),
  fish: items("fish", [
    ["Hake and Chips", "Crispy battered hake with golden chips", 55, "Fish meals", "https://images.unsplash.com/photo-1579208030886-b937da0925dc?auto=format&fit=crop&w=900&q=85"],
    ["2 Piece Hake and Chips", "Two hake portions with golden chips", 75, "Fish meals", "https://tb-static.uber.com/prod/image-proc/processed_images/727cc6ed372a6049d2ed1b9df3f0d4e8/bc9c318a9c96996e2d990faf2b0c65f6.jpeg"],
    ["Family Fish and Chips", "Four hake portions with a large chips", 155, "Fish meals", "https://tb-static.uber.com/prod/image-proc/processed_images/ddc6c5731534c94a5d168db169464814/b4facf495c22df52f3ca635379ebe613.jpeg"],
    ["Fish Burger", "Battered fish fillet, lettuce and tartar sauce", 49, "Burgers", "https://img.mrdfood.com/marketing/59dd3e30-92c1-4ed8-8e08-b3db47e9ff6b.jpeg"],
    ["Calamari and Chips", "Tender calamari rings with chips", 65, "Seafood", "https://www.sa-venues.com/things-to-do/westerncape/gallery/5330/5.jpg"],
    ["Russian and Chips", "Grilled Russian sausage with chips", 42, "Extras", "https://doepies.websitedesigns-sa.co.za/wp-content/uploads/2022/11/russian-sausage.jpg"],
    ["Large Chips", "Golden, crispy chips", 35, "Extras", "https://tb-static.uber.com/prod/image-proc/processed_images/15f7627fa38241563ce951c5b8a77662/5954bcb006b10dbfd0bc160f6370faf3.jpeg"],
    ["Coke 500 ml", "Ice-cold Coca-Cola", 15, "Cold drinks", COKE_500],
  ]),
};
