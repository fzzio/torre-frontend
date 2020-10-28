module.exports = {
  outputDir: 'dist',
  devServer: {
    proxy: {
      '/api/': {
        // target: 'http://localhost:3007',
        target: 'http://ec2-3-15-140-212.us-east-2.compute.amazonaws.com:3007',
        changeOrigin: true,
        pathRewrite: { '^/api/': '' }
      }
    }
  }
}
