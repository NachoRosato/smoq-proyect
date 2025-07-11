const mongoose = require("mongoose");
const Producto = require("./models/Producto");
const Categoria = require("./models/Categoria");
const Gusto = require("./models/Gusto");
require("dotenv").config();

const productosEjemplo = [
  {
    nombre: "Camiseta Básica",
    descripcion:
      "Camiseta de algodón 100% premium, perfecta para el día a día. Disponible en varios colores y talles.",
    precio: 2500,
    imagen:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    categoria: "ropa",
    stock: 50,
    activo: true,
  },
  {
    nombre: "Jeans Clásicos",
    descripcion:
      "Jeans de alta calidad con el corte perfecto. Cómodos y duraderos para cualquier ocasión.",
    precio: 4500,
    imagen:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
    categoria: "ropa",
    stock: 30,
    activo: true,
  },
  {
    nombre: "Zapatillas Deportivas",
    descripcion:
      "Zapatillas ideales para deporte y uso casual. Suela antideslizante y diseño moderno.",
    precio: 3800,
    imagen:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    categoria: "calzado",
    stock: 25,
    activo: true,
  },
  {
    nombre: "Reloj Elegante",
    descripcion:
      "Reloj de diseño minimalista con correa de cuero genuino. Perfecto para ocasiones especiales.",
    precio: 12000,
    imagen:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop",
    categoria: "accesorios",
    stock: 15,
    activo: true,
  },
  {
    nombre: "Mochila Urbana",
    descripcion:
      "Mochila resistente con múltiples compartimentos. Ideal para trabajo y viajes.",
    precio: 3200,
    imagen:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    categoria: "accesorios",
    stock: 20,
    activo: true,
  },
  {
    nombre: "Sandalias de Verano",
    descripcion:
      "Sandalias cómodas y elegantes para el verano. Material transpirable y suela flexible.",
    precio: 1800,
    imagen:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop",
    categoria: "calzado",
    stock: 35,
    activo: true,
  },
  {
    nombre: "Gorra Deportiva",
    descripcion:
      "Gorra ajustable con diseño deportivo. Protección UV y transpirable.",
    precio: 1200,
    imagen:
      "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=500&h=500&fit=crop",
    categoria: "accesorios",
    stock: 40,
    activo: true,
  },
  {
    nombre: "Chaqueta de Cuero",
    descripcion:
      "Chaqueta de cuero genuino con diseño clásico. Abrigada y elegante para cualquier ocasión.",
    precio: 8500,
    imagen:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
    categoria: "ropa",
    stock: 12,
    activo: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/smoq");
  await Categoria.deleteMany();
  await Producto.deleteMany();
  await Gusto.deleteMany();

  // Crear categorías
  const categorias = await Categoria.insertMany([
    { nombre: "ropa" },
    { nombre: "calzado" },
    { nombre: "accesorios" },
  ]);

  // Crear gustos
  const gustos = await Gusto.insertMany([
    { nombre: "Rojo", descripcion: "Color rojo intenso" },
    { nombre: "Azul", descripcion: "Color azul marino" },
    { nombre: "Negro", descripcion: "Color negro clásico" },
    { nombre: "Blanco", descripcion: "Color blanco puro" },
    { nombre: "Talle S", descripcion: "Talle pequeño" },
    { nombre: "Talle M", descripcion: "Talle mediano" },
    { nombre: "Talle L", descripcion: "Talle grande" },
    { nombre: "Clásico", descripcion: "Estilo clásico" },
    { nombre: "Deportivo", descripcion: "Estilo deportivo" },
    { nombre: "Verano", descripcion: "Ideal para verano" },
  ]);

  // Mapear nombres a IDs
  const catMap = {};
  categorias.forEach((cat) => {
    catMap[cat.nombre] = cat._id;
  });
  const gustoMap = {};
  gustos.forEach((g) => {
    gustoMap[g.nombre] = g._id;
  });

  // Crear productos con referencia a categoría y gustos
  await Producto.insertMany([
    {
      nombre: "Camiseta Básica",
      descripcion:
        "Camiseta de algodón 100% premium, perfecta para el día a día. Disponible en varios colores y talles.",
      precio: 2500,
      imagen:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
      categoria: catMap["ropa"],
      stock: 50,
      gustos: [
        gustoMap["Rojo"],
        gustoMap["Azul"],
        gustoMap["Negro"],
        gustoMap["Blanco"],
        gustoMap["Talle S"],
        gustoMap["Talle M"],
        gustoMap["Talle L"],
      ],
      activo: true,
    },
    {
      nombre: "Jeans Clásicos",
      descripcion:
        "Jeans de alta calidad con el corte perfecto. Cómodos y duraderos para cualquier ocasión.",
      precio: 4500,
      imagen:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
      categoria: catMap["ropa"],
      stock: 30,
      gustos: [gustoMap["Talle S"], gustoMap["Talle M"], gustoMap["Talle L"]],
      activo: true,
    },
    {
      nombre: "Zapatillas Deportivas",
      descripcion:
        "Zapatillas ideales para deporte y uso casual. Suela antideslizante y diseño moderno.",
      precio: 3800,
      imagen:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
      categoria: catMap["calzado"],
      stock: 25,
      gustos: [gustoMap["Deportivo"], gustoMap["Clásico"]],
      activo: true,
    },
    {
      nombre: "Reloj Elegante",
      descripcion:
        "Reloj de diseño minimalista con correa de cuero genuino. Perfecto para ocasiones especiales.",
      precio: 12000,
      imagen:
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop",
      categoria: catMap["accesorios"],
      stock: 15,
      gustos: [], // Sin gustos
      activo: true,
    },
    {
      nombre: "Mochila Urbana",
      descripcion:
        "Mochila resistente con múltiples compartimentos. Ideal para trabajo y viajes.",
      precio: 3200,
      imagen:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
      categoria: catMap["accesorios"],
      stock: 20,
      gustos: [gustoMap["Negro"], gustoMap["Azul"]],
      activo: true,
    },
    {
      nombre: "Sandalias de Verano",
      descripcion:
        "Sandalias cómodas y elegantes para el verano. Material transpirable y suela flexible.",
      precio: 1800,
      imagen:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop",
      categoria: catMap["calzado"],
      stock: 35,
      gustos: [gustoMap["Verano"], gustoMap["Clásico"]],
      activo: true,
    },
    {
      nombre: "Gorra Deportiva",
      descripcion:
        "Gorra ajustable con diseño deportivo. Protección UV y transpirable.",
      precio: 1200,
      imagen:
        "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=500&h=500&fit=crop",
      categoria: catMap["accesorios"],
      stock: 40,
      gustos: [gustoMap["Deportivo"], gustoMap["Negro"]],
      activo: true,
    },
    {
      nombre: "Chaqueta de Cuero",
      descripcion:
        "Chaqueta de cuero genuino con diseño clásico. Abrigada y elegante para cualquier ocasión.",
      precio: 8500,
      imagen:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
      categoria: catMap["ropa"],
      stock: 12,
      gustos: [gustoMap["Negro"], gustoMap["Clásico"]],
      activo: true,
    },
  ]);

  mongoose.disconnect();
}

seed();
