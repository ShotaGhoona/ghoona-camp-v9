# Claude Code Custom Commands 早わかりガイド

## これは何？

よく使うプロンプトを `.md` ファイルに保存し、`/project:コマンド名` で呼び出せる機能。

## 保存場所

| スコープ | 場所 | コマンド例 |
|---------|------|-----------|
| プロジェクト | `.claude/commands/` | `/project:review` |
| 個人用 | `~/.claude/commands/` | `/user:my-task` |

## 作り方

1. `.claude/commands/review.md` を作成
2. 中にプロンプトを記述
3. `/project:review` で実行

## 引数を使う

`$ARGUMENTS` でコマンド実行時の入力を受け取れる。

```markdown
<!-- fix-issue.md -->
Issue #$ARGUMENTS を修正してください。
```

実行: `/project:fix-issue 1234` → Issue #1234 を修正

## 階層化

`commands/frontend/test.md` → `/project:frontend:test`

## チーム共有

`.claude/commands/` を Git にコミットすれば全員が同じコマンドを使える。

## 注意

API キー等の機密情報は直接書かず、環境変数を使うこと。
