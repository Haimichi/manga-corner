const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Phân tích bundle chỉ khi được yêu cầu rõ ràng
      if (process.env.ANALYZE) {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
          })
        );
      }
      
      // Nén assets chỉ trong môi trường production
      if (env === 'production') {
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
          })
        );
        
        // Cấu hình code splitting chi tiết chỉ trong production
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  // Lấy tên package từ node_modules để phân chia
                  const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                  return `vendor.${packageName.replace('@', '')}`;
                },
                priority: 10,
              },
            },
          },
        };
      } else {
        // Cấu hình đơn giản hơn cho development
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            name: false,
          },
        };
      }
      
      // Tăng hiệu suất building trong development
      if (env === 'development') {
        // Sử dụng cache
        webpackConfig.cache = {
          type: 'filesystem',
          allowCollectingMemory: true,
        };
        
        // Giảm số lượng source maps
        webpackConfig.devtool = 'eval-cheap-module-source-map';
      }
      
      return webpackConfig;
    },
  },
  // Bật tối ưu hóa trong development
  devServer: {
    // Tăng tốc hot reload
    hot: true,
    client: {
      overlay: false, // Tắt overlay lỗi để tăng hiệu suất
    },
  },
}; 