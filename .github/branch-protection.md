# Branch Protection Rules - Saldivia ERP

## Configuración de Protección de Ramas

### 🛡️ Rama `main` (Protegida)

**Reglas de protección aplicadas:**
- ✅ Requiere Pull Request para merge
- ✅ Requiere revisión de código
- ✅ Requiere que las ramas estén actualizadas antes del merge
- ✅ Incluye administradores en las restricciones
- ✅ Restringe push directo a main
- ✅ Elimina automáticamente ramas de feature después del merge

**Flujo de trabajo:**
1. Crear rama de desarrollo (ej: `v1.0.x-dev`)
2. Desarrollar funcionalidades en la rama de desarrollo
3. Crear Pull Request hacia `main`
4. Revisión de código obligatoria
5. Merge solo después de aprobación

### 🚀 Ramas de Desarrollo

**Nomenclatura:**
- `v1.0.x-dev` - Ramas de desarrollo por versión
- `feature/nombre-funcionalidad` - Ramas de funcionalidades específicas
- `hotfix/descripcion` - Ramas de correcciones urgentes

**Ciclo de vida:**
- Las ramas de desarrollo se eliminan después del merge exitoso a main
- Solo se mantiene la rama de desarrollo activa actual
- Historial completo preservado en main

### 📋 Versiones Actuales

- ✅ `v1.0.1` - Módulo de usuarios completo (mergeado a main)
- 🚧 `v1.0.2-dev` - En desarrollo activo
- ❌ `v1.0.1-dev` - Eliminada (obsoleta)

### 🔒 Comandos de Protección

```bash
# Eliminar rama obsoleta local
git branch -D nombre-rama

# Eliminar rama obsoleta remota
git push origin --delete nombre-rama

# Crear nueva rama de desarrollo
git checkout -b v1.0.x-dev
git push -u origin v1.0.x-dev
```

---

**Nota:** La protección de ramas se configura a nivel de repositorio en GitHub.
Para configurar: Settings → Branches → Add rule → Branch name pattern: `main` 