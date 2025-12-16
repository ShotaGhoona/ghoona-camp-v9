# バックエンドアーキテクチャドキュメント

## 目次

1. [オニオンアーキテクチャの概要](#オニオンアーキテクチャの概要)
2. [各層の役割](#各層の役割)
3. [Domain 層](#domain層)
4. [Application 層](#application層)
5. [Infrastructure 層](#infrastructure層)
6. [Presentation 層](#presentation層)
7. [DI 層](#di層)

---

## オニオンアーキテクチャの概要

オニオンアーキテクチャは、ドメインを中心とした同心円状の層構造を持つアーキテクチャです。

### オニオンアーキテクチャの構造

- **中心（Domain）**: ビジネスルール、エンティティ、値オブジェクト
- **2 層目（Application）**: ユースケース、ビジネスロジックの調整
- **最外層（Infrastructure, Presentation）**: 外部との接続（DB、API、外部サービス）
- **DI 層**: すべての層を繋ぎ、依存関係を解決

### 依存関係のルール

**依存の方向**: 外側から内側へのみ。内側の層は外側の層の実装を知る必要がない。

| 層                 | import できる層            | import できない層            |
| ------------------ | -------------------------- | ---------------------------- |
| **Domain**         | なし（完全に独立）         | すべて                       |
| **Application**    | Domain、別の Application   | Infrastructure, Presentation |
| **Infrastructure** | Domain, Application        | Presentation                 |
| **Presentation**   | Application, Domain（DTO） | Infrastructure（直接は NG）  |
| **DI**             | すべて（特別に許容）       | -                            |

### 重要な制約

- ✅ Application 層は Domain 層のみ import 可能
- ✅ DB 操作は Repository インターフェースを通して行う
- ✅ DI 層だけはすべての層を import できる（依存性注入のため）
- ❌ Application 層で Infrastructure 層（DB モデルなど）を直接 import しない
- ❌ Application 層で DB 操作を直接書かない

---

## 各層の役割

| 層                 | 役割                                                     |
| ------------------ | -------------------------------------------------------- |
| **Domain**         | ビジネスルール、エンティティ、リポジトリインターフェース |
| **Application**    | ユースケース、ビジネスロジックの調整                     |
| **Infrastructure** | DB 操作、外部サービス連携の実装                          |
| **Presentation**   | API エンドポイント、リクエスト/レスポンス                |
| **DI**             | 依存性注入、各層の接続                                   |

---

## Domain 層

**役割**: ビジネスドメインの中心で、ビジネスルールとエンティティを定義する純粋な層。

**ディレクトリ構造例**:

```
backend/app/domain/
├── entities/              # エンティティ
│   ├── user.py
│   ├── product.py
│   └── order.py
├── repositories/          # リポジトリインターフェース
│   ├── user_repository.py
│   ├── product_repository.py
│   └── order_repository.py
└── value_objects/         # 値オブジェクト
    ├── email.py
    ├── money.py
    └── status.py
```

### 1. Entity（エンティティ）

**何を書くか**:

- ビジネスの中心となるデータ構造
- 基本的には DB のテーブル構造と対応
- エンティティに対する**ビジネスルール**（フィールド操作のルール）

**重要**: エンティティには**ビジネスロジック**を持たせる。単なるデータクラスではない。

**ポイント**:

- エンティティにはビジネスルールを記述（`create_with_number`, `update_from_request`など）
- **Value Object を活用**してビジネスルールを適用（見積書番号生成など）
- **DB 操作はしない**。データ構造とルールのみ。
- Pydantic の`BaseModel`を継承する形で書く。

### 2. Value Object（値オブジェクト）

**何を書くか**:

- 型定義にプラス α してルールを設けたい時
- 不変性が重要な値

**ポイント**:

- **不変性**（`frozen = True`で一度作成したら変更できない）
- **等価性が値で決まる**（ID ではなく）
- **ビジネスルールをカプセル化**（application 層にルールの詳細を漏らさない！）
- Pydantic の`BaseModel`を使用する。

### 3. Repository（リポジトリインターフェース）

**何を書くか**:

- Infrastructure 層で実装する DB 操作のための**インターフェース**（抽象クラス）
- メソッドのシグネチャのみを定義（実装は Infrastructure 層）

**重要**:

- **Application 層ではこのインターフェースを使用**
- **本実装は Infrastructure 層にかく。**

**ポイント**:

- **Domain 層ではインターフェースのみ定義して、実装は書かない**（`pass`のみ）
- エンティティを引数・戻り値として使用
- ビジネスロジックに必要なメソッドを定義
  - 基本的には CRUD 操作がメイン。
  - 複雑なメソッドは query_service を使うべきという話もあるが、archaive では全部レポジトリに書いている。

---

## Application 層

**役割**: アプリケーションロジックの実装。ユースケースを定義し、ビジネスロジックを調整する。

**ディレクトリ構造**:

```
backend/app/application/
├── use_cases/             # ユースケース
│   ├── user_usecase.py
│   ├── product_usecase.py
│   └── order_usecase.py
├── interfaces/            # インターフェース定義
│   └── external_service.py
└── schemas/               # DTO（Data Transfer Object）
    ├── user_schemas.py
    ├── product_schemas.py
    └── order_schemas.py
```

### 1. Schema（DTO）

**何を書くか**:

- データ転送用のオブジェクト
- Application 層と Presentation 層で使用
- エンティティとは別物（エンティティはビジネスルール、DTO はデータ転送）

**ポイント**:

- Pydantic の`BaseModel`を使用
- Application 層と Presentation 層で共有される場合もあり
- エンティティとは別に定義（エンティティは内部ロジック用、DTO はデータ転送用）

**注意**:

- 現状、命名がおかしかったり、DTO を application 層に定義できていないマネジメントもある

### 2. Usecase（ユースケース）

**何を書くか**:

- 各エンドポイントに対するビジネスロジック
- DB 操作に関わるロジック

**重要な制約**:

- ✅ **import していいのは Domain 層と別の Application 層のみ**
- ❌ **DB 操作は直接書かない**（Domain Repository を使用する）
- ❌ **DB の model は使わない**（Entity を使用する）

**ポイント**:

- クラスのコンストラクタでリポジトリインターフェースを受け取る
  - **外部サービス（S3、CloudFront など）を使用する場合も本実装ではなくインターフェースを使うようにする。**
- **Entity や Value Object を活用**してビジネスルールを適用する。（直接は書かない）
- 結果を DTO に変換して返す

---

## Infrastructure 層

**役割**: 外部インターフェースとの連携。DB 操作、外部サービス（S3、Redis、Qdrant など）の実装。

**ディレクトリ構造**:

```
backend/app/infrastructure/
├── db/
│   ├── models/                    # DBモデル
│   │   ├── user_model.py
│   │   ├── product_model.py
│   │   └── order_model.py
│   └── repositories/              # リポジトリ実装
│       ├── user_repository_impl.py
│       ├── product_repository_impl.py
│       └── order_repository_impl.py
├── security/                      # セキュリティサービス
│   └── jwt_service.py
└── logging/                       # ロギングサービス
    └── logging.py
```

### 1. Models（DB モデル）

**何を書くか**:

- SQLAlchemy の DB モデル
- テーブル定義、カラム定義、リレーション定義

**注意事項**:

- ⚠️ **CASCADE は非推奨**
- 削除は論理削除または関連データを順番に削除するロジックを application あるいは infra/repository に書く

**ポイント**:

- SQLAlchemy の`Base`を継承
- **CASCADE は基本的に使わない**（論理削除または手動削除ロジックを推奨）

### 2. Repository Implementation（リポジトリ実装）

**何を書くか**:

- Domain 層で定義したリポジトリインターフェースの**実装**
- DB 操作の具体的な処理
- DB モデル ⇄ エンティティの変換

**ポイント**:

- リポジトリインターフェース（例: `UserRepository`）を継承
- **Domain 層で定義した全メソッドを実装する必要がある**
- 変換メソッド（`to_entity`など）を用意して再利用可能にする。で、エンティティを戻り値とする

**💡 新しいメソッドを追加したい場合**:

1. Domain 層のリポジトリインターフェースにメソッドを追加
2. Infrastructure 層のリポジトリ実装で実装

### 3. その他外部サービス

**何を書くか**:

- Redis, AWS S3, Qdrant などの外部サービスとの連携
- `backend/app/infrastructure/` に実装

---

## Presentation 層

**役割**: ユーザーインターフェース。API エンドポイントの定義とリクエスト/レスポンスの処理。

**ディレクトリ構造**:

```
backend/app/presentation/
├── api/                    # APIエンドポイント
│   ├── user_api.py
│   ├── product_api.py
│   └── order_api.py
└── schemas/                # リクエスト/レスポンス定義
    ├── user_schemas.py
    ├── product_schemas.py
    └── order_schemas.py
```

### 1. Schema（リクエスト/レスポンス）

**何を書くか**:

- リクエストとレスポンスの定義
- Pydantic を使ったバリデーション

### 2. API（エンドポイント）

**何を書くか**:

- FastAPI のルーター定義
- エンドポイントの実装
- Usecase の呼び出し
- 認証・認可（Depends）

**ポイント**:

- `Depends`を使って依存注入
  - `get_xxxx_usecase`: Usecase を注入 (詳しくは後述)
  - `get_current_company_id`: 現在のユーザーの会社 ID を取得（認証済み）
- エンドポイント内では基本的に**Usecase のメソッドを呼び出すのみ**
- Application 層の DTO を Presentation 層のレスポンスに変換（`from_domain`等のメソッド）
- 例外処理して HTTP エラーに変換

---

## DI 層

**ディレクトリ構造**:

```
backend/app/di/
├── user_management.py
├── product_management.py
├── order_management.py
└── ...
```

**役割**: 依存性注入。各層を接続し、依存関係を解決する。

**何を書くか**:

- 各エンドポイントに依存性を注入するための関数
- Usecase のインスタンスを生成し、必要なリポジトリを注入

**重要**:

- ✅ **この層だけは Application、Domain、Infra から import を許容**

**ポイント**:

- `get_db`で DB セッションを取得（FastAPI の`Depends`）
- リポジトリ実装（例: `UserRepositoryImpl`）のインスタンスを生成
- 外部サービス（例: `S3Service`）のインスタンスを生成
- Usecase にリポジトリと外部サービスを注入
- 複数のリポジトリや外部サービスが必要な場合も対応

**使い方**:

- Presentation 層の API エンドポイントで以下のように使用:
  ```python
  @router.get("/users")
  def get_users(
      user_usecase: UserUsecase = Depends(get_user_usecase)  # ← DI
  ):
      # user_usecaseはすでに依存性が注入された状態
      result = user_usecase.get_users(...)
  ```

---

## アーキテクチャ検証

このプロジェクトでは、オニオンアーキテクチャの原則に従っているかを自動的に検証する仕組みが含まれています。

### アーキテクチャチェックの実行

```bash
# Makeを使用
make onion-check

# 直接実行
python backend/scripts/check_onion_architecture.py
```

### CI/CD 統合

バックエンドコードに影響するプルリクエストでは、GitHub Actions でアーキテクチャチェックが自動的に実行されます。詳細は `.github/workflows/backend-ci.yml` を参照してください。

チェッカーは以下を検証します:

- Domain 層が他の層に依存していないこと
- Application 層が Domain のみに依存していること
- Infrastructure 層が Presentation に依存していないこと
- モジュール間に循環依存がないこと

---

## ベストプラクティス

1. **Domain 層を純粋に保つ**: 外部依存を持たず、ビジネスロジックのみ
2. **インターフェースを使用**: Domain でインターフェースを定義し、Infrastructure で実装
3. **依存の方向**: 常に外側の層から内側の層へ
4. **循環依存を避ける**: 各層は明確な責任を持つべき
5. **Value Object を使用**: 不変の値オブジェクトでビジネスルールをカプセル化
6. **DTO と Entity を分離**: Entity はビジネスロジック用、DTO はデータ転送用
7. **独立したテスト**: Domain と Application 層は Infrastructure なしでテスト可能であるべき
