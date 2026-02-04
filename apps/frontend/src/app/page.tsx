export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">ChordBook</h1>
          <nav className="flex gap-4">
            <a href="/login" className="text-gray-600 hover:text-gray-900">
              ログイン
            </a>
            <a
              href="/register"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
            >
              新規登録
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          自分だけのコード譜ライブラリを
          <br />
          作りやすく・演奏しやすく・管理しやすく
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          シンプルなコード譜を作成・管理・共有できるアプリ。
          <br />
          既存サイトの不満を解消し、オリジナル曲も一元管理。
        </p>
        <a
          href="/register"
          className="inline-block bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          無料で始める
        </a>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            主な機能
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">&#9835;</div>
              <h4 className="text-lg font-semibold mb-2">作りやすい</h4>
              <p className="text-gray-600">
                コード補完機能、スマート予測で
                <br />
                効率的にコード譜を作成
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">&#9834;</div>
              <h4 className="text-lg font-semibold mb-2">演奏しやすい</h4>
              <p className="text-gray-600">
                見やすいデザイン、自動スクロールで
                <br />
                演奏に集中できる
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">&#128193;</div>
              <h4 className="text-lg font-semibold mb-2">管理しやすい</h4>
              <p className="text-gray-600">
                一元管理、共有機能で
                <br />
                コード譜をすっきり整理
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2025 ChordBook. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
