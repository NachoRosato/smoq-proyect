const mongoose = require("mongoose");
const Producto = require("./models/Producto");
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

const seedDatabase = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpiar productos existentes
    await Producto.deleteMany({});
    console.log("🗑️ Productos existentes eliminados");

    // Insertar productos de ejemplo
    const productosCreados = await Producto.insertMany(productosEjemplo);
    console.log(`✅ ${productosCreados.length} productos creados exitosamente`);

    // Mostrar productos creados
    console.log("\n📦 Productos creados:");
    productosCreados.forEach((producto) => {
      console.log(`- ${producto.nombre}: $${producto.precio}`);
    });

    console.log("\n🎉 Base de datos poblada exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedDatabase();
