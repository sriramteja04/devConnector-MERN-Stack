const express = require('express');
const app = express();

let PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API Started Working');
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
