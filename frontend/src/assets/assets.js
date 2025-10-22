import logo from './logo.png';
import search_icon from './search_icon.png';
import profile_icon from './profile_icon.png';
import cart_icon from './cart_icon.png';
import menu_icon from './menu_icon.png';
import back_icon from './back_icon.png';
import exchange_icon from './exchange_icon.png';
import check_icon from './check_icon.png';
import support_icon from './support_icon.png';
import phone_icon from './phone_icon.png';
import mail_icon from './mail_icon.png';
import location_icon from './location_icon.png';
import star_icon from './star_icon.png';
import cross_icon from './cross_icon.png';
import star_dull_icon from './star_dull_icon.png';
import bin_icon from './bin_icon.png';
import neworder_icon from './neworder_icon.png';
import card_logo from './card_logo.png';
import about_img from './about_img.jpg';
import contact_img from './contact_img.jpg';
import hero_img from './hero_img.png';
import rcdf from './rcdf1.jpg';
import rcdf2 from './rcdf2.jpeg';
import rcdf3 from './rcdf3.jpeg';
import rccf from './rccf1.jpg';
import rccf2 from './rccf2.png';
import rccf3 from './rccf3.jpg';
import bf1 from './bf1.jpg';
import bf2 from './bf2.jpg';
import bf3 from './bf3.jpg';
import dt1 from './dt1.png';
import dt2 from './dt2.png'
import dt3 from './dt3.jpg'
import ct1 from './ct1.jpg';
import ct2 from './ct2.jpeg'
import ct3 from './ct3.png';
import bt1 from './bt1.jpeg';
import bt2 from './bt2.jpg';
import dtoy1 from './dtoy1.jpg'
import dtoy2 from './dtoy2.jpg'
import ctoy1 from './ctoy1.png'
import ctoy2 from './ctoy2.jpg'
import btoy1 from './btoy1.jpg'
import btoy2 from './btoy2.jpeg'


export const assets = {
    logo,
    rcdf,
    rccf,
    search_icon,
    profile_icon,
    cart_icon,
    menu_icon,
    back_icon,
    exchange_icon,
    check_icon,
    support_icon,
    phone_icon,
    mail_icon,
    location_icon,
    cross_icon,
    star_icon,
    star_dull_icon,
    bin_icon,
    neworder_icon,
    card_logo,
    about_img,
    contact_img,
    hero_img,
    rcdf2,
    rcdf3,
    rccf2,
    rccf3,
    bf1,
    bf2,
    bf3,
    dt1,
    ct1,
    bt1,
    bt2,
    dtoy1,
    dtoy2,
    btoy1,
    btoy2

}

