module.exports = {
  outputDir: 'dist',
  devServer: {
    proxy: {
      '/api/': {
        // target: 'https://itunes.apple.com',
        target: 'http://localhost:3007',
        changeOrigin: true,
        pathRewrite: { '^/api/': '' }
      }
    }
  }
}
