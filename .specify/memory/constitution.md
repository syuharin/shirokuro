<!--
Sync Impact Report:
- Version change: [CONSTITUTION_VERSION] → 1.0.0
- List of modified principles: (Initial principles defined)
  - I. Zero Database Policy: 外部・内部を問わずデータベース（SQL/NoSQL）を一切使用しない。
  - II. No User Management: ログイン、サインアップ、アカウント作成機能は一切実装しない。
  - III. Stateless Grouping: グループはURLのパスパラメータのみで識別し、サーバー側に状態を持たない。
  - IV. Real-time P2P: 数値の同期はサーバーを介さないWebRTC（PeerJS推奨）によるP2P通信を基本とする。
  - V. Vercel Native: Vercelの無料枠（Hobbyプラン）で完結し、追加費用が発生しない構成にする。
  - VI. Minimalist UI: 0-100のスライダーと、他ユーザーの数値をリスト表示するだけの極めてシンプルな構成にする。
- Added sections:
  - Core Principles (I-VI)
  - Deployment & Platform Constraints
  - Testing & Verification Requirements
- Removed sections: None
- Templates requiring updates (✅ updated):
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->

# Shirokuro Constitution

## Core Principles

### I. Zero Database Policy
外部・内部を問わずデータベース（SQL/NoSQL）を一切使用しない。すべてのデータは揮発性（in-memory）または、URLパラメータを通じてのみ受け渡される。

**Rationale**: インフラの複雑さを排除し、メンテナンスフリーな構成を維持するため。

### II. No User Management
ログイン、サインアップ、アカウント作成機能は一切実装しない。ユーザー認証のためのセッション管理も行わない。

**Rationale**: 個人情報を保持せず、実装コストとセキュリティリスクを最小化するため。

### III. Stateless Grouping
グループはURLのパスパラメータ（例: `/groups/[groupId]`) のみで識別し、サーバー側に状態を持たない。共有リンクのURL自体がグループへのアクセスキーとなる。

**Rationale**: データベースなしで複数ユーザーによる共有空間を実現するため。

### IV. Real-time P2P
数値の同期はサーバーを介さないWebRTC（PeerJS推奨）によるP2P通信を基本とする。サーバーはシグナリングのみに利用し、データの保存・中継は行わない。

**Rationale**: 低遅延な同期を実現し、サーバーの負荷とストレージコストをゼロにするため。

### V. Vercel Native
Vercelの無料枠（Hobbyプラン）で完結し、追加費用が発生しない構成にする。外部のマネージドサービス（DB等）も無料枠を超えるものは一切使用しない。

**Rationale**: 永続的な無料運用を保証するため。

### VI. Minimalist UI
0-100のスライダーと、他ユーザーの数値をリスト表示するだけの極めてシンプルな構成にする。過剰な装飾や複雑なページ遷移は排除する。

**Rationale**: 実装の迅速さと、直感的な操作性を最優先するため。

## Deployment & Platform Constraints

Vercel Hobbyプランの制約内（Serverless Functionsのタイムアウト、帯域幅など）で動作するように設計する。
サーバーレスなフロントエンドが中心となり、サーバーサイドの状態（State）は持たない。

## Testing & Verification Requirements

テストは主に以下の観点で行う。
- P2P接続の確立と数値の同期が正常に行われるか（Browser automationなどによるシミュレーション）。
- URLパラメータによるグループ識別が機能するか。
- 外部DB等への依存が混入していないか。

## Governance

本憲法はプロジェクトのすべての実装における最上位の判断基準とする。
原則の変更または削除は、ガバナンスの大幅な見直しが必要であり、バージョンをメジャーアップデート（X.0.0）して記録する。
すべてのプルリクエストは本憲法への準拠を確認し、違反がある場合は採用しない。

**Version**: 1.0.0 | **Ratified**: 2026-02-22 | **Last Amended**: 2026-02-22
