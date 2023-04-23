const express = require('express');
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authUser = require('./routes/auth')
const multer = require('multer');
const path = require('path');
const userRouter = require('./routes/users')
const postRouter = require('./routes/posts')
const categoryRouter = require('./routes/categories')

dotenv.config();
app.use(express.json());
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
.then(console.log("Connected to MongoDB")).catch((err) => console.log(err));

const PUBLIC_DIR = path.resolve(__dirname, "./public");

//Configuration for Multer for pdf
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PUBLIC_DIR + '/uploads');
  },

  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `post-${file.fieldname}-${Date.now()}.${ext}`);
  },
});
// Uploading multitple files(image , video, text)
const upload = multer({
  storage: storage,

  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image or video files are allowed'));
    }
  }
}).fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 }]);
// Routes
app.use('/api/v1/auth',authUser);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/post',upload,postRouter);
app.use('/api/v1/categories',categoryRouter);


app.listen(5000, () => {
  console.log('Server listening on port 5000');
});
