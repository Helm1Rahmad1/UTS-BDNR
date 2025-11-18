# Skema Database MongoDB - ThriftStyle

Dokumen ini menjelaskan struktur (skema) untuk setiap koleksi dalam database `thriftstyle`.
Setiap skema juga memiliki `createdAt` dan `updatedAt` secara otomatis karena `{ timestamps: true }`.

---

### 1. `users`

Menyimpan data pengguna yang terdaftar di aplikasi.

```json
{
  "_id": "ObjectId",
  "name": { "type": "String", "required": true },
  "email": { "type": "String", "required": true, "unique": true },
  "passwordHash": { "type": "String", "required": true },
  "isAdmin": { "type": "Boolean", "default": false },
  "avatar": { "type": "String", "default": "" },
  "phone": { "type": "String", "default": "" }
}
```

---

### 2. `products`

Menyimpan semua data produk yang dijual.

```json
{
  "_id": "ObjectId",
  "name": { "type": "String", "required": true },
  "slug": { "type": "String", "required": true, "unique": true },
  "description": { "type": "String", "required": true },
  "images": [{ "type": "String", "required": true }],
  "price": { "type": "Number", "required": true },
  "brand": { "type": "ObjectId", "ref": "Brand", "required": true },
  "category": { "type": "ObjectId", "ref": "Category", "required": true },
  "condition": {
    "type": "String",
    "required": true,
    "enum": ["New", "Like New", "Very Good", "Good", "Acceptable"]
  },
  "size": { "type": "String", "required": true },
  "stock": { "type": "Number", "required": true, "default": 1 },
  "rating": { "type": "Number", "default": 0 },
  "numReviews": { "type": "Number", "default": 0 }
}
```

---

### 3. `categories`

Menyimpan data kategori produk.

```json
{
  "_id": "ObjectId",
  "name": { "type": "String", "required": true, "unique": true },
  "slug": { "type": "String", "required": true, "unique": true }
}
```

---

### 4. `brands`

Menyimpan data merek produk.

```json
{
  "_id": "ObjectId",
  "name": { "type": "String", "required": true, "unique": true },
  "slug": { "type": "String", "required": true, "unique": true }
}
```

---

### 5. `reviews`

Menyimpan ulasan yang diberikan oleh pengguna untuk produk.

```json
{
  "_id": "ObjectId",
  "user": { "type": "ObjectId", "ref": "User", "required": true },
  "product": { "type": "ObjectId", "ref": "Product", "required": true },
  "rating": { "type": "Number", "required": true },
  "comment": { "type": "String", "required": true }
}
```

---

### 6. `carts`

Menyimpan data keranjang belanja untuk setiap pengguna.

```json
{
  "_id": "ObjectId",
  "user": { "type": "ObjectId", "ref": "User", "required": true, "unique": true },
  "items": [
    {
      "product": { "type": "ObjectId", "ref": "Product", "required": true },
      "quantity": { "type": "Number", "required": true, "min": 1 }
    }
  ]
}
```
