# C2C Marketplace Features - Implementation Summary

## ✅ Implementasi Selesai

### 1. Modifikasi Product Schema
**File:** `models/Product.ts`

Perubahan:
- ✅ Tambah field `seller` (ref ke User, required)
- ✅ Tambah field `listingStatus` (enum: "ACTIVE"/"SOLD", default: "ACTIVE")
- ✅ Ubah `stock` default jadi 1

### 2. Model Offer Baru
**File:** `models/Offer.ts`

Schema:
- `product` → Ref ke Product
- `buyer` → Ref ke User
- `seller` → Ref ke User
- `offerPrice` → Number (required)
- `status` → Enum: "PENDING", "ACCEPTED", "DECLINED" (default: "PENDING")
- `createdAt` → Date

### 3. API CRUD untuk Offer

#### **POST /api/offers** - Buat tawaran baru
```json
{
  "productId": "product_id_here",
  "offerPrice": 150000
}
```
Validasi:
- ✅ User harus login
- ✅ Product harus ACTIVE
- ✅ Tidak bisa offer produk sendiri
- ✅ Tidak bisa offer 2x untuk produk yang sama (PENDING)

#### **GET /api/offers** - List semua offers user
Response: Array of offers dengan populate product, buyer, seller

#### **PATCH /api/offers/[id]** - Update status offer (Accept/Decline)
```json
{
  "status": "ACCEPTED"  // atau "DECLINED"
}
```
Validasi:
- ✅ Hanya seller yang bisa update
- ✅ Hanya offer PENDING yang bisa diupdate
- ✅ Jika ACCEPTED → product jadi SOLD & decline offer lain

#### **GET /api/offers/[id]** - Detail satu offer
Response: Offer details dengan populate data

### 4. API Join dengan Aggregation (untuk Poin UTS)

#### **GET /api/users/my-offers** - Get offers dengan MongoDB $lookup
Menggunakan aggregation pipeline:
```javascript
$match → $lookup (products) → $lookup (users) → $project → $sort
```

Response berisi:
- Semua offers user (sebagai buyer atau seller)
- Join dengan product details (name, images, price, slug)
- Join dengan user details (buyer & seller info)
- Sorted by createdAt descending

## Testing

### 1. Buat Offer
```bash
curl -X POST http://localhost:3000/api/offers \
  -H "Content-Type: application/json" \
  -d '{"productId": "PRODUCT_ID", "offerPrice": 150000}'
```

### 2. List Offers
```bash
curl http://localhost:3000/api/offers
```

### 3. Accept/Decline Offer (sebagai seller)
```bash
curl -X PATCH http://localhost:3000/api/offers/OFFER_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "ACCEPTED"}'
```

### 4. Get My Offers (dengan Join)
```bash
curl http://localhost:3000/api/users/my-offers
```

## Database Migration

Sudah dijalankan:
```bash
npm run migrate
```
- ✅ 100 products updated
- ✅ Semua product sekarang punya seller (admin)
- ✅ listingStatus = "ACTIVE"
- ✅ stock = 1

## Next Steps (Optional)

Frontend yang perlu dibuat:
1. Tombol "Make Offer" di product detail page
2. Dialog form untuk input offer price
3. Page untuk list offers (buyer & seller view)
4. UI untuk accept/decline offers (seller)
5. Badge "SOLD" untuk produk yang sudah sold

## Catatan Teknis

- Authentication menggunakan NextAuth
- Protected routes sudah handle di middleware
- MongoDB aggregation untuk join collections
- Auto-decline offers lain saat accept satu offer
- Update product status ke SOLD saat offer accepted
