module.exports = {
  outputDir: 'dist',
  devServer: {
    proxy: {
      '/api/': {
        target: 'https://floating-everglades-26974.herokuapp.com/',
        changeOrigin: true,
        pathRewrite: { '^/api/': '' }
      }
    }
  }
}
