const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const markdownpdf = require('markdown-pdf');
require('dotenv').config();

// get details from gitub repository environment variables

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
});

// compile markdown files into a single file
const compileMarkdown = async () => {
 const path = './news';
 const files = fs.readdirSync(path);
 const markdownFiles = files.filter(file => file.includes('.md'));
 var data = '';
 markdownFiles.forEach((file) => {
  const content = fs.readFileSync(`${path}/${file}`, 'utf-8');
  data += content;
  data += '\n';
  data += "-------------------";
  data += '\n';
  data += "@" + file.split('-')[0];
  data += '\n\n';
  data += "-------------------";
  data += "-------------------";
  data += '\n\n';
 });

 return data;
}


// this function will upload a single file to cloudinary from markdown content
const upload = (content) => {
 // upload file to cloudinary ./oldnews directory converting them to pdf
 try {
  // use markdownpdf to convert html to pdf and upload to cloudinary
  markdownpdf().from.string(content).to.buffer((err, buffer) => {
   if (err) {
    console.log(err);
    return err;
   }
   // upload pdf to cloudinary
   cloudinary.uploader.upload_stream({
    resource_type: "raw",
    format: "pdf",
    folder: "previous-issues",
    public_id: new Date().toISOString().split('T')[0],
   }, (err, res) => {
    if (err) {
     console.log(err);
     return err;
    }
    console.log(res);
   }).end(buffer);
  });


 } catch (err) {
  console.log(err);
  return err;
 }
}



compileMarkdown().then((data) => {
 // invoke upload function for entire compiled markdown
 upload(data);
}).catch((err) => {
 console.log(err);
});