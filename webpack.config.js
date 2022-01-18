const path = require('path');

module.exports = {
  
  mode: 'development',  
  entry: './src/scripts/app.js',
  output: {
    path: path.resolve(__dirname, 'dist/scripts'),
    filename: 'bundle.js'
  },
  watch: true
  
};

