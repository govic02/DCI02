const tokenCambioPassword = new mongoose.Schema({
    idToken: Number,
    username: String,
    token: String,
    isUsed: String
  });
  