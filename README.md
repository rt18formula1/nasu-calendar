# ゆる学徒公開カレンダー

株式会社pedanticの動画投稿スケジュールを確認・共有できるカレンダー配信サイトです。ゆる学徒界隈のラジオの動画公開スケジュールを一覧で確認できます。 

## 📋 概要

このサイトは、ゆる学徒界隈の各チャンネルの動画公開スケジュールをGoogleカレンダーで一元管理し、ユーザーが簡単に確認・購読できるようにするために作成されました。

### 主な機能

- **Googleカレンダー埋め込み**: リアルタイムで更新されるカレンダーを表示
- **週間スケジュール一覧**: 曜日ごとの動画公開時間を一目で確認
- **カレンダー購読**: ワンクリックでGoogleカレンダーに追加
- **カレンダーIDコピー**: カレンダーIDを簡単にコピー
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応

## 🎯 対象チャンネル

以下のゆる学徒界隈のチャンネルの動画公開スケジュールを管理しています：

- ゆる哲学ラジオ
- ゆる言語学ラジオ
- ゆる天文学ラジオ
- ゆる民俗学ラジオ
- ゆるコンピュータ科学ラジオ
- ゆる音楽学ラジオ
- ゆる学徒カフェ
- 博士と道化師
- 積読チャンネル
- 煩悩どこまでも
- 白黒つけない会議
- 歌舞伎町にかぶりつけ!【かぶかぶ】
- 株式会社pedantic

## 🚀 デモ

[https://yurugakuto-calendar.vercel.app](https://yurugakuto-calendar.vercel.app)

## 🛠️ 技術スタック

### フロントエンド
- **React 18** - UIフレームワーク
- **TypeScript** - 型安全なJavaScript
- **Vite** - ビルドツール
- **Tailwind CSS** - CSSフレームワーク
- **Lucide React** - アイコンライブラリ
- **Sonner** - トースト通知

### バックエンド
- **Express** - Webサーバーフレームワーク
- **Node.js** - JavaScriptランタイム

### デプロイ
- **Vercel** - ホスティングプラットフォーム

## 📦 インストール

### 前提条件

- Node.js 18.x 以上
- pnpm 8.x 以上

### ローカル開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/rt18formula1/nasu-calendar.git
cd nasu-calendar

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

## 🏗️ ビルド

```bash
# 本番用ビルド
pnpm build

# ビルド後のプレビュー
pnpm preview
```

## 🌐 デプロイ

### Vercelへのデプロイ

```bash
# Vercel CLIのインストール
npm i -g vercel

# デプロイ
vercel
```

または、GitHubリポジトリをVercelに接続して自動デプロイを設定できます。

## 📁 プロジェクト構成

```
pedantic-calendar-site/
├── client/                 # フロントエンド（Reactアプリ）
│   ├── public/            # 静的ファイル
│   │   ├── favicon.png    # ファビコン
│   │   ├── robots.txt     # クローラー設定
│   │   ├── sitemap.xml    # サイトマップ
│   │   └── ai.html        # AIクローラー用ページ
│   ├── src/
│   │   ├── components/    # Reactコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   └── main.tsx       # エントリーポイント
│   └── index.html         # HTMLテンプレート
├── server/                # バックエンド（Expressサーバー）
│   └── index.ts          # サーバーエントリーポイント
├── shared/               # 共有コード
├── package.json          # プロジェクト設定
├── tsconfig.json         # TypeScript設定
├── vite.config.ts        # Vite設定
└── vercel.json          # Vercel設定
```

## 🔧 環境変数

以下の環境変数を設定する必要があります：

```env
VITE_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

## 📝 週間スケジュール

| 曜日 | 時間 | チャンネル |
|------|------|-----------|
| 日曜 | 午前9:45 | ゆるコンピュータ科学ラジオ |
| 日曜 | 午後8時 | ゆる民俗学ラジオ |
| 月曜 | 午後4時 | 博士と道化師 |
| 月曜 | 午後5時 | 積読チャンネル |
| 火曜 | 午後6:45 | ゆる言語学ラジオ |
| 火曜 | 午後8時 | 煩悩どこまでも |
| 水曜 | 午後6:45 | ゆる学徒カフェ |
| 水曜 | 午後8時 | 白黒つけない会議 |
| 木曜 | 午後6時 | 歌舞伎町にかぶりつけ!【かぶかぶ】 |
| 木曜 | 午後8時 | ゆる天文学ラジオ |
| 金曜 | 午後7時 | 株式会社pedantic |
| 金曜 | 午後8時 | ゆる音楽学ラジオ |
| 土曜 | 午前9:45 | 白黒つけない会議 |
| 土曜 | 午後8時 | ゆる哲学ラジオ |

## 🤝 貢献

バグ報告や機能リクエストは、Issueを通じてお願いします。

## ⚠️ 注意事項

- これは非公式のゆる学徒界隈のラジオの動画公開スケジュールカレンダーです
- ライブ配信やイベントまでは追加できません
- ファンが運営するサイトなので、株式会社Pedanticに問い合わせするのはおやめください
- お問い合わせはSNS（X: [@rt18_yurugakuto](https://x.com/rt18_yurugakuto)）までお願いします


## 📞 お問い合わせ

- X: [@rt18_yurugakuto](https://x.com/rt18_yurugakuto)
- Instagram: [rt18_formula1](https://instagram.com/rt18_formula1)

## 🙏 謝辞

このカレンダーは、株式会社pedanticおよびゆる学徒界隈の皆様のコンテンツを参考にして作成されています。

---

rt18_formula1
