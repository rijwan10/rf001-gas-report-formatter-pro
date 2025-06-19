# RF001-gas-report-formatter

## プロジェクトID: RF001
## カテゴリ: Report Formatter（レポート系）
## 開発開始: 2023-12-10
## ステータス: Active

### 概要
McKinsey/BCG品質のレポート生成システム（Google Apps Script版）。Claude MCP統合により、自然言語での指示からプロフェッショナルなレポートを自動生成。

### 主な機能
- **自然言語処理**: Claude APIを活用したレポート内容の解析と構造化
- **McKinsey/BCGスタイル**: コンサルティングファーム標準のフォーマット
- **自動グラフ生成**: データから適切なビジュアライゼーション作成
- **多言語対応**: 日本語・英語でのレポート出力
- **テンプレート管理**: カスタマイズ可能なレポートテンプレート

### 技術スタック
- **フロントエンド**: Google Apps Script (HTML Service)
- **バックエンド**: Google Apps Script
- **データベース**: Google Sheets
- **AI統合**: Claude API (Anthropic)

### 成果
- レポート作成時間を80%削減
- 一貫性のあるプロフェッショナルな出力品質
- 非技術者でも高品質レポート作成可能

### プロジェクト構造
```
rf001-gas-report-formatter/
├── src/
│   ├── main.gs              # メインスクリプト
│   ├── claudeApi.gs         # Claude API連携
│   ├── reportGenerator.gs   # レポート生成ロジック
│   └── templates/          # レポートテンプレート
├── assets/
│   └── styles.html         # カスタムスタイル
└── README.md
```

### 関連リンク
- **GitHub**: https://github.com/amijadoamijado/rf001-gas-report-formatter-pro
- **関連プロジェクト**: RF002-report-formatter（React版）