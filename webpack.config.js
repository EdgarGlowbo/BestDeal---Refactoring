const path = require('path');

module.exports = {
  
  mode: 'development',  
  entry: {
    app: ['./src/scripts/app.js', './src/scripts/items.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist/scripts'),
    filename: 'bundle.js'
  },
  watch: true
  
};