export const products = [
{
    _id: "rcdf",
    name: "Royal Canin Mini Adult",
    brand: "Royal Canin",
    description: "Premium dog food for adult dogs.",
    image: [rcdf],
    category: "Food",
    subCategory: "Dog",
    seller: "All for pet shop",
    date: "2025-08-23",
    bestseller: true,
    options: [
    { weight: "2kg", price: 100, sale_price: 75, special_price: true },
    { weight: "4kg", price: 180, sale_price: 140, special_price: true },
    { weight: "8kg", price: 350, sale_price: 260, special_price: true }
  ]
},

{
    _id: "rcdf2",
    name: "Royal Canin Maxi Puppy",
    brand: "Royal Canin",
    description: "Premium dog food for maxi puppy dogs.",
    image: [rcdf2],
    category: "Food",
    subCategory: "Dog",
    seller: "All for pet shop",
    date: "2025-08-27",
    bestseller: false,
    options: [
    { weight: "2kg", price: 100, sale_price: 75, special_price: true },
    { weight: "4kg", price: 180, sale_price: 140, special_price: false },
    { weight: "8kg", price: 350, sale_price: 260, special_price: true }
  ]
},

{
    _id: "rcdf3",
    name: "Royal Canin Mini Puppy",
    brand: "Royal Canin",
    description: "Premium dog food for mini puppy dogs.",
    image: [rcdf3],
    category: "Food",
    subCategory: "Dog",
    seller: "Animax",
    date: "2025-08-27",
    bestseller: false,
    options: [
    { weight: "2kg", price: 95, sale_price: 70, special_price: true },
    { weight: "4kg", price: 150, sale_price: 140, special_price: false },
  ]
    
},

{
    _id: "rccf",
    name: "Royal Canin Indoor",
    brand: "Royal Canin",
    description: "Premium cat food for adult cats.",
    image: [rccf],
    category: "Food",
    subCategory: "Cat",
    seller: "Animaux",
    date: "2025-08-23",
    bestseller: false,
    options: [
    { weight: "2kg", price: 100, sale_price: 75, special_price: true },
    { weight: "4kg", price: 180, sale_price: 140, special_price: false },
  ]

},

{
    _id: "rccf2",
    name: "Royal Canin Mother & Babycat",
    brand: "Royal Canin",
    description: "Premium cat food for kitten cats.",
    image: [rccf2],
    category: "Food",
    subCategory: "Cat",
    seller: "Animax",
    date: "2025-08-27",
    bestseller: false,
    options: [
    { weight: "2kg", price: 100, sale_price: 75, special_price: true },
    { weight: "4kg", price: 180, sale_price: 140, special_price: false },
  ]

},

{
    _id: "rccf3",
    name: "Royal Canin Cat Sensible",
    brand: "Royal Canin",
    description: "Premium cat food for sensible adult cats.",
    image: [rccf3],
    category: "Food",
    subCategory: "Cat",
    seller: "All for pet shop",
    date: "2025-08-27",
    bestseller: false,
    options: [
    { weight: "2kg", price: 100, sale_price: 75, special_price: true },
  ]

},
{
    _id: "bf1",
    name: "Wild Bird Food",
    description: "Best Wild Bird Food",
    image: [bf1],
    category: "Food",
    subCategory: "Bird",
    seller: "All for pet shop",
    date: "2025-08-31",
    bestseller: false,
    options: [
    { weight: "4.45kg", price: 80, sale_price: 45, special_price: false },
  ]

},
{
    _id: "bf2",
    name: "FruitBlend Flavor",
    description: "FruitBlend Flavor with antural flavors",
    image: [bf2],
    category: "Food",
    subCategory: "Bird",
    seller: "Animax",
    date: "2025-08-31",
    bestseller: false,
    options: [
    { weight: "1.6kg", price: 50, sale_price: 45, special_price: false },
  ]
    

},
{
    _id: "bf3",
    name: "Bird Food",
    description: "Best Bird Food",
    image: [bf3],
    category: "Food",
    subCategory: "Bird",
    seller: "All for pet shop",
    date: "2025-08-31",
    bestseller: false,
    options: [
    { weight: "1kg", price: 20, sale_price: 10, special_price: false },
  ]

},

{
    _id: "dt1",
    name: "Dog treats Bon Snacks chicken taste",
    description: "Premium dog treats for all breeds.",
    image: [dt1],
    category: "Treat",
    subCategory: "Dog",
    seller: "Animax",
    date: "2025-08-28",
    bestseller: false,
    options: [
    { weight: "90g", price: 20, sale_price: 18, special_price: true },
  ]

},
{
    _id: "dt2",
    name: "Dog treats Beeno chicken taste",
    description: "Rollies Meaty Treats, Crispy Chicken Flavour.",
    image: [dt2],
    category: "Treat",
    subCategory: "Dog",
    seller: "Animax",
    date: "2025-08-29",
    bestseller: true,
    options: [
    { weight: "120g", price: 20, sale_price: 18, special_price: false },
  ]

},
{
    _id: "dt3",
    name: "Dog treats Mini Bones chicken taste",
    description: "Premium dog treats Mini Bones, chicken.",
    image: [dt3],
    category: "Treat",
    subCategory: "Dog",
    seller: "All for pet shop",
    date: "2025-08-29",
    bestseller: false,
    options: [
    { weight: "150g", price: 25, sale_price: 20, special_price: true },
  ]

},
{
    _id: "ct1",
    name: "Cat treats Creamy Squid",
    description: "Premium cat treats for all breeds.",
    image: [ct1],
    category: "Treat",
    subCategory: "Cat",
    seller: "Animax",
    date: "2025-08-28",
    bestseller: false,
    options: [
    { weight: "60g", price: 25, sale_price: 20, special_price: true },
  ]

},
{
    _id: "ct2",
    name: "Cat treats Delectables Squeeze up chicken taste",
    description: "Premium cat treats for all breeds.",
    image: [ct2],
    category: "Treat",
    subCategory: "Cat",
    seller: "All for pet shop",
    date: "2025-08-29",
    bestseller: true,
    options: [
    { weight: "60g", price: 25, sale_price: 18, special_price: true },
  ]

},
{
    _id: "ct3",
    name: "Cat treats prima cat chicken taste",
    description: "Premium cat treats for all breeds.",
    image: [ct3],
    category: "Treat",
    subCategory: "Cat",
    seller: "Animax",
    date: "2025-08-29",
    bestseller: true,
    options: [
    { weight: "40g", price: 15, sale_price: 20, special_price: false },
  ]

},
{
    _id: "bt1",
    name: "Natural Spray millet",
    description: "Natural Spray millet for all the birds.",
    image: [bt1],
    category: "Treat",
    subCategory: "Bird",
    seller: "Animax",
    date: "2025-08-31",
    bestseller: false,
    options: [
    { weight: "453g", price: 35, sale_price: 10, special_price: false },
  ]

},
{
    _id: "bt2",
    name: "Prestige Sticks",
    description: "Prestige Sticks with eggs and Thyme.",
    image: [bt2],
    category: "Treat",
    subCategory: "Bird",
    seller: "Animax",
    date: "2025-08-31",
    bestseller: false,
    options: [
    { weight: "30g", price: 20, sale_price: 10, special_price: false },
  ]

},
{
    _id: "dtoy1",
    name: "Dog toy",
    description: "Premium dog toy for all breeds.",
    image: [dtoy1],
    category: "Toy",
    subCategory: "Dog",
    seller: "Animax",
    date: "2025-08-28",
    bestseller: false,
    options: [
    {  quantity: "1", price: 20, sale_price: 18, special_price: false },
  ]

},
{
    _id: "dtoy2",
    name: "Dog toy",
    description: "Premium dog toy for all breeds.",
    image: [dtoy2],
    category: "Toy",
    subCategory: "Dog",
    seller: "Animax",
    date: "2025-08-28",
    bestseller: false,
    options: [
    {  quantity: "1", price: 20, sale_price: 18, special_price: true },
  ]

},
{
    _id: "ctoy1",
    name: "Cat toy",
    description: "Premium cat toy for all breeds.",
    image: [ctoy1],
    category: "Toy",
    subCategory: "Cat",
    seller: "petra",
    date: "2025-08-29",
    bestseller: true,
    options: [
    {  quantity: "1", price: 18, sale_price: 15, special_price: false },
  ]

},
{
    _id: "ctoy2",
    name: "Cat toy",
    description: "Premium cat toy for all breeds.",
    image: [ctoy2],
    category: "Toy",
    subCategory: "Cat",
    seller: "petra",
    date: "2025-08-28",
    bestseller: false,
    options: [
    {  quantity: "1", price: 60, sale_price: 45, special_price: true },
  ]

},
{
    _id: "btoy1",
    name: "Bird toy",
    description: "Premium bird toy for all breeds.",
    image: [btoy1],
    category: "Toy",
    subCategory: "Bird",
    seller: "petra",
    date: "2025-08-31",
    bestseller: false,
    options: [
    {  quantity: "1", price: 45, sale_price: 45, special_price: false },
  ]

},
{
    _id: "btoy2",
    name: "Bird toy",
    description: "Premium bird toy for all breeds.",
    image: [btoy2],
    category: "Toy",
    subCategory: "Bird",
    seller: "petra",
    date: "2025-08-31",
    bestseller: false,
    options: [
    {  quantity: "1", price: 30, sale_price: 25, special_price: false },
  ]

},

]