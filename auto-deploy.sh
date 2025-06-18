#!/bin/bash

# RF001-GAS ReportFormatter Pro 自動デプロイスクリプト

echo "🚀 RF001-GAS ReportFormatter Pro 自動デプロイ開始..."

# Apps Script API有効化確認
echo "📋 Step 1: Apps Script API有効化確認"
echo "以下のURLにアクセスしてApps Script APIを有効化してください："
echo "https://script.google.com/home/usersettings"
echo ""
read -p "APIを有効化しましたか？ (y/n): " api_enabled

if [ "$api_enabled" != "y" ]; then
    echo "❌ Apps Script APIが有効化されていません。上記URLで有効化してください。"
    exit 1
fi

# プロジェクト作成
echo "📂 Step 2: Google Apps Script プロジェクト作成"
clasp create --title "RF001-ReportFormatter-Pro-GAS" --type standalone

if [ $? -ne 0 ]; then
    echo "❌ プロジェクト作成に失敗しました。"
    echo "手動作成を推奨します: MANUAL_DEPLOYMENT_GUIDE.md を参照"
    exit 1
fi

# ファイル push
echo "📤 Step 3: ファイルアップロード"
clasp push

if [ $? -eq 0 ]; then
    echo "✅ ファイルアップロード完了"
else
    echo "⚠️ ファイルアップロードでエラーが発生しました"
fi

# デプロイ
echo "🌐 Step 4: WebApp デプロイ"
clasp deploy --description "RF001 Professional Report Generator"

if [ $? -eq 0 ]; then
    echo "✅ WebApp デプロイ完了"
    echo ""
    echo "🎉 RF001-GAS ReportFormatter Pro 自動デプロイ完了！"
    echo ""
    echo "📋 次のステップ:"
    echo "1. clasp open でプロジェクトを開く"
    echo "2. initializeProject() 関数を実行"
    echo "3. WebApp URLにアクセステスト"
    echo ""
else
    echo "❌ WebApp デプロイに失敗しました"
    echo "手動デプロイを推奨します: MANUAL_DEPLOYMENT_GUIDE.md を参照"
fi

echo "📊 デプロイ情報表示:"
clasp deployments