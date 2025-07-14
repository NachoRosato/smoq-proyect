const Producto = require("../models/Producto");

/**
 * Actualiza productos cuando se elimina una categoría
 * @param {string} categoriaId - ID de la categoría eliminada
 * @returns {Promise<Object>} - Resultado de la actualización
 */
async function updateProductosOnCategoriaDelete(categoriaId) {
  try {
    console.log(
      `🔄 Actualizando productos después de eliminar categoría: ${categoriaId}`
    );

    // Buscar productos que usan esta categoría
    const productos = await Producto.find({ categoria: categoriaId });

    if (productos.length === 0) {
      console.log(`✅ No se encontraron productos con la categoría eliminada`);
      return { success: true, updatedCount: 0 };
    }

    // Opción 1: Desactivar productos (recomendado)
    const updateResult = await Producto.updateMany(
      { categoria: categoriaId },
      {
        activo: false,
        // Agregar un campo para indicar por qué fue desactivado
        $set: {
          categoriaEliminada: true,
          fechaDesactivacion: new Date(),
        },
      }
    );

    console.log(
      `✅ ${updateResult.modifiedCount} productos desactivados por eliminación de categoría`
    );

    return {
      success: true,
      updatedCount: updateResult.modifiedCount,
      action: "desactivated",
    };
  } catch (error) {
    console.error(
      "❌ Error actualizando productos por eliminación de categoría:",
      error
    );
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza productos cuando se elimina un gusto
 * @param {string} gustoId - ID del gusto eliminado
 * @returns {Promise<Object>} - Resultado de la actualización
 */
async function updateProductosOnGustoDelete(gustoId) {
  try {
    console.log(
      `🔄 Actualizando productos después de eliminar gusto: ${gustoId}`
    );

    // Buscar productos que usan este gusto
    const productos = await Producto.find({
      $or: [{ gustos: gustoId }, { "stockPorGusto.gusto": gustoId }],
    });

    if (productos.length === 0) {
      console.log(`✅ No se encontraron productos con el gusto eliminado`);
      return { success: true, updatedCount: 0 };
    }

    // Actualizar productos: remover el gusto de gustos y stockPorGusto
    const updateResult = await Producto.updateMany(
      { gustos: gustoId },
      {
        $pull: {
          gustos: gustoId,
          stockPorGusto: { gusto: gustoId },
        },
      }
    );

    console.log(
      `✅ ${updateResult.modifiedCount} productos actualizados por eliminación de gusto`
    );

    return {
      success: true,
      updatedCount: updateResult.modifiedCount,
      action: "removed_gusto",
    };
  } catch (error) {
    console.error(
      "❌ Error actualizando productos por eliminación de gusto:",
      error
    );
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza productos cuando se modifica una categoría
 * @param {string} categoriaId - ID de la categoría modificada
 * @param {Object} oldData - Datos anteriores de la categoría
 * @param {Object} newData - Nuevos datos de la categoría
 * @returns {Promise<Object>} - Resultado de la actualización
 */
async function updateProductosOnCategoriaUpdate(categoriaId, oldData, newData) {
  try {
    console.log(
      `🔄 Actualizando productos después de modificar categoría: ${categoriaId}`
    );

    // Buscar productos que usan esta categoría
    const productos = await Producto.find({ categoria: categoriaId });

    if (productos.length === 0) {
      console.log(`✅ No se encontraron productos con la categoría modificada`);
      return { success: true, updatedCount: 0 };
    }

    // Si solo cambió el nombre, no necesitamos hacer nada especial
    // Los productos seguirán funcionando normalmente
    console.log(
      `✅ ${productos.length} productos mantienen referencia a categoría modificada`
    );

    return {
      success: true,
      updatedCount: productos.length,
      action: "verified",
    };
  } catch (error) {
    console.error(
      "❌ Error verificando productos por modificación de categoría:",
      error
    );
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza productos cuando se modifica un gusto
 * @param {string} gustoId - ID del gusto modificado
 * @param {Object} oldData - Datos anteriores del gusto
 * @param {Object} newData - Nuevos datos del gusto
 * @returns {Promise<Object>} - Resultado de la actualización
 */
async function updateProductosOnGustoUpdate(gustoId, oldData, newData) {
  try {
    console.log(
      `🔄 Verificando productos después de modificar gusto: ${gustoId}`
    );

    // Buscar productos que usan este gusto
    const productos = await Producto.find({
      $or: [{ gustos: gustoId }, { "stockPorGusto.gusto": gustoId }],
    });

    if (productos.length === 0) {
      console.log(`✅ No se encontraron productos con el gusto modificado`);
      return { success: true, updatedCount: 0 };
    }

    // Si solo cambió el nombre, no necesitamos hacer nada especial
    // Los productos seguirán funcionando normalmente
    console.log(
      `✅ ${productos.length} productos mantienen referencia a gusto modificado`
    );

    return {
      success: true,
      updatedCount: productos.length,
      action: "verified",
    };
  } catch (error) {
    console.error(
      "❌ Error verificando productos por modificación de gusto:",
      error
    );
    return { success: false, error: error.message };
  }
}

/**
 * Función general para limpiar referencias huérfanas
 * @returns {Promise<Object>} - Resultado de la limpieza
 */
async function cleanupOrphanReferences() {
  try {
    console.log(`🧹 Iniciando limpieza de referencias huérfanas...`);

    // Importar modelos necesarios
    const Categoria = require("../models/Categoria");
    const Gusto = require("../models/Gusto");

    // Obtener todas las categorías y gustos existentes
    const categoriasExistentes = await Categoria.find({}, "_id");
    const gustosExistentes = await Gusto.find({}, "_id");

    const categoriaIds = categoriasExistentes.map((c) => c._id.toString());
    const gustoIds = gustosExistentes.map((g) => g._id.toString());

    // Limpiar productos con categorías huérfanas
    const productosConCategoriasHuerfanas = await Producto.find({
      categoria: { $nin: categoriasExistentes.map((c) => c._id) },
    });

    if (productosConCategoriasHuerfanas.length > 0) {
      await Producto.updateMany(
        { categoria: { $nin: categoriasExistentes.map((c) => c._id) } },
        {
          activo: false,
          categoriaEliminada: true,
          fechaDesactivacion: new Date(),
        }
      );
      console.log(
        `✅ ${productosConCategoriasHuerfanas.length} productos desactivados por categorías huérfanas`
      );
    }

    // Limpiar productos con gustos huérfanos
    const productosConGustosHuerfanos = await Producto.find({
      $or: [
        { gustos: { $nin: gustosExistentes.map((g) => g._id) } },
        { "stockPorGusto.gusto": { $nin: gustosExistentes.map((g) => g._id) } },
      ],
    });

    if (productosConGustosHuerfanos.length > 0) {
      // Remover gustos huérfanos
      for (const producto of productosConGustosHuerfanos) {
        const gustosValidos = producto.gustos.filter((g) =>
          gustoIds.includes(g.toString())
        );
        const stockPorGustoValido = producto.stockPorGusto.filter((sg) =>
          gustoIds.includes(sg.gusto.toString())
        );

        await Producto.updateOne(
          { _id: producto._id },
          {
            gustos: gustosValidos,
            stockPorGusto: stockPorGustoValido,
          }
        );
      }
      console.log(
        `✅ ${productosConGustosHuerfanos.length} productos limpiados de gustos huérfanos`
      );
    }

    return {
      success: true,
      categoriasHuerfanas: productosConCategoriasHuerfanas.length,
      gustosHuerfanos: productosConGustosHuerfanos.length,
    };
  } catch (error) {
    console.error("❌ Error en limpieza de referencias huérfanas:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  updateProductosOnCategoriaDelete,
  updateProductosOnGustoDelete,
  updateProductosOnCategoriaUpdate,
  updateProductosOnGustoUpdate,
  cleanupOrphanReferences,
};
