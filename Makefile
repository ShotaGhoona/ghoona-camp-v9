.PHONY: help up down build logs restart test lint fix format lint-all db-init db-migrate db-upgrade db-downgrade db-history db-current onion-check generate-rsa-keys install snapshot/update infra/lint infra/format snapshot

# デフォルトターゲット
help:
	@echo "使用可能なコマンド:"
	@echo "  make up              - Docker Composeでアプリケーションを起動"
	@echo "  make down            - Docker Composeでアプリケーションを停止"
	@echo "  make build           - Docker Composeでイメージをビルド"
	@echo "  make logs            - ログを表示"
	@echo "  make restart         - アプリケーションを再起動"
	@echo "  make clean           - Dockerコンテナとボリュームを削除"
	@echo "  make shell           - backendコンテナにシェルで入る"
	@echo "  make test            - テストを実行"
	@echo ""
	@echo "  make db-init         - 初回マイグレーションファイルを作成"
	@echo "  make db-migrate msg='message' - マイグレーションファイルを作成（autogenerate）"
	@echo "  make db-upgrade      - マイグレーションを適用"
	@echo "  make db-downgrade    - マイグレーションをロールバック"
	@echo "  make db-history      - マイグレーション履歴を表示"
	@echo "  make db-current      - 現在のマイグレーションリビジョンを表示"
	@echo ""
	@echo "  make lint            - Ruffでコードをチェック"
	@echo "  make format          - Ruffでコードをフォーマット"
	@echo "  make fix             - Ruffで自動修正可能なエラーを修正"
	@echo "  make lint-all        - lintとformatを両方実行"
	@echo "  make onion-check     - Onion Architectureの依存関係をチェック"
	@echo ""
	@echo "  make generate-rsa-keys - JWT用のRSA鍵ペアを生成"
	@echo "  make export-swagger    - SwaggerドキュメントをHTMLとして生成"

# ==========================================
# Docker Compose コマンド
# ==========================================

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

restart:
	docker compose restart

# ==========================================
# Alembic コマンド
# ==========================================

db-init:
	docker compose run --rm migrator alembic revision -m "initial migration"

db-migrate:
	@if [ -z "$(msg)" ]; then \
		echo "Error: msg is required. Usage: make db-migrate msg='your message'"; \
		exit 1; \
	fi
	docker compose run --rm migrator alembic revision --autogenerate -m "$(msg)"

db-upgrade:
	docker compose run --rm migrator alembic upgrade head

db-downgrade:
	docker compose run --rm migrator alembic downgrade -1

db-history:
	docker compose run --rm migrator alembic history

db-current:
	docker compose run --rm migrator alembic current

# ==========================================
# テスト
# ==========================================

test:
	docker compose exec backend pytest

# ==========================================
# コード品質チェック
# ==========================================

lint:
	docker compose exec backend ruff check .

fix:
	docker compose exec backend ruff check --fix .

format:
	docker compose exec backend ruff format .

lint-all: fix format

# Onion Architecture チェック
onion-check:
	docker compose run --rm backend python scripts/check_onion_architecture.py

# ==========================================
# セキュリティ
# ==========================================

generate-rsa-keys:
	docker compose exec backend python scripts/generate_rsa_keys.py

# ==========================================
# ドキュメント生成
# ==========================================

export-swagger:
	docker compose exec backend python scripts/export_swagger.py

# ==========================================
# インフラストラクチャ
# ==========================================

.PHONY: install
install:
	cd infra && npm install 

.PHONY: snapshot/update
snapshot/update:
	cd infra && \
		npx jest --updateSnapshot

.PHONY: infra/lint
infra/lint:
	npx @biomejs/biome lint infra

.PHONY: infra/format
infra/format:
	npx @biomejs/biome check infra --fix

.PHONY: snapshot
snapshot:
	cd infra && npx jest