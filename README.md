# Software QA Final Project (REST API)

![CI Status](https://github.com/Reyisbey/Final-Projesi/actions/workflows/main.yml/badge.svg)
![Codecov](https://img.shields.io/codecov/c/github/Reyisbey/Final-Projesi)

Bu proje, Yazılım Kalitesi ve Güvencesi dersi dönem sonu projesi kapsamında geliştirilmiş, 5 farklı kaynak (Users, Products, Categories, Orders, Reviews) içeren kapsamlı bir REST API'dir.

## 🚀 Teknolojiler

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: SQLite (Geliştirme ve Test kolaylığı için) / MySQL (Desteklenir)
*   **ORM**: Sequelize
*   **Testing**: Jest, Supertest
*   **Documentation**: Swagger / OpenAPI
*   **CI/CD**: GitHub Actions

## 📦 Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/Reyisbey/Final-Projesi.git
    cd Final-Projesi
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın:**
    ```bash
    npm start
    ```
    *Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.*

## 📖 API Dokümantasyonu

API endpoints, request/response şemaları ve test imkanı için Swagger UI entegre edilmiştir.

*   **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Temel Endpointler

*   **Users**: `GET /api/users`, `POST /api/users`
*   **Products**: `GET /api/products`, `POST /api/products`
*   **Categories**: `GET /api/categories`, `POST /api/categories`
*   **Orders**: `POST /api/orders` (Sipariş oluşturma ve stok düşümü yapar)
*   **Reviews**: `GET /api/reviews`, `POST /api/reviews`

## 🧪 Testler

Proje kapsamında **Birim (Unit)**, **Entegrasyon (Integration)** ve **Sistem (E2E)** testleri bulunmaktadır.

Testleri çalıştırmak için:

```bash
npm test
```

Coverage raporu için:

```bash
npm run test:coverage
```

### Test Kapsamı
*   **Unit Tests**: Controller mantığı ve modeller mocklanarak test edilmiştir.
*   **Integration Tests**: API endpointleri SQLite (:memory:) veritabanı üzerinde test edilmiştir.
*   **System Tests**: Kullanıcı kaydından sipariş oluşturmaya kadar olan tam akış test edilmiştir.

## 🛠 CI/CD Pipeline

Bu proje **GitHub Actions** kullanılarak sürekli entegrasyon (CI) sürecine dahil edilmiştir.
Her `push` ve `pull_request` işleminde:
1.  Uygulama derlenir (Build).
2.  Tüm testler çalıştırılır.
3.  Code coverage raporu oluşturulur (Codecov entegrasyonu mevcuttur).

Workflow dosyası: `.github/workflows/main.yml`

---
**Geliştirici**: Talat